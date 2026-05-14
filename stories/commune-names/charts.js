// stories/commune-names/charts.js
// Chart.js horizontal bar for most-duplicated commune names,
// plus table population helpers.

const CHART_JS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

async function loadChartJS() {
  if (window.Chart) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CHART_JS_CDN;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function drawTopNamesChart(selector, data) {
  await loadChartJS();

  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const labels = data.map(d => d.name);
  const values = data.map(d => d.count);

  new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: '#b32020',
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} communes named "${ctx.label}"`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { size: 11 },
            color: '#666',
          },
          grid: { color: '#ede8e0' },
          border: { color: '#d8d0c0' },
          title: {
            display: true,
            text: 'Number of communes sharing this name',
            font: { size: 11 },
            color: '#888',
          },
        },
        y: {
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          },
          grid: { display: false },
          border: { color: '#d8d0c0' },
        },
      },
    },
  });
}

export function populateTables(stats) {
  const longestTbody = document.querySelector('#table-longest tbody');
  if (longestTbody && stats.longestNames) {
    longestTbody.innerHTML = stats.longestNames.slice(0, 8).map(d =>
      `<tr>
        <td>
          <span class="commune-name">${d.name}</span>
          <span class="dept-label"> — ${d.deptName}</span>
        </td>
        <td>${d.len} chars</td>
      </tr>`
    ).join('');
  }

  const shortestTbody = document.querySelector('#table-shortest tbody');
  if (shortestTbody && stats.shortestNames) {
    shortestTbody.innerHTML = stats.shortestNames.slice(0, 15).map(d =>
      `<tr>
        <td>
          <span class="commune-name">${d.name}</span>
          <span class="dept-label"> — ${d.deptName}</span>
        </td>
        <td>${d.pop.toLocaleString('fr-FR')} pop.</td>
      </tr>`
    ).join('');
  }
}
