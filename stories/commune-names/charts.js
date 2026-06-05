/* charts.js — commune-names story */

export function drawLengthHistogram(canvasId, lengthDistribution) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Group lengths: 1-5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15-19, 20-29, 30+
  const buckets = [];
  const bucketLabels = [];

  // Build buckets: individual 1-19, then groups
  const grouped = {};
  for (const { len, count } of lengthDistribution) {
    if (len <= 19) {
      grouped[len] = (grouped[len] || 0) + count;
    } else if (len <= 29) {
      grouped['20–29'] = (grouped['20–29'] || 0) + count;
    } else {
      grouped['30+'] = (grouped['30+'] || 0) + count;
    }
  }

  for (let i = 1; i <= 19; i++) {
    bucketLabels.push(String(i));
    buckets.push(grouped[i] || 0);
  }
  bucketLabels.push('20–29');
  buckets.push(grouped['20–29'] || 0);
  bucketLabels.push('30+');
  buckets.push(grouped['30+'] || 0);

  const colors = bucketLabels.map(l => {
    const n = parseInt(l);
    if (n <= 2) return '#b32020';
    if (l === '30+') return '#b32020';
    return '#1a1a1a';
  });

  const Chart = window.Chart;
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: bucketLabels,
      datasets: [{
        data: buckets,
        backgroundColor: colors,
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
            title: ([item]) => `${item.label} characters`,
            label: (item) => `${item.raw.toLocaleString('fr-FR')} communes`,
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
          },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          }
        },
        y: {
          grid: { color: '#e8e2d8' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
            callback: v => v.toLocaleString('fr-FR'),
          },
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          }
        }
      }
    }
  });
}

export function drawSaintChart(canvasId, topSaintEpithets) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = topSaintEpithets.map(d => `Saint-${d.epithet}`);
  const values = topSaintEpithets.map(d => d.count);

  const Chart = window.Chart;
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: '#1a1a1a',
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
            title: ([item]) => item.label,
            label: (item) => `${item.raw} communes`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#e8e2d8' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
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
