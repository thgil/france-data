// Chart.js v4 is loaded globally from CDN in index.html

export function drawTopNamesChart(canvasId, topNames) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = topNames.map(d => d.name);
  const counts = topNames.map(d => d.count);

  new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
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
            label: (ctx) => ` ${ctx.raw} communes`,
          },
        },
      },
      scales: {
        x: {
          title: { display: false },
          grid: { color: '#e0d8cc' },
          ticks: {
            color: '#666',
            font: { family: "'Helvetica Neue', sans-serif", size: 12 },
            stepSize: 1,
          },
          border: { color: '#1a1a1a' },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: '#1a1a1a',
            font: { family: 'Georgia, serif', size: 13 },
          },
          border: { color: '#1a1a1a' },
        },
      },
    },
  });
}

export function drawLengthChart(canvasId, lengthDist) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = lengthDist.map(d => d.len);
  const counts = lengthDist.map(d => d.count);

  new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: '#b32020',
        borderWidth: 0,
        barPercentage: 1.0,
        categoryPercentage: 0.85,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => `${items[0].label} characters`,
            label: (ctx) => ` ${ctx.raw.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Characters in name',
            color: '#666',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
          },
          grid: { display: false },
          ticks: {
            color: '#666',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            maxTicksLimit: 15,
          },
          border: { color: '#1a1a1a' },
        },
        y: {
          title: {
            display: true,
            text: 'Communes',
            color: '#666',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
          },
          grid: { color: '#e0d8cc' },
          ticks: {
            color: '#666',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
          },
          border: { color: '#1a1a1a' },
        },
      },
    },
  });
}
