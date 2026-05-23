// commune-names/charts.js — name length histogram + top duplicates bar chart

export function drawLengthHistogram(containerId, lengthDist) {
  const canvas = document.querySelector(containerId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Group lengths: 1-5, 6-10, 11-15, 16-20, 21-25, 26-30, 31+
  const buckets = [
    { label: '1–5',  min: 1,  max: 5  },
    { label: '6–10', min: 6,  max: 10 },
    { label: '11–15',min: 11, max: 15 },
    { label: '16–20',min: 16, max: 20 },
    { label: '21–25',min: 21, max: 25 },
    { label: '26–30',min: 26, max: 30 },
    { label: '31+',  min: 31, max: 99 },
  ];

  const counts = buckets.map(b => {
    return lengthDist
      .filter(d => d.len >= b.min && d.len <= b.max)
      .reduce((s, d) => s + d.count, 0);
  });

  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: buckets.map(b => b.label),
      datasets: [{
        data: counts,
        backgroundColor: '#7a1818',
        borderRadius: 2,
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
            label: ctx => `${ctx.raw.toLocaleString('fr-FR')} communes`,
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Helvetica Neue', sans-serif", size: 12 }, color: '#444' },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          }
        },
        y: {
          grid: { color: '#ede8e0' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
            callback: v => v.toLocaleString('fr-FR'),
          },
          title: {
            display: true,
            text: 'Communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          }
        }
      }
    }
  });
}

export function drawDuplicatesChart(containerId, topDuplicates) {
  const canvas = document.querySelector(containerId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const top15 = topDuplicates.slice(0, 15);

  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: top15.map(d => d.name),
      datasets: [{
        data: top15.map(d => d.count),
        backgroundColor: '#7a1818',
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
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#ede8e0' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
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
