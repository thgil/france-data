// stories/village-names/charts.js
// Pure-DOM chart rendering: horizontal bar charts for commune name statistics.

const BAR_COLOR = '#b32020';
const BAR_MAX_WIDTH = 240;

function hBar(value, max, label, sublabel) {
  const pct = Math.round((value / max) * BAR_MAX_WIDTH);
  return `
    <div class="hbar-row">
      <div class="hbar-label">
        <span class="hbar-name">${label}</span>
        ${sublabel ? `<span class="hbar-sub">${sublabel}</span>` : ''}
      </div>
      <div class="hbar-track">
        <div class="hbar-fill" style="width:${pct}px"></div>
      </div>
      <div class="hbar-value">${value.toLocaleString('fr-FR')}</div>
    </div>`;
}

export function renderWordChart(el, topWords) {
  const max = topWords[0].count;
  el.innerHTML = topWords.map(({ word, count }) =>
    hBar(count, max, `<em>${word}</em>`, '')
  ).join('');
}

export function renderDuplicatesChart(el, topDuplicates) {
  const max = topDuplicates[0].count;
  el.innerHTML = topDuplicates.map(({ name, count }) =>
    hBar(count, max, `<em>${name}</em>`, `${count} communes`)
  ).join('');
}

export function renderShortTable(el, shortList) {
  el.innerHTML = shortList.map(({ name, deptName, pop }) => `
    <tr>
      <td class="place"><strong>${name}</strong></td>
      <td>${deptName}</td>
      <td>${pop.toLocaleString('fr-FR')} inh.</td>
    </tr>`
  ).join('');
}

export function renderLongTable(el, top5) {
  el.innerHTML = top5.map(({ name, deptName, length }, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place" style="font-style:italic">${name}</td>
      <td>${deptName}</td>
      <td>${length} chars</td>
    </tr>`
  ).join('');
}
