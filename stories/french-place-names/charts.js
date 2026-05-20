/* charts.js — french-place-names story */

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top20 = topNames.slice(0, 20);
  const maxCount = top20[0].count;

  container.innerHTML = '';
  container.style.fontFamily = 'var(--sans, Helvetica Neue, sans-serif)';
  container.style.fontSize = '12px';

  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;';

  top20.forEach((d, i) => {
    const pct = (d.count / maxCount) * 100;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:3px 8px 3px 0;color:#aaa;font-size:10px;min-width:1.8ch;text-align:right;vertical-align:middle">${i + 1}</td>
      <td style="padding:3px 12px 3px 0;font-family:Georgia,serif;white-space:nowrap;vertical-align:middle">${d.name}</td>
      <td style="padding:3px 0;width:100%;vertical-align:middle">
        <div style="position:relative;height:14px;">
          <div style="position:absolute;left:0;top:2px;height:10px;width:${pct}%;background:#b32020;border-radius:1px;transition:width 0.4s ease;"></div>
        </div>
      </td>
      <td style="padding:3px 0 3px 10px;text-align:right;font-variant-numeric:tabular-nums;color:#444;white-space:nowrap;vertical-align:middle">${d.count}×</td>
    `;
    table.appendChild(tr);
  });

  container.appendChild(table);
}

export function drawPrefixChart(selector, topPrefixes) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top12 = topPrefixes.slice(0, 12);
  const maxCount = top12[0].count;

  container.innerHTML = '';
  container.style.fontFamily = 'var(--sans, Helvetica Neue, sans-serif)';
  container.style.fontSize = '12px';

  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;';

  top12.forEach((d, i) => {
    const pct = (d.count / maxCount) * 100;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:3px 8px 3px 0;color:#aaa;font-size:10px;min-width:1.8ch;text-align:right;vertical-align:middle">${i + 1}</td>
      <td style="padding:3px 12px 3px 0;font-family:Georgia,serif;white-space:nowrap;vertical-align:middle">${d.prefix}–</td>
      <td style="padding:3px 0;width:100%;vertical-align:middle">
        <div style="position:relative;height:14px;">
          <div style="position:absolute;left:0;top:2px;height:10px;width:${pct}%;background:#4a7a4a;border-radius:1px;transition:width 0.4s ease;"></div>
        </div>
      </td>
      <td style="padding:3px 0 3px 10px;text-align:right;font-variant-numeric:tabular-nums;color:#444;white-space:nowrap;vertical-align:middle">${d.count.toLocaleString('fr-FR')}</td>
    `;
    table.appendChild(tr);
  });

  container.appendChild(table);
}

export function drawLengthHistogram(selector, lengthHistogram) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = lengthHistogram.filter(d => d.length <= 35 && d.count > 0);
  const maxCount = Math.max(...data.map(d => d.count));

  const W = container.clientWidth || 600;
  const H = 160;
  const barW = Math.max(2, Math.floor((W - 40) / data.length) - 1);
  const totalW = data.length * (barW + 1) + 40;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${H + 28}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  data.forEach((d, i) => {
    const barH = Math.max(1, (d.count / maxCount) * H);
    const x = 40 + i * (barW + 1);
    const y = H - barH;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.75');
    svg.appendChild(rect);

    if (d.length % 5 === 0 || d.length === 1) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + barW / 2);
      label.setAttribute('y', H + 16);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-family', 'Helvetica Neue, sans-serif');
      label.setAttribute('fill', '#888');
      label.textContent = d.length;
      svg.appendChild(label);
    }
  });

  const axisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  axisLabel.setAttribute('x', totalW / 2);
  axisLabel.setAttribute('y', H + 27);
  axisLabel.setAttribute('text-anchor', 'middle');
  axisLabel.setAttribute('font-size', '10');
  axisLabel.setAttribute('font-family', 'Helvetica Neue, sans-serif');
  axisLabel.setAttribute('fill', '#aaa');
  axisLabel.textContent = 'name length (characters)';
  svg.appendChild(axisLabel);

  container.innerHTML = '';
  container.appendChild(svg);
}
