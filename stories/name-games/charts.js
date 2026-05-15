async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

function renderShortGrid(shortCommunes) {
  const el = document.getElementById('short-grid');
  if (!el) return;
  // Show 2-letter communes only (Y is highlighted in prose)
  const twoLetter = shortCommunes.filter(c => c.length === 2);
  el.innerHTML = twoLetter.map(c => `
    <div class="short-card">
      <div class="sc-name">${c.name}</div>
      <div class="sc-dept">Dept. ${c.dept}</div>
      <div class="sc-pop">${c.pop.toLocaleString('fr-FR')} residents</div>
    </div>
  `).join('');
}

function renderHistogram(lengthDist) {
  const wrap = document.getElementById('hist-wrap');
  const xlabels = document.getElementById('hist-x-labels');
  if (!wrap || !xlabels) return;

  // Only show lengths 1–45 (trim near-zero tail)
  const relevant = lengthDist.filter(d => d.length >= 1 && d.length <= 45);
  const maxCount = Math.max(...relevant.map(d => d.count));

  wrap.innerHTML = relevant.map(d => {
    const pct = (d.count / maxCount * 100).toFixed(1);
    return `<div class="hist-bar" style="height:${pct}%" title="${d.length} chars: ${d.count.toLocaleString('fr-FR')} communes">
      <span class="hist-tip">${d.length} chars<br>${d.count.toLocaleString('fr-FR')}</span>
    </div>`;
  }).join('');

  // X-axis labels: every 5 characters
  xlabels.innerHTML = relevant.map((d, i) => {
    const show = d.length === 1 || d.length % 5 === 0;
    return `<span class="hist-x-label">${show ? d.length : ''}</span>`;
  }).join('');
}

function renderHBarChart(containerId, rows, maxVal, colorClass = '') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = rows.map(r => `
    <div class="hbar-row">
      <div class="hbar-label">${r.label}</div>
      <div class="hbar-track">
        <div class="hbar-fill${colorClass ? ' ' + colorClass : ''}" style="width:${(r.value / maxVal * 100).toFixed(1)}%"></div>
      </div>
      <div class="hbar-val">${r.value.toLocaleString('fr-FR')}</div>
    </div>
  `).join('');
}

function renderPrefixChart(prefixes) {
  const maxVal = prefixes[0].count;
  renderHBarChart('prefix-chart', prefixes.map(p => ({ label: p.prefix, value: p.count })), maxVal);
}

function renderDupChart(topNames) {
  const top12 = topNames.slice(0, 12);
  const maxVal = top12[0].count;
  renderHBarChart('dup-chart', top12.map(n => ({ label: n.name, value: n.count })), maxVal, 'gold');
}

function renderHyphenChart(hyphens) {
  const maxVal = Math.max(...hyphens.map(h => h.count));
  renderHBarChart('hyphen-chart', hyphens.map(h => ({ label: h.label, value: h.count })), maxVal);
}

async function main() {
  try {
    const data = await loadJSON('./data.json');
    const { stats, lengthDist, topNames, prefixes, hyphens, shortCommunes } = data;

    // Stat callouts (already in HTML, but update from data for accuracy)
    const statTotal = document.getElementById('stat-total');
    const statUnique = document.getElementById('stat-unique');
    const statAvg = document.getElementById('stat-avg');
    const statSaint = document.getElementById('stat-saint');
    if (statTotal) statTotal.textContent = stats.total.toLocaleString('fr-FR');
    if (statUnique) statUnique.textContent = stats.uniqueNames.toLocaleString('fr-FR');
    if (statAvg) statAvg.textContent = stats.avgLength;
    if (statSaint) statSaint.textContent = stats.saintPct + '%';

    renderShortGrid(shortCommunes);
    renderHistogram(lengthDist);
    renderPrefixChart(prefixes);
    renderDupChart(topNames);
    renderHyphenChart(hyphens);

  } catch (err) {
    console.error('Failed to load name-games data:', err);
  }
}

main();
