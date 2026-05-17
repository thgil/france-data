async function loadStats() {
  const res = await fetch('./name-stats.json');
  if (!res.ok) throw new Error(`name-stats.json: HTTP ${res.status}`);
  return res.json();
}

function renderLengthChart(stats) {
  const canvas = document.getElementById('length-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dist = stats.lengthDist;
  const maxLength = 30; // cap display at 30 chars (tail is tiny)
  const visible = dist.filter(d => d.length <= maxLength);
  const maxCount = Math.max(...visible.map(d => d.count));

  const W = canvas.width;
  const H = canvas.height;
  const padLeft = 44;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 40;

  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom;

  ctx.clearRect(0, 0, W, H);

  const barW = chartW / visible.length;
  const gap = Math.max(1, barW * 0.15);

  // Bars
  visible.forEach((d, i) => {
    const barH = (d.count / maxCount) * chartH;
    const x = padLeft + i * barW + gap / 2;
    const y = padTop + chartH - barH;
    const w = barW - gap;

    // Colour: highlight the peak range (6–10 chars)
    ctx.fillStyle = (d.length >= 6 && d.length <= 10) ? '#c67c00' : '#d8d0c0';
    ctx.fillRect(x, y, w, barH);
  });

  // X axis labels (every 5)
  ctx.fillStyle = '#888';
  ctx.font = '11px "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  visible.forEach((d, i) => {
    if (d.length % 5 === 0) {
      const x = padLeft + i * barW + barW / 2;
      ctx.fillText(d.length, x, H - padBottom + 14);
    }
  });

  // Y axis labels
  ctx.textAlign = 'right';
  [0, 0.5, 1].forEach(frac => {
    const val = Math.round(maxCount * frac);
    const y = padTop + chartH - frac * chartH + 4;
    ctx.fillText(val >= 1000 ? `${(val/1000).toFixed(1)}k` : val, padLeft - 4, y);

    // Gridline
    ctx.strokeStyle = '#e8e0d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + chartH - frac * chartH);
    ctx.lineTo(padLeft + chartW, padTop + chartH - frac * chartH);
    ctx.stroke();
  });

  // X axis line
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop + chartH);
  ctx.lineTo(padLeft + chartW, padTop + chartH);
  ctx.stroke();

  // Annotation: mode
  const mode = visible.reduce((best, d) => d.count > best.count ? d : best, visible[0]);
  const modeX = padLeft + visible.findIndex(d => d.length === mode.length) * barW + barW / 2;
  const modeY = padTop + chartH - (mode.count / maxCount) * chartH - 6;
  ctx.fillStyle = '#c67c00';
  ctx.font = 'bold 11px "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${mode.length} chars`, modeX, modeY);

  // X axis label
  ctx.fillStyle = '#888';
  ctx.font = '11px "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('name length (characters)', padLeft + chartW / 2, H);
}

function renderSaintsChart(stats) {
  const container = document.getElementById('saints-chart');
  if (!container) return;

  const top = stats.topSaints.slice(0, 12);
  const maxCount = top[0].count;

  container.innerHTML = top.map(d => `
    <li class="horiz-bar-row">
      <span class="horiz-bar-label">Saint(e)-${d.saint}</span>
      <span class="horiz-bar-track">
        <span class="horiz-bar-fill" style="width:${(d.count / maxCount * 100).toFixed(1)}%"></span>
      </span>
      <span class="horiz-bar-val">${d.count}</span>
    </li>
  `).join('');
}

function renderDupTable(stats) {
  const tbody = document.querySelector('#dup-table tbody');
  if (!tbody) return;

  const top = stats.topNames.filter(d => d.count > 1).slice(0, 12);
  tbody.innerHTML = top.map((d, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="nm">${d.name}</td>
      <td class="count">${d.count}×</td>
    </tr>
  `).join('');
}

function renderShortestTable(stats) {
  const tbody = document.querySelector('#shortest-table tbody');
  if (!tbody) return;

  tbody.innerHTML = stats.shortest.slice(0, 14).map((d, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="nm">${d.name}</td>
      <td class="dept">dept. ${d.dept}</td>
      <td class="chars">${d.length}L</td>
    </tr>
  `).join('');
}

function renderLongestTable(stats) {
  const tbody = document.querySelector('#longest-table tbody');
  if (!tbody) return;

  tbody.innerHTML = stats.longest.slice(0, 12).map((d, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="nm" style="font-size:11px;word-break:break-word">${d.name}</td>
      <td class="chars">${d.length}L</td>
    </tr>
  `).join('');
}

async function main() {
  try {
    const stats = await loadStats();

    renderLengthChart(stats);
    renderSaintsChart(stats);
    renderDupTable(stats);
    renderShortestTable(stats);
    renderLongestTable(stats);

  } catch (err) {
    console.error('commune-names charts error:', err);
  }
}

main();
