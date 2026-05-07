export function drawDeptChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const sorted = [...data].sort((a, b) => b.per10k - a.per10k);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.name),
      datasets: [{
        data: sorted.map(d => d.per10k),
        backgroundColor: sorted.map(d =>
          d.dept === '75' ? '#c67c00' : '#b8a898'
        ),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.raw.toFixed(1)} bakeries per 10,000 residents`,
            afterLabel: ctx => {
              const d = sorted[ctx.dataIndex];
              return `${d.bakeries.toLocaleString('fr-FR')} bakeries total`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Bakeries per 10,000 residents',
            font: { size: 11, family: "'Helvetica Neue', sans-serif" },
            color: '#888'
          },
          grid: { color: '#ede8e0' },
          ticks: {
            font: { size: 11 },
            color: '#666'
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            color: '#333',
            maxRotation: 30
          }
        }
      }
    }
  });
}

export function drawCommuneChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const sorted = [...data].sort((a, b) => a.per10k - b.per10k);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.name),
      datasets: [{
        data: sorted.map(d => d.per10k),
        backgroundColor: sorted.map(d =>
          d.dept === '75' ? '#c67c00' : '#8fa8b8'
        ),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.raw.toFixed(1)} bakeries per 10,000 residents`,
            afterLabel: ctx => {
              const d = sorted[ctx.dataIndex];
              return `${d.bakeries} bakeries · pop. ${d.population.toLocaleString('fr-FR')}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Bakeries per 10,000 residents',
            font: { size: 11, family: "'Helvetica Neue', sans-serif" },
            color: '#888'
          },
          grid: { color: '#ede8e0' },
          ticks: { font: { size: 11 }, color: '#666' }
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            color: '#333'
          }
        }
      }
    }
  });
}
