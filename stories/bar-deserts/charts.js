/**
 * Bar-deserts story charts.
 * Renders a ranked horizontal-bar chart of all French départements
 * by share of communes with no registered bar.
 */

function lerpColor(pct) {
  // 0% → warm light (#f0ece4), 100% → dark red (#b32020)
  const t = Math.min(pct / 100, 1);
  const r = Math.round(240 + (179 - 240) * t);
  const g = Math.round(236 + (32  - 236) * t);
  const b = Math.round(228 + (32  - 228) * t);
  return `rgb(${r},${g},${b})`;
}

export function renderRanking(containerId, depts) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const ROW_H   = 21;
  const NAME_W  = 192;
  const BAR_W   = 360;
  const PCT_W   = 52;
  const PAD_L   = 12;
  const PAD_R   = 8;
  const WIDTH   = PAD_L + NAME_W + BAR_W + PCT_W + PAD_R;
  const HEIGHT  = depts.length * ROW_H + 2;

  const rows = depts.map((d, i) => {
    const y      = i * ROW_H;
    const barPx  = (d.pctWithout / 100) * BAR_W;
    const color  = lerpColor(d.pctWithout);
    const bold   = d.pctWithout >= 85 || d.pctWithout <= 2;
    const nameX  = PAD_L + NAME_W - 6;
    const barX   = PAD_L + NAME_W;
    const lblX   = barX + barPx + 5;
    const textY  = y + ROW_H * 0.67;
    const fill   = bold ? '#1a1a1a' : '#444';
    const fw     = bold ? '600' : '400';

    return `<g>
  <text x="${nameX}" y="${textY}" text-anchor="end" font-size="11.5"
    fill="${fill}" font-weight="${fw}">${d.name} (${d.dept})</text>
  <rect x="${barX}" y="${y + 3}" width="${barPx.toFixed(1)}" height="${ROW_H - 6}"
    fill="${color}" rx="1"/>
  <text x="${lblX}" y="${textY}" font-size="11" fill="#666">${d.pctWithout}%</text>
</g>`;
  }).join('\n');

  container.innerHTML = `<svg
  viewBox="0 0 ${WIDTH} ${HEIGHT}"
  width="100%"
  xmlns="http://www.w3.org/2000/svg"
  style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;display:block;">
${rows}
</svg>`;
}

export function renderSizeHistogram(containerId, depts) {
  // Show the population distribution as a simple callout list — skip heavy charting
  const container = document.querySelector(containerId);
  if (!container) return;

  // Buckets for bar-less communes (pre-computed constants from analysis)
  const buckets = [
    { label: 'Under 100 residents',    count: 3389 },
    { label: '100 – 499 residents',    count: 12967 },
    { label: '500 – 999 residents',    count: 4347 },
    { label: '1,000 – 4,999 residents',count: 2489 },
    { label: '5,000 – 9,999 residents',count: 65 },
    { label: '10,000+ residents',       count: 8 },
  ];
  const total = buckets.reduce((s, b) => s + b.count, 0);
  const maxCount = Math.max(...buckets.map(b => b.count));

  const ROW_H  = 28;
  const NAME_W = 200;
  const BAR_W  = 280;
  const CNT_W  = 72;
  const PAD    = 12;
  const WIDTH  = PAD + NAME_W + BAR_W + CNT_W + PAD;
  const HEIGHT = buckets.length * ROW_H + 4;

  const rows = buckets.map((b, i) => {
    const y     = i * ROW_H + 2;
    const barPx = (b.count / maxCount) * BAR_W;
    const pct   = (b.count / total * 100).toFixed(1);
    const textY = y + ROW_H * 0.65;
    const color = b.count > 1000 ? '#c85020' : b.count > 100 ? '#d8a070' : '#e0c8b0';
    return `<g>
  <text x="${PAD + NAME_W - 6}" y="${textY}" text-anchor="end"
    font-size="11.5" fill="#333">${b.label}</text>
  <rect x="${PAD + NAME_W}" y="${y + 4}" width="${barPx.toFixed(1)}"
    height="${ROW_H - 8}" fill="${color}" rx="1"/>
  <text x="${PAD + NAME_W + barPx + 6}" y="${textY}"
    font-size="11" fill="#666">${b.count.toLocaleString('fr-FR')} (${pct}%)</text>
</g>`;
  }).join('\n');

  container.innerHTML = `<svg
  viewBox="0 0 ${WIDTH} ${HEIGHT}"
  width="100%"
  xmlns="http://www.w3.org/2000/svg"
  style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;display:block;">
${rows}
</svg>`;
}
