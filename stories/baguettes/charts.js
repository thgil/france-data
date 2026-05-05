// charts.js — baguettes story
// Uses Observable Plot via CDN (loaded lazily on first call).

const PLOT_CDN = "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/dist/plot.umd.min.js";

let _Plot = null;
async function getPlot() {
  if (_Plot) return _Plot;
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = PLOT_CDN;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load Observable Plot"));
    document.head.appendChild(s);
  });
  _Plot = window.Plot;
  return _Plot;
}

function mountChart(selector, svg) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = "";
  el.appendChild(svg);
}

// Chart 1: top communes by bakeries/10k (pop >= 5000), horizontal bar
export async function drawTopChart(selector, data) {
  const Plot = await getPlot();

  const chartWidth = Math.min(720, window.innerWidth - 48);
  const barHeight = 22;
  const marginLeft = 180;

  const svg = Plot.plot({
    width: chartWidth,
    marginLeft,
    marginRight: 80,
    marginTop: 12,
    marginBottom: 32,
    x: {
      label: "bakeries per 10,000 residents →",
      labelOffset: 28,
      grid: true,
      tickFormat: d => d.toFixed(0),
    },
    y: {
      label: null,
      domain: data.map(d => d.shortName),
    },
    marks: [
      Plot.barX(data, {
        x: "bakeriesPer10k",
        y: "shortName",
        sort: { y: "x", reverse: true },
        fill: d => d.isParis ? "#b32020" : "#888",
        title: d =>
          `${d.name}\n${d.bakeriesPer10k} per 10k\n(${d.bakeries} bakeries, pop. ${d.population.toLocaleString("fr-FR")})`,
      }),
      Plot.ruleX([5.3], {
        stroke: "#1a1a1a",
        strokeDasharray: "4 3",
        strokeWidth: 1.2,
      }),
      Plot.text([{ x: 5.3, label: "IDF avg" }], {
        x: "x",
        y: data[data.length - 1]?.shortName,
        text: "label",
        textAnchor: "start",
        dx: 4,
        dy: -barHeight * 0.4,
        fontSize: 10,
        fill: "#555",
      }),
    ],
    style: {
      background: "transparent",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: "12px",
    },
  });

  mountChart(selector, svg);
}

// Chart 2: Paris arrondissements ranked, horizontal bar
export async function drawParisChart(selector, data) {
  const Plot = await getPlot();

  const chartWidth = Math.min(680, window.innerWidth - 48);

  const svg = Plot.plot({
    width: chartWidth,
    marginLeft: 90,
    marginRight: 80,
    marginTop: 12,
    marginBottom: 32,
    x: {
      label: "bakeries per 10,000 residents →",
      labelOffset: 28,
      grid: true,
      tickFormat: d => d.toFixed(0),
    },
    y: {
      label: null,
      domain: data.map(d => d.name),
    },
    marks: [
      Plot.barX(data, {
        x: "bakeriesPer10k",
        y: "name",
        sort: { y: "x", reverse: true },
        fill: "#b32020",
        fillOpacity: d => {
          // Fade out lower arrondissements slightly for visual gradient
          const max = Math.max(...data.map(d => d.bakeriesPer10k));
          return 0.4 + 0.6 * (d.bakeriesPer10k / max);
        },
        title: d =>
          `${d.name}\n${d.bakeriesPer10k} per 10k  (1 per ${d.onePerResidents?.toLocaleString("fr-FR")} residents)`,
      }),
      Plot.ruleX([8.0], {
        stroke: "#1a1a1a",
        strokeDasharray: "4 3",
        strokeWidth: 1.2,
      }),
      Plot.text([{ x: 8.0, label: "Paris avg" }], {
        x: "x",
        y: data[data.length - 1]?.name,
        text: "label",
        textAnchor: "start",
        dx: 4,
        dy: -10,
        fontSize: 10,
        fill: "#555",
      }),
    ],
    style: {
      background: "transparent",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: "12px",
    },
  });

  mountChart(selector, svg);
}

// Chart 3: département comparison, horizontal bar
export async function drawDeptChart(selector, data) {
  const Plot = await getPlot();

  const chartWidth = Math.min(560, window.innerWidth - 48);

  const svg = Plot.plot({
    width: chartWidth,
    marginLeft: 140,
    marginRight: 80,
    marginTop: 12,
    marginBottom: 32,
    x: {
      label: "bakeries per 10,000 residents →",
      labelOffset: 28,
      grid: true,
      tickFormat: d => d.toFixed(0),
      domain: [0, 10],
    },
    y: {
      label: null,
      domain: data.map(d => d.name),
    },
    marks: [
      Plot.barX(data, {
        x: "bakeriesPer10k",
        y: "name",
        sort: { y: "x", reverse: true },
        fill: d => d.code === "75" ? "#b32020" : "#888",
        title: d =>
          `${d.name}\n${d.bakeriesPer10k} per 10k\n${d.bakeries.toLocaleString("fr-FR")} bakeries`,
      }),
      Plot.ruleX([5.3], {
        stroke: "#1a1a1a",
        strokeDasharray: "4 3",
        strokeWidth: 1.2,
      }),
      Plot.text([{ x: 5.3, label: "IDF avg 5.3" }], {
        x: "x",
        y: data[data.length - 1]?.name,
        text: "label",
        textAnchor: "start",
        dx: 4,
        dy: -10,
        fontSize: 10,
        fill: "#555",
      }),
    ],
    style: {
      background: "transparent",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: "12px",
    },
  });

  mountChart(selector, svg);
}
