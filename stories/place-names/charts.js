/* place-names/charts.js — bar charts for the naming story */

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK  = '#1a1a1a';
const MUTE = '#888';
const GOLD = '#b07d2c';
const LIGHT_GOLD = '#e8d5a3';

function makeChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, config);
}

export function drawTopNamesChart(canvasId, topNames) {
  const labels = topNames.map(d => d.name);
  const counts = topNames.map(d => d.count);

  makeChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: counts.map((_, i) => i === 0 ? GOLD : LIGHT_GOLD),
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
            label: ctx => ` ${ctx.raw} communes with this exact name`
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#ede8e0' },
          ticks: { font: { family: SANS, size: 11 }, color: MUTE },
          title: { display: true, text: 'Number of communes', font: { family: SANS, size: 11 }, color: MUTE }
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: "'Georgia', serif", size: 12 }, color: INK }
        }
      }
    }
  });
}

export function drawSaintsChart(canvasId, topSaints) {
  const labels = topSaints.map(d => `Saint(e)-${d.saint}`);
  const counts = topSaints.map(d => d.count);

  makeChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: counts.map((_, i) => i === 0 ? GOLD : LIGHT_GOLD),
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
            label: ctx => ` ${ctx.raw} communes named after this saint`
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#ede8e0' },
          ticks: { font: { family: SANS, size: 11 }, color: MUTE },
          title: { display: true, text: 'Number of communes', font: { family: SANS, size: 11 }, color: MUTE }
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: "'Georgia', serif", size: 12 }, color: INK }
        }
      }
    }
  });
}

export function drawLengthChart(canvasId, lenDist) {
  const filtered = lenDist.filter(d => d.length <= 45);
  const labels = filtered.map(d => d.length);
  const counts = filtered.map(d => d.count);

  makeChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: LIGHT_GOLD,
        borderWidth: 0,
        borderRadius: 1,
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
            label: ctx => ` ${ctx.raw.toLocaleString('fr-FR')} communes`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: SANS, size: 10 },
            color: MUTE,
            callback: (val, i) => i % 5 === 0 ? labels[i] : ''
          },
          title: { display: true, text: 'Name length (characters)', font: { family: SANS, size: 11 }, color: MUTE }
        },
        y: {
          grid: { color: '#ede8e0' },
          ticks: { font: { family: SANS, size: 11 }, color: MUTE },
          title: { display: true, text: 'Number of communes', font: { family: SANS, size: 11 }, color: MUTE }
        }
      }
    }
  });
}
