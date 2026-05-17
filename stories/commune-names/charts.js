/* commune-names/charts.js — Chart.js-based charts for the names story */

export function drawLengthHistogram(selector, lengthDist) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  // Only show lengths 1–30 (99%+ of communes; tail beyond 30 is <0.1%)
  const cutoff = 30;
  const labels = [];
  const values = [];
  for (const { length, count } of lengthDist) {
    if (length <= cutoff) {
      labels.push(length);
      values.push(count);
    }
  }

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: '#b32020',
        borderWidth: 0,
        borderRadius: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => `${items[0].label} characters`,
            label: item => `${item.raw.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Name length (characters)', font: { size: 11, family: "'Helvetica Neue', sans-serif" }, color: '#888' },
          ticks: { font: { size: 11 }, color: '#444' },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: 'Communes', font: { size: 11, family: "'Helvetica Neue', sans-serif" }, color: '#888' },
          ticks: { font: { size: 11 }, color: '#444' },
          grid: { color: '#ede8e0' },
        },
      },
    },
  });
}

export function drawDuplicatesChart(selector, mostCommonNames) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const top = mostCommonNames.slice(0, 15);
  const labels = top.map(d => d.name);
  const values = top.map(d => d.count);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: '#b32020',
        borderWidth: 0,
        borderRadius: 1,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: item => `${item.raw} communes share this name`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Communes with this exact name', font: { size: 11 }, color: '#888' },
          ticks: { font: { size: 11 }, color: '#444', stepSize: 1 },
          grid: { color: '#ede8e0' },
        },
        y: {
          ticks: { font: { size: 12, family: 'Georgia, serif' }, color: '#1a1a1a' },
          grid: { display: false },
        },
      },
    },
  });
}
