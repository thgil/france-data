/* commune-names/charts.js — horizontal bar charts for name frequency analysis */

export function drawTopNamesChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const top15 = data.topNames.slice(0, 15).reverse();

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: top15.map(d => d.name),
      datasets: [{
        data: top15.map(d => d.count),
        backgroundColor: '#b32020',
        borderWidth: 0,
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
            label: ctx => ` ${ctx.raw} communes share this name`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#e0d8cc' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'Number of communes with this exact name',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 13 },
            color: '#1a1a1a',
          },
        },
      },
    },
  });
}

export function drawSaintNamesChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const top15 = data.topSaints.slice(0, 15).reverse();

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: top15.map(d => d.name),
      datasets: [{
        data: top15.map(d => d.count),
        backgroundColor: '#4a6fa5',
        borderWidth: 0,
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
            label: ctx => ` ${ctx.raw} communes`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#e0d8cc' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
          },
          title: {
            display: true,
            text: 'Communes whose name begins with this saint',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 13 },
            color: '#1a1a1a',
          },
        },
      },
    },
  });
}
