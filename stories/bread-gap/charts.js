export function drawDeptChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const depts = [...data.byDept].sort((a, b) => b.per10k - a.per10k);
  const maxVal = depts[0].per10k;

  const BAR_H = 28;
  const LABEL_W = 130;
  const GAP = 6;
  const CHART_W = 340;
  const PADDING = { top: 20, right: 60, bottom: 20, left: 0 };
  const totalH = depts.length * (BAR_H + GAP) - GAP;
  const svgH = totalH + PADDING.top + PADDING.bottom;
  const svgW = LABEL_W + CHART_W + PADDING.right;

  const PARIS_GOLD = '#c67c00';
  const SUBURB_COLOR = '#8b7355';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.maxWidth = '520px';
  svg.style.overflow = 'visible';

  function px(val) {
    return (val / maxVal) * CHART_W;
  }

  depts.forEach((d, i) => {
    const y = PADDING.top + i * (BAR_H + GAP);
    const barW = px(d.per10k);
    const isParis = d.dept === '75';
    const fill = isParis ? PARIS_GOLD : SUBURB_COLOR;

    // Department label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', LABEL_W - 8);
    text.setAttribute('y', y + BAR_H / 2 + 1);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-family', 'Georgia, serif');
    text.setAttribute('font-size', '13');
    text.setAttribute('fill', isParis ? '#1a1a1a' : '#444');
    text.setAttribute('font-weight', isParis ? '600' : 'normal');
    text.textContent = d.name;
    svg.appendChild(text);

    // Bar background
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', LABEL_W);
    bgRect.setAttribute('y', y);
    bgRect.setAttribute('width', CHART_W);
    bgRect.setAttribute('height', BAR_H);
    bgRect.setAttribute('fill', '#f0ebe0');
    bgRect.setAttribute('rx', '2');
    svg.appendChild(bgRect);

    // Bar fill
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', LABEL_W);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', BAR_H);
    rect.setAttribute('fill', fill);
    rect.setAttribute('rx', '2');
    svg.appendChild(rect);

    // Value label
    const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    val.setAttribute('x', LABEL_W + barW + 6);
    val.setAttribute('y', y + BAR_H / 2 + 1);
    val.setAttribute('dominant-baseline', 'middle');
    val.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    val.setAttribute('font-size', '12');
    val.setAttribute('fill', isParis ? '#1a1a1a' : '#666');
    val.setAttribute('font-weight', isParis ? '600' : 'normal');
    val.textContent = d.per10k.toFixed(1);
    svg.appendChild(val);
  });

  // X axis label
  const axisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  axisLabel.setAttribute('x', LABEL_W + CHART_W / 2);
  axisLabel.setAttribute('y', svgH - 2);
  axisLabel.setAttribute('text-anchor', 'middle');
  axisLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  axisLabel.setAttribute('font-size', '10');
  axisLabel.setAttribute('letter-spacing', '0.8');
  axisLabel.setAttribute('fill', '#999');
  axisLabel.textContent = 'BAKERIES PER 10,000 RESIDENTS';
  svg.appendChild(axisLabel);

  container.appendChild(svg);
}

export function populateTables(data) {
  const topBody = document.querySelector('#table-top tbody');
  if (topBody) {
    topBody.innerHTML = data.topCommunesPop5k.map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td class="dept-tag">${d.deptName}</td>
        <td>${d.per10k.toFixed(1)}</td>
      </tr>
    `).join('');
  }

  const desertBody = document.querySelector('#table-deserts tbody');
  if (desertBody) {
    desertBody.innerHTML = data.lowestDensityPop5k.map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td class="dept-tag">${d.deptName}</td>
        <td>${d.per10k.toFixed(1)}</td>
      </tr>
    `).join('');
  }

  const zeroBody = document.querySelector('#table-zero tbody');
  if (zeroBody) {
    zeroBody.innerHTML = data.zeroBakeryCommunes.map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td class="dept-tag">${d.deptName}</td>
        <td>${d.population.toLocaleString('fr-FR')}</td>
      </tr>
    `).join('');
  }
}
