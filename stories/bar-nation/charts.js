// stories/bar-nation/charts.js
// Horizontal bar chart: 96 departments ranked by bars per 10k residents.
// Depends on Chart.js 4 loaded globally (UMD build via CDN script tag).

const TAG_COLORS = {
  corsica:     '#c67c00',
  paris:       '#1a5c8f',
  'idf-suburb': '#7a2252',
  other:       '#a0a0a0'
};

const TAG_LABELS = {
  corsica:     'Corse',
  paris:       'Paris',
  'idf-suburb': 'Banlieue parisienne',
  other:       'Other'
};

export function drawBarLeague(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  const depts = stats.departments; // sorted by per10k desc

  const labels    = depts.map(d => `${d.name} (${d.dept})`);
  const values    = depts.map(d => d.per10k);
  const bgColors  = depts.map(d => TAG_COLORS[d.tag] || TAG_COLORS.other);
  const national  = stats.nationalAvg;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: bgColors,
          borderWidth: 0,
          barThickness: 8
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const d = depts[ctx.dataIndex];
              return [
                `${d.per10k} bars per 10,000`,
                `${d.bars.toLocaleString('fr-FR')} bars · ${d.pop.toLocaleString('fr-FR')} residents`,
                `Rank #${d.rank} of 96`
              ];
            }
          },
          bodyFont: { size: 12 },
          padding: 10
        }
      },
      scales: {
        x: {
          min: 0,
          max: 23,
          grid: { color: '#e0d8cc', lineWidth: 0.5 },
          border: { color: '#c8c0b0' },
          ticks: {
            font: { size: 11 },
            color: '#666',
            callback: v => v
          },
          title: {
            display: true,
            text: 'Bars per 10,000 residents',
            font: { size: 11 },
            color: '#888'
          }
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { size: 10 },
            color: depts.map(d => TAG_COLORS[d.tag] || '#555'),
            autoSkip: false,
            maxRotation: 0
          }
        }
      }
    },
    plugins: [
      {
        id: 'avgLine',
        afterDraw(chart) {
          const { ctx: c, chartArea, scales } = chart;
          const xPos = scales.x.getPixelForValue(national);
          c.save();
          c.setLineDash([5, 3]);
          c.strokeStyle = '#888';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(xPos, chartArea.top);
          c.lineTo(xPos, chartArea.bottom);
          c.stroke();
          c.setLineDash([]);
          c.fillStyle = '#888';
          c.font = '10px Helvetica Neue, sans-serif';
          c.fillText(`Avg ${national}`, xPos + 4, chartArea.top + 12);
          c.restore();
        }
      }
    ]
  });
}
