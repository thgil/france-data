// stories/commune-names/charts.js
// Two charts: top duplicate commune names + name-length histogram.
// Export: drawCharts(stats)

import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4/+esm';

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const MUTE   = '#666';
const ACCENT = '#b32020';
const SAND   = '#c67c00';

const FONT = { family: "'Helvetica Neue', Helvetica, Arial, sans-serif" };

function sharedDefaults() {
  Chart.defaults.font         = { ...FONT, size: 12 };
  Chart.defaults.color        = INK;
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.backgroundColor = PAPER;
  Chart.defaults.plugins.tooltip.borderColor      = '#b8b0a0';
  Chart.defaults.plugins.tooltip.borderWidth      = 1;
  Chart.defaults.plugins.tooltip.titleColor       = INK;
  Chart.defaults.plugins.tooltip.bodyColor        = '#333';
  Chart.defaults.plugins.tooltip.padding          = 8;
  Chart.defaults.plugins.tooltip.cornerRadius     = 3;
}

export function drawCharts(stats) {
  sharedDefaults();
  drawDuplicatesChart(stats.topDuplicates);
  drawLengthChart(stats.lengthDistribution);
}

function drawDuplicatesChart(data) {
  const canvas = document.getElementById('chart-dupes');
  if (!canvas) return;

  const labels = data.map(d => d.name);
  const values = data.map(d => d.count);
  const colors = values.map(v => v >= 10 ? ACCENT : (v >= 8 ? SAND : '#8b9bb4'));

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 8 } },
      scales: {
        x: {
          grid: { color: '#e8e0d4' },
          ticks: { stepSize: 1, font: { ...FONT, size: 11 }, color: MUTE },
          title: {
            display: true,
            text: 'Number of communes with this name',
            font: { ...FONT, size: 11 },
            color: MUTE,
          },
          min: 0,
          max: 13,
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 13 },
            color: INK,
          },
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              const d = data[ctx.dataIndex];
              const deptList = d.depts.join(', ');
              return [
                ` ${d.count} communes`,
                ` Départements: ${deptList}`,
              ];
            }
          }
        }
      }
    }
  });
}

function drawLengthChart(data) {
  const canvas = document.getElementById('chart-lengths');
  if (!canvas) return;

  const labels = data.map(d => d.length);
  const values = data.map(d => d.count);

  // Highlight a few buckets
  const bgColors = labels.map(l => {
    if (l === 1)  return ACCENT;   // Y
    if (l === 45) return ACCENT;   // Saint-Remy-en-Bouzemont-...
    if (l >= 35)  return '#c89070';
    return '#8b9bb4';
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: bgColors,
        borderWidth: 0,
        borderRadius: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { ...FONT, size: 10 },
            color: MUTE,
            callback: (val, idx) => {
              const l = labels[idx];
              if (l === 1 || l === 5 || l === 10 || l === 15 || l === 20 ||
                  l === 25 || l === 30 || l === 35 || l === 40 || l === 45) return l;
              return '';
            },
            maxRotation: 0,
          },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { ...FONT, size: 11 },
            color: MUTE,
          },
        },
        y: {
          grid: { color: '#e8e0d4' },
          ticks: {
            font: { ...FONT, size: 11 },
            color: MUTE,
            callback: v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v,
          },
          title: {
            display: true,
            text: 'Number of communes',
            font: { ...FONT, size: 11 },
            color: MUTE,
          },
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: ctx => `${ctx[0].label} characters`,
            label: ctx => ` ${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          }
        },
        annotation: {
          annotations: {
            labelY: {
              type: 'label',
              xValue: 1,
              yValue: values[0] + 200,
              content: ['Y'],
              font: { family: 'Georgia, serif', size: 11 },
              color: ACCENT,
            }
          }
        }
      }
    }
  });
}
