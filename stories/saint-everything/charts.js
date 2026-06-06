/* saint-everything/charts.js — commune name charts using Chart.js */

const CHART_COLORS = {
  saint: '#8b3a3a',
  saintLight: 'rgba(139,58,58,0.15)',
  secular: '#3a5a8b',
  secularLight: 'rgba(58,90,139,0.15)',
  accent: '#b32020',
  bar: '#2a4a2a',
  barLight: 'rgba(42,74,42,0.15)',
  neutral: '#888',
  gridLine: '#e0d8cc',
};

function baseChartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#faf7f2',
        borderColor: '#b8b0a0',
        borderWidth: 1,
        titleColor: '#1a1a1a',
        bodyColor: '#444',
        titleFont: { family: 'Georgia, serif', size: 13 },
        bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: CHART_COLORS.gridLine },
        ticks: { font: { family: "'Helvetica Neue', sans-serif", size: 11 }, color: '#555' },
      },
      y: {
        grid: { color: CHART_COLORS.gridLine },
        ticks: { font: { family: "'Helvetica Neue', sans-serif", size: 11 }, color: '#555' },
      },
    },
  };
}

export function drawTopNamesChart(canvasId, stats) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const top = stats.top20Names.slice(0, 20);
  const labels = top.map(d => d.name);
  const counts = top.map(d => d.count);
  const colors = top.map(d =>
    (d.name.startsWith('Saint') || d.name.startsWith('Sainte'))
      ? CHART_COLORS.saint
      : CHART_COLORS.secular
  );

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      ...baseChartOptions(),
      indexAxis: 'y',
      plugins: {
        ...baseChartOptions().plugins,
        tooltip: {
          ...baseChartOptions().plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.parsed.x} communes share this name`,
          },
        },
      },
      scales: {
        x: {
          ...baseChartOptions().scales.x,
          title: {
            display: true,
            text: 'Number of communes with this name',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          ...baseChartOptions().scales.y,
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          },
        },
      },
    },
  });
}

export function drawLengthChart(canvasId, stats) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const dist = stats.lengthDistribution.filter(d => d.length <= 35 && d.count > 0);
  const labels = dist.map(d => d.length);
  const counts = dist.map(d => d.count);

  const peak = Math.max(...counts);
  const colors = counts.map(c =>
    c === peak ? CHART_COLORS.accent : CHART_COLORS.neutral
  );

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 0,
        borderRadius: 1,
      }],
    },
    options: {
      ...baseChartOptions(),
      plugins: {
        ...baseChartOptions().plugins,
        tooltip: {
          ...baseChartOptions().plugins.tooltip,
          callbacks: {
            title: ctx => `${ctx[0].label}-character names`,
            label: ctx => ` ${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          ...baseChartOptions().scales.x,
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          ...baseChartOptions().scales.y,
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
      },
    },
  });
}

export function drawSaintChart(canvasId, stats) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const saints = stats.topSaints.slice(0, 15);
  const labels = saints.map(d => d.name);
  const counts = saints.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: CHART_COLORS.saint,
        borderColor: CHART_COLORS.saint,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      ...baseChartOptions(),
      indexAxis: 'y',
      plugins: {
        ...baseChartOptions().plugins,
        tooltip: {
          ...baseChartOptions().plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.parsed.x} communes`,
          },
        },
      },
      scales: {
        x: {
          ...baseChartOptions().scales.x,
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          ...baseChartOptions().scales.y,
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          },
        },
      },
    },
  });
}
