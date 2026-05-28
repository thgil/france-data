async function loadData() {
  const res = await fetch('./data.json');
  if (!res.ok) throw new Error(`data.json: HTTP ${res.status}`);
  return res.json();
}

function populateShortestTable(data) {
  const tbody = document.querySelector('#table-shortest tbody');
  if (!tbody) return;
  tbody.innerHTML = data.shortestNames.slice(0, 15).map((r, i) =>
    `<tr>
      <td class="n-rank">${i + 1}</td>
      <td class="n-name">${r.name}</td>
      <td><span class="n-note">${r.length} chr · dept ${r.dept}</span></td>
    </tr>`
  ).join('');
}

function populateLongestTable(data) {
  const tbody = document.querySelector('#table-longest tbody');
  if (!tbody) return;
  tbody.innerHTML = data.longestNames.slice(0, 8).map((r, i) =>
    `<tr>
      <td class="n-rank">${i + 1}</td>
      <td class="n-name" style="font-size:11px;word-break:break-word">${r.name}</td>
      <td><span class="n-note">${r.length} chr</span></td>
    </tr>`
  ).join('');
}

function drawTopNamesChart(data) {
  const canvas = document.getElementById('chart-top-names');
  if (!canvas) return;

  const top = data.topNames.slice(0, 20);
  const labels = top.map(d => d.name);
  const counts = top.map(d => d.count);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Communes sharing this name',
        data: counts,
        backgroundColor: '#b32020cc',
        borderColor: '#b32020',
        borderWidth: 1,
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
            label: ctx => `${ctx.parsed.x} commune${ctx.parsed.x > 1 ? 's' : ''} share this name`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { family: "'Helvetica Neue', sans-serif", size: 11 }
          },
          grid: { color: '#e0d8cc' },
          title: {
            display: true,
            text: 'Number of communes sharing this name',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888'
          }
        },
        y: {
          ticks: {
            font: { family: 'Georgia, serif', size: 13 },
            color: '#1a1a1a'
          },
          grid: { display: false }
        }
      }
    }
  });
}

function drawLengthDistChart(data) {
  const canvas = document.getElementById('chart-length-dist');
  if (!canvas) return;

  const dist = data.lengthDist;
  const labels = dist.map(d => d.length);
  const counts = dist.map(d => d.count);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Communes',
        data: counts,
        backgroundColor: '#3a6ea8bb',
        borderColor: '#3a6ea8',
        borderWidth: 1,
        borderRadius: 1,
        barPercentage: 0.95,
        categoryPercentage: 1.0,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `${ctx[0].label} characters`,
            label: ctx => `${ctx.parsed.y.toLocaleString('fr-FR')} communes`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 10 },
            maxTicksLimit: 20,
            callback: (val, idx) => {
              const len = labels[idx];
              return len % 5 === 0 || len === 1 ? len : '';
            }
          },
          grid: { display: false },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888'
          }
        },
        y: {
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            callback: v => v.toLocaleString('fr-FR')
          },
          grid: { color: '#e0d8cc' },
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888'
          }
        }
      }
    }
  });
}

async function main() {
  try {
    const data = await loadData();

    populateShortestTable(data);
    populateLongestTable(data);
    drawTopNamesChart(data);
    drawLengthDistChart(data);

    // Update stat callouts from live data
    const el = id => document.getElementById(id);
    if (el('stat-total')) el('stat-total').textContent = data.meta.total.toLocaleString('fr-FR');
    if (el('stat-saint')) el('stat-saint').textContent = data.meta.saintTotal.toLocaleString('fr-FR');
    if (el('stat-shared')) el('stat-shared').textContent = data.meta.sharedCommunes.toLocaleString('fr-FR');

  } catch (err) {
    console.error('Failed to load commune-names data:', err);
  }
}

main();
