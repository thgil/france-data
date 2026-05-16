/* charts.js — saints-and-ys */

export function drawSaintChart(mountSelector, stats) {
  const el = document.querySelector(mountSelector);
  if (!el) return;

  const data = stats.topSaintFamilies.slice(0, 12);
  const maxCount = data[0].count;

  const BAR_H = 28;
  const GAP = 6;
  const LABEL_W = 130;
  const COUNT_W = 42;
  const BAR_MAX_W = 320;
  const PADDING = { top: 8, bottom: 8, left: 8, right: 16 };

  const totalH = data.length * (BAR_H + GAP) - GAP + PADDING.top + PADDING.bottom;
  const totalW = LABEL_W + BAR_MAX_W + COUNT_W + PADDING.left + PADDING.right;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.display = 'block';
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
  svg.style.overflow = 'visible';

  data.forEach((d, i) => {
    const y = PADDING.top + i * (BAR_H + GAP);
    const barW = Math.round((d.count / maxCount) * BAR_MAX_W);
    const cx = PADDING.left + LABEL_W;
    const cy = y + BAR_H / 2;

    // Label
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', PADDING.left + LABEL_W - 8);
    label.setAttribute('y', cy + 1);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.setAttribute('font-family', "Georgia, serif");
    label.textContent = d.name;
    svg.appendChild(label);

    // Bar
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', cx);
    rect.setAttribute('y', y + 4);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', BAR_H - 8);
    rect.setAttribute('fill', i === 0 ? '#b32020' : '#d4bfa0');
    rect.setAttribute('rx', '2');
    svg.appendChild(rect);

    // Count
    const count = document.createElementNS(svgNS, 'text');
    count.setAttribute('x', cx + barW + 7);
    count.setAttribute('y', cy + 1);
    count.setAttribute('dominant-baseline', 'middle');
    count.setAttribute('font-size', '12');
    count.setAttribute('fill', '#444');
    count.setAttribute('font-variant-numeric', 'tabular-nums');
    count.textContent = d.count.toLocaleString('fr-FR');
    svg.appendChild(count);
  });

  el.appendChild(svg);
}

export function drawNameLengthChart(mountSelector, stats) {
  const el = document.querySelector(mountSelector);
  if (!el) return;

  const svgNS = 'http://www.w3.org/2000/svg';

  const buckets = [
    { label: '1–3', count: 0 },
    { label: '4–6', count: 0 },
    { label: '7–9', count: 0 },
    { label: '10–14', count: 0 },
    { label: '15–20', count: 0 },
    { label: '21–30', count: 0 },
    { label: '31+', count: 0 },
  ];

  (stats.nameLengthDist || []).forEach(({ len, count }) => {
    if (len <= 3) buckets[0].count += count;
    else if (len <= 6) buckets[1].count += count;
    else if (len <= 9) buckets[2].count += count;
    else if (len <= 14) buckets[3].count += count;
    else if (len <= 20) buckets[4].count += count;
    else if (len <= 30) buckets[5].count += count;
    else buckets[6].count += count;
  });

  const maxCount = Math.max(...buckets.map(b => b.count));
  const BAR_W = 56;
  const GAP = 10;
  const BAR_MAX_H = 120;
  const LABEL_H = 30;
  const COUNT_H = 20;
  const PADDING = { top: 8, bottom: 8, left: 16, right: 16 };

  const totalW = buckets.length * (BAR_W + GAP) - GAP + PADDING.left + PADDING.right;
  const totalH = BAR_MAX_H + LABEL_H + COUNT_H + PADDING.top + PADDING.bottom;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.display = 'block';
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";

  const baselineY = PADDING.top + BAR_MAX_H;

  buckets.forEach((b, i) => {
    const x = PADDING.left + i * (BAR_W + GAP);
    const barH = Math.round((b.count / maxCount) * BAR_MAX_H);

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', baselineY - barH);
    rect.setAttribute('width', BAR_W);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#d4bfa0');
    rect.setAttribute('rx', '2');
    svg.appendChild(rect);

    const labelEl = document.createElementNS(svgNS, 'text');
    labelEl.setAttribute('x', x + BAR_W / 2);
    labelEl.setAttribute('y', baselineY + 16);
    labelEl.setAttribute('text-anchor', 'middle');
    labelEl.setAttribute('font-size', '11');
    labelEl.setAttribute('fill', '#666');
    labelEl.textContent = b.label;
    svg.appendChild(labelEl);

    if (b.count > 0) {
      const countEl = document.createElementNS(svgNS, 'text');
      countEl.setAttribute('x', x + BAR_W / 2);
      countEl.setAttribute('y', baselineY - barH - 4);
      countEl.setAttribute('text-anchor', 'middle');
      countEl.setAttribute('font-size', '10');
      countEl.setAttribute('fill', '#888');
      countEl.textContent = b.count > 999
        ? `${Math.round(b.count / 1000)}k`
        : b.count.toString();
      svg.appendChild(countEl);
    }
  });

  el.appendChild(svg);
}
