import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@4/+esm';
Chart.register(...registerables);

const PAPER = '#faf7f2';
const INK = '#1a1a1a';
const ACCENT = '#b32020';
const MUTE = '#888';
const RULE = '#e0d8cc';

const baseFont = {
  family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  size: 12,
  color: INK,
};

function commonChartOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: PAPER,
        borderColor: '#b8b0a0',
        borderWidth: 1,
        titleColor: INK,
        bodyColor: '#444',
        titleFont: { family: 'Georgia, serif', size: 13 },
        bodyFont: { ...baseFont, size: 11 },
        padding: 8,
      },
    },
    ...extra,
  };
}

export function drawTopNamesChart(selector, stats) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const top25 = stats.topNames.slice(0, 25);
  const labels = top25.map(d => d.name);
  const data = top25.map(d => d.count);
  const colors = labels.map(l =>
    (l.startsWith('Saint') || l.startsWith('Sainte')) ? ACCENT : '#8a7a5a'
  );

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      ...commonChartOptions(),
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: RULE },
          border: { display: false },
          ticks: { font: baseFont, color: MUTE, stepSize: 1 },
          title: {
            display: true,
            text: 'Communes with this name',
            font: { ...baseFont, size: 11 },
            color: MUTE,
          },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: INK,
          },
        },
      },
      plugins: {
        ...commonChartOptions().plugins,
        tooltip: {
          ...commonChartOptions().plugins.tooltip,
          callbacks: {
            title: items => items[0].label,
            label: item => ` ${item.raw} communes share this name`,
          },
        },
      },
    },
  });
}

export function drawLengthHistogram(selector, stats) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  // Only show lengths 1–35 (covers 99.9% of communes; longer names are extreme outliers)
  const relevant = stats.lengthHist.filter(d => d.len >= 1 && d.len <= 35);
  const labels = relevant.map(d => d.len);
  const data = relevant.map(d => d.count);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: '#8a7a5a',
        borderWidth: 0,
        borderRadius: 1,
        categoryPercentage: 0.95,
        barPercentage: 0.95,
      }],
    },
    options: {
      ...commonChartOptions(),
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { ...baseFont, size: 11 },
            color: MUTE,
            maxRotation: 0,
            callback: (v, i) => (i % 5 === 0 ? labels[i] : ''),
          },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { ...baseFont, size: 11 },
            color: MUTE,
          },
        },
        y: {
          grid: { color: RULE },
          border: { display: false },
          ticks: { font: baseFont, color: MUTE },
          title: {
            display: true,
            text: 'Number of communes',
            font: { ...baseFont, size: 11 },
            color: MUTE,
          },
        },
      },
      plugins: {
        ...commonChartOptions().plugins,
        tooltip: {
          ...commonChartOptions().plugins.tooltip,
          callbacks: {
            title: items => `${items[0].label} characters`,
            label: item => ` ${item.raw.toLocaleString('fr-FR')} communes`,
          },
        },
      },
    },
  });
}
