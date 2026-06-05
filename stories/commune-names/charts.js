/**
 * commune-names/charts.js
 * Renders the name-length histogram and the top-rivers bar chart.
 */

export function drawLengthHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const margin = { top: 12, right: 12, bottom: 40, left: 44 };
  const totalW = container.clientWidth || 680;
  const totalH = 220;
  const w = totalW - margin.left - margin.right;
  const h = totalH - margin.top - margin.bottom;

  const maxCount = Math.max(...lengthDist.map(d => d.count));
  const chars = lengthDist.map(d => d.chars);
  const minChar = Math.min(...chars);
  const maxChar = Math.max(...chars);

  const barW = Math.max(1, Math.floor(w / (maxChar - minChar + 1)) - 1);

  function xPos(c) {
    return Math.round(((c - minChar) / (maxChar - minChar)) * w);
  }
  function yPos(count) {
    return h - Math.round((count / maxCount) * h);
  }

  const bars = lengthDist.map(d => {
    const x = xPos(d.chars);
    const y = yPos(d.count);
    const barH = h - y;
    return `<rect x="${margin.left + x}" y="${margin.top + y}" width="${barW}" height="${barH}"
      fill="#b32020" opacity="0.75">
      <title>${d.chars} chars: ${d.count.toLocaleString('fr-FR')} communes</title>
    </rect>`;
  }).join('');

  // X axis ticks: every 5 chars
  const xTicks = [];
  for (let c = Math.ceil(minChar / 5) * 5; c <= maxChar; c += 5) {
    const x = margin.left + xPos(c);
    xTicks.push(`
      <line x1="${x}" y1="${margin.top + h}" x2="${x}" y2="${margin.top + h + 4}" stroke="#888" stroke-width="1"/>
      <text x="${x}" y="${margin.top + h + 16}" text-anchor="middle" font-size="11" fill="#888">${c}</text>
    `);
  }

  // Y axis ticks
  const yTickValues = [0, Math.round(maxCount / 2), maxCount];
  const yTicks = yTickValues.map(v => {
    const y = margin.top + yPos(v);
    return `
      <line x1="${margin.left - 4}" y1="${y}" x2="${margin.left}" y2="${y}" stroke="#888" stroke-width="1"/>
      <text x="${margin.left - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#888">${v.toLocaleString('fr-FR')}</text>
    `;
  });

  const svg = `<svg width="${totalW}" height="${totalH}" role="img" aria-label="Name length distribution">
    <rect width="${totalW}" height="${totalH}" fill="none"/>
    <!-- Axes -->
    <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + h}" stroke="#ccc" stroke-width="1"/>
    <line x1="${margin.left}" y1="${margin.top + h}" x2="${margin.left + w}" y2="${margin.top + h}" stroke="#ccc" stroke-width="1"/>
    ${bars}
    ${xTicks.join('')}
    ${yTicks.join('')}
    <text x="${margin.left + w / 2}" y="${totalH - 2}" text-anchor="middle" font-size="11" fill="#888">characters in name</text>
  </svg>`;

  container.innerHTML = svg;
}

export function drawRiversChart(selector, topRivers) {
  const container = document.querySelector(selector);
  if (!container) return;

  const margin = { top: 8, right: 60, bottom: 8, left: 120 };
  const rowH = 26;
  const totalH = margin.top + topRivers.length * rowH + margin.bottom;
  const totalW = container.clientWidth || 560;
  const w = totalW - margin.left - margin.right;
  const maxCount = topRivers[0].count;

  const rows = topRivers.map((d, i) => {
    const y = margin.top + i * rowH;
    const barW = Math.round((d.count / maxCount) * w);
    return `
      <text x="${margin.left - 8}" y="${y + rowH / 2 + 4}" text-anchor="end" font-size="13" font-family="Georgia,serif" fill="#1a1a1a">-sur-${d.river}</text>
      <rect x="${margin.left}" y="${y + 4}" width="${barW}" height="${rowH - 10}" fill="#b32020" opacity="0.75" rx="2"/>
      <text x="${margin.left + barW + 6}" y="${y + rowH / 2 + 4}" font-size="12" fill="#444">${d.count}</text>
    `;
  }).join('');

  const svg = `<svg width="${totalW}" height="${totalH}" role="img" aria-label="Most common rivers in commune names">
    ${rows}
  </svg>`;

  container.innerHTML = svg;
}
