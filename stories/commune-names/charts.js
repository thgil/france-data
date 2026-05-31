// charts.js — commune-names story

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const ACCENT = '#b32020';
const BAR_COLOR = '#c67c00';
const BAR_LIGHT = '#e8d5b0';

function setDims(canvas, w, h) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

// ── Chart 1: Most common words ──────────────────────────────────────────────

export function drawWordChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const words = data.topWords.slice(0, 10);
  const maxCount = words[0].count;

  const LABEL_W = 100;
  const BAR_H = 28;
  const GAP = 6;
  const PAD = { top: 16, right: 60, bottom: 8, left: LABEL_W + 12 };
  const W = container.clientWidth || 560;
  const H = PAD.top + (BAR_H + GAP) * words.length + PAD.bottom;

  const ctx = setDims(canvas, W, H);
  const barW = W - PAD.left - PAD.right;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  words.forEach((d, i) => {
    const y = PAD.top + i * (BAR_H + GAP);
    const w = (d.count / maxCount) * barW;

    // Bar
    ctx.fillStyle = BAR_LIGHT;
    ctx.fillRect(PAD.left, y, barW, BAR_H);
    ctx.fillStyle = BAR_COLOR;
    ctx.fillRect(PAD.left, y, w, BAR_H);

    // Label (word)
    ctx.fillStyle = INK;
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.word, PAD.left - 8, y + BAR_H / 2);

    // Value
    ctx.fillStyle = MUTE;
    ctx.font = '12px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.count.toLocaleString('fr-FR'), PAD.left + w + 6, y + BAR_H / 2);
  });
}

// ── Chart 2: Most common full names ────────────────────────────────────────

export function drawNamesChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const names = data.topNames.slice(0, 10);
  const maxCount = names[0].count;

  const LABEL_W = 180;
  const BAR_H = 26;
  const GAP = 6;
  const PAD = { top: 16, right: 48, bottom: 8, left: LABEL_W + 12 };
  const W = container.clientWidth || 560;
  const H = PAD.top + (BAR_H + GAP) * names.length + PAD.bottom;

  const ctx = setDims(canvas, W, H);
  const barW = W - PAD.left - PAD.right;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  names.forEach((d, i) => {
    const y = PAD.top + i * (BAR_H + GAP);
    const w = (d.count / maxCount) * barW;

    // Bar
    ctx.fillStyle = BAR_LIGHT;
    ctx.fillRect(PAD.left, y, barW, BAR_H);
    ctx.fillStyle = ACCENT;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(PAD.left, y, w, BAR_H);
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = INK;
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.name, PAD.left - 8, y + BAR_H / 2);

    // Value
    ctx.fillStyle = MUTE;
    ctx.font = '12px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.count + ' communes', PAD.left + w + 6, y + BAR_H / 2);
  });
}

// ── Table: shortest commune names ──────────────────────────────────────────

const DEPT_NAMES = {
  '08': 'Ardennes', '25': 'Doubs', '28': 'Eure-et-Loir',
  '31': 'Haute-Garonne', '38': 'Isère', '61': 'Orne',
  '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '70': 'Haute-Saône', '76': 'Seine-Maritime', '80': 'Somme',
  '95': 'Val-d\'Oise'
};

export function populateShortestTable(selector, data) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;

  tbody.innerHTML = data.shortest.map((d, i) => {
    const deptName = DEPT_NAMES[d.dept] || ('Dept ' + d.dept);
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td class="chars">${d.name.length}</td>
      <td class="dept-name">${deptName}</td>
      <td class="pop-val">${d.pop.toLocaleString('fr-FR')}</td>
    </tr>`;
  }).join('');
}
