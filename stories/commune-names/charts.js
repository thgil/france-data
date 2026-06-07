// stories/commune-names/charts.js
// Two D3 SVG charts: most-duplicated commune names and first-word dominance.

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const ACCENT   = '#b32020';
const GOLD     = '#c67c00';
const INK_MUTE = '#888';
const RULE     = '#e0d8cc';
const SANS     = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF    = "Georgia, 'Times New Roman', serif";

// ── Utility: responsive width ─────────────────────────────────────────────────
function containerWidth(el) {
  return Math.max(el.getBoundingClientRect().width || 640, 320);
}

// ── Chart 1: most-duplicated names (horizontal bar) ──────────────────────────
export function drawDuplicatesChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = stats.mostCommon.slice(0, 12);
  const W    = containerWidth(el);
  const barH = 28;
  const gap  = 6;
  const labelW = Math.round(W * 0.42);
  const marginT = 8;
  const marginB = 24;
  const H = marginT + data.length * (barH + gap) + marginB;

  const svg = d3.select(el).append('svg')
    .attr('width', W)
    .attr('height', H)
    .style('display', 'block');

  const maxCount = data[0].count;
  const barScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([0, W - labelW - 40]);

  const g = svg.append('g').attr('transform', `translate(${labelW},${marginT})`);

  data.forEach((d, i) => {
    const y = i * (barH + gap);

    // Bar
    g.append('rect')
      .attr('x', 0).attr('y', y)
      .attr('width', barScale(d.count)).attr('height', barH)
      .attr('fill', i === 0 ? ACCENT : '#c8b89a')
      .attr('rx', 2);

    // Count label inside bar
    g.append('text')
      .attr('x', barScale(d.count) - 6)
      .attr('y', y + barH / 2 + 1)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-family', SANS)
      .attr('font-size', 11)
      .attr('fill', i === 0 ? '#fff' : '#555')
      .text(`${d.count}×`);
  });

  // Name labels (left side)
  const labelG = svg.append('g').attr('transform', `translate(0,${marginT})`);
  data.forEach((d, i) => {
    const y = i * (barH + gap);
    labelG.append('text')
      .attr('x', labelW - 8)
      .attr('y', y + barH / 2 + 1)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-family', SERIF)
      .attr('font-size', 13)
      .attr('fill', i === 0 ? ACCENT : '#1a1a1a')
      .text(d.name);
  });

  // X-axis label
  svg.append('text')
    .attr('x', labelW)
    .attr('y', H - 4)
    .attr('font-family', SANS)
    .attr('font-size', 10)
    .attr('fill', INK_MUTE)
    .attr('letter-spacing', 0.8)
    .text('NUMBER OF COMMUNES WITH THIS NAME');
}

// ── Chart 2: top first-word bar chart ─────────────────────────────────────────
export function drawFirstWordsChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Show top 10, collapsing small ones
  const raw = stats.topFirstWords.slice(0, 10);
  const W   = containerWidth(el);
  const barH = 28;
  const gap  = 6;
  const labelW = Math.round(W * 0.22);
  const marginT = 8;
  const marginB = 24;
  const H = marginT + raw.length * (barH + gap) + marginB;

  const svg = d3.select(el).append('svg')
    .attr('width', W)
    .attr('height', H)
    .style('display', 'block');

  const maxCount = raw[0].count;
  const barScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([0, W - labelW - 50]);

  const g = svg.append('g').attr('transform', `translate(${labelW},${marginT})`);

  raw.forEach((d, i) => {
    const y = i * (barH + gap);
    const isSaint = d.word === 'Saint' || d.word === 'Sainte';

    g.append('rect')
      .attr('x', 0).attr('y', y)
      .attr('width', barScale(d.count)).attr('height', barH)
      .attr('fill', isSaint ? ACCENT : '#c8b89a')
      .attr('rx', 2);

    // Count
    g.append('text')
      .attr('x', barScale(d.count) + 6)
      .attr('y', y + barH / 2 + 1)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('font-family', SANS)
      .attr('font-size', 11)
      .attr('fill', '#555')
      .text(d.count.toLocaleString('fr-FR'));
  });

  // Name labels
  const labelG = svg.append('g').attr('transform', `translate(0,${marginT})`);
  raw.forEach((d, i) => {
    const y = i * (barH + gap);
    const isSaint = d.word === 'Saint' || d.word === 'Sainte';
    labelG.append('text')
      .attr('x', labelW - 8)
      .attr('y', y + barH / 2 + 1)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-family', SERIF)
      .attr('font-size', 13)
      .attr('fill', isSaint ? ACCENT : '#1a1a1a')
      .text(d.word);
  });

  // X-axis label
  svg.append('text')
    .attr('x', labelW)
    .attr('y', H - 4)
    .attr('font-family', SANS)
    .attr('font-size', 10)
    .attr('fill', INK_MUTE)
    .attr('letter-spacing', 0.8)
    .text('COMMUNES STARTING WITH THIS WORD');
}
