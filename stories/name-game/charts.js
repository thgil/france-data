// stories/name-game/charts.js
// Bar charts for the commune name statistics story.
// Exports: drawTopNamesChart, drawSaintDeptsChart, drawLengthDistChart

import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@4/+esm';
Chart.register(...registerables);

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';
const ACCENT = '#b32020';
const FILL  = '#d4c8b8';
const FILL_ACCENT = '#b32020';

function resolveCanvas(selector) {
  const el = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!el) throw new Error(`Canvas not found: ${selector}`);
  return el;
}

/* ── Top duplicated names ────────────────────────────────────────────── */
export function drawTopNamesChart(selector, topNames) {
  const canvas = resolveCanvas(selector);

  const labels = topNames.map(d => d.name);
  const counts = topNames.map(d => d.count);
  const colors = topNames.map(d =>
    d.name === 'Sainte-Colombe' ? FILL_ACCENT : FILL
  );

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
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
            label: ctx => ` ${ctx.parsed.x} commune${ctx.parsed.x > 1 ? 's' : ''} share this name`,
          },
          bodyFont: { family: SANS, size: 12 },
          titleFont: { family: SERIF, size: 13 },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 14,
          ticks: {
            stepSize: 2,
            color: MUTE,
            font: { family: SANS, size: 11 },
          },
          grid: { color: RULE },
          border: { color: RULE },
          title: {
            display: true,
            text: 'number of communes sharing this exact name',
            color: MUTE,
            font: { family: SANS, size: 11 },
          },
        },
        y: {
          ticks: {
            color: INK,
            font: { family: SERIF, size: 13 },
          },
          grid: { display: false },
          border: { display: false },
        },
      },
    },
  });
}

/* ── Saint- communes by département ──────────────────────────────────── */
export function drawSaintDeptsChart(selector, topDepts) {
  const canvas = resolveCanvas(selector);

  const labels = topDepts.map(d => d.name);
  const counts = topDepts.map(d => d.count);
  const colors = topDepts.map(d =>
    d.name === 'Dordogne' ? FILL_ACCENT : FILL
  );

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
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
            label: ctx => ` ${ctx.parsed.x} Saint-/Sainte- communes`,
          },
          bodyFont: { family: SANS, size: 12 },
          titleFont: { family: SERIF, size: 13 },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 20,
            color: MUTE,
            font: { family: SANS, size: 11 },
          },
          grid: { color: RULE },
          border: { color: RULE },
          title: {
            display: true,
            text: 'communes starting with Saint- or Sainte-',
            color: MUTE,
            font: { family: SANS, size: 11 },
          },
        },
        y: {
          ticks: {
            color: INK,
            font: { family: SANS, size: 12 },
          },
          grid: { display: false },
          border: { display: false },
        },
      },
    },
  });
}

/* ── Name length distribution ────────────────────────────────────────── */
export function drawLengthDistChart(selector, lengthDist) {
  const canvas = resolveCanvas(selector);

  // Show lengths 1–30 (the tail beyond 30 is very sparse)
  const visible = lengthDist.filter(d => d.length <= 30);
  const labels = visible.map(d => d.length);
  const counts = visible.map(d => d.count);
  const colors = visible.map(d => d.length === 1 ? FILL_ACCENT : FILL);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
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
            title: ctx => `${ctx[0].label} characters`,
            label: ctx => ` ${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
          bodyFont: { family: SANS, size: 12 },
          titleFont: { family: SERIF, size: 13 },
        },
      },
      scales: {
        x: {
          ticks: {
            color: MUTE,
            font: { family: SANS, size: 11 },
            callback: (val, i) => (labels[i] % 5 === 0 || labels[i] === 1) ? labels[i] : '',
          },
          grid: { display: false },
          border: { color: RULE },
          title: {
            display: true,
            text: 'name length (characters)',
            color: MUTE,
            font: { family: SANS, size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: MUTE,
            font: { family: SANS, size: 11 },
            callback: val => val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val,
          },
          grid: { color: RULE },
          border: { display: false },
          title: {
            display: true,
            text: 'communes',
            color: MUTE,
            font: { family: SANS, size: 11 },
          },
        },
      },
    },
  });
}
