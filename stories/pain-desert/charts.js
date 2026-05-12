// stories/pain-desert/charts.js
// Two D3 charts for the pain-desert story.
// Chart A: horizontal stacked bar — bread deserts by département.
// Chart B: horizontal bar — largest communes with no bakery.

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const DATA_URL = './data.json';
const ACCENT = '#b32020';
const ACCENT_LIGHT = '#e0845a';
const MUTED = '#d8d0c0';
const INK = '#1a1a1a';
const INK_MUTE = '#666';
const PAPER = '#faf7f2';
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const tooltip = document.getElementById('tooltip');

function showTip(html, event) {
  tooltip.innerHTML = html;
  tooltip.style.opacity = '1';
  moveTip(event);
}

function moveTip(event) {
  const x = event.clientX + 14;
  const y = event.clientY - 8;
  tooltip.style.left = Math.min(x, window.innerWidth - 240) + 'px';
  tooltip.style.top = y + 'px';
}

function hideTip() {
  tooltip.style.opacity = '0';
}

// ── Chart A: bread deserts by département ────────────────────────────────────

function drawDeptChart(data) {
  const mount = document.getElementById('chart-dept');
  if (!mount) return;

  const depts = [...data.byDept].sort((a, b) => b.breadPct - a.breadPct);

  const marginTop = 8;
  const marginRight = 64;
  const marginBottom = 24;
  const marginLeft = 140;
  const barHeight = 28;
  const gap = 8;
  const height = depts.length * (barHeight + gap) - gap + marginTop + marginBottom;
  const width = Math.min(mount.clientWidth || 700, 700);
  const innerW = width - marginLeft - marginRight;

  const svg = d3.select(mount).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('font-family', SANS);

  const g = svg.append('g')
    .attr('transform', `translate(${marginLeft},${marginTop})`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);

  // Background track
  g.selectAll('.track')
    .data(depts)
    .join('rect')
    .attr('class', 'track')
    .attr('x', 0)
    .attr('y', (d, i) => i * (barHeight + gap))
    .attr('width', innerW)
    .attr('height', barHeight)
    .attr('fill', MUTED);

  // Bread desert fill
  const bars = g.selectAll('.bar')
    .data(depts)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d, i) => i * (barHeight + gap))
    .attr('width', d => x(d.breadPct))
    .attr('height', barHeight)
    .attr('fill', d => d.breadPct === 0 ? '#a8c8a0' : ACCENT)
    .style('cursor', 'pointer');

  bars.on('mousemove', (event, d) => {
    showTip(
      `<strong>${d.name}</strong><br>` +
      `${d.breadDeserts} of ${d.total} communes (${d.breadPct}%) have no bakery<br>` +
      `${d.pharmaDeserts} of ${d.total} communes (${d.pharmaPct}%) have no pharmacy`,
      event
    );
  }).on('mouseleave', hideTip);

  // Dept labels
  g.selectAll('.dept-label')
    .data(depts)
    .join('text')
    .attr('class', 'dept-label')
    .attr('x', -8)
    .attr('y', (d, i) => i * (barHeight + gap) + barHeight / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 13)
    .attr('fill', INK)
    .text(d => d.name);

  // Pct labels
  g.selectAll('.pct-label')
    .data(depts)
    .join('text')
    .attr('class', 'pct-label')
    .attr('x', d => Math.max(x(d.breadPct) + 6, 4))
    .attr('y', (d, i) => i * (barHeight + gap) + barHeight / 2)
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 12)
    .attr('font-weight', '700')
    .attr('fill', d => d.breadPct === 0 ? '#2a6e20' : ACCENT)
    .text(d => d.breadPct === 0 ? '0%' : `${d.breadPct}%`);

  // X axis
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${height - marginTop - marginBottom + 4})`);

  xAxis.append('line')
    .attr('x1', 0).attr('x2', innerW)
    .attr('stroke', '#bbb').attr('stroke-width', 1);

  [0, 25, 50, 75, 100].forEach(v => {
    xAxis.append('text')
      .attr('x', x(v))
      .attr('y', 16)
      .attr('text-anchor', v === 0 ? 'start' : v === 100 ? 'end' : 'middle')
      .attr('font-size', 11)
      .attr('fill', INK_MUTE)
      .text(v === 100 ? '100%' : `${v}%`);
  });
}

// ── Chart B: largest communes with no bakery ────────────────────────────────

function drawBigDesertChart(data) {
  const mount = document.getElementById('chart-big-deserts');
  if (!mount) return;

  const communes = data.bigBreadDeserts.slice(0, 12);

  const marginTop = 8;
  const marginRight = 80;
  const marginBottom = 36;
  const marginLeft = 190;
  const barHeight = 26;
  const gap = 8;
  const height = communes.length * (barHeight + gap) - gap + marginTop + marginBottom;
  const width = Math.min(mount.clientWidth || 700, 700);
  const innerW = width - marginLeft - marginRight;

  const maxPop = d3.max(communes, d => d.population);
  const x = d3.scaleLinear().domain([0, maxPop]).range([0, innerW]);

  const svg = d3.select(mount).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('font-family', SANS);

  const g = svg.append('g')
    .attr('transform', `translate(${marginLeft},${marginTop})`);

  // Bars
  const bars = g.selectAll('.bar')
    .data(communes)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d, i) => i * (barHeight + gap))
    .attr('width', d => x(d.population))
    .attr('height', barHeight)
    .attr('fill', d => d.pharmacies === 0 ? ACCENT : ACCENT_LIGHT)
    .style('cursor', 'pointer');

  bars.on('mousemove', (event, d) => {
    const dept77 = { '77': 'Seine-et-Marne', '78': 'Yvelines', '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': "Val-d'Oise", '75': 'Paris' };
    showTip(
      `<strong>${d.name}</strong><br>` +
      `${dept77[d.dept] || d.dept}<br>` +
      `Population: ${d.population.toLocaleString()}<br>` +
      `Bakeries: 0 · Pharmacies: ${d.pharmacies}`,
      event
    );
  }).on('mouseleave', hideTip);

  // Commune labels
  g.selectAll('.commune-label')
    .data(communes)
    .join('text')
    .attr('class', 'commune-label')
    .attr('x', -8)
    .attr('y', (d, i) => i * (barHeight + gap) + barHeight / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 12)
    .attr('fill', INK)
    .text(d => d.name.length > 22 ? d.name.slice(0, 21) + '…' : d.name);

  // Population labels
  g.selectAll('.pop-label')
    .data(communes)
    .join('text')
    .attr('class', 'pop-label')
    .attr('x', d => x(d.population) + 6)
    .attr('y', (d, i) => i * (barHeight + gap) + barHeight / 2)
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 11)
    .attr('fill', INK_MUTE)
    .text(d => d.population.toLocaleString('fr-FR'));

  // Pharmacy note on bars
  g.selectAll('.pharma-note')
    .data(communes)
    .join('text')
    .attr('class', 'pharma-note')
    .attr('x', d => Math.max(x(d.population) - 6, 4))
    .attr('y', (d, i) => i * (barHeight + gap) + barHeight / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 10)
    .attr('fill', PAPER)
    .attr('opacity', d => (d.pharmacies > 0 && x(d.population) > 60) ? 1 : 0)
    .text(d => d.pharmacies > 0 ? `${d.pharmacies} pharm.` : '');

  // X axis
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${height - marginTop - marginBottom + 4})`);

  xAxis.append('line')
    .attr('x1', 0).attr('x2', innerW)
    .attr('stroke', '#bbb').attr('stroke-width', 1);

  const tickVals = [0, 2000, 4000, 6000, 8000].filter(v => v <= maxPop + 500);
  tickVals.forEach(v => {
    xAxis.append('text')
      .attr('x', x(v))
      .attr('y', 16)
      .attr('text-anchor', v === 0 ? 'start' : 'middle')
      .attr('font-size', 11)
      .attr('fill', INK_MUTE)
      .text(v === 0 ? '0' : v.toLocaleString('fr-FR'));
  });

  // X axis label
  xAxis.append('text')
    .attr('x', innerW / 2)
    .attr('y', 32)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('fill', INK_MUTE)
    .text('Population');
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

async function main() {
  let data;
  try {
    data = await fetch('./data.json').then(r => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  } catch (e) {
    console.error('Failed to load pain-desert data:', e);
    return;
  }

  drawDeptChart(data);
  drawBigDesertChart(data);
}

main();
