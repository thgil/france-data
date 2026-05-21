/* commune-names/charts.js — Chart.js-based charts for the naming story */

const PALETTE = {
  accent: '#8b2e00',
  accentLight: '#c67c00',
  bar: '#b5824a',
  barHover: '#8b5e2a',
  bg: '#faf7f2',
  border: '#d8d0c0',
  muted: '#888',
};

function barColor(i, highlight) {
  return highlight ? PALETTE.accent : PALETTE.bar;
}

export function drawTopNamesChart(canvasId, topNames) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const labels = topNames.map(d => d.name);
  const data = topNames.map(d => d.count);
  const colors = labels.map((l, i) => i < 3 ? PALETTE.accent : PALETTE.bar);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderRadius: 2,
        borderSkipped: false,
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
            label: ctx => `${ctx.raw} communes share this name`,
          },
          backgroundColor: PALETTE.bg,
          borderColor: PALETTE.border,
          borderWidth: 1,
          titleColor: '#1a1a1a',
          bodyColor: '#444',
          titleFont: { family: 'Georgia, serif', size: 13 },
          bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
          padding: 10,
        }
      },
      scales: {
        x: {
          grid: { color: '#ede8e0' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: PALETTE.muted,
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'Number of communes with this name',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: PALETTE.muted,
          }
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          }
        }
      }
    }
  });
}

export function drawSaintDensityChart(canvasId, saintDensity) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const labels = saintDensity.map(d => d.deptName);
  const data = saintDensity.map(d => d.pct);
  const colors = data.map((v, i) => i === 0 ? PALETTE.accent : PALETTE.bar);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderRadius: 2,
        borderSkipped: false,
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
            label: ctx => {
              const d = saintDensity[ctx.dataIndex];
              return `${d.saints} of ${d.total} communes (${d.pct}%)`;
            },
          },
          backgroundColor: PALETTE.bg,
          borderColor: PALETTE.border,
          borderWidth: 1,
          titleColor: '#1a1a1a',
          bodyColor: '#444',
          titleFont: { family: 'Georgia, serif', size: 13 },
          bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
          padding: 10,
        }
      },
      scales: {
        x: {
          grid: { color: '#ede8e0' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: PALETTE.muted,
            callback: v => v + '%',
          },
          title: {
            display: true,
            text: '% of communes named after a saint',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: PALETTE.muted,
          }
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 12 },
            color: '#1a1a1a',
          }
        }
      }
    }
  });
}

export function drawLengthHistogram(canvasId, lengthHist) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const labels = lengthHist.map(d => d.length);
  const data = lengthHist.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: PALETTE.bar,
        borderRadius: 1,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `${ctx[0].label} characters`,
            label: ctx => `${ctx.raw.toLocaleString('fr-FR')} communes`,
          },
          backgroundColor: PALETTE.bg,
          borderColor: PALETTE.border,
          borderWidth: 1,
          titleColor: '#1a1a1a',
          bodyColor: '#444',
          titleFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
          bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
          padding: 10,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 10 },
            color: PALETTE.muted,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 18,
          },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: PALETTE.muted,
          }
        },
        y: {
          grid: { color: '#ede8e0' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: PALETTE.muted,
            callback: v => v.toLocaleString('fr-FR'),
          },
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: PALETTE.muted,
          }
        }
      }
    }
  });
}
