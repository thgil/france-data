// charts.js — pharmacy-boom story
// Two Chart.js charts: growth timeline + dept × decade breakdown.

const CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

async function loadChartJS() {
  if (window.Chart) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CDN;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const PALETTE = [
  '#b32020', // accent red — Paris
  '#3a6b9e', // blue — Seine-et-Marne
  '#4e9e5a', // green — Yvelines
  '#c67c00', // amber — Essonne
  '#7a5ea7', // purple — Hauts-de-Seine
  '#d45f00', // orange — Seine-Saint-Denis
  '#1a7a6e', // teal — Val-de-Marne
  '#8a7030', // brown — Val-d'Oise
];

export async function drawGrowthChart(selector, stats) {
  await loadChartJS();
  const el = document.querySelector(selector);
  if (!el) return;

  const data = stats.cumulative;
  const labels = data.map(d => d.year);
  const opened = data.map(d => d.opened);
  const totals = data.map(d => d.total);

  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Cumulative total',
          data: totals,
          borderColor: '#b32020',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'yRight',
          tension: 0.3,
          order: 1,
        },
        {
          type: 'bar',
          label: 'Opened that year',
          data: opened,
          backgroundColor: 'rgba(180,180,160,0.65)',
          borderColor: 'rgba(150,140,120,0.8)',
          borderWidth: 1,
          yAxisID: 'yLeft',
          order: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: "'Helvetica Neue', sans-serif", size: 12 },
            color: '#444',
            boxWidth: 14,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label || '';
              const val = ctx.parsed.y;
              return ` ${label}: ${val.toLocaleString('fr-FR')}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
            maxTicksLimit: 14,
          },
          grid: { display: false },
        },
        yLeft: {
          position: 'left',
          title: {
            display: true,
            text: 'Opened per year',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
        yRight: {
          position: 'right',
          title: {
            display: true,
            text: 'Cumulative total',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#b32020',
          },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#b32020',
          },
          grid: { display: false },
        },
      },
    },
  });
}

export async function drawDeptChart(selector, stats) {
  await loadChartJS();
  const el = document.querySelector(selector);
  if (!el) return;

  // Decades to display (skip 1940s and 1950s — tiny counts)
  const decades = ['1960', '1970', '1980', '1990', '2000', '2010'];
  const decadeLabels = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010–13'];

  // Sort departments by total descending
  const depts = [...stats.deptBreakdown].sort((a, b) => b.total - a.total);

  const datasets = depts.map((d, i) => ({
    label: d.name,
    data: decades.map(dec => d.byDecade[dec] || 0),
    backgroundColor: PALETTE[i % PALETTE.length],
    borderColor: 'transparent',
    borderWidth: 0,
    stack: 'depts',
  }));

  new Chart(el, {
    type: 'bar',
    data: {
      labels: decadeLabels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#444',
            boxWidth: 12,
            padding: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y;
              return val > 0 ? ` ${ctx.dataset.label}: ${val}` : null;
            },
          },
          filter: (item) => item.parsed.y > 0,
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 12 },
            color: '#444',
          },
          grid: { display: false },
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'New pharmacies',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
      },
    },
  });
}
