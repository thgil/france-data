// charts.js — place-names story

export function drawFirstWordChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const W = el.clientWidth || 600;
  const margin = { top: 8, right: 60, bottom: 32, left: 90 };
  const items = data.slice(0, 12);
  const barH = 28;
  const gap = 6;
  const H = margin.top + items.length * (barH + gap) - gap + margin.bottom;
  const plotW = W - margin.left - margin.right;
  const maxVal = items[0].count;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

  items.forEach((d, i) => {
    const y = i * (barH + gap);
    const bw = Math.round((d.count / maxVal) * plotW);
    const isSaint = d.word === 'Saint' || d.word === 'Sainte';

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', y);
    rect.setAttribute('width', bw);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', isSaint ? '#8b5e3c' : '#c9a96e');
    rect.setAttribute('rx', 2);
    g.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', -6);
    label.setAttribute('y', y + barH / 2 + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d.word;
    g.appendChild(label);

    const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    val.setAttribute('x', bw + 6);
    val.setAttribute('y', y + barH / 2 + 4);
    val.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    val.setAttribute('font-size', '11');
    val.setAttribute('fill', '#666');
    val.textContent = d.count.toLocaleString('fr-FR');
    g.appendChild(val);
  });

  svg.appendChild(g);
  el.appendChild(svg);
}

export function drawTopNamesChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const W = el.clientWidth || 600;
  const margin = { top: 8, right: 40, bottom: 32, left: 168 };
  const items = data.slice(0, 15);
  const barH = 24;
  const gap = 5;
  const H = margin.top + items.length * (barH + gap) - gap + margin.bottom;
  const plotW = W - margin.left - margin.right;
  const maxVal = items[0].count;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

  items.forEach((d, i) => {
    const y = i * (barH + gap);
    const bw = Math.max(4, Math.round((d.count / maxVal) * plotW));
    const isSaint = d.name.startsWith('Saint') || d.name.startsWith('Sainte');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', y);
    rect.setAttribute('width', bw);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', isSaint ? '#8b5e3c' : '#c9a96e');
    rect.setAttribute('rx', 2);
    g.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', -6);
    label.setAttribute('y', y + barH / 2 + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d.name;
    g.appendChild(label);

    const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    val.setAttribute('x', bw + 5);
    val.setAttribute('y', y + barH / 2 + 4);
    val.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    val.setAttribute('font-size', '11');
    val.setAttribute('fill', '#666');
    val.textContent = `×${d.count}`;
    g.appendChild(val);
  });

  svg.appendChild(g);
  el.appendChild(svg);
}

export function drawLengthHistogram(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const W = el.clientWidth || 600;
  const margin = { top: 8, right: 20, bottom: 36, left: 44 };
  const plotW = W - margin.left - margin.right;
  const plotH = 140;
  const H = plotH + margin.top + margin.bottom;

  const items = data.filter(d => d.length >= 1 && d.length <= 45);
  const maxCount = Math.max(...items.map(d => d.count));
  const barW = plotW / items.length;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

  items.forEach((d, i) => {
    const bh = Math.round((d.count / maxCount) * plotH);
    const x = i * barW;
    const y = plotH - bh;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + 0.5);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(1, barW - 1));
    rect.setAttribute('height', bh);
    rect.setAttribute('fill', '#c9a96e');
    g.appendChild(rect);

    if (d.length === 1 || d.length === 45 || d.length % 5 === 0) {
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tick.setAttribute('x', x + barW / 2);
      tick.setAttribute('y', plotH + 14);
      tick.setAttribute('text-anchor', 'middle');
      tick.setAttribute('font-family', "'Helvetica Neue', sans-serif");
      tick.setAttribute('font-size', '10');
      tick.setAttribute('fill', '#888');
      tick.textContent = d.length;
      g.appendChild(tick);
    }
  });

  // Y-axis labels
  [0, maxCount].forEach(v => {
    const y = v === 0 ? plotH : 0;
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', -4);
    t.setAttribute('y', y + (v === 0 ? -3 : 10));
    t.setAttribute('text-anchor', 'end');
    t.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    t.setAttribute('font-size', '10');
    t.setAttribute('fill', '#888');
    t.textContent = v === 0 ? '0' : v.toLocaleString('fr-FR');
    g.appendChild(t);
  });

  // X-axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', plotW / 2);
  xLabel.setAttribute('y', plotH + 30);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  xLabel.setAttribute('font-size', '10');
  xLabel.setAttribute('fill', '#888');
  xLabel.textContent = 'name length (characters)';
  g.appendChild(xLabel);

  svg.appendChild(g);
  el.appendChild(svg);
}
