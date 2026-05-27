/* charts.js — commune-names story */

const CHART_DEFAULTS = {
  font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  color: '#1a1a1a',
};

function applyDefaults(Chart) {
  Chart.defaults.font.family = CHART_DEFAULTS.font.family;
  Chart.defaults.color = CHART_DEFAULTS.color;
}

export function drawLengthHistogram(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const Chart = window.Chart;
  if (!Chart) { canvas.parentElement.innerHTML = '<p class="chart-error">Chart library not loaded.</p>'; return; }
  applyDefaults(Chart);

  const dist = stats.lengthDist;
  const labels = dist.map(d => d.len);
  const data   = dist.map(d => d.count);

  const highlight = (ctx) => {
    const len = labels[ctx.dataIndex];
    if (len === 1) return '#b32020';
    if (len === 45) return '#b32020';
    return '#c8a96e';
  };

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: (ctx) => highlight(ctx),
        borderWidth: 0,
        borderRadius: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => `${items[0].label} character${items[0].label === '1' ? '' : 's'}`,
            label: (item) => `${item.raw.toLocaleString('fr-FR')} commune${item.raw === 1 ? '' : 's'}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Name length (characters)', font: { size: 11 }, color: '#666' },
          grid: { display: false },
          ticks: { maxTicksLimit: 15, font: { size: 11 } },
        },
        y: {
          title: { display: true, text: 'Communes', font: { size: 11 }, color: '#666' },
          grid: { color: '#ede8e0' },
          ticks: { font: { size: 11 } },
        },
      },
    },
  });
}

export function drawTopNamesChart(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const Chart = window.Chart;
  if (!Chart) { canvas.parentElement.innerHTML = '<p class="chart-error">Chart library not loaded.</p>'; return; }
  applyDefaults(Chart);

  const top = stats.topNames.slice(0, 15);
  const labels = top.map(d => d.name);
  const data   = top.map(d => d.count);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: '#c8a96e',
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
            label: (item) => `${item.raw} communes named "${item.label}"`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Number of communes with this exact name', font: { size: 11 }, color: '#666' },
          grid: { color: '#ede8e0' },
          ticks: { font: { size: 11 }, stepSize: 1 },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { size: 12, family: "Georgia, 'Times New Roman', serif" },
          },
        },
      },
    },
  });
}
