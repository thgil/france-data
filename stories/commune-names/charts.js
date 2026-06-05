// stories/commune-names/charts.js
// Two charts: name-length histogram + top-duplicate names bar.

import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@4/+esm';
Chart.register(...registerables);

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const INK_M  = '#888';
const ACCENT = '#b32020';

const baseFont = {
  family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  size: 12,
  color: INK,
};

Chart.defaults.font = baseFont;
Chart.defaults.color = INK;

// ── helper ──────────────────────────────────────────────────────────────────

function makeAxes(xLabel, yLabel) {
  return {
    x: {
      title: { display: !!xLabel, text: xLabel, color: INK_M, font: { size: 11 } },
      grid: { color: '#e8e4dc' },
      ticks: { color: INK },
    },
    y: {
      title: { display: !!yLabel, text: yLabel, color: INK_M, font: { size: 11 } },
      grid: { color: '#e8e4dc' },
      ticks: { color: INK },
    },
  };
}

// ── Length histogram ─────────────────────────────────────────────────────────

export function drawLengthChart(canvasId, lengthDist) {
  const maxLen = 45;
  const labels = [];
  const values = [];

  for (let l = 1; l <= maxLen; l++) {
    labels.push(l);
    values.push(lengthDist[String(l)] ?? 0);
  }

  const ctx = document.getElementById(canvasId).getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'communes',
        data: values,
        backgroundColor: values.map((_, i) => {
          const l = i + 1;
          if (l === 1) return ACCENT;
          if (l >= 38) return '#c67c00';
          return '#c8bfaf';
        }),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => `${items[0].label} characters`,
            label: (item) => `${item.raw.toLocaleString('en')} communes`,
          },
          backgroundColor: PAPER,
          titleColor: INK,
          bodyColor: INK,
          borderColor: '#b8b0a0',
          borderWidth: 1,
          padding: 8,
        },
      },
      scales: {
        ...makeAxes('Name length (characters)', 'Number of communes'),
        x: {
          ...makeAxes().x,
          title: { display: true, text: 'Name length (characters)', color: INK_M, font: { size: 11 } },
          ticks: {
            color: INK,
            maxTicksLimit: 15,
            callback: (v, i) => {
              const l = i + 1;
              if (l === 1 || l === 10 || l === 20 || l === 30 || l === 45) return l;
              return '';
            },
          },
        },
      },
    },
  });
}

// ── Top duplicates chart ─────────────────────────────────────────────────────

export function drawDupesChart(canvasId, topDuplicates) {
  const items = topDuplicates.slice(0, 15).reverse();
  const labels = items.map(d => d.name);
  const values = items.map(d => d.count);

  const ctx = document.getElementById(canvasId).getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'communes with this name',
        data: values,
        backgroundColor: values.map((_, i) =>
          labels[i] === 'Sainte-Colombe' ? ACCENT : '#c8bfaf'
        ).reverse().reverse(),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => `${item.raw} communes named "${item.label}"`,
          },
          backgroundColor: PAPER,
          titleColor: INK,
          bodyColor: INK,
          borderColor: '#b8b0a0',
          borderWidth: 1,
          padding: 8,
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Number of communes with this name', color: INK_M, font: { size: 11 } },
          grid: { color: '#e8e4dc' },
          ticks: { color: INK, stepSize: 1 },
          min: 0,
          max: 13,
        },
        y: {
          grid: { display: false },
          ticks: { color: INK, font: { size: 12 } },
        },
      },
    },
  });
}
