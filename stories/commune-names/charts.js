export function drawSaintsChart(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  const top10 = stats.topSaints.slice(0, 12);
  const labels = top10.map(s => s.name);
  const counts = top10.map(s => s.count);

  // Colours: accent for top bar, muted for rest
  const ACCENT = '#b32020';
  const MUTED  = '#c8bfb0';
  const colors = counts.map((_, i) => (i === 0 ? ACCENT : MUTED));

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x} communes`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#e8e0d4' },
          ticks: {
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
            color: '#666',
            maxTicksLimit: 6,
          },
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 13 },
            color: '#1a1a1a',
          },
        },
      },
    },
  });
}

export function populateTables(stats) {
  const dupTbody = document.querySelector('#table-duplicates tbody');
  if (dupTbody) {
    dupTbody.innerHTML = stats.topExact.slice(0, 10).map((item, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${item.name}</td>
        <td>${item.count}×</td>
      </tr>`
    ).join('');
  }

  const prefTbody = document.querySelector('#table-prefixes tbody');
  if (prefTbody) {
    prefTbody.innerHTML = stats.topPrefixes.slice(0, 10).map((item, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${item.prefix}-…</td>
        <td>${item.count}</td>
      </tr>`
    ).join('');
  }
}
