/* charts.js — commune-y story */

const ACCENT   = '#b32020';
const MUTED    = '#c8bfb0';
const PAPER    = '#faf7f2';
const INK_SOFT = '#3a3a3a';

function buildShortTable(stats) {
  const tbody = document.querySelector('#table-short tbody');
  if (!tbody) return;
  tbody.innerHTML = stats.shortNames.map(c =>
    `<tr>
      <td class="name-cell">${c.name}</td>
      <td>${c.deptName} (${c.dept})</td>
      <td class="num-cell">${c.pop.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

function buildLengthChart(stats, Chart) {
  const ctx = document.getElementById('chart-length');
  if (!ctx) return;

  const data  = stats.nameLengthDist;
  const max   = Math.max(...data.map(d => d.count));

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.len),
      datasets: [{
        data:            data.map(d => d.count),
        backgroundColor: data.map(d => d.count === max ? ACCENT : MUTED),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => `${items[0].label} characters`,
            label: item => `${item.raw.toLocaleString('fr-FR')} communes`,
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Name length (characters)', color: '#888', font: { size: 11 } },
          grid: { display: false },
          ticks: { color: '#888', font: { size: 11 } },
        },
        y: {
          title: { display: false },
          grid: { color: '#ede8e0' },
          ticks: {
            color: '#888',
            font: { size: 11 },
            callback: v => v.toLocaleString('fr-FR'),
          },
        }
      }
    }
  });
}

function buildDuplicatesChart(stats, Chart) {
  const ctx = document.getElementById('chart-duplicates');
  if (!ctx) return;

  const data = stats.topDuplicates.slice(0, 10);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        data:            data.map(d => d.count),
        backgroundColor: data.map((d, i) => i === 0 ? ACCENT : MUTED),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: item => `${item.raw} communes share this name`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#ede8e0' },
          ticks: { color: '#888', font: { size: 11 }, stepSize: 1 },
          min: 0,
          max: 14,
        },
        y: {
          grid: { display: false },
          ticks: { color: INK_SOFT, font: { size: 13, family: 'Georgia, serif' } },
        }
      }
    }
  });
}

function buildSaintsChart(stats, Chart) {
  const ctx = document.getElementById('chart-saints');
  if (!ctx) return;

  const data = stats.topSaintNames.slice(0, 10);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => `Saint-${d.saint}`),
      datasets: [{
        data:            data.map(d => d.count),
        backgroundColor: data.map((d, i) => i === 0 ? ACCENT : MUTED),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: item => `${item.raw} communes begin with this saint's name`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#ede8e0' },
          ticks: { color: '#888', font: { size: 11 } },
          min: 0,
        },
        y: {
          grid: { display: false },
          ticks: { color: INK_SOFT, font: { size: 13, family: 'Georgia, serif' } },
        }
      }
    }
  });
}

export async function drawCharts(stats) {
  const { Chart, registerables } = await import('https://cdn.jsdelivr.net/npm/chart.js@4/+esm');
  Chart.register(...registerables);

  buildShortTable(stats);
  buildLengthChart(stats, Chart);
  buildDuplicatesChart(stats, Chart);
  buildSaintsChart(stats, Chart);
}
