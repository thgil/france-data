// charts.js — commune-names story

export function drawHorizontalBar(selector, data, { labelKey, valueKey, color = '#8b6914', maxWidth = 580, barH = 22, gap = 6, fontSize = 13 } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;

  const maxVal = Math.max(...data.map(d => d[valueKey]));
  const totalH = data.length * (barH + gap);
  const labelW = 220;
  const numW = 48;
  const svgW = maxWidth;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  data.forEach((d, i) => {
    const y = i * (barH + gap);
    const barW = Math.max(2, ((d[valueKey] / maxVal) * (svgW - labelW - numW - 8)));
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelW - 8);
    label.setAttribute('y', y + barH / 2 + fontSize * 0.35);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', fontSize);
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d[labelKey];
    g.appendChild(label);

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', color);
    rect.setAttribute('rx', 2);
    g.appendChild(rect);

    // Value
    const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    val.setAttribute('x', labelW + barW + 6);
    val.setAttribute('y', y + barH / 2 + fontSize * 0.35);
    val.setAttribute('font-family', "Helvetica Neue, Arial, sans-serif");
    val.setAttribute('font-size', fontSize - 1);
    val.setAttribute('fill', '#555');
    val.textContent = d[valueKey].toLocaleString('fr-FR');
    g.appendChild(val);

    svg.appendChild(g);
  });

  el.appendChild(svg);
}

export function drawPrefixBar(selector, data, opts = {}) {
  return drawHorizontalBar(selector, data, {
    labelKey: 'prefix',
    valueKey: 'count',
    color: '#5a6e3a',
    ...opts,
  });
}

export function drawNameBar(selector, data, opts = {}) {
  return drawHorizontalBar(selector, data, {
    labelKey: 'name',
    valueKey: 'count',
    color: '#8b6914',
    ...opts,
  });
}

export function drawRiverBar(selector, data, opts = {}) {
  return drawHorizontalBar(selector, data, {
    labelKey: 'river',
    valueKey: 'count',
    color: '#3a6a7a',
    ...opts,
  });
}

export function populateShortNames(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const items = [
    { name: 'Y', dept: '80', pop: 89 },
    ...stats.two_letters,
  ];

  el.innerHTML = items.map(c =>
    `<span class="short-name" title="Dépt. ${c.dept} · ${c.pop.toLocaleString('fr-FR')} hab.">${c.name}</span>`
  ).join('');
}

export function populateLongest(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = stats.longest.slice(0, 5).map((c, i) =>
    `<div class="long-name-row">
      <span class="long-name-rank">${i + 1}</span>
      <span class="long-name-text">${c.name}</span>
      <span class="long-name-len">${c.name.length} letters</span>
    </div>`
  ).join('');
}

export function populateSuffix(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;
  // Show top river-name suffixes after -sur-
  el.innerHTML = stats.top_rivers.slice(0, 8).map(r =>
    `<tr>
      <td class="place">-sur-${r.river}</td>
      <td>${r.count}</td>
    </tr>`
  ).join('');
}
