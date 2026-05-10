/* charts.js — commune-names story */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888888';
const ACCENT = '#b32020';

function resolveCanvas(selector) {
  return typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
}

/* Name-length histogram */
export function drawLenChart(selector, stats) {
  const canvas = resolveCanvas(selector);
  if (!canvas || !stats.lenDist) return;

  const dist = stats.lenDist;

  // Group lengths 1-9, then 10-14, 15-19, 20-24, 25-29, 30+ for readability
  // Actually show 1-40 individual, but cap at 40 and group 40+
  // Use individual bars from 1..35, then "36+" bucket
  const maxLen = 40;
  const labels = [];
  const values = [];
  let overflow = 0;
  for (let l = 1; l <= maxLen; l++) {
    const entry = dist.find(d => d.len === l);
    labels.push(l.toString());
    values.push(entry ? entry.count : 0);
  }
  // sum 40+
  dist.filter(d => d.len > maxLen).forEach(d => { overflow += d.count; });
  if (overflow > 0) {
    labels.push('41+');
    values.push(overflow);
  }

  // Color: highlight peak range (6-9) in accent, rest muted
  const colors = labels.map(l => {
    const n = parseInt(l);
    return (n >= 6 && n <= 9) ? ACCENT : '#c8c0b4';
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 1,
      }],
    },
    options: {
      animation: false,
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ([item]) => `${item.label} characters`,
            label: (item) => `${item.raw.toLocaleString('fr-FR')} communes`,
          },
          backgroundColor: PAPER,
          titleColor: INK,
          bodyColor: INK,
          borderColor: '#b8b0a0',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Name length (characters)',
            color: MUTE,
            font: { family: 'Helvetica Neue, sans-serif', size: 11 },
          },
          grid: { display: false },
          ticks: {
            color: MUTE,
            font: { size: 10 },
            maxRotation: 0,
            callback: (val, i) => {
              const n = parseInt(labels[i]);
              return (n % 5 === 0 || n === 1) ? labels[i] : '';
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Communes',
            color: MUTE,
            font: { family: 'Helvetica Neue, sans-serif', size: 11 },
          },
          grid: { color: '#ede8e0' },
          ticks: {
            color: MUTE,
            font: { size: 10 },
            callback: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
          },
        },
      },
    },
  });
}

/* Most-shared names horizontal bar chart */
export function drawSharedChart(selector, stats) {
  const canvas = resolveCanvas(selector);
  if (!canvas || !stats.topShared) return;

  const top = stats.topShared.slice(0, 12).reverse(); // reverse for bottom-to-top horizontal bars

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: top.map(d => d.name),
      datasets: [{
        data: top.map(d => d.count),
        backgroundColor: top.map((d, i) => i === top.length - 1 ? ACCENT : '#c8c0b4'),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      animation: false,
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ([item]) => item.label,
            label: (item) => `${item.raw} communes, across ${top.reverse()[item.dataIndex]?.depts?.length ?? '?'} départements`,
          },
          backgroundColor: PAPER,
          titleColor: INK,
          bodyColor: INK,
          borderColor: '#b8b0a0',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          min: 0,
          ticks: {
            color: MUTE,
            font: { size: 10 },
            stepSize: 1,
          },
          grid: { color: '#ede8e0' },
          title: {
            display: true,
            text: 'Number of communes sharing this name',
            color: MUTE,
            font: { family: 'Helvetica Neue, sans-serif', size: 11 },
          },
        },
        y: {
          ticks: {
            color: INK,
            font: { family: 'Georgia, serif', size: 13 },
          },
          grid: { display: false },
        },
      },
    },
  });
}
