import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

export function drawLengthChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const dist = stats.lengthDist;
  const data = Object.entries(dist).map(([len, count]) => ({
    len: +len,
    count,
  }));

  const chart = Plot.plot({
    width: Math.min(el.clientWidth || 680, 680),
    height: 220,
    marginLeft: 40,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 36,
    style: {
      background: 'transparent',
      fontFamily: "'Helvetica Neue', sans-serif",
      fontSize: '12px',
      color: '#1a1a1a',
    },
    x: {
      label: 'Name length (characters)',
      labelOffset: 32,
      tickSpacing: 40,
    },
    y: {
      label: 'Number of communes',
      grid: true,
      tickFormat: d => d >= 1000 ? `${d / 1000}k` : d,
    },
    marks: [
      Plot.rectY(data, {
        x1: d => d.len - 0.5,
        x2: d => d.len + 0.5,
        y: 'count',
        fill: '#b32020',
        fillOpacity: 0.75,
      }),
      Plot.ruleY([0]),
    ],
  });

  el.append(chart);
}

export function populateTables(stats) {
  // Shortest names table
  const shortTbody = document.querySelector('#table-shortest tbody');
  if (shortTbody) {
    shortTbody.innerHTML = stats.shortest.slice(0, 12).map(c =>
      `<tr>
        <td class="name-cell">${c.name}</td>
        <td class="len-cell">${c.len}</td>
        <td class="dept-cell">${c.dept}</td>
        <td class="pop-cell">${(c.pop || 0).toLocaleString('fr-FR')}</td>
      </tr>`
    ).join('');
  }

  // Most common names table
  const commonTbody = document.querySelector('#table-common tbody');
  if (commonTbody) {
    commonTbody.innerHTML = stats.mostCommon.map((row, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="name-cell">${row.name}</td>
        <td class="count-cell">${row.count} communes</td>
      </tr>`
    ).join('');
  }

  // Longest names table
  const longTbody = document.querySelector('#table-longest tbody');
  if (longTbody) {
    longTbody.innerHTML = stats.longest.slice(0, 8).map(c =>
      `<tr>
        <td class="name-cell long-name">${c.name}</td>
        <td class="len-cell">${c.len}</td>
        <td class="dept-cell">${c.dept}</td>
      </tr>`
    ).join('');
  }

  // Top saints table
  const saintTbody = document.querySelector('#table-saints tbody');
  if (saintTbody) {
    saintTbody.innerHTML = stats.saintSeconds.map((row, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="name-cell">Saint-${row.saint} / Sainte-${row.saint}</td>
        <td class="count-cell">${row.count} communes</td>
      </tr>`
    ).join('');
  }
}
