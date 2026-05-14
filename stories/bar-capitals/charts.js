// charts.js — bar-capitals story
// Renders the commune horizontal-bar chart and département ranking tables.

export function renderCommuneChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const communes = stats.topCommunes.slice(0, 12);
  const max = communes[0].per10k;
  const nationalAvg = stats.nationalAvg;

  const avgPct = (nationalAvg / max * 100).toFixed(2);

  const rows = communes.map((c, i) => {
    const pct = (c.per10k / max * 100).toFixed(2);
    const isAlps = ['73', '74', '05', '38'].includes(c.dept);
    const isCorsica = ['2A', '2B'].includes(c.dept);
    const highlight = isAlps || isCorsica;

    return `<div class="bar-row">
      <div class="bar-label">
        ${escHtml(c.name)}
        <small>Dept ${escHtml(c.dept)} · ${c.pop.toLocaleString('fr-FR')} res.</small>
      </div>
      <div class="bar-track">
        <div class="bar-fill${highlight ? ' is-highlight' : ''}" style="width:${pct}%"></div>
      </div>
      <span class="bar-value">${c.per10k}</span>
    </div>`;
  }).join('');

  // National average marker row
  const avgRow = `<div class="avg-bar-row" style="margin-top:4px;margin-bottom:12px;">
    <div class="avg-label">national avg</div>
    <div class="avg-track">
      <div class="avg-line" style="left:${avgPct}%"></div>
    </div>
    <span class="bar-value" style="color:#888">${nationalAvg}</span>
  </div>`;

  container.innerHTML = rows + avgRow;
}

export function renderDeptTables(stats) {
  const topBody = document.querySelector('#table-top-dept tbody');
  if (topBody && stats.topDepts) {
    topBody.innerHTML = stats.topDepts.slice(0, 10).map((d, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${escHtml(d.name)}</td>
        <td>${d.per10k}/10k</td>
      </tr>`
    ).join('');
  }

  const bottomBody = document.querySelector('#table-bottom-dept tbody');
  if (bottomBody && stats.bottomDepts) {
    const bottom = [...stats.bottomDepts].reverse().slice(0, 10);
    bottomBody.innerHTML = bottom.map((d, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${escHtml(d.name)}</td>
        <td>${d.per10k}/10k</td>
      </tr>`
    ).join('');
  }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
