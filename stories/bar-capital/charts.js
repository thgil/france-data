// stories/bar-capital/charts.js
// Two horizontal bar charts: big cities + Paris arrondissements.
// Loaded as a module from index.html.

export function drawCharts(stats) {
  drawBigCitiesChart(stats.bigCities);
  drawParisChart(stats.parisArr);
}

function drawBigCitiesChart(cities) {
  const canvas = document.getElementById('chart-big-cities');
  if (!canvas) return;

  // Top 20 by per10k, plus a couple of low anchors for context
  const displayed = cities.slice(0, 20);
  const labels = displayed.map(c => c.name);
  const values = displayed.map(c => c.per10k);

  // Colour: Paris arrondissements in accent red, others in amber
  const colors = displayed.map(c =>
    c.dept === '75' ? 'rgba(179,32,32,0.75)' : 'rgba(198,124,0,0.75)'
  );
  const borderColors = displayed.map(c =>
    c.dept === '75' ? 'rgba(179,32,32,1)' : 'rgba(198,124,0,1)'
  );

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
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
            label: (ctx) => {
              const c = displayed[ctx.dataIndex];
              return ` ${ctx.parsed.x} bars per 10,000 · ${c.bars.toLocaleString('fr-FR')} bars · pop ${c.pop.toLocaleString('fr-FR')}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: 'Bars per 10,000 residents', font: { size: 11 }, color: '#888' },
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { font: { size: 11 }, color: '#666' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#333' }
        }
      }
    }
  });
}

function drawParisChart(parisArr) {
  const canvas = document.getElementById('chart-paris');
  if (!canvas) return;

  const sorted = [...parisArr].sort((a, b) => b.per10k - a.per10k);

  // Ordinal label: 75101 → "1er", 75102 → "2e", etc.
  const arrLabel = (code) => {
    const n = parseInt(code.slice(-2), 10);
    return n === 1 ? '1er' : `${n}e`;
  };

  const labels = sorted.map(c => arrLabel(c.code));
  const values = sorted.map(c => c.per10k);

  // Gradient: high = deep amber/red, low = muted
  const maxVal = Math.max(...values);
  const colors = values.map(v => {
    const intensity = v / maxVal;
    const r = Math.round(179 + (198 - 179) * (1 - intensity));
    const g = Math.round(32 + (124 - 32) * (1 - intensity));
    const b = Math.round(32 * (1 - intensity));
    return `rgba(${r},${g},${b},0.75)`;
  });

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.75', '1')),
        borderWidth: 1,
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
            label: (ctx) => {
              const c = sorted[ctx.dataIndex];
              return ` ${ctx.parsed.x} bars per 10,000 · ${c.bars} bars · pop ${c.pop.toLocaleString('fr-FR')}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: 'Bars per 10,000 residents', font: { size: 11 }, color: '#888' },
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { font: { size: 11 }, color: '#666' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'Georgia, serif' }, color: '#333' }
        }
      }
    }
  });
}
