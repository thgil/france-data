async function main() {
  const res = await fetch('./data.json');
  if (!res.ok) throw new Error(`data.json: HTTP ${res.status}`);
  const data = await res.json();

  populateCallouts(data.summary);
  drawDistributionChart(data.buckets);
  populateSmallest(data.smallest);
  populateLargest(data.largest, data.summary.parisTotalPop);
}

function populateCallouts(summary) {
  const total = document.getElementById('cn-total');
  const median = document.getElementById('cn-median');
  if (total) total.textContent = summary.totalCommunes.toLocaleString('fr-FR');
  if (median) median.textContent = summary.medianPop.toLocaleString('fr-FR');
}

function drawDistributionChart(buckets) {
  const container = document.getElementById('chart-distribution');
  if (!container) return;

  const W = 700;
  const H = 320;
  const marginLeft = 110;
  const marginRight = 20;
  const marginTop = 10;
  const marginBottom = 40;
  const innerW = W - marginLeft - marginRight;
  const innerH = H - marginTop - marginBottom;

  const n = buckets.length;
  const groupGap = 10;
  const barGap = 2;
  const groupW = (innerW - groupGap * (n - 1)) / n;
  const barW = (groupW - barGap) / 2;

  const maxVal = Math.max(
    ...buckets.map(b => b.communePct),
    ...buckets.map(b => b.populationPct)
  );
  const yScale = innerH / (maxVal * 1.05);

  function x(i, barIndex) {
    return marginLeft + i * (groupW + groupGap) + barIndex * (barW + barGap);
  }
  function y(val) {
    return marginTop + innerH - val * yScale;
  }
  function barH(val) {
    return val * yScale;
  }

  // Y axis ticks
  const yTicks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  const yTickLines = yTicks
    .filter(t => t <= maxVal * 1.05)
    .map(t => {
      const yy = y(t);
      return `
        <line x1="${marginLeft}" x2="${W - marginRight}" y1="${yy}" y2="${yy}"
              stroke="#e8e0d8" stroke-width="1" />
        <text x="${marginLeft - 6}" y="${yy + 4}" text-anchor="end"
              font-family="'Helvetica Neue', sans-serif" font-size="10" fill="#888">${t}%</text>`;
    }).join('');

  // Bars
  const bars = buckets.map((b, i) => {
    const x0 = x(i, 0);
    const x1 = x(i, 1);
    const y0 = y(b.communePct);
    const y1 = y(b.populationPct);
    const h0 = barH(b.communePct);
    const h1 = barH(b.populationPct);

    // Value labels on top (only if bar is tall enough)
    const label0 = h0 > 14
      ? `<text x="${x0 + barW / 2}" y="${y0 - 3}" text-anchor="middle"
              font-family="'Helvetica Neue', sans-serif" font-size="9" fill="#6b8cba">${b.communePct}%</text>`
      : '';
    const label1 = h1 > 14
      ? `<text x="${x1 + barW / 2}" y="${y1 - 3}" text-anchor="middle"
              font-family="'Helvetica Neue', sans-serif" font-size="9" fill="#c67c00">${b.populationPct}%</text>`
      : '';

    // X-axis label (rotated)
    const labelX = x0 + groupW / 2;
    const labelY = marginTop + innerH + 12;
    const xLabel = `
      <text transform="translate(${labelX},${labelY}) rotate(-35)"
            text-anchor="end" dominant-baseline="middle"
            font-family="'Helvetica Neue', sans-serif" font-size="10" fill="#555">${b.label}</text>`;

    return `
      <rect x="${x0}" y="${y0}" width="${barW}" height="${h0}" fill="#6b8cba" rx="1"/>
      <rect x="${x1}" y="${y1}" width="${barW}" height="${h1}" fill="#c67c00" rx="1"/>
      ${label0}${label1}${xLabel}`;
  }).join('');

  // Y axis label
  const yAxisLabel = `
    <text transform="translate(14,${marginTop + innerH / 2}) rotate(-90)"
          text-anchor="middle" font-family="'Helvetica Neue', sans-serif"
          font-size="10" fill="#888">share (%)</text>`;

  const svg = `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
         style="width:100%;max-width:${W}px;display:block;font-family:sans-serif">
      ${yAxisLabel}
      ${yTickLines}
      ${bars}
      <line x1="${marginLeft}" x2="${marginLeft}" y1="${marginTop}" y2="${marginTop + innerH}"
            stroke="#ccc" stroke-width="1"/>
      <line x1="${marginLeft}" x2="${W - marginRight}" y1="${marginTop + innerH}" y2="${marginTop + innerH}"
            stroke="#ccc" stroke-width="1"/>
    </svg>`;

  container.innerHTML = svg;
}

function populateSmallest(smallest) {
  const tbody = document.querySelector('#table-smallest tbody');
  if (!tbody) return;
  tbody.innerHTML = smallest.map((c, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${c.name} <span style="color:#aaa;font-size:11px">(${c.dept})</span></td>
      <td>${c.pop.toLocaleString('fr-FR')} ${c.pop === 1 ? 'person' : 'people'}</td>
    </tr>`).join('');
}

function populateLargest(largest, parisTotalPop) {
  const tbody = document.querySelector('#table-largest tbody');
  if (!tbody) return;

  // Filter out Paris arrondissements, keep only cities
  const cities = largest.filter(c => !c.name.includes('Arrondissement'));

  const rows = cities.map((c, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${c.name}</td>
      <td>${c.pop.toLocaleString('fr-FR')}</td>
    </tr>`).join('');

  // Add Paris note at bottom
  const parisNote = `
    <tr>
      <td class="rank" style="color:#bbb">★</td>
      <td class="place" style="color:#888;font-style:italic">Paris (20 arrondissements)</td>
      <td style="color:#888">${parisTotalPop.toLocaleString('fr-FR')}</td>
    </tr>`;

  tbody.innerHTML = rows + parisNote;
}

main().catch(err => console.error('tiny-communes charts error:', err));
