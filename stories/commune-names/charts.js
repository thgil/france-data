const TOP_NAMES = [
  { name: 'Sainte-Colombe',  count: 12 },
  { name: 'Saint-Sauveur',   count: 11 },
  { name: 'Saint-Aubin',     count: 10 },
  { name: 'Beaulieu',        count: 10 },
  { name: 'Saint-Marcel',    count:  9 },
  { name: 'Saint-Michel',    count:  9 },
  { name: 'Le Pin',          count:  9 },
  { name: 'Saint-Pierre',    count:  9 },
  { name: 'Sainte-Marie',    count:  9 },
  { name: 'Saint-Rémy',      count:  8 },
  { name: 'Saint-Clément',   count:  8 },
  { name: 'Saint-Hilaire',   count:  8 },
];

const TOP_SAINT_DEPTS = [
  { dept: 'Dordogne',          count: 128, total: 503 },
  { dept: 'Gironde',           count: 121, total: 534 },
  { dept: 'Isère',             count: 105, total: 512 },
  { dept: 'Saône-et-Loire',    count: 105, total: 563 },
  { dept: 'Charente-Maritime', count: 100, total: 462 },
  { dept: 'Seine-Maritime',    count:  99, total: 707 },
  { dept: 'Ardèche',           count:  97, total: 335 },
  { dept: 'Puy-de-Dôme',       count:  92, total: 463 },
  { dept: 'Loire',             count:  89, total: 320 },
  { dept: 'Manche',            count:  86, total: 445 },
];

function buildHBar(rows, labelKey, valueKey, maxOverride, color, formatValue) {
  const maxVal = maxOverride || Math.max(...rows.map(r => r[valueKey]));
  const BAR_MAX = 300;
  const LABEL_W = 168;
  const ROW_H = 34;
  const PAD = 12;
  const svgH = rows.length * ROW_H + PAD * 2;
  const svgW = LABEL_W + BAR_MAX + 60;

  const rowSVG = rows.map((r, i) => {
    const y = PAD + i * ROW_H;
    const barW = Math.round((r[valueKey] / maxVal) * BAR_MAX);
    const label = formatValue ? formatValue(r) : r[valueKey];
    return `
      <text x="${LABEL_W - 8}" y="${y + ROW_H * 0.62}"
            text-anchor="end" font-family="Georgia,serif" font-size="13" fill="#1a1a1a">${r[labelKey]}</text>
      <rect x="${LABEL_W}" y="${y + 4}" width="${barW}" height="${ROW_H - 10}"
            fill="${color}" rx="2"/>
      <text x="${LABEL_W + barW + 7}" y="${y + ROW_H * 0.62}"
            font-family="Helvetica Neue,sans-serif" font-size="12" fill="#666">${label}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" style="max-width:${svgW}px;display:block">
    ${rowSVG}
  </svg>`;
}

export function drawNameChart(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = buildHBar(
    TOP_NAMES,
    'name',
    'count',
    12,
    '#8b6f47',
    r => `${r.count}×`
  );
}

export function drawSaintChart(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = buildHBar(
    TOP_SAINT_DEPTS,
    'dept',
    'count',
    130,
    '#b32020',
    r => `${r.count} (${Math.round(100 * r.count / r.total)}%)`
  );
}
