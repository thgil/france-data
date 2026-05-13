// charts.js — commune-names story charts (uses Chart.js loaded globally)

const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SERIF = "Georgia, 'Times New Roman', serif";
const COLOR_ACCENT = '#8b0000';
const COLOR_MUTED = '#c0a080';
const COLOR_GRID = '#e8e0d4';
const COLOR_LABEL = '#666';

function baseChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#faf7f2',
        borderColor: '#b8b0a0',
        borderWidth: 1,
        titleColor: '#1a1a1a',
        bodyColor: '#444',
        titleFont: { family: FONT_SERIF, size: 13 },
        bodyFont: { family: FONT_SANS, size: 12 },
        padding: 10,
      },
    },
  };
}

export function drawNameCharts(stats) {
  drawDuplicatesChart(stats.topDuplicates);
  drawSaintsChart(stats.saintDepts);
}

function drawDuplicatesChart(topDuplicates) {
  const canvas = document.getElementById('chart-dups');
  if (!canvas || !window.Chart) return;

  const labels = topDuplicates.map(d => d.name);
  const values = topDuplicates.map(d => d.count);

  new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(l =>
          /^Sainte?-/i.test(l) ? COLOR_ACCENT : COLOR_MUTED
        ),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      ...baseChartDefaults(),
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: COLOR_GRID },
          ticks: {
            font: { family: FONT_SANS, size: 11 },
            color: COLOR_LABEL,
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'Number of communes with this name',
            font: { family: FONT_SANS, size: 11 },
            color: COLOR_LABEL,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: FONT_SERIF, size: 12 },
            color: '#1a1a1a',
          },
        },
      },
      plugins: {
        ...baseChartDefaults().plugins,
        tooltip: {
          ...baseChartDefaults().plugins.tooltip,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const d = topDuplicates[item.dataIndex];
              const depts = d.depts.slice(0, 4).join(', ') +
                (d.depts.length > 4 ? ` +${d.depts.length - 4} more` : '');
              return [`${item.raw} communes`, depts];
            },
          },
        },
      },
    },
  });
}

function drawSaintsChart(saintDepts) {
  const canvas = document.getElementById('chart-saints');
  if (!canvas || !window.Chart) return;

  const top15 = saintDepts.slice(0, 15);
  const labels = top15.map(d => d.name);
  const values = top15.map(d => d.pct);

  new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: COLOR_ACCENT,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      ...baseChartDefaults(),
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: COLOR_GRID },
          ticks: {
            font: { family: FONT_SANS, size: 11 },
            color: COLOR_LABEL,
            callback: v => v + '%',
          },
          title: {
            display: true,
            text: '% of communes starting with "Saint" or "Sainte"',
            font: { family: FONT_SANS, size: 11 },
            color: COLOR_LABEL,
          },
          max: 35,
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: FONT_SERIF, size: 12 },
            color: '#1a1a1a',
          },
        },
      },
      plugins: {
        ...baseChartDefaults().plugins,
        tooltip: {
          ...baseChartDefaults().plugins.tooltip,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const d = top15[item.dataIndex];
              return [`${d.saints} of ${d.total} communes (${item.raw}%)`];
            },
          },
        },
      },
    },
  });
}
