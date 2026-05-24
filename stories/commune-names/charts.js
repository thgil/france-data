async function loadData() {
  const r = await fetch('./data.json');
  return r.json();
}

function commonChartDefaults() {
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
        titleFont: { family: 'Georgia, serif', size: 13 },
        bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "'Helvetica Neue', sans-serif", size: 11 },
          color: '#555',
        },
        border: { color: '#ccc' },
      },
      y: {
        grid: { color: '#e8e4dc' },
        ticks: {
          font: { family: "'Helvetica Neue', sans-serif", size: 11 },
          color: '#888',
        },
        border: { display: false },
      },
    },
  };
}

function drawDupesChart(data) {
  const ctx = document.getElementById('chart-dupes');
  if (!ctx) return;
  const top20 = data.topDupes.slice(0, 20);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top20.map(d => d.name),
      datasets: [{
        data: top20.map(d => d.count),
        backgroundColor: top20.map(d =>
          d.name.startsWith('Saint') || d.name.startsWith('Sainte') ? '#b32020' : '#8a6030'
        ),
        borderWidth: 0,
        barPercentage: 0.75,
      }],
    },
    options: {
      ...commonChartDefaults(),
      indexAxis: 'y',
      plugins: {
        ...commonChartDefaults().plugins,
        tooltip: {
          ...commonChartDefaults().plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const d = top20[ctx.dataIndex];
              return ` ${d.count} communes (depts: ${d.depts.slice(0, 6).join(', ')}${d.depts.length > 6 ? '…' : ''})`;
            },
          },
        },
      },
      scales: {
        x: {
          ...commonChartDefaults().scales.x,
          title: {
            display: true,
            text: 'number of communes with this name',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
          ticks: {
            ...commonChartDefaults().scales.x.ticks,
            stepSize: 2,
          },
        },
        y: {
          ...commonChartDefaults().scales.y,
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          },
        },
      },
    },
  });
}

function drawSaintsChart(data) {
  const ctx = document.getElementById('chart-saints');
  if (!ctx) return;
  const saints = data.topSaints;
  const colors = [
    '#b32020','#c93030','#d94040','#b84020','#c85030',
    '#a83520','#d35030','#bb4025','#c04530','#b33020',
    '#cc4535','#bf4028','#c83828','#ba3a22','#c44230',
  ];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: saints.map(d => d.name),
      datasets: [{
        data: saints.map(d => d.count),
        backgroundColor: colors.slice(0, saints.length),
        borderWidth: 0,
        barPercentage: 0.75,
      }],
    },
    options: {
      ...commonChartDefaults(),
      plugins: {
        ...commonChartDefaults().plugins,
        tooltip: {
          ...commonChartDefaults().plugins.tooltip,
          callbacks: {
            title: (items) => `Saint-${items[0].label} / Sainte-${items[0].label}`,
            label: (ctx) => ` ${ctx.raw} communes`,
          },
        },
      },
      scales: {
        x: {
          ...commonChartDefaults().scales.x,
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          },
        },
        y: {
          ...commonChartDefaults().scales.y,
          title: {
            display: true,
            text: 'communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
      },
    },
  });
}

function drawLengthsChart(data) {
  const ctx = document.getElementById('chart-lengths');
  if (!ctx) return;
  const dist = data.lengthDist;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dist.map(d => d.length),
      datasets: [{
        data: dist.map(d => d.count),
        backgroundColor: dist.map(d => {
          const l = typeof d.length === 'number' ? d.length : 31;
          if (l === 1) return '#b32020';
          if (l >= 30) return '#8a6030';
          return '#6a7a8a';
        }),
        borderWidth: 0,
        barPercentage: 0.85,
      }],
    },
    options: {
      ...commonChartDefaults(),
      plugins: {
        ...commonChartDefaults().plugins,
        tooltip: {
          ...commonChartDefaults().plugins.tooltip,
          callbacks: {
            title: (items) => {
              const l = items[0].label;
              return l === '30+' ? '30+ characters' : `${l} characters`;
            },
            label: (ctx) => ` ${ctx.raw.toLocaleString()} communes`,
          },
        },
      },
      scales: {
        x: {
          ...commonChartDefaults().scales.x,
          title: {
            display: true,
            text: 'name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          ...commonChartDefaults().scales.y,
          title: {
            display: true,
            text: 'communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
      },
    },
  });
}

(async () => {
  const data = await loadData();

  const saintEl = document.getElementById('ps-saint-count');
  if (saintEl) saintEl.textContent = data.saintCount.toLocaleString();

  drawDupesChart(data);
  drawSaintsChart(data);
  drawLengthsChart(data);
})();
