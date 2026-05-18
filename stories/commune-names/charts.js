/* eslint-disable no-undef */
export function drawNameCharts(stats) {
  drawLengthHistogram(stats.length_hist);
  drawSaintChart(stats.saint_depts);
  populateTables(stats);
}

function drawLengthHistogram(hist) {
  const ctx = document.getElementById('chart-length');
  if (!ctx) return;

  const labels = hist.map(([len]) => len);
  const values = hist.map(([, count]) => count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(l => l === 1 ? '#8b1e1e' : l === 45 ? '#8b1e1e' : '#b8860b'),
        borderWidth: 0,
        barPercentage: 0.95,
        categoryPercentage: 1,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ([item]) => `${item.label} characters`,
            label: (item) => `${item.raw.toLocaleString('fr-FR')} communes`,
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Name length (characters)', font: { size: 11 }, color: '#888' },
          ticks: { font: { size: 11 }, color: '#666', maxTicksLimit: 15 },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: 'Number of communes', font: { size: 11 }, color: '#888' },
          ticks: { font: { size: 11 }, color: '#666' },
          grid: { color: '#ede8e0' },
        }
      }
    }
  });
}

function drawSaintChart(saintDepts) {
  const ctx = document.getElementById('chart-saints');
  if (!ctx) return;

  const sorted = [...saintDepts].sort((a, b) => b.pct - a.pct).slice(0, 12);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => `${d.name} (${d.dept})`),
      datasets: [{
        data: sorted.map(d => d.pct),
        backgroundColor: '#b8860b',
        borderWidth: 0,
        barPercentage: 0.7,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const d = sorted[item.dataIndex];
              return `${d.pct}% — ${d.count} of ${d.total} communes`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: '% of communes starting with Saint(e)', font: { size: 11 }, color: '#888' },
          ticks: {
            font: { size: 11 }, color: '#666',
            callback: v => `${v}%`,
          },
          grid: { color: '#ede8e0' },
          max: 35,
        },
        y: {
          ticks: { font: { size: 12 }, color: '#333' },
          grid: { display: false },
        }
      }
    }
  });
}

function populateTables(stats) {
  const commonTbody = document.querySelector('#table-common tbody');
  if (commonTbody && stats.most_common) {
    commonTbody.innerHTML = stats.most_common.slice(0, 10).map((d, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td>${d.count}</td>
      </tr>`
    ).join('');
  }

  const twoTbody = document.querySelector('#table-twoletter tbody');
  if (twoTbody) {
    const twoLetterNames = [
      { name: 'Y', dept: 'Somme (80)', pop: 89 },
      { name: 'By', dept: 'Doubs (25)', pop: 86 },
      { name: 'Bû', dept: 'Eure-et-Loir (28)', pop: 2022 },
      { name: 'Eu', dept: 'Seine-Maritime (76)', pop: 6591 },
      { name: 'Gy', dept: 'Haute-Saône (70)', pop: 1001 },
      { name: 'Oz', dept: 'Isère (38)', pop: 213 },
      { name: 'Oô', dept: 'Haute-Garonne (31)', pop: 103 },
      { name: 'Py', dept: 'Pyrénées-Orientales (66)', pop: 79 },
      { name: 'Ri', dept: 'Orne (61)', pop: 156 },
      { name: 'Ry', dept: 'Seine-Maritime (76)', pop: 775 },
    ];
    twoTbody.innerHTML = twoLetterNames.map(d =>
      `<tr>
        <td class="place" style="font-size:15px;font-weight:600">${d.name}</td>
        <td>${d.dept}</td>
        <td>${d.pop.toLocaleString('fr-FR')}</td>
      </tr>`
    ).join('');
  }
}
