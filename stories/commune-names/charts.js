// stories/commune-names/charts.js
// Bar charts for commune-names story.
// Exports: drawSaintChart, drawNameChart, drawLetterChart

const ACCENT = '#b32020';
const BAR_BG = '#e8e0d4';

function svgBar(container, items, { valueKey = 'count', labelKey = 'name', maxItems = 12, title = '' } = {}) {
  const slice = items.slice(0, maxItems);
  const maxVal = Math.max(...slice.map(d => d[valueKey]));

  const rowH = 28;
  const labelW = 220;
  const barAreaW = 260;
  const countW = 56;
  const padTop = title ? 28 : 8;
  const padBottom = 8;
  const padLeft = 12;
  const totalW = padLeft + labelW + barAreaW + countW + 16;
  const totalH = padTop + slice.length * rowH + padBottom;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.maxWidth = `${totalW}px`;

  if (title) {
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', padLeft);
    t.setAttribute('y', 18);
    t.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
    t.setAttribute('font-size', '10');
    t.setAttribute('font-weight', '600');
    t.setAttribute('letter-spacing', '1.2');
    t.setAttribute('text-transform', 'uppercase');
    t.setAttribute('fill', '#888');
    t.textContent = title.toUpperCase();
    svg.appendChild(t);
  }

  slice.forEach((d, i) => {
    const y = padTop + i * rowH;
    const barW = Math.round((d[valueKey] / maxVal) * barAreaW);

    // Background bar
    const bgRect = document.createElementNS(ns, 'rect');
    bgRect.setAttribute('x', padLeft + labelW);
    bgRect.setAttribute('y', y + 6);
    bgRect.setAttribute('width', barAreaW);
    bgRect.setAttribute('height', rowH - 10);
    bgRect.setAttribute('fill', BAR_BG);
    bgRect.setAttribute('rx', '2');
    svg.appendChild(bgRect);

    // Filled bar
    if (barW > 0) {
      const fillRect = document.createElementNS(ns, 'rect');
      fillRect.setAttribute('x', padLeft + labelW);
      fillRect.setAttribute('y', y + 6);
      fillRect.setAttribute('width', barW);
      fillRect.setAttribute('height', rowH - 10);
      fillRect.setAttribute('fill', ACCENT);
      fillRect.setAttribute('rx', '2');
      svg.appendChild(fillRect);
    }

    // Label
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', padLeft + labelW - 8);
    label.setAttribute('y', y + rowH / 2 + 1);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('font-family', 'Georgia, Times New Roman, serif');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d[labelKey];
    svg.appendChild(label);

    // Count
    const count = document.createElementNS(ns, 'text');
    count.setAttribute('x', padLeft + labelW + barAreaW + 8);
    count.setAttribute('y', y + rowH / 2 + 1);
    count.setAttribute('dominant-baseline', 'middle');
    count.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
    count.setAttribute('font-size', '12');
    count.setAttribute('fill', '#555');
    count.textContent = d[valueKey].toLocaleString('fr-FR');
    svg.appendChild(count);

    // Divider
    if (i < slice.length - 1) {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', padLeft);
      line.setAttribute('y1', y + rowH);
      line.setAttribute('x2', totalW - 8);
      line.setAttribute('y2', y + rowH);
      line.setAttribute('stroke', '#ede8e0');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }
  });

  container.innerHTML = '';
  container.appendChild(svg);
}

function drawLetterChart(container, letterDist) {
  // Only show A-Z (skip accented first letters)
  const base = letterDist.filter(d => /^[A-Z]$/.test(d.letter));
  const maxVal = Math.max(...base.map(d => d.count));

  const colW = 28;
  const barMaxH = 100;
  const padTop = 16;
  const padBottom = 40;
  const totalW = base.length * colW + 24;
  const totalH = padTop + barMaxH + padBottom;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  base.forEach((d, i) => {
    const x = 12 + i * colW;
    const barH = Math.max(2, Math.round((d.count / maxVal) * barMaxH));
    const barY = padTop + barMaxH - barH;

    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x + 2);
    rect.setAttribute('y', barY);
    rect.setAttribute('width', colW - 6);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', d.letter === 'S' ? ACCENT : '#c8bfa8');
    rect.setAttribute('rx', '1');
    svg.appendChild(rect);

    // Letter label
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', x + colW / 2 - 1);
    label.setAttribute('y', padTop + barMaxH + 14);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', d.letter === 'S' ? ACCENT : '#888');
    label.setAttribute('font-weight', d.letter === 'S' ? '700' : '400');
    label.textContent = d.letter;
    svg.appendChild(label);

    // Count label for S
    if (d.letter === 'S') {
      const ct = document.createElementNS(ns, 'text');
      ct.setAttribute('x', x + colW / 2 - 1);
      ct.setAttribute('y', barY - 5);
      ct.setAttribute('text-anchor', 'middle');
      ct.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
      ct.setAttribute('font-size', '9');
      ct.setAttribute('fill', ACCENT);
      ct.textContent = d.count.toLocaleString('fr-FR');
      svg.appendChild(ct);
    }
  });

  container.innerHTML = '';
  container.appendChild(svg);
}

export function drawSaintChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;
  svgBar(el, data.top_saints, {
    maxItems: 12,
    title: 'Saint names — communes with each patron (all variants)',
  });
}

export function drawNameChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;
  svgBar(el, data.top_names, {
    maxItems: 12,
    title: 'Most-duplicated full commune names',
  });
}

export function drawLetterChartMain(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;
  drawLetterChart(el, data.letter_dist);
}
