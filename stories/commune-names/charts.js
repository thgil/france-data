export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Focus on the interesting range: 1–35 chars (99.9% of data)
  const data = lengthDist.filter(d => d.length <= 35);
  const maxCount = Math.max(...data.map(d => d.count));
  const totalShown = data.reduce((s, d) => s + d.count, 0);

  const W = container.clientWidth || 640;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 28, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const barW = Math.floor(innerW / data.length) - 1;
  const scaleY = v => innerH - (v / maxCount) * innerH;

  const bars = data.map((d, i) => {
    const x = PAD.left + i * (innerW / data.length);
    const barH = (d.count / maxCount) * innerH;
    const y = PAD.top + innerH - barH;
    const fill = d.length <= 3 ? '#c67c00' : d.length >= 38 ? '#7c3c00' : '#b0a090';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(barW, 1)}" height="${barH.toFixed(1)}" fill="${fill}" opacity="0.85"/>`;
  }).join('');

  // Y-axis ticks
  const yTicks = [0, 1000, 2000, 3000].filter(t => t <= maxCount);
  const yLines = yTicks.map(t => {
    const y = PAD.top + scaleY(t);
    return `<line x1="${PAD.left}" x2="${PAD.left + innerW}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e0d8cc" stroke-width="1"/>
            <text x="${(PAD.left - 4).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#888">${t >= 1000 ? (t/1000)+'k' : t}</text>`;
  }).join('');

  // X-axis labels (every 5)
  const xLabels = data.filter(d => d.length % 5 === 0 || d.length === 1).map((d, i) => {
    const idx = data.indexOf(d);
    const x = PAD.left + idx * (innerW / data.length) + barW / 2;
    return `<text x="${x.toFixed(1)}" y="${(H - 6).toFixed(1)}" text-anchor="middle" font-size="10" fill="#888">${d.length}</text>`;
  }).join('');

  // Annotation for peak
  const peakLen = data.reduce((best, d) => d.count > best.count ? d : best, data[0]);
  const peakIdx = data.indexOf(peakLen);
  const peakX = PAD.left + peakIdx * (innerW / data.length) + barW / 2;
  const peakY = PAD.top + scaleY(peakLen.count) - 4;
  const annotation = `<text x="${peakX.toFixed(1)}" y="${(peakY - 2).toFixed(1)}" text-anchor="middle" font-size="9" fill="#666">${peakLen.length} chars: ${peakLen.count.toLocaleString('fr-FR')}</text>`;

  container.innerHTML = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible">
    ${yLines}
    ${bars}
    ${xLabels}
    ${annotation}
    <text x="${PAD.left}" y="${(PAD.top - 4).toFixed(1)}" font-size="9" fill="#aaa">communes</text>
    <text x="${(W/2).toFixed(1)}" y="${H}" text-anchor="middle" font-size="10" fill="#aaa">characters in commune name</text>
  </svg>`;
}

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = topNames.slice(0, 15);
  const maxCount = data[0].count;

  const W = container.clientWidth || 640;
  const ROW_H = 26;
  const LABEL_W = 200;
  const BAR_AREA = W - LABEL_W - 60;
  const H = data.length * ROW_H + 16;

  const rows = data.map((d, i) => {
    const y = i * ROW_H + 8;
    const barW = (d.count / maxCount) * BAR_AREA;
    const isSaint = d.name.startsWith('Saint') || d.name.startsWith('Sainte');
    return `
      <text x="${LABEL_W - 8}" y="${(y + ROW_H * 0.65).toFixed(1)}" text-anchor="end" font-size="12" font-family="Georgia,serif" fill="#1a1a1a">${d.name}</text>
      <rect x="${LABEL_W}" y="${(y + 4).toFixed(1)}" width="${barW.toFixed(1)}" height="${(ROW_H - 8).toFixed(1)}" fill="${isSaint ? '#c67c00' : '#b0a090'}" opacity="0.8"/>
      <text x="${(LABEL_W + barW + 6).toFixed(1)}" y="${(y + ROW_H * 0.65).toFixed(1)}" font-size="11" fill="#444">${d.count}×</text>
    `;
  }).join('');

  container.innerHTML = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible">
    ${rows}
  </svg>`;
}
