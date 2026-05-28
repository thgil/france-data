/* charts.js — name-game story */

export function drawTopNamesChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const items = data.topNames.slice(0, 20);
  const max = items[0].count;

  el.innerHTML = items.map((d, i) => {
    const pct = (d.count / max * 100).toFixed(1);
    return `
      <div class="bar-row">
        <span class="bar-rank">${i + 1}</span>
        <span class="bar-label">${d.name}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="bar-value">${d.count}</span>
      </div>`;
  }).join('');
}

export function drawPrefixChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const items = data.topPrefixes.slice(0, 15);
  const max = items[0].count;

  el.innerHTML = items.map((d, i) => {
    const pct = (d.count / max * 100).toFixed(1);
    const isSaint = d.prefix.startsWith('Saint') || d.prefix.startsWith('Sainte');
    return `
      <div class="bar-row">
        <span class="bar-rank">${i + 1}</span>
        <span class="bar-label${isSaint ? ' bar-label-saint' : ''}">${d.prefix}</span>
        <div class="bar-track">
          <div class="bar-fill${isSaint ? ' bar-fill-saint' : ''}" style="width:${pct}%"></div>
        </div>
        <span class="bar-value">${d.count.toLocaleString('fr-FR')}</span>
      </div>`;
  }).join('');
}

export function drawLengthChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const items = data.lengthDist.filter(d => d.length <= 30);
  const max = Math.max(...items.map(d => d.count));
  const barW = 18;
  const gap = 4;
  const h = 120;
  const totalW = items.length * (barW + gap);

  const bars = items.map((d, i) => {
    const bh = Math.max(2, Math.round(d.count / max * h));
    const x = i * (barW + gap);
    const y = h - bh;
    const fill = d.length <= 2 ? '#b32020' : (d.length >= 35 ? '#c67c00' : '#888');
    return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" fill="${fill}" rx="2"/>
      <text x="${x + barW / 2}" y="${h + 14}" text-anchor="middle" font-size="9" fill="#888">${d.length <= 2 || d.length % 5 === 0 ? d.length : ''}</text>`;
  }).join('');

  el.innerHTML = `<svg viewBox="0 0 ${totalW} ${h + 20}" style="width:100%;max-width:${totalW}px;display:block;overflow:visible">
    ${bars}
    <text x="0" y="${h + 30}" font-size="9" fill="#aaa">← shorter</text>
    <text x="${totalW}" y="${h + 30}" text-anchor="end" font-size="9" fill="#aaa">longer →</text>
  </svg>`;
}
