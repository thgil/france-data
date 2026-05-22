// charts.js — commune-names story

export function drawTopNames(mountId, data) {
  const container = document.getElementById(mountId);
  if (!container) return;

  const items = data.slice(0, 20);
  const maxCount = items[0].count;

  const html = items.map((d, i) => {
    const pct = (d.count / maxCount) * 100;
    const rank = i + 1;
    return `
      <div class="bar-row">
        <span class="bar-rank">${rank}</span>
        <span class="bar-label">${d.name}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="bar-count">${d.count}</span>
      </div>`;
  }).join('');

  container.innerHTML = html;
}

export function drawLengthHistogram(mountId, data) {
  const container = document.getElementById(mountId);
  if (!container) return;

  // Group into buckets of 2 chars for readability
  const buckets = {};
  for (const { length, count } of data) {
    const bucket = Math.floor(length / 2) * 2;
    buckets[bucket] = (buckets[bucket] || 0) + count;
  }

  const entries = Object.entries(buckets)
    .map(([k, v]) => ({ length: +k, count: v }))
    .sort((a, b) => a.length - b.length);

  const maxCount = Math.max(...entries.map(d => d.count));
  const svgWidth = container.clientWidth || 640;
  const svgHeight = 200;
  const padL = 50, padR = 16, padT = 16, padB = 40;
  const plotW = svgWidth - padL - padR;
  const plotH = svgHeight - padT - padB;

  const barW = Math.max(1, plotW / entries.length - 2);
  const xStep = plotW / entries.length;

  const bars = entries.map((d, i) => {
    const x = padL + i * xStep;
    const barH = (d.count / maxCount) * plotH;
    const y = padT + plotH - barH;
    const label = d.length === 0 ? '1' : `${d.length + 1}`;
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="#b32020" opacity="0.8"/>`;
  }).join('');

  // X-axis labels (every 4 chars to reduce clutter)
  const xLabels = entries
    .filter((_, i) => i % 4 === 0)
    .map((d, i) => {
      const idx = entries.findIndex(e => e.length === d.length);
      const x = padL + idx * xStep + barW / 2;
      return `<text x="${x}" y="${svgHeight - 6}" text-anchor="middle" font-size="11" fill="#666">${d.length + 1}</text>`;
    }).join('');

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = padT + plotH * (1 - pct);
    const val = Math.round(maxCount * pct);
    return `
      <line x1="${padL - 4}" y1="${y}" x2="${padL + plotW}" y2="${y}" stroke="#e0d8cc" stroke-width="1"/>
      <text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#888">${val.toLocaleString()}</text>`;
  }).join('');

  const svg = `<svg width="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
    <style>text { font-family: 'Helvetica Neue', sans-serif; }</style>
    ${yLabels}
    ${bars}
    ${xLabels}
    <text x="${padL + plotW / 2}" y="${svgHeight - 2}" text-anchor="middle" font-size="11" fill="#666">name length (characters)</text>
  </svg>`;

  container.innerHTML = svg;
}
