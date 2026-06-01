/* commune-names/charts.js — Chart.js-based charts for the name story */

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const ACCENT = '#b32020';
const SOFT   = '#d8d0c0';

const BASE_FONT = {
  family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  size: 12,
  color: INK,
};

Chart.defaults.color = MUTE;
Chart.defaults.font  = { ...BASE_FONT };

export function drawLetterChart(canvasId, letterChart) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // Mark 'S' bar as accent colour
  const labels = letterChart.map(d => d.letter);
  const counts  = letterChart.map(d => d.count);
  const colors  = labels.map(l => (l === 'S' ? ACCENT : '#c8bfb0'));

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 0,
        barPercentage: 0.85,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, maxRotation: 0 },
        },
        y: {
          grid: { color: '#e8e0d4' },
          ticks: {
            font: { size: 11 },
            callback: v => v.toLocaleString('fr-FR'),
          },
        },
      },
    },
  });
}

export function drawTopNamesChart(canvasId, topNames) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const top = topNames.slice(0, 20);
  const labels = top.map(d => d.name);
  const counts  = top.map(d => d.count);
  const colors  = top.map((d, i) => (i === 0 ? ACCENT : '#c8bfb0'));

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 0,
        barPercentage: 0.8,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x} communes share this name`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#e8e0d4' },
          ticks: { font: { size: 11 }, stepSize: 1 },
          title: { display: true, text: 'Number of communes', font: { size: 11 }, color: MUTE },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { size: 12, family: 'Georgia, serif' },
            color: INK,
          },
        },
      },
    },
  });
}

export function drawLengthChart(canvasId, lengthChart) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // Bucket 31+ into a single bar
  const buckets = [];
  for (let l = 1; l <= 30; l++) {
    const entry = lengthChart.find(d => d.len === l);
    buckets.push({ label: String(l), count: entry ? entry.count : 0 });
  }
  const longTail = lengthChart.filter(d => d.len > 30).reduce((s, d) => s + d.count, 0);
  if (longTail > 0) buckets.push({ label: '31+', count: longTail });

  const labels = buckets.map(b => b.label);
  const counts  = buckets.map(b => b.count);
  // Highlight the peak region (7-9 chars)
  const colors  = labels.map(l => {
    const n = parseInt(l);
    if (n >= 7 && n <= 9) return ACCENT;
    return '#c8bfb0';
  });

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 0,
        barPercentage: 0.9,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, maxRotation: 0 },
          title: { display: true, text: 'Characters in name', font: { size: 11 }, color: MUTE },
        },
        y: {
          grid: { color: '#e8e0d4' },
          ticks: {
            font: { size: 11 },
            callback: v => v.toLocaleString('fr-FR'),
          },
        },
      },
    },
  });
}
