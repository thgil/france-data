// commune-names/charts.js — Chart.js visualisations

export function drawTopNamesChart(canvasId, communes) {
  const nameCounts = {};
  for (const c of communes) {
    nameCounts[c.name] = (nameCounts[c.name] || 0) + 1;
  }

  const sorted = Object.entries(nameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const labels = sorted.map(([name]) => name);
  const values = sorted.map(([, count]) => count);

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
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
            label: (ctx) => ` ${ctx.raw} commune${ctx.raw > 1 ? 's' : ''} share this name`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 14,
          ticks: {
            stepSize: 2,
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
          grid: { color: '#e8e0d4' },
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          },
          grid: { display: false },
        },
      },
    },
  });
}

export function drawLengthHistogram(canvasId, communes) {
  const counts = new Array(46).fill(0);
  for (const c of communes) {
    const l = c.name.length;
    if (l < counts.length) counts[l]++;
  }

  // Build labels from 1..45
  const labels = [];
  const values = [];
  for (let i = 1; i <= 45; i++) {
    labels.push(i);
    values.push(counts[i] || 0);
  }

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(l => (l <= 2 || l >= 38) ? '#b32020' : '#c8bfb0'),
        borderWidth: 0,
        barPercentage: 0.9,
        categoryPercentage: 1.0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => `${items[0].label} character${items[0].label > 1 ? 's' : ''}`,
            label: (ctx) => ` ${ctx.raw.toLocaleString('fr-FR')} commune${ctx.raw > 1 ? 's' : ''}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            font: { family: "'Helvetica Neue', sans-serif", size: 10 },
            color: '#888',
            callback: (val, i) => {
              const v = labels[i];
              return (v === 1 || v === 5 || v % 5 === 0) ? v : '';
            },
          },
          grid: { display: false },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
          grid: { color: '#e8e0d4' },
          title: {
            display: true,
            text: 'Communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
      },
    },
  });
}
