// stories/commune-names/charts.js
// SVG chart renderers for the commune-names story.
// No external dependencies.

function svgHBar({ selector, data, valueKey = 'count', labelKey = 'name',
  color = '#b32020', width = 600, rowH = 28, labelW = 220, padRight = 50 }) {
  const el = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!el) return;

  const maxVal = Math.max(...data.map(d => d[valueKey]));
  const barW = width - labelW - padRight;
  const h = data.length * rowH + 10;

  const rows = data.map((d, i) => {
    const fillW = Math.max(2, Math.round((d[valueKey] / maxVal) * barW));
    const y = i * rowH + 4;
    const label = d[labelKey] || '';
    const val = d[valueKey];
    return `
      <text x="${labelW - 8}" y="${y + 17}" text-anchor="end"
        font-family="Georgia, serif" font-size="13" fill="#1a1a1a"
        dominant-baseline="auto">${label}</text>
      <rect x="${labelW}" y="${y + 4}" width="${fillW}" height="${rowH - 10}"
        fill="${color}" rx="1"/>
      <text x="${labelW + fillW + 6}" y="${y + 17}" font-family="'Helvetica Neue', sans-serif"
        font-size="12" fill="#444" dominant-baseline="auto">${val.toLocaleString('fr-FR')}</text>`;
  }).join('\n');

  el.innerHTML = `
    <svg viewBox="0 0 ${width} ${h}" width="100%" style="overflow:visible;display:block">
      ${rows}
    </svg>`;
}

function svgHistogram({ selector, data, color = '#888', width = 600, h = 140 }) {
  const el = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!el) return;

  const keys = Object.keys(data).map(Number).sort((a, b) => a - b);
  const vals = keys.map(k => data[k]);
  const maxVal = Math.max(...vals);
  const n = keys.length;
  const padL = 8, padR = 8, padB = 24, padT = 8;
  const plotW = width - padL - padR;
  const plotH = h - padT - padB;
  const colW = Math.floor(plotW / n);

  const bars = keys.map((k, i) => {
    const bh = Math.max(1, Math.round((vals[i] / maxVal) * plotH));
    const x = padL + i * colW;
    const y = padT + plotH - bh;
    return `<rect x="${x}" y="${y}" width="${colW - 1}" height="${bh}" fill="${color}" rx="1"/>`;
  }).join('\n');

  // X-axis labels: min, mid, max
  const midIdx = Math.floor(n / 2);
  const xLabels = [
    { i: 0, label: keys[0] },
    { i: midIdx, label: keys[midIdx] },
    { i: n - 1, label: keys[n - 1] },
  ].map(({ i, label }) => {
    const x = padL + i * colW + colW / 2;
    return `<text x="${x}" y="${h - 4}" text-anchor="middle"
      font-family="'Helvetica Neue', sans-serif" font-size="11" fill="#888">${label}</text>`;
  }).join('\n');

  el.innerHTML = `
    <svg viewBox="0 0 ${width} ${h}" width="100%" style="overflow:visible;display:block">
      ${bars}
      ${xLabels}
      <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}"
        stroke="#ccc" stroke-width="1"/>
    </svg>`;
}

export function drawNameFreqChart(selector, top20) {
  const data = top20.map(([name, count]) => ({ name, count }));
  svgHBar({ selector, data, valueKey: 'count', labelKey: 'name', color: '#b32020', width: 560, rowH: 30, labelW: 200 });
}

export function drawSaintChart(selector, topSaints) {
  const data = topSaints.map(([saint, count]) => ({ name: `Saint-${saint}`, count }));
  svgHBar({ selector, data, valueKey: 'count', labelKey: 'name', color: '#8b5a2b', width: 560, rowH: 30, labelW: 160 });
}

export function drawLengthChart(selector, lenDist) {
  svgHistogram({ selector, data: lenDist, color: '#4a7a5a', width: 560, h: 130 });
}
