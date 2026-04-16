// charts.js — pharmacy-myth story charts
// Uses Observable Plot via CDN (imported in the story page).

import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

const ACCENT = "#b32020";
const INK    = "#1a1a1a";

/**
 * drawNationalBars(selector, data)
 * Chart 1: Simple two-bar national comparison — bakeries vs pharmacies.
 * @param {string} selector  CSS selector for the mount element
 * @param {object} data      Parsed data.json
 */
export function drawNationalBars(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const { pharmacies, bakeries } = data.national;

  const rows = [
    { label: "Bakeries",   count: bakeries,   color: INK    },
    { label: "Pharmacies", count: pharmacies, color: ACCENT },
  ];

  const chart = Plot.plot({
    width: Math.min(el.offsetWidth || 640, 640),
    height: 280,
    marginLeft: 96,
    marginRight: 72,
    marginTop: 32,
    marginBottom: 16,
    style: {
      background: "transparent",
      fontFamily: "var(--sans, 'Helvetica Neue', Helvetica, Arial, sans-serif)",
      fontSize: "13px",
      overflow: "visible",
    },
    x: {
      axis: null,
      domain: [0, 42000],
    },
    y: {
      label: null,
      tickSize: 0,
    },
    marks: [
      // Bars
      Plot.barX(rows, {
        x: "count",
        y: "label",
        fill: "color",
        sort: { y: "x", reverse: true },
        rx: 2,
      }),
      // Count labels at end of bar
      Plot.text(rows, {
        x: "count",
        y: "label",
        text: (d) => d.count.toLocaleString("en-US"),
        sort: { y: "x", reverse: true },
        dx: 8,
        textAnchor: "start",
        fontWeight: "700",
        fontSize: "15px",
        fill: INK,
      }),
    ],
  });

  el.innerHTML = "";
  el.appendChild(chart);
}

/**
 * drawArrondissementBars(selector, data)
 * Chart 2: Paris arrondissements ranked by pharmacies per 10k residents.
 * Each row shows two bars: pharmacies per 10k (red) and bakeries per 10k (dark).
 * @param {string} selector  CSS selector for the mount element
 * @param {object} data      Parsed data.json
 */
export function drawArrondissementBars(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Data is already sorted by pharmacies per 10k descending in data.json,
  // but we sort explicitly to be safe.
  const arrondissements = [...data.paris.arrondissements].sort(
    (a, b) => b.pharmaciesPer10k - a.pharmaciesPer10k
  );

  // Flatten into two rows per arrondissement for grouped bars
  const rows = arrondissements.flatMap((d) => [
    { name: d.name, type: "Pharmacies", value: d.pharmaciesPer10k, color: ACCENT },
    { name: d.name, type: "Bakeries",   value: d.bakeriesPer10k,   color: INK    },
  ]);

  // Y-axis order: arrondissements by descending pharmacy density
  const nameOrder = arrondissements.map((d) => d.name);

  // fy domain: we use fy for the arrondissement grouping, x for type
  // Use Plot.barX with fy for grouped horizontal bars
  const rowHeight = 30;
  const chartHeight = arrondissements.length * rowHeight * 2 + 80;

  const chart = Plot.plot({
    width: Math.min(el.offsetWidth || 640, 640),
    height: chartHeight,
    marginLeft: 44,
    marginRight: 16,
    marginTop: 48,
    marginBottom: 24,
    style: {
      background: "transparent",
      fontFamily: "var(--sans, 'Helvetica Neue', Helvetica, Arial, sans-serif)",
      fontSize: "12px",
      overflow: "visible",
    },
    x: {
      label: "per 10,000 residents",
      labelOffset: 36,
      tickSize: 3,
    },
    fy: {
      label: null,
      domain: nameOrder,
      tickSize: 0,
    },
    color: {
      domain: ["Pharmacies", "Bakeries"],
      range:  [ACCENT, INK],
      legend: true,
    },
    marks: [
      Plot.barX(rows, {
        x: "value",
        y: "type",
        fy: "name",
        fill: "color",
        rx: 2,
        title: (d) => `${d.name} — ${d.type}: ${d.value.toFixed(1)} per 10,000`,
      }),
      Plot.text(rows, {
        x: "value",
        y: "type",
        fy: "name",
        text: (d) => d.value.toFixed(1),
        dx: 5,
        textAnchor: "start",
        fontSize: "11px",
        fill: (d) => d.color,
        fontWeight: "600",
      }),
      // Subtle grid
      Plot.gridX({ stroke: "#e8e4dc", strokeWidth: 1 }),
    ],
  });

  el.innerHTML = "";
  el.appendChild(chart);
}
