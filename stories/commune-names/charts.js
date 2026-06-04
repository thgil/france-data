// charts.js — commune-names story
// Draws two Chart.js charts: top commune names and name-length distribution.

const CHART_DEFAULTS = {
  font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 12 },
  color: '#3a3a3a',
};

function applyDefaults() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.font.family = CHART_DEFAULTS.font.family;
  Chart.defaults.font.size   = CHART_DEFAULTS.font.size;
  Chart.defaults.color       = CHART_DEFAULTS.color;
}

export function drawTopNamesChart(canvasId, topNames) {
  applyDefaults();
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = topNames.map(d => d.name);
  const values = topNames.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: '#2a5e82',
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
            label: ctx => ` ${ctx.raw} commune${ctx.raw > 1 ? 's' : ''}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#e8e0d4' },
          ticks: { precision: 0 },
          title: {
            display: true,
            text: 'Number of communes with this name',
            font: { size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
          },
        },
      },
    },
  });
}

export function drawLengthChart(canvasId, lengthDist) {
  applyDefaults();
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = lengthDist.map(d => d.label);
  const values = lengthDist.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: values.map((_, i) => {
          const len = lengthDist[i].len;
          if (len <= 2) return '#b32020';
          if (len >= 30) return '#b32020';
          return '#b07a40';
        }),
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
            title: ctx => {
              const d = lengthDist[ctx[0].dataIndex];
              return `${d.label} character${d.len === 1 ? '' : 's'}`;
            },
            label: ctx => ` ${ctx.raw.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { color: '#e8e0d4' },
          ticks: {
            callback: v => v.toLocaleString('fr-FR'),
          },
          title: {
            display: true,
            text: 'Communes',
            font: { size: 11 },
            color: '#888',
          },
        },
      },
    },
  });
}
