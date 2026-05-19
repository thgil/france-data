// charts.js — commune-names story
// Draws the name-length distribution bar chart using Chart.js.

export function drawLengthChart(canvasId, lengthDist) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Group lengths 30+ together to keep the x-axis readable
  const labels = [];
  const values = [];
  for (let l = 1; l <= 29; l++) {
    const entry = lengthDist.find(d => d.len === l);
    labels.push(String(l));
    values.push(entry ? entry.count : 0);
  }
  const over30 = lengthDist.filter(d => d.len >= 30).reduce((s, d) => s + d.count, 0);
  labels.push('30+');
  values.push(over30);

  // Peak bar index (length 7 and 8 tie at 3695 each)
  const maxVal = Math.max(...values);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: values.map(v => v === maxVal ? '#8b5e3c' : '#c49a6c'),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const l = items[0].label;
              return l === '30+' ? '30 or more characters' : `${l} characters`;
            },
            label: (item) => `${item.raw.toLocaleString('fr-FR')} communes`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11, family: "'Helvetica Neue', sans-serif" },
            color: '#888',
            maxRotation: 0,
            // Show every 5th label to avoid crowding
            callback: function(val, idx) {
              const raw = this.getLabelForValue(val);
              if (raw === '1' || raw === '30+') return raw;
              const n = parseInt(raw);
              return (n % 5 === 0) ? raw : '';
            }
          }
        },
        y: {
          grid: { color: '#ede8e0' },
          ticks: {
            font: { size: 11, family: "'Helvetica Neue', sans-serif" },
            color: '#888',
            callback: (v) => v.toLocaleString('fr-FR')
          }
        }
      }
    }
  });
}
