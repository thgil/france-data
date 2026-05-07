/* charts.js — What France Is Named For
 * Two Chart.js horizontal bar charts: top saints, top rivers.
 */

const SAINTS = [
  { name: 'Martin',  count: 203 },
  { name: 'Jean',    count: 155 },
  { name: 'Pierre',  count: 144 },
  { name: 'Germain', count: 108 },
  { name: 'Julien',  count: 78  },
  { name: 'Laurent', count: 77  },
  { name: 'Hilaire', count: 68  },
  { name: 'Georges', count: 67  },
  { name: 'Étienne', count: 65  },
  { name: 'André',   count: 64  },
];

const RIVERS = [
  { name: 'sur-Mer (sea)',    count: 100 },
  { name: 'sur-Loire',        count: 71  },
  { name: 'sur-Seine',        count: 70  },
  { name: 'sur-Marne',        count: 55  },
  { name: 'sur-Meuse',        count: 43  },
  { name: 'sur-Saône',        count: 34  },
  { name: 'sur-Sarthe',       count: 23  },
  { name: 'sur-Aube',         count: 21  },
  { name: 'sur-Cher',         count: 21  },
  { name: 'sur-Seille',       count: 19  },
];

const LANDSCAPE = [
  { word: 'bois',      label: 'bois (woods)',      count: 217 },
  { word: 'val',       label: 'val (valley)',      count: 130 },
  { word: 'villeneuve', label: 'villeneuve (new town)', count: 85 },
  { word: 'vieux',     label: 'vieux (old)',        count: 79  },
  { word: 'mont',      label: 'mont (mountain)',   count: 102 },
  { word: 'château',   label: 'château (castle)',  count: 95  },
  { word: 'pont',      label: 'pont (bridge)',      count: 86  },
  { word: 'fontaine',  label: 'fontaine (spring)', count: 74  },
  { word: 'neuville',  label: 'neuville (new town)', count: 71 },
  { word: 'rivière',   label: 'rivière (river)',   count: 66  },
  { word: 'bains',     label: 'bains (spa/baths)', count: 63  },
  { word: 'forêt',     label: 'forêt (forest)',    count: 47  },
];

const CHART_COLORS = {
  saint: '#8b3a2a',
  river: '#2a5c8b',
  land:  '#2a6b3a',
};

function makeHorizBarChart(canvasId, data, colorKey) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = data.map(d => d.label || d.name);
  const values = data.map(d => d.count);
  const color = CHART_COLORS[colorKey];

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: color + 'cc',
        borderColor: color,
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x} communes`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#e8e2d8' },
          ticks: {
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
            color: '#666',
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          },
        },
      },
    },
  });
}

export function drawSaintsChart(canvasId) {
  return makeHorizBarChart(canvasId, SAINTS, 'saint');
}

export function drawRiversChart(canvasId) {
  return makeHorizBarChart(canvasId, RIVERS, 'river');
}

export function drawLandscapeChart(canvasId) {
  const sorted = [...LANDSCAPE].sort((a, b) => b.count - a.count);
  return makeHorizBarChart(canvasId, sorted, 'land');
}
