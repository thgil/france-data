// charts.js — commune-names story
// Pure SVG bar charts. No external dependencies.

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';
const ACCENT = '#b32020';

// ── Helpers ──────────────────────────────────────────────────────────────────

function svg(tag, attrs = {}, children = []) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const child of children) {
    if (typeof child === 'string') el.textContent += child;
    else if (child) el.appendChild(child);
  }
  return el;
}

function svgText(content, attrs = {}) {
  const el = svg('text', { fill: INK, 'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif', ...attrs });
  el.textContent = content;
  return el;
}

// ── Horizontal bar chart ─────────────────────────────────────────────────────
// data: [{ label, value }, ...]
function drawHBar(container, data, { maxValue, color = ACCENT, unit = '' } = {}) {
  const W = container.clientWidth || 680;
  const ROW_H = 28;
  const LABEL_W = Math.min(220, Math.floor(W * 0.40));
  const BAR_W = W - LABEL_W - 60; // 60px for value labels
  const H = data.length * ROW_H + 20;
  const max = maxValue || Math.max(...data.map(d => d.value));

  const root = svg('svg', { width: '100%', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });

  data.forEach((d, i) => {
    const y = i * ROW_H + 10;
    const barLen = Math.max(2, (d.value / max) * BAR_W);

    // label
    const labelEl = svgText(d.label, {
      x: LABEL_W - 6,
      y: y + ROW_H * 0.62,
      'text-anchor': 'end',
      'font-size': '13',
      fill: INK,
    });
    root.appendChild(labelEl);

    // bar
    root.appendChild(svg('rect', {
      x: LABEL_W,
      y: y + 4,
      width: barLen,
      height: ROW_H - 8,
      fill: color,
      opacity: 0.82,
      rx: 2,
    }));

    // value label
    const valueEl = svgText(`${d.value}${unit}`, {
      x: LABEL_W + barLen + 5,
      y: y + ROW_H * 0.62,
      'text-anchor': 'start',
      'font-size': '12',
      fill: MUTE,
    });
    root.appendChild(valueEl);
  });

  // baseline
  root.appendChild(svg('line', { x1: LABEL_W, y1: 0, x2: LABEL_W, y2: H, stroke: RULE, 'stroke-width': 1 }));

  container.appendChild(root);
}

// ── Vertical bar chart (for length distribution) ─────────────────────────────
// data: [{ length, count }, ...]  — uses 'length' as x-axis label
function drawVBar(container, data, { color = ACCENT } = {}) {
  const W = container.clientWidth || 680;
  const H = 200;
  const PAD = { top: 10, right: 10, bottom: 30, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const max = Math.max(...data.map(d => d.count));
  const barW = Math.max(2, (innerW / data.length) - 1);

  const root = svg('svg', { width: '100%', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });

  // Grid lines (light)
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = PAD.top + innerH * (1 - frac);
    root.appendChild(svg('line', {
      x1: PAD.left, y1: y, x2: W - PAD.right, y2: y,
      stroke: RULE, 'stroke-width': 1
    }));
  });

  // Bars
  data.forEach((d, i) => {
    const barH = Math.max(1, (d.count / max) * innerH);
    const x = PAD.left + i * (innerW / data.length);
    const y = PAD.top + innerH - barH;

    root.appendChild(svg('rect', {
      x: x + 0.5,
      y,
      width: Math.max(1, barW),
      height: barH,
      fill: color,
      opacity: 0.78,
    }));

    // x-axis label: only at every 5 chars
    if (d.length % 5 === 0) {
      root.appendChild(svgText(String(d.length), {
        x: x + barW / 2,
        y: H - 8,
        'text-anchor': 'middle',
        'font-size': '11',
        fill: MUTE,
      }));
    }
  });

  // Baseline
  root.appendChild(svg('line', {
    x1: PAD.left, y1: PAD.top + innerH,
    x2: W - PAD.right, y2: PAD.top + innerH,
    stroke: INK, 'stroke-width': 1
  }));

  // Y-axis label
  root.appendChild(svgText('communes', {
    x: 0, y: 0,
    'text-anchor': 'middle',
    'font-size': '10',
    fill: MUTE,
    transform: `rotate(-90) translate(${-(PAD.top + innerH / 2)}, 10)`,
  }));

  container.appendChild(root);
}

// ── Public entry point ────────────────────────────────────────────────────────
export function drawNameCharts(stats) {
  // Chart 1: top names
  const el1 = document.getElementById('chart-top-names');
  if (el1) {
    const topData = stats.topNames.slice(0, 15).map(d => ({ label: d.name, value: d.count }));
    drawHBar(el1, topData, { maxValue: 14, color: ACCENT });
  }

  // Chart 2: name length distribution
  const el2 = document.getElementById('chart-length-dist');
  if (el2) {
    // Collapse to lengths 1..50+ (trim outliers)
    const trimmed = stats.lengthDist
      .filter(d => d.length >= 1 && d.length <= 50)
      .map(d => ({ length: d.length, count: d.count }));
    drawVBar(el2, trimmed, { color: '#4a7fb5' });
  }

  // Chart 3: top prefixes
  const el3 = document.getElementById('chart-prefixes');
  if (el3) {
    // Combine saint + sainte as "saint(e)"
    const raw = stats.topPrefixes.slice(0, 12);
    const saintEntry = raw.find(d => d.prefix === 'saint');
    const sainteEntry = raw.find(d => d.prefix === 'sainte');
    const merged = raw
      .filter(d => d.prefix !== 'sainte') // drop separate sainte
      .map(d => {
        if (d.prefix === 'saint' && sainteEntry) {
          return { label: 'saint(e)', value: d.count + sainteEntry.count };
        }
        return { label: d.prefix, value: d.count };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
    drawHBar(el3, merged, { color: '#6a8f4c' });
  }
}
