// stories/commune-names/charts.js
// Builds the short-names table, shared-names table, and top-names bar chart.

const DEPT_NAMES = {
  '80': 'Somme', '25': 'Doubs', '28': 'Eure-et-Loir', '76': 'Seine-Maritime',
  '70': 'Haute-Saône', '38': 'Isère', '31': 'Haute-Garonne', '66': 'Pyrénées-Orientales',
  '61': 'Orne', '08': 'Ardennes', '65': 'Hautes-Pyrénées', '95': 'Val-d\'Oise',
};

function fmtPop(n) {
  if (!n) return '—';
  return n.toLocaleString('fr-FR');
}

function buildShortTable(shortNames) {
  const tbody = document.querySelector('#table-short tbody');
  if (!tbody) return;
  const rows = shortNames.filter(d => d.len <= 2).map(d => {
    const deptLabel = DEPT_NAMES[d.dept] || `Dept ${d.dept}`;
    return `<tr>
      <td class="nm">${d.name}<span class="dept-badge">${d.dept}</span></td>
      <td><span class="pop-note">${deptLabel} · pop. ${fmtPop(d.pop)}</span></td>
    </tr>`;
  });
  tbody.innerHTML = rows.join('');
}

function buildSharedTable(topNames) {
  const tbody = document.querySelector('#table-shared tbody');
  if (!tbody) return;
  const shared = topNames.filter(d => d.count >= 2).slice(0, 10);
  tbody.innerHTML = shared.map((d, i) =>
    `<tr>
      <td class="nm">${d.name}</td>
      <td>${d.count}×</td>
    </tr>`
  ).join('');
}

function buildTopNamesChart(topNames) {
  const canvas = document.getElementById('chart-top-names');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = topNames.map(d => d.name);
  const values = topNames.map(d => d.count);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Number of communes',
        data: values,
        backgroundColor: '#b32020',
        borderRadius: 2,
        borderSkipped: false,
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
            label: ctx => ` ${ctx.parsed.x} commune${ctx.parsed.x > 1 ? 's' : ''}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            stepSize: 1,
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
          grid: { color: '#ede8e0' },
          title: {
            display: true,
            text: 'Number of communes sharing this name',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          ticks: {
            font: { family: 'Georgia, serif', size: 13 },
            color: '#1a1a1a',
          },
          grid: { display: false },
        },
      },
    },
  });

  // Fix canvas height for horizontal bar
  canvas.parentElement.style.height = (topNames.length * 26 + 60) + 'px';
}

export function buildCharts(data) {
  buildShortTable(data.short_names || []);
  buildSharedTable(data.top_names || []);
  buildTopNamesChart(data.top_names || []);

  // Update stat cards with live data
  const s = data.stats;
  if (!s) return;
  const el = id => document.getElementById(id);
  if (el('sn-total'))   el('sn-total').textContent   = s.total.toLocaleString('fr-FR');
  if (el('sn-unique'))  el('sn-unique').textContent  = s.unique_names.toLocaleString('fr-FR');
  if (el('sn-saint'))   el('sn-saint').textContent   = s.saint_total.toLocaleString('fr-FR');
  if (el('sn-hyphen'))  el('sn-hyphen').textContent  = s.hyphen_pct + '%';
  if (el('longest-name')) el('longest-name').textContent = s.longest_name;
}
