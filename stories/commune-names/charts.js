// charts.js — commune-names story charts (Chart.js 4)

async function main() {
  const res = await fetch('./communes-stats.json');
  if (!res.ok) throw new Error('Failed to load communes-stats.json');
  const stats = await res.json();

  renderWordChart(stats);
  renderLengthChart(stats);
  renderRepeatedTable(stats);
  animateSaintNumber(stats.saintCount);
}

function renderWordChart(stats) {
  const ctx = document.getElementById('chart-words');
  if (!ctx) return;

  const words = stats.meaningfulWords.slice(0, 12);
  const labels = words.map(w => {
    const s = w.word.charAt(0).toUpperCase() + w.word.slice(1);
    return s;
  });
  const values = words.map(w => w.count);

  const colors = values.map((_, i) =>
    i === 0 ? 'rgba(179, 32, 32, 0.75)' : 'rgba(179, 32, 32, 0.25)'
  );

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.75', '1').replace('0.25', '0.5')),
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.x.toLocaleString('fr-FR')} occurrences`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#e8e4dc' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
            callback: v => v.toLocaleString('fr-FR'),
          },
          border: { color: '#d0c8bc' },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 13 },
            color: '#1a1a1a',
          },
          border: { color: '#d0c8bc' },
        },
      },
    },
  });
}

function renderLengthChart(stats) {
  const ctx = document.getElementById('chart-length');
  if (!ctx) return;

  const dist = stats.lengthDist;
  const labels = dist.map(d => d.length);
  const values = dist.map(d => d.count);

  // Color the peak range (6-9) slightly darker
  const colors = values.map((_, i) => {
    const l = parseInt(labels[i]);
    return (l >= 6 && l <= 9) ? 'rgba(179, 32, 32, 0.5)' : 'rgba(26, 26, 26, 0.2)';
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.5', '0.8').replace('0.2', '0.4')),
        borderWidth: 1,
        borderRadius: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => `${items[0].label} characters`,
            label: ctx => `${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
          },
          border: { color: '#d0c8bc' },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { color: '#e8e4dc' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
            callback: v => v.toLocaleString('fr-FR'),
          },
          border: { color: '#d0c8bc' },
          title: {
            display: true,
            text: 'Communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
      },
    },
  });
}

function renderRepeatedTable(stats) {
  const tbody = document.querySelector('#table-repeated tbody');
  if (!tbody) return;

  const top = stats.mostRepeated.slice(0, 12);
  const max = top[0].count;

  tbody.innerHTML = top.map((item, i) => {
    const barWidth = Math.round((item.count / max) * 80);
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${item.name}<span class="repeat-bar" style="width:${barWidth}px"></span></td>
      <td>${item.count}</td>
    </tr>`;
  }).join('');
}

function animateSaintNumber(target) {
  const el = document.getElementById('saint-number');
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString('fr-FR');
    if (current >= target) clearInterval(timer);
  }, 16);
}

main().catch(err => console.error('commune-names charts error:', err));
