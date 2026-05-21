// charts.js — saint-names story

export function renderSaintChart(containerSel, data) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  const max = data[0].count;

  container.innerHTML = data.map(d => {
    const pct = (d.count / max * 100).toFixed(1);
    return `
      <div class="bar-row">
        <div class="bar-label">Saint(e)-${d.saint}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
          <span class="bar-value">${d.count}</span>
        </div>
      </div>`;
  }).join('');
}

export function renderDupChart(containerSel, data) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  const max = data[0].count;

  container.innerHTML = data.map(d => {
    const pct = (d.count / max * 100).toFixed(1);
    return `
      <div class="bar-row">
        <div class="bar-label">${d.name}</div>
        <div class="bar-track">
          <div class="bar-fill bar-fill-dup" style="width:${pct}%"></div>
          <span class="bar-value">${d.count}</span>
        </div>
      </div>`;
  }).join('');
}

export function renderLengthHistogram(containerSel, dist) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  const buckets = [];
  for (let i = 1; i <= 45; i++) {
    buckets.push({ len: i, count: dist[String(i)] || 0 });
  }
  const max = Math.max(...buckets.map(b => b.count));

  container.innerHTML = `
    <div class="hist-wrap">
      ${buckets.map(b => {
        const h = b.count === 0 ? 1 : Math.max(2, Math.round(b.count / max * 120));
        const label = b.len === 1 ? '1' : b.len === 15 ? '15' : b.len === 30 ? '30' : b.len === 45 ? '45' : '';
        return `<div class="hist-col" title="${b.len} chars: ${b.count.toLocaleString('fr-FR')} communes">
          <div class="hist-bar" style="height:${h}px;opacity:${b.count === 0 ? 0.1 : 1}"></div>
          <div class="hist-tick">${label}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="hist-caption">Name length (characters). Most communes cluster between 6–19 chars.</div>
  `;
}

export function renderShortNames(containerSel, data) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  container.innerHTML = data.map(d => {
    const deptName = deptLabel(d.dept);
    return `
      <div class="short-card">
        <div class="short-name">${d.name}</div>
        <div class="short-detail">${deptName} · ${d.pop.toLocaleString('fr-FR')} residents</div>
      </div>`;
  }).join('');
}

function deptLabel(code) {
  const map = {
    '80': 'Somme', '08': 'Ardennes', '25': 'Doubs', '28': 'Eure-et-Loir',
    '31': 'Haute-Garonne', '38': 'Isère', '61': 'Orne', '65': 'Hautes-Pyrénées',
    '66': 'Pyrénées-Orientales', '70': 'Haute-Saône', '76': 'Seine-Maritime', '95': "Val-d'Oise",
  };
  return map[code] || `Dept ${code}`;
}
