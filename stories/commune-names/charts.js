/* chart rendering for commune-names story */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';

function baseChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: PAPER,
        borderColor: '#b8b0a0',
        borderWidth: 1,
        titleColor: INK,
        bodyColor: '#444',
        titleFont: { family: 'Georgia, serif', size: 13 },
        bodyFont: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 12 },
        padding: 10,
        callbacks: {},
      },
    },
  };
}

export function drawTopNamesChart(canvasId, stats) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const items = stats.topNames.slice(0, 15);
  const labels = items.map(d => d.name);
  const values = items.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: items.map((_, i) => i === 0 ? '#8b1a1a' : '#b8a898'),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      ...baseChartDefaults(),
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: RULE },
          ticks: {
            color: MUTE,
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
            stepSize: 1,
          },
          border: { color: RULE },
          title: {
            display: true,
            text: 'Number of communes with this name',
            color: MUTE,
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: INK,
            font: { family: 'Georgia, serif', size: 12 },
          },
          border: { color: RULE },
        },
      },
      plugins: {
        ...baseChartDefaults().plugins,
        tooltip: {
          ...baseChartDefaults().plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.raw} communes share this name`,
          },
        },
      },
    },
  });
}

export function drawLenDistChart(canvasId, stats) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const dist = stats.lenDist.filter(d => d.len <= 40);
  const labels = dist.map(d => d.len);
  const values = dist.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(l => {
          if (l <= 2)  return '#8b1a1a';
          if (l >= 35) return '#b32020';
          return '#b8a898';
        }),
        borderWidth: 0,
        borderRadius: 1,
        categoryPercentage: 0.95,
        barPercentage: 0.95,
      }],
    },
    options: {
      ...baseChartDefaults(),
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: MUTE,
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
            maxTicksLimit: 20,
          },
          border: { color: RULE },
          title: {
            display: true,
            text: 'Characters in commune name',
            color: MUTE,
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
          },
        },
        y: {
          grid: { color: RULE },
          ticks: {
            color: MUTE,
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
          },
          border: { color: RULE },
          title: {
            display: true,
            text: 'Communes',
            color: MUTE,
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
          },
        },
      },
      plugins: {
        ...baseChartDefaults().plugins,
        tooltip: {
          ...baseChartDefaults().plugins.tooltip,
          callbacks: {
            title: items => `${items[0].label} characters`,
            label: ctx => ` ${ctx.raw.toLocaleString('fr-FR')} communes`,
          },
        },
      },
    },
  });
}
