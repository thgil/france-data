// charts.js — commune-names story
// Draws: (1) top-names bar chart, (2) name-length histogram

const DATA = {
  total: 35014,
  topNames: [
    { name: "Sainte-Colombe", count: 12 },
    { name: "Saint-Sauveur", count: 11 },
    { name: "Saint-Aubin", count: 10 },
    { name: "Beaulieu", count: 10 },
    { name: "Saint-Marcel", count: 9 },
    { name: "Saint-Michel", count: 9 },
    { name: "Le Pin", count: 9 },
    { name: "Saint-Pierre", count: 9 },
    { name: "Sainte-Marie", count: 9 },
    { name: "Saint-Rémy", count: 8 },
    { name: "Saint-Clément", count: 8 },
    { name: "Saint-Hilaire", count: 8 },
    { name: "Saint-Loup", count: 8 },
    { name: "Beaumont", count: 8 },
    { name: "Verrières", count: 8 },
  ],
  lengthDist: {
    "1":1,"2":13,"3":154,"4":720,"5":1969,"6":3223,"7":3695,
    "8":3695,"9":3000,"10":2522,"11":1884,"12":1435,"13":1167,
    "14":1018,"15":1095,"16":1080,"17":998,"18":904,"19":793,
    "20":628,"21":534,"22":428,"23":361,"24":273,"25":222,
    "26":183,"27":135,"28":107,"29":87,"30":62,"31":52,
    "32":32,"33":25,"34":22,"35":11,"36":9,"37":7,
    "38":4,"39":2,"40":1,"43":1,"44":1,"45":1
  },
  meanLength: 11.8,
  medianLength: 10
};

function drawTopNames() {
  const canvas = document.getElementById('chart-top-names');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const names = DATA.topNames;
  const maxCount = names[0].count;

  const padL = 145, padR = 48, padT = 16, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const rowH = chartH / names.length;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = '#e0dbd0';
  ctx.lineWidth = 1;
  for (let v = 0; v <= maxCount; v += 2) {
    const x = padL + (v / maxCount) * chartW;
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + chartH);
    ctx.stroke();
  }

  // Bars
  names.forEach((d, i) => {
    const barW = (d.count / maxCount) * chartW;
    const y = padT + i * rowH;
    const barH = rowH * 0.55;
    const barY = y + (rowH - barH) / 2;

    // Highlight top name
    ctx.fillStyle = i === 0 ? '#b32020' : '#c8bfaf';
    ctx.fillRect(padL, barY, barW, barH);

    // Name label
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `${i === 0 ? 600 : 400} 12px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.name, padL - 8, y + rowH / 2);

    // Count label
    ctx.fillStyle = '#444';
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`×${d.count}`, padL + barW + 5, y + rowH / 2);
  });

  // X-axis
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + chartH);
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  // X-axis labels
  ctx.fillStyle = '#888';
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let v = 0; v <= maxCount; v += 2) {
    const x = padL + (v / maxCount) * chartW;
    ctx.fillText(v, x, padT + chartH + 4);
  }
}

function drawLengthHist() {
  const canvas = document.getElementById('chart-length');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  // Bucket lengths 1–30, then 30+
  const buckets = [];
  let over30 = 0;
  for (const [k, v] of Object.entries(DATA.lengthDist)) {
    const n = parseInt(k);
    if (n <= 30) buckets[n] = (buckets[n] || 0) + v;
    else over30 += v;
  }
  // Build display array: lengths 1 to 30, then "30+"
  const display = [];
  for (let i = 1; i <= 30; i++) display.push({ label: String(i), count: buckets[i] || 0 });
  display.push({ label: '30+', count: over30 });

  const maxCount = Math.max(...display.map(d => d.count));

  const padL = 32, padR = 16, padT = 16, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = chartW / display.length;

  ctx.clearRect(0, 0, W, H);

  display.forEach((d, i) => {
    const bh = (d.count / maxCount) * chartH;
    const x = padL + i * barW;
    const y = padT + chartH - bh;

    // Highlight median and mean
    const isMedian = d.label === String(DATA.medianLength);
    ctx.fillStyle = isMedian ? '#b32020' : '#c8bfaf';
    ctx.fillRect(x + 1, y, barW - 2, bh);
  });

  // X-axis
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + chartH);
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  // X labels — every 5
  ctx.fillStyle = '#888';
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  display.forEach((d, i) => {
    const x = padL + i * barW + barW / 2;
    if (d.label === '1' || parseInt(d.label) % 5 === 0 || d.label === '30+') {
      ctx.fillText(d.label, x, padT + chartH + 4);
    }
  });

  // Median annotation
  const medIdx = DATA.medianLength - 1;
  const medX = padL + medIdx * barW + barW / 2;
  ctx.fillStyle = '#b32020';
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('median = ' + DATA.medianLength, medX, padT + 2);

  // Y-axis ghost
  ctx.strokeStyle = '#e0dbd0';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1].forEach(f => {
    const y = padT + chartH - f * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.font = '9px Helvetica Neue, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(f * maxCount).toLocaleString(), padL - 3, y + 1);
  });
}

function init() {
  drawTopNames();
  drawLengthHist();

  // Redraw on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { drawTopNames(); drawLengthHist(); }, 120);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
