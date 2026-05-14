// charts.js — commune-names story
// Renders top-names bar chart, length histogram, and populates stats tables.
// No external dependencies — pure SVG rendered into container elements.

const ACCENT = '#b32020';
const BAR_COLOR = '#b32020';
const BAR_BG = '#e8e0d4';
const LABEL_COLOR = '#1a1a1a';
const AXIS_COLOR = '#999';
const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

// ── Top-names horizontal bar chart ──────────────────────────────────────────

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const ROW_H = 28;
  const LABEL_W = 220;
  const BAR_AREA = 260;
  const COUNT_W = 40;
  const PAD_TOP = 8;
  const PAD_BOT = 8;
  const WIDTH = LABEL_W + BAR_AREA + COUNT_W + 16;
  const HEIGHT = PAD_TOP + topNames.length * ROW_H + PAD_BOT;

  const maxCount = topNames[0]?.count ?? 1;

  const rows = topNames.map((d, i) => {
    const y = PAD_TOP + i * ROW_H;
    const barW = Math.max(2, (d.count / maxCount) * BAR_AREA);
    const midY = y + ROW_H / 2;

    return `
      <g>
        <rect x="${LABEL_W}" y="${y + 4}" width="${BAR_AREA}" height="${ROW_H - 8}"
              fill="${BAR_BG}" rx="2"/>
        <rect x="${LABEL_W}" y="${y + 4}" width="${barW}" height="${ROW_H - 8}"
              fill="${BAR_COLOR}" rx="2"/>
        <text x="${LABEL_W - 8}" y="${midY + 4}"
              font-family="${FONT_SERIF}" font-size="13" fill="${LABEL_COLOR}"
              text-anchor="end">${escSvg(d.name)}</text>
        <text x="${LABEL_W + BAR_AREA + 8}" y="${midY + 4}"
              font-family="${FONT_SANS}" font-size="12" fill="${AXIS_COLOR}"
              text-anchor="start">${d.count}</text>
      </g>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" style="display:block;max-width:${WIDTH}px"
         role="img" aria-label="Top 20 most common French commune names">
      ${rows}
    </svg>`;
}

// ── Name length histogram ────────────────────────────────────────────────────

export function drawLengthHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Group into bins of 2 chars (1-2, 3-4, 5-6, ... 43-45)
  // But keep 1 alone since Y is unique
  const raw = lengthDist; // [{length, count}]

  // Build display data: each bar = one length value
  // To avoid 45 bars, bin lengths >= 26 together
  const binned = [];
  const singles = raw.filter(d => d.length <= 25);
  const overflow = raw.filter(d => d.length > 25);
  for (const d of singles) binned.push({ label: String(d.length), count: d.count });
  if (overflow.length) {
    const total = overflow.reduce((s, d) => s + d.count, 0);
    binned.push({ label: '26+', count: total });
  }

  const PAD_L = 48;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 36;
  const W = 680;
  const H = 200;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const n = binned.length;
  const barW = chartW / n;
  const maxCount = Math.max(...binned.map(d => d.count));

  // Y axis ticks
  const yTicks = [0, 1000, 2000, 3000];
  const yTickLines = yTicks.map(v => {
    const y = PAD_T + chartH - (v / maxCount) * chartH;
    return `
      <line x1="${PAD_L}" x2="${PAD_L + chartW}" y1="${y}" y2="${y}"
            stroke="#e0d8cc" stroke-width="1"/>
      <text x="${PAD_L - 6}" y="${y + 4}" font-family="${FONT_SANS}" font-size="10"
            fill="${AXIS_COLOR}" text-anchor="end">${v === 0 ? '' : (v / 1000).toFixed(0) + 'k'}</text>`;
  }).join('');

  const bars = binned.map((d, i) => {
    const bh = (d.count / maxCount) * chartH;
    const x = PAD_L + i * barW;
    const y = PAD_T + chartH - bh;
    const highlight = d.label === '1' || d.label === '2' || d.label === '45' || d.label === '26+';
    const fill = highlight ? ACCENT : BAR_COLOR;
    const opacity = highlight ? '1' : '0.55';

    // Label every 5th tick on x-axis
    const showLabel = i === 0 || (parseInt(d.label) % 5 === 0) || d.label === '26+';
    const labelEl = showLabel
      ? `<text x="${x + barW / 2}" y="${PAD_T + chartH + 16}"
               font-family="${FONT_SANS}" font-size="10" fill="${AXIS_COLOR}"
               text-anchor="middle">${d.label}</text>`
      : '';

    return `
      <rect x="${x + 1}" y="${y}" width="${barW - 2}" height="${bh}"
            fill="${fill}" opacity="${opacity}" rx="1"/>
      ${labelEl}`;
  }).join('');

  // Annotation for Y (length=1)
  const yBar = binned.find(d => d.label === '1');
  const yBarX = PAD_L + 0 * barW + barW / 2;
  const yBarY = PAD_T + chartH - (yBar ? (yBar.count / maxCount) * chartH : 0) - 8;
  const annotation = `
    <text x="${yBarX + 14}" y="${yBarY - 4}"
          font-family="${FONT_SANS}" font-size="10" fill="${ACCENT}">Y</text>
    <line x1="${yBarX}" x2="${yBarX + 12}" y1="${yBarY}" y2="${yBarY - 6}"
          stroke="${ACCENT}" stroke-width="1"/>`;

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;max-width:${W}px"
         role="img" aria-label="Distribution of French commune name lengths">
      ${yTickLines}
      ${bars}
      ${annotation}
      <!-- X axis label -->
      <text x="${PAD_L + chartW / 2}" y="${H - 2}"
            font-family="${FONT_SANS}" font-size="11" fill="${AXIS_COLOR}"
            text-anchor="middle">Name length (characters)</text>
      <!-- Y axis label -->
      <text x="12" y="${PAD_T + chartH / 2}"
            font-family="${FONT_SANS}" font-size="11" fill="${AXIS_COLOR}"
            text-anchor="middle" transform="rotate(-90,12,${PAD_T + chartH / 2})">Communes</text>
      <!-- Axis line -->
      <line x1="${PAD_L}" x2="${PAD_L}" y1="${PAD_T}" y2="${PAD_T + chartH}"
            stroke="#ccc" stroke-width="1"/>
      <line x1="${PAD_L}" x2="${PAD_L + chartW}" y1="${PAD_T + chartH}" y2="${PAD_T + chartH}"
            stroke="#ccc" stroke-width="1"/>
    </svg>`;
}

// ── Stats tables ─────────────────────────────────────────────────────────────

export function populateTables(stats) {
  // Short names table
  const shortTbody = document.querySelector('#table-short tbody');
  if (shortTbody && stats.shortestNames) {
    const rows = stats.shortestNames
      .filter(d => d.length <= 2)
      .map((d, i) => `
        <tr>
          <td class="rank">${i + 1}</td>
          <td class="place">${escHtml(d.name)}</td>
          <td class="dim">${deptLabel(d.dept)}</td>
          <td>${d.pop ? d.pop.toLocaleString('fr-FR') : '—'}</td>
        </tr>`).join('');
    shortTbody.innerHTML = rows;
  }

  // Long names table
  const longTbody = document.querySelector('#table-long tbody');
  if (longTbody && stats.longestNames) {
    longTbody.innerHTML = stats.longestNames.slice(0, 5).map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place" style="word-break:break-word;max-width:200px">${escHtml(d.name)}</td>
        <td>${d.length} chars</td>
      </tr>`).join('');
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function escSvg(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function deptLabel(dept) {
  const names = {
    '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
    '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
    '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
    '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
    '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or',
    '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs',
    '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
    '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde',
    '34': 'Hérault', '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire',
    '38': 'Isère', '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher',
    '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique', '45': 'Loiret',
    '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
    '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne',
    '54': 'Meurthe-et-Moselle', '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle',
    '58': 'Nièvre', '59': 'Nord', '60': 'Oise', '61': 'Orne',
    '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques',
    '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin',
    '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône', '71': 'Saône-et-Loire',
    '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie', '75': 'Paris',
    '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
    '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
    '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
    '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
    '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
    '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
    '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
    '974': 'La Réunion', '976': 'Mayotte',
  };
  return names[dept] ? `Dept. ${dept} — ${names[dept]}` : `Dept. ${dept}`;
}
