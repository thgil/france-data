// stories/commune-names/charts.js
// Two charts: name-length histogram and most-common-names horizontal bars.

const PALETTE = {
  bar:     '#b32020',
  barMid:  '#c94a4a',
  barFade: '#d97070',
  rule:    '#e0d8cc',
  ink:     '#1a1a1a',
  mute:    '#888',
  paper:   '#faf7f2',
};

// ── Length histogram ────────────────────────────────────────────────────────
// Bins: 1–5, 6–10, 11–15, 16–20, 21–25, 26–30, 31+
const LENGTH_BINS = [
  { label: '1–5',  min: 1,  max: 5  },
  { label: '6–10', min: 6,  max: 10 },
  { label: '11–15',min: 11, max: 15 },
  { label: '16–20',min: 16, max: 20 },
  { label: '21–25',min: 21, max: 25 },
  { label: '26–30',min: 26, max: 30 },
  { label: '31+',  min: 31, max: 999 },
];

const LENGTH_DIST = {1:1,2:13,3:154,4:720,5:1969,6:3223,7:3695,8:3695,9:3000,10:2522,11:1884,12:1435,13:1167,14:1018,15:1095,16:1177,17:1186,18:1202,19:1117,20:1028,21:923,22:819,23:649,24:501,25:329,26:200,27:105,28:55,29:53,30:29,31:12,32:8,33:2,34:6,35:7,36:2,37:3,38:3,39:1,40:3,41:1,43:1,45:1};

function buildHistogram(canvasEl) {
  const bins = LENGTH_BINS.map(b => {
    let count = 0;
    for (let l = b.min; l <= b.max; l++) count += (LENGTH_DIST[l] || 0);
    return { ...b, count };
  });

  const maxCount = Math.max(...bins.map(b => b.count));
  const dpr = window.devicePixelRatio || 1;
  const W = canvasEl.offsetWidth || 640;
  const H = 220;

  canvasEl.width  = W * dpr;
  canvasEl.height = H * dpr;
  canvasEl.style.width  = W + 'px';
  canvasEl.style.height = H + 'px';

  const ctx = canvasEl.getContext('2d');
  ctx.scale(dpr, dpr);

  const padL = 52, padR = 16, padT = 16, padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  ctx.fillStyle = PALETTE.paper;
  ctx.fillRect(0, 0, W, H);

  const barW = Math.floor(plotW / bins.length) - 4;
  const gap  = Math.floor(plotW / bins.length);

  // Y-axis gridlines
  ctx.strokeStyle = PALETTE.rule;
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1.0].forEach(frac => {
    const y = padT + plotH - frac * plotH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();

    ctx.fillStyle = PALETTE.mute;
    ctx.font = `10px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(frac * maxCount / 1000) + 'k', padL - 6, y);
  });

  // Bars
  bins.forEach((bin, i) => {
    const x = padL + i * gap;
    const barH = (bin.count / maxCount) * plotH;
    const y = padT + plotH - barH;

    const gradient = ctx.createLinearGradient(0, y, 0, y + barH);
    gradient.addColorStop(0, PALETTE.bar);
    gradient.addColorStop(1, PALETTE.barFade);
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 2, y, barW, barH);

    // X-axis label
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `10px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(bin.label, x + 2 + barW / 2, padT + plotH + 6);
  });

  // Baseline
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();

  // Y-axis label
  ctx.save();
  ctx.translate(13, padT + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = PALETTE.mute;
  ctx.font = `10px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('communes', 0, 0);
  ctx.restore();
}

// ── Most-common names chart (horizontal bars) ───────────────────────────────
const TOP_NAMES = [
  { name: 'Sainte-Colombe', count: 12 },
  { name: 'Saint-Sauveur',  count: 11 },
  { name: 'Saint-Aubin',    count: 10 },
  { name: 'Beaulieu',       count: 10 },
  { name: 'Saint-Marcel',   count:  9 },
  { name: 'Saint-Michel',   count:  9 },
  { name: 'Le Pin',         count:  9 },
  { name: 'Saint-Pierre',   count:  9 },
  { name: 'Sainte-Marie',   count:  9 },
  { name: 'Saint-Rémy',     count:  8 },
];

function buildTopNamesChart(containerEl) {
  const maxCount = TOP_NAMES[0].count;
  containerEl.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:grid;grid-template-columns:140px 1fr 28px;gap:5px 10px;align-items:center;';

  TOP_NAMES.forEach((item, i) => {
    const pct = (item.count / maxCount) * 100;

    const label = document.createElement('div');
    label.style.cssText = 'font-family:Georgia,serif;font-size:13px;color:#1a1a1a;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    label.textContent = item.name;

    const track = document.createElement('div');
    track.style.cssText = 'height:16px;background:#ede8e0;border-radius:2px;overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = `height:100%;width:${pct}%;background:#b32020;border-radius:2px;transition:width 0.4s ease;`;
    track.appendChild(fill);

    const num = document.createElement('div');
    num.style.cssText = 'font-family:"Helvetica Neue",sans-serif;font-size:12px;color:#888;font-variant-numeric:tabular-nums;';
    num.textContent = item.count + 'x';

    wrapper.appendChild(label);
    wrapper.appendChild(track);
    wrapper.appendChild(num);
  });

  containerEl.appendChild(wrapper);
}

export function drawLengthHistogram(selector) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;
  buildHistogram(canvas);
  window.addEventListener('resize', () => buildHistogram(canvas));
}

export function drawTopNamesChart(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  buildTopNamesChart(el);
}
