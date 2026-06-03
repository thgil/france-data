export function renderTopNamesChart(containerId, topNames) {
  const el = document.querySelector(containerId);
  if (!el) return;
  const maxCount = topNames[0].count;
  el.innerHTML = topNames.map(({ name, count }, i) => {
    const pct = (count / maxCount * 100).toFixed(1);
    const rank = i + 1;
    return `<div class="bar-row">
      <span class="bar-rank">${rank}</span>
      <span class="bar-name">${name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%"></div>
      </div>
      <span class="bar-count">${count}</span>
    </div>`;
  }).join('');
}

export function renderShortNamesTable(containerId, shortNames) {
  const el = document.querySelector(containerId);
  if (!el) return;
  el.innerHTML = shortNames.map(({ name, chars, deptName, pop }) =>
    `<tr>
      <td class="place">${name}</td>
      <td class="center">${chars}</td>
      <td>${deptName}</td>
      <td class="num">${pop.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

export function renderSaintDeptsTable(containerId, saintDepts) {
  const el = document.querySelector(containerId);
  if (!el) return;
  el.innerHTML = saintDepts.map(({ deptName, saintCount, totalCount, pct }, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${deptName}</td>
      <td class="num">${saintCount}</td>
      <td class="num">${totalCount}</td>
      <td class="num">${pct}%</td>
    </tr>`
  ).join('');
}
