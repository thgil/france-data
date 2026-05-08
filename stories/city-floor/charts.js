/* charts.js — city-floor story */

export function drawBucketChart(mountSelector, buckets) {
  const el = document.querySelector(mountSelector);
  if (!el) return;

  const W = el.clientWidth || 640;
  const rowH = 44;
  const labelW = 120;
  const pctW = W - labelW - 80; // space for pct label on right
  const H = buckets.length * rowH + 40;

  const maxPct = 55; // fixed scale to 55%

  function color(pct) {
    // Interpolate from #c0392b (red, high desert) to #5a8a6a (green-ish, low desert)
    const t = pct / maxPct;
    const r = Math.round(192 + (90 - 192) * (1 - t));
    const g = Math.round(57 + (138 - 57) * (1 - t));
    const b = Math.round(43 + (106 - 43) * (1 - t));
    return `rgb(${r},${g},${b})`;
  }

  const rows = buckets.map((b, i) => {
    const y = i * rowH + 20;
    const barW = Math.max(2, (b.desertPct / maxPct) * pctW);
    const col = color(b.desertPct);
    return `
      <text x="${labelW - 8}" y="${y + 14}" text-anchor="end" font-family="'Helvetica Neue',sans-serif" font-size="12" fill="#444">${b.label}</text>
      <rect x="${labelW}" y="${y}" width="${barW}" height="24" fill="${col}" rx="2"/>
      <text x="${labelW + barW + 6}" y="${y + 15}" font-family="'Helvetica Neue',sans-serif" font-size="12" font-weight="600" fill="#1a1a1a">${b.desertPct}%</text>
      <text x="${labelW + barW + 6}" y="${y + 27}" font-family="'Helvetica Neue',sans-serif" font-size="10" fill="#888">${b.deserts.toLocaleString('fr-FR')} of ${b.total.toLocaleString('fr-FR')}</text>
    `;
  }).join('');

  // Threshold tick at 2.5 equivalent on the scale isn't directly shown here;
  // this chart is purely desert %.
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <text x="${labelW}" y="12" font-family="'Helvetica Neue',sans-serif" font-size="10" font-weight="600" letter-spacing="1" text-transform="uppercase" fill="#888">COMMUNE SIZE (RESIDENTS)</text>
    ${rows}
  </svg>`;

  el.innerHTML = svg;
}

export function drawCityDots(mountSelector, cities) {
  const el = document.querySelector(mountSelector);
  if (!el) return;

  const W = el.clientWidth || 720;
  const marginL = 48;
  const marginR = 24;
  const marginT = 32;
  const marginB = 40;
  const plotW = W - marginL - marginR;
  const H = 320;
  const plotH = H - marginT - marginB;

  const aplMin = 0;
  const aplMax = 8;

  function xScale(apl) {
    return marginL + (apl - aplMin) / (aplMax - aplMin) * plotW;
  }

  // Log-scale population for y-axis
  const popMin = Math.log(50000);
  const popMax = Math.log(550000);
  function yScale(pop) {
    return marginT + plotH - (Math.log(pop) - popMin) / (popMax - popMin) * plotH;
  }

  // Axis ticks
  const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const yTickPops = [50000, 100000, 200000, 500000];
  const yTickLabels = ['50K', '100K', '200K', '500K'];

  const xTickSVG = xTicks.map(v => {
    const x = xScale(v);
    return `
      <line x1="${x}" y1="${marginT}" x2="${x}" y2="${marginT + plotH}" stroke="#e8e4dc" stroke-width="1"/>
      <text x="${x}" y="${marginT + plotH + 16}" text-anchor="middle" font-family="'Helvetica Neue',sans-serif" font-size="11" fill="#888">${v}</text>
    `;
  }).join('');

  const yTickSVG = yTickPops.map((pop, i) => {
    const y = yScale(pop);
    return `
      <line x1="${marginL}" y1="${y}" x2="${marginL + plotW}" y2="${y}" stroke="#e8e4dc" stroke-width="1"/>
      <text x="${marginL - 6}" y="${y + 4}" text-anchor="end" font-family="'Helvetica Neue',sans-serif" font-size="10" fill="#888">${yTickLabels[i]}</text>
    `;
  }).join('');

  // APL 2.5 threshold
  const threshX = xScale(2.5);
  const threshLine = `
    <line x1="${threshX}" y1="${marginT}" x2="${threshX}" y2="${marginT + plotH}" stroke="#b32020" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="${threshX + 4}" y="${marginT + 12}" font-family="'Helvetica Neue',sans-serif" font-size="10" fill="#b32020">APL 2.5 threshold</text>
  `;

  // Dots
  const dots = cities.map(c => {
    const x = xScale(c.apl);
    const y = yScale(Math.max(50000, c.pop));
    const r = Math.max(3, Math.min(10, Math.sqrt(c.pop / 50000) * 3));
    const fill = c.desert ? '#b32020' : '#2c7bb6';
    const opacity = 0.75;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" fill-opacity="${opacity}" stroke="white" stroke-width="0.5">
      <title>${c.name} (dept ${c.dept}) — Pop: ${c.pop.toLocaleString('fr-FR')} — APL: ${c.apl}</title>
    </circle>`;
  }).join('');

  // Label a few notable cities
  const notable = ['Argenteuil', 'Saint-Laurent-du-Maroni', 'Strasbourg', 'Bordeaux', 'Marseille', 'Lyon'];
  const labels = cities.filter(c => notable.includes(c.name)).map(c => {
    const x = xScale(c.apl);
    const y = yScale(Math.max(50000, c.pop));
    const anchor = c.apl < 3 ? 'start' : 'end';
    const dx = c.apl < 3 ? 7 : -7;
    const dy = c.name === 'Argenteuil' ? -8 : 4;
    return `<text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" font-family="Georgia,serif" font-size="11" fill="#1a1a1a" font-style="italic">${c.name}</text>`;
  }).join('');

  // Axis labels
  const xAxisLabel = `<text x="${marginL + plotW / 2}" y="${H - 4}" text-anchor="middle" font-family="'Helvetica Neue',sans-serif" font-size="11" fill="#666">APL score (GP accessibility)</text>`;
  const yAxisLabel = `<text x="10" y="${marginT + plotH / 2}" text-anchor="middle" font-family="'Helvetica Neue',sans-serif" font-size="11" fill="#666" transform="rotate(-90, 10, ${marginT + plotH / 2})">Population (log scale)</text>`;

  // Legend
  const legX = W - marginR - 130;
  const legY = marginT + 4;
  const legend = `
    <circle cx="${legX}" cy="${legY}" r="5" fill="#b32020" fill-opacity="0.75"/>
    <text x="${legX + 9}" y="${legY + 4}" font-family="'Helvetica Neue',sans-serif" font-size="11" fill="#444">Medical desert (&lt;2.5)</text>
    <circle cx="${legX}" cy="${legY + 18}" r="5" fill="#2c7bb6" fill-opacity="0.75"/>
    <text x="${legX + 9}" y="${legY + 22}" font-family="'Helvetica Neue',sans-serif" font-size="11" fill="#444">Good access (≥2.5)</text>
  `;

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${xTickSVG}
    ${yTickSVG}
    ${threshLine}
    ${dots}
    ${labels}
    ${xAxisLabel}
    ${yAxisLabel}
    ${legend}
    <rect x="${marginL}" y="${marginT}" width="${plotW}" height="${plotH}" fill="none" stroke="#ccc" stroke-width="1"/>
  </svg>`;

  el.innerHTML = svg;
}
