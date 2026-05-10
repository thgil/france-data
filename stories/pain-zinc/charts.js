/* pain-zinc: bakeries vs bars across IDF */

const BREAD = '#c67c00';   // warm amber — matches bakeries story
const BAR   = '#b32020';   // site accent red — bars
const BREAD_LIGHT = 'rgba(198,124,0,0.15)';
const BAR_LIGHT   = 'rgba(179,32,32,0.15)';

export function drawDeptChart(containerId, data) {
  const canvas = document.querySelector(containerId);
  if (!canvas) return;

  const depts = data.byDept;
  const labels = depts.map(d => d.name);
  const bakeries = depts.map(d => d.bakeries);
  const bars = depts.map(d => d.bars);

  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Bakeries',
          data: bakeries,
          backgroundColor: BREAD,
          borderWidth: 0,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
        {
          label: 'Bars',
          data: bars,
          backgroundColor: BAR,
          borderWidth: 0,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: "'Helvetica Neue', sans-serif", size: 12 },
            color: '#1a1a1a',
            boxWidth: 12,
            boxHeight: 12,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#faf7f2',
          borderColor: '#b8b0a0',
          borderWidth: 1,
          titleColor: '#1a1a1a',
          bodyColor: '#444',
          titleFont: { family: 'Georgia, serif', size: 13 },
          bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
          padding: 10,
          callbacks: {
            label(ctx) {
              return `  ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('fr-FR')}`;
            },
            afterBody(items) {
              const d = depts[items[0].dataIndex];
              const r = d.ratio;
              if (r === 999) return '';
              return r < 1
                ? [`  → ${(1/r).toFixed(1)} bars per bakery`]
                : [`  → ${r.toFixed(1)} bakeries per bar`];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#555',
            maxRotation: 30,
          },
          grid: { display: false },
        },
        y: {
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
            callback: v => v.toLocaleString('fr-FR'),
          },
          grid: { color: '#ece8e0', lineWidth: 1 },
          border: { display: false },
        },
      },
    },
  });
}

export function drawArrChart(containerId, data) {
  const canvas = document.querySelector(containerId);
  if (!canvas) return;

  // Sort by bar count descending for display
  const arr = [...data.parisArr].sort((a, b) => b.bars - a.bars);
  const labels = arr.map(d => d.shortName);
  const bakeries = arr.map(d => d.bakeries);
  const bars = arr.map(d => d.bars);

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Bakeries',
          data: bakeries,
          backgroundColor: BREAD,
          borderWidth: 0,
          barPercentage: 0.75,
          categoryPercentage: 0.85,
        },
        {
          label: 'Bars',
          data: bars,
          backgroundColor: BAR,
          borderWidth: 0,
          barPercentage: 0.75,
          categoryPercentage: 0.85,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: "'Helvetica Neue', sans-serif", size: 12 },
            color: '#1a1a1a',
            boxWidth: 12, boxHeight: 12, padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#faf7f2',
          borderColor: '#b8b0a0',
          borderWidth: 1,
          titleColor: '#1a1a1a',
          bodyColor: '#444',
          titleFont: { family: 'Georgia, serif', size: 13 },
          bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
          padding: 10,
          callbacks: {
            title(items) { return arr[items[0].dataIndex].name; },
            label(ctx) {
              return `  ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('fr-FR')}`;
            },
            afterBody(items) {
              const d = arr[items[0].dataIndex];
              const r = d.ratio;
              if (r === 999) return '';
              return r < 1
                ? [`  → ${(1/r).toFixed(1)} bars per bakery`]
                : [`  → ${r.toFixed(1)} bakeries per bar`];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#555',
          },
          grid: { display: false },
        },
        y: {
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
            callback: v => v.toLocaleString('fr-FR'),
          },
          grid: { color: '#ece8e0', lineWidth: 1 },
          border: { display: false },
        },
      },
    },
  });
}
