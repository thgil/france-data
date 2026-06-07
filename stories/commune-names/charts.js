// stories/commune-names/charts.js
// Text-and-chart story: commune name patterns across 35,014 French communes.
// Exports: drawTopNamesChart(selector, stats), drawLengthChart(selector, stats)

export function drawTopNamesChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = stats.topNames.slice(0, 20);
  const maxCount = data[0].count;

  const W = el.clientWidth || 600;
  const rowH = 28;
  const labelW = Math.min(220, W * 0.42);
  const barAreaW = W - labelW - 56; // 56 = count label space
  const H = data.length * rowH + 20;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.fontFamily = "Georgia, 'Times New Roman', serif";
  svg.style.fontSize = '13px';
  svg.style.overflow = 'visible';

  data.forEach((d, i) => {
    const y = i * rowH + rowH * 0.5;
    const barW = Math.max(2, (d.count / maxCount) * barAreaW);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelW - 8);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('fill', '#1a1a1a');
    label.setAttribute('font-size', '13');
    label.setAttribute('font-family', "Georgia, 'Times New Roman', serif");
    label.textContent = d.name;
    g.appendChild(label);

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', y - 8);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', 16);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.75');
    g.appendChild(rect);

    // Count label
    const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    count.setAttribute('x', labelW + barW + 6);
    count.setAttribute('y', y + 4);
    count.setAttribute('fill', '#666');
    count.setAttribute('font-size', '11');
    count.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    count.setAttribute('font-variant-numeric', 'tabular-nums');
    count.textContent = `×${d.count}`;
    g.appendChild(count);

    svg.appendChild(g);
  });

  el.appendChild(svg);
}

export function drawLengthChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Bucket into groups for readability
  const raw = stats.nameLengthDist;
  const byLen = {};
  raw.forEach(d => { byLen[d.len] = d.count; });

  // Build buckets: 1, 2-3, 4-5, 6-8, 9-11, 12-15, 16-20, 21-30, 31+
  const buckets = [
    { label: '1', min: 1, max: 1 },
    { label: '2–3', min: 2, max: 3 },
    { label: '4–5', min: 4, max: 5 },
    { label: '6–8', min: 6, max: 8 },
    { label: '9–11', min: 9, max: 11 },
    { label: '12–15', min: 12, max: 15 },
    { label: '16–20', min: 16, max: 20 },
    { label: '21–30', min: 21, max: 30 },
    { label: '31+', min: 31, max: 99 },
  ].map(b => ({
    label: b.label,
    count: Object.entries(byLen)
      .filter(([l]) => +l >= b.min && +l <= b.max)
      .reduce((s, [, c]) => s + c, 0)
  }));

  const maxCount = Math.max(...buckets.map(b => b.count));
  const W = el.clientWidth || 600;
  const padL = 16;
  const padR = 16;
  const padTop = 12;
  const padBot = 32;
  const chartH = 140;
  const H = chartH + padTop + padBot;
  const nBuckets = buckets.length;
  const colW = (W - padL - padR) / nBuckets;
  const barPad = 4;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  svg.style.fontSize = '11px';

  buckets.forEach((b, i) => {
    const x = padL + i * colW;
    const barH = Math.max(2, (b.count / maxCount) * chartH);
    const barY = padTop + chartH - barH;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + barPad);
    rect.setAttribute('y', barY);
    rect.setAttribute('width', colW - barPad * 2);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#1a1a1a');
    rect.setAttribute('opacity', '0.7');
    g.appendChild(rect);

    // X-axis label
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', x + colW / 2);
    lbl.setAttribute('y', padTop + chartH + 16);
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('fill', '#666');
    lbl.setAttribute('font-size', '10');
    lbl.textContent = b.label;
    g.appendChild(lbl);

    // Count on top of bar (only for non-tiny bars)
    if (barH > 16) {
      const cnt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      cnt.setAttribute('x', x + colW / 2);
      cnt.setAttribute('y', barY - 3);
      cnt.setAttribute('text-anchor', 'middle');
      cnt.setAttribute('fill', '#1a1a1a');
      cnt.setAttribute('font-size', '10');
      cnt.setAttribute('font-variant-numeric', 'tabular-nums');
      cnt.textContent = b.count.toLocaleString('fr-FR');
      g.appendChild(cnt);
    }

    svg.appendChild(g);
  });

  // X-axis title
  const axisLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  axisLbl.setAttribute('x', W / 2);
  axisLbl.setAttribute('y', H - 2);
  axisLbl.setAttribute('text-anchor', 'middle');
  axisLbl.setAttribute('fill', '#888');
  axisLbl.setAttribute('font-size', '10');
  axisLbl.textContent = 'Name length (characters)';
  svg.appendChild(axisLbl);

  el.appendChild(svg);
}
