/* charts.js — commune-names story */

export function drawTopNamesChart(canvasId, topNames) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = topNames.map(d => d.name);
  const values = topNames.map(d => d.count);

  // Highlight saint/sainte names
  const colors = topNames.map(d =>
    /saint/i.test(d.name) ? '#8b3a3a' : '#5a7a9e'
  );

  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
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
            label: ctx => ` ${ctx.parsed.x} communes share this name`,
          },
          bodyFont: { family: 'Helvetica Neue, sans-serif', size: 12 },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { family: 'Helvetica Neue, sans-serif', size: 11 },
            color: '#888',
          },
          grid: { color: '#ede8e0' },
          title: {
            display: true,
            text: 'number of communes sharing this name',
            font: { family: 'Helvetica Neue, sans-serif', size: 11 },
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
    }
  });

  return chart;
}

export function drawLengthChart(canvasId, communes) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Distribution of name lengths
  const lengths = communes.map(c => c.name.length);
  const buckets = {};
  lengths.forEach(l => { buckets[l] = (buckets[l] || 0) + 1; });

  const minLen = Math.min(...Object.keys(buckets).map(Number));
  const maxLen = Math.max(...Object.keys(buckets).map(Number));
  const labels = [];
  const values = [];
  for (let i = minLen; i <= maxLen; i++) {
    labels.push(i);
    values.push(buckets[i] || 0);
  }

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(l =>
          l <= 2 ? '#8b3a3a' : l >= 35 ? '#5a4a2a' : '#8aaa8a'
        ),
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
            title: ctx => `${ctx[0].label}-character names`,
            label: ctx => ` ${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
          bodyFont: { family: 'Helvetica Neue, sans-serif', size: 12 },
        },
      },
      scales: {
        x: {
          ticks: {
            font: { family: 'Helvetica Neue, sans-serif', size: 10 },
            color: '#888',
            maxTicksLimit: 20,
          },
          grid: { display: false },
          title: {
            display: true,
            text: 'name length (characters)',
            font: { family: 'Helvetica Neue, sans-serif', size: 11 },
            color: '#888',
          },
        },
        y: {
          ticks: {
            font: { family: 'Helvetica Neue, sans-serif', size: 11 },
            color: '#888',
          },
          grid: { color: '#ede8e0' },
          title: {
            display: true,
            text: 'number of communes',
            font: { family: 'Helvetica Neue, sans-serif', size: 11 },
            color: '#888',
          },
        },
      },
    }
  });
}
