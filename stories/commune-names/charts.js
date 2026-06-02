/* commune-names/charts.js */

export function drawLengthChart(selector, lengthDist) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const filteredDist = lengthDist.filter(d => d.length >= 1 && d.length <= 45);
  const maxCount = Math.max(...filteredDist.map(d => d.count));
  const padL = 52, padR = 20, padT = 20, padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const barCount = filteredDist.length;
  const barW = plotW / barCount;

  ctx.fillStyle = '#faf7f2';
  ctx.fillRect(0, 0, W, H);

  // Y-axis gridlines
  ctx.strokeStyle = '#e0d8cc';
  ctx.lineWidth = 0.5;
  const yTicks = [500, 1000, 1500, 2000, 2500, 3000].filter(t => t <= maxCount + 200);
  yTicks.forEach(tick => {
    const y = padT + plotH - (tick / maxCount) * plotH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();

    ctx.fillStyle = '#999';
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(tick.toLocaleString('fr-FR'), padL - 6, y + 3.5);
  });

  // Bars
  filteredDist.forEach((d, i) => {
    const barH = (d.count / maxCount) * plotH;
    const x = padL + i * barW;
    const y = padT + plotH - barH;

    // Highlight the key lengths
    if (d.length === 1) {
      ctx.fillStyle = '#b32020';
    } else if (d.length >= 40) {
      ctx.fillStyle = '#c67c00';
    } else {
      ctx.fillStyle = '#4a7fb5';
    }

    ctx.fillRect(x + 1, y, barW - 2, barH);
  });

  // X-axis labels (every 5)
  ctx.fillStyle = '#666';
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  filteredDist.forEach((d, i) => {
    if (d.length % 5 === 0) {
      const x = padL + i * barW + barW / 2;
      ctx.fillText(d.length, x, padT + plotH + 16);
    }
  });

  // X-axis label
  ctx.fillStyle = '#888';
  ctx.font = '11px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('name length (characters)', padL + plotW / 2, H - 4);

  // Annotations
  ctx.font = 'bold 10px Helvetica Neue, sans-serif';
  ctx.fillStyle = '#b32020';
  ctx.textAlign = 'left';
  ctx.fillText('← "Y"', padL + 3, padT + plotH - 4);
}

export function drawFirstWordsChart(selector, topFirstWords) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  // Show top 12 first words
  const data = topFirstWords.slice(0, 12);
  const maxVal = data[0].count;

  const padL = 90, padR = 60, padT = 16, padB = 16;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const rowH = plotH / data.length;

  ctx.fillStyle = '#faf7f2';
  ctx.fillRect(0, 0, W, H);

  data.forEach((d, i) => {
    const y = padT + i * rowH;
    const barW = (d.count / maxVal) * plotW;

    // Highlight saints
    const isSaint = d.word === 'Saint' || d.word === 'Sainte';
    ctx.fillStyle = isSaint ? '#b32020' : '#4a7fb5';
    ctx.fillRect(padL, y + 4, barW, rowH - 8);

    // Word label
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `${isSaint ? 'bold ' : ''}13px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.fillText(d.word, padL - 8, y + rowH / 2 + 4.5);

    // Count label
    ctx.fillStyle = '#444';
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.count.toLocaleString('fr-FR'), padL + barW + 6, y + rowH / 2 + 4);
  });
}
