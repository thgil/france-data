/* bar-deserts/charts.js — horizontal bar chart + table helpers */

export function drawDeptChart(selector, depts) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Top 15 departments by density
  const data = depts.slice(0, 15);
  const maxVal = data[0].per1000;
  const nationalAvg = 0.733;

  const margin = { top: 8, right: 100, bottom: 32, left: 152 };
  const rowHeight = 28;
  const chartH = data.length * rowHeight;
  const svgW = Math.min(container.clientWidth || 680, 680);
  const svgH = chartH + margin.top + margin.bottom;
  const innerW = svgW - margin.left - margin.right;

  const scale = v => (v / (maxVal * 1.08)) * innerW;
  const avgX = scale(nationalAvg);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}"
    viewBox="0 0 ${svgW} ${svgH}" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;display:block;width:100%;max-width:680px;">`;

  svg += `<g transform="translate(${margin.left},${margin.top})">`;

  // National average line
  svg += `<line x1="${avgX}" x2="${avgX}" y1="0" y2="${chartH}"
    stroke="#b32020" stroke-width="1" stroke-dasharray="3,3" opacity="0.7"/>`;

  data.forEach((d, i) => {
    const y = i * rowHeight;
    const barW = scale(d.per1000);
    const isTop = i < 5;
    const fill = isTop ? '#8b5e3c' : '#c8b89a';
    const textY = y + rowHeight * 0.65;

    // Row bg on hover (static alt rows)
    if (i % 2 === 0) {
      svg += `<rect x="${-margin.left}" y="${y}" width="${svgW}" height="${rowHeight - 1}" fill="#f5f1ea" opacity="0.5"/>`;
    }

    // Bar
    svg += `<rect x="0" y="${y + 4}" width="${barW}" height="${rowHeight - 10}" fill="${fill}" rx="2"/>`;

    // Dept name (left label)
    svg += `<text x="-8" y="${textY}" text-anchor="end" font-size="12" fill="#1a1a1a">${escSVG(d.name)}</text>`;

    // Value label
    svg += `<text x="${barW + 6}" y="${textY}" font-size="12" fill="#555" font-variant-numeric="tabular-nums">${d.per1000.toFixed(2)}</text>`;
  });

  // X-axis
  svg += `<line x1="0" x2="${innerW}" y1="${chartH}" x2="${innerW}" y2="${chartH}" stroke="#ccc" stroke-width="1"/>`;

  // National avg label
  svg += `<text x="${avgX + 4}" y="${chartH + 20}" font-size="10" fill="#b32020">national avg (${nationalAvg})</text>`;

  svg += `</g></svg>`;
  container.innerHTML = svg;
}

export function populateDeptTables(topTbodyId, bottomTbodyId, depts) {
  const topEl = document.getElementById(topTbodyId);
  if (topEl) {
    topEl.innerHTML = depts.slice(0, 8).map((d, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td>${d.per1000.toFixed(2)} / 1k</td>
        <td>${d.bars.toLocaleString('fr-FR')} bars</td>
      </tr>`
    ).join('');
  }

  const bottomEl = document.getElementById(bottomTbodyId);
  if (bottomEl) {
    const bottom = depts.slice().reverse().filter(d => /^\d/.test(d.dept) && d.dept !== '97').slice(0, 6);
    bottomEl.innerHTML = bottom.map((d, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td>${d.per1000.toFixed(2)} / 1k</td>
        <td>${d.bars.toLocaleString('fr-FR')} bars</td>
      </tr>`
    ).join('');
  }
}

export function populateCommuneTable(tbodyId, communes) {
  const el = document.getElementById(tbodyId);
  if (!el) return;
  el.innerHTML = communes.slice(0, 12).map((c, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${c.name}</td>
      <td class="place-sub">${c.deptName}</td>
      <td>${c.bars} bars / ${c.pop.toLocaleString('fr-FR')} pop</td>
      <td>${c.per1000.toFixed(1)} / 1k</td>
    </tr>`
  ).join('');
}

function escSVG(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
