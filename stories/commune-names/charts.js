/* commune-names/charts.js — interactive charts for the commune names story */

export function drawAlphabetChart(container, alphabetData) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  const max = Math.max(...alphabetData.map(d => d.count));

  el.innerHTML = '';
  el.style.fontFamily = 'var(--sans, Helvetica Neue, sans-serif)';
  el.style.fontSize = '12px';

  alphabetData.forEach(d => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;margin:2px 0;';

    const label = document.createElement('span');
    label.textContent = d.letter;
    label.style.cssText = 'width:14px;text-align:right;font-weight:600;color:#1a1a1a;flex-shrink:0;';

    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'flex:1;height:14px;background:#ede8e0;border-radius:2px;position:relative;';

    const bar = document.createElement('div');
    const pct = (d.count / max) * 100;
    bar.style.cssText = `width:${pct}%;height:100%;background:#b32020;border-radius:2px;transition:width 0.3s;`;

    barWrap.appendChild(bar);

    const count = document.createElement('span');
    count.textContent = d.count.toLocaleString('fr-FR');
    count.style.cssText = 'width:52px;text-align:right;color:#555;flex-shrink:0;font-variant-numeric:tabular-nums;';

    row.appendChild(label);
    row.appendChild(barWrap);
    row.appendChild(count);
    el.appendChild(row);
  });
}

export function drawLengthHistogram(container, lengthData) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  // Only show lengths 1–32 (tail is tiny)
  const visible = lengthData.filter(d => d.length <= 32);
  const max = Math.max(...visible.map(d => d.count));
  const totalHeight = 80;

  el.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:flex-end;gap:2px;height:' + totalHeight + 'px;';

  visible.forEach(d => {
    const colWrap = document.createElement('div');
    colWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;flex:1;min-width:0;';
    colWrap.title = `${d.length} chars: ${d.count.toLocaleString('fr-FR')} communes`;

    const bar = document.createElement('div');
    const h = Math.round((d.count / max) * totalHeight);
    bar.style.cssText = `width:100%;height:${h}px;background:#b32020;border-radius:1px 1px 0 0;`;

    colWrap.appendChild(bar);
    wrap.appendChild(colWrap);
  });

  const axis = document.createElement('div');
  axis.style.cssText = 'display:flex;gap:2px;margin-top:4px;';
  visible.forEach(d => {
    const tick = document.createElement('div');
    tick.style.cssText = 'flex:1;min-width:0;text-align:center;font-size:9px;color:#888;';
    tick.textContent = d.length % 5 === 0 ? d.length : '';
    axis.appendChild(tick);
  });

  el.appendChild(wrap);
  el.appendChild(axis);
}

export function initSearch(inputEl, resultsEl, communes) {
  if (!inputEl || !resultsEl) return;

  // Build index: name → list of communes
  const nameIndex = new Map();
  communes.forEach(c => {
    const key = c.name.toLowerCase();
    if (!nameIndex.has(key)) nameIndex.set(key, []);
    nameIndex.get(key).push(c);
  });

  // Build prefix index for suggestions
  const prefixMap = new Map();
  communes.forEach(c => {
    const norm = c.name.toLowerCase();
    for (let i = 2; i <= Math.min(norm.length, 20); i++) {
      const prefix = norm.slice(0, i);
      if (!prefixMap.has(prefix)) prefixMap.set(prefix, new Set());
      prefixMap.get(prefix).add(c.name);
    }
  });

  function render(query) {
    const q = query.trim().toLowerCase();
    resultsEl.innerHTML = '';

    if (q.length < 2) {
      resultsEl.style.display = 'none';
      return;
    }

    // Exact match first
    const exact = nameIndex.get(q);
    if (exact) {
      const matchCount = exact.length;
      const header = document.createElement('div');
      header.style.cssText = 'padding:8px 12px;border-bottom:1px solid #ede8e0;font-size:12px;color:#666;';
      header.textContent = matchCount === 1
        ? `1 commune named "${exact[0].name}"`
        : `${matchCount} communes named "${exact[0].name}"`;
      resultsEl.appendChild(header);

      exact.slice(0, 20).forEach(c => {
        const item = document.createElement('div');
        item.style.cssText = 'padding:6px 12px;border-bottom:1px solid #f0ece4;display:flex;justify-content:space-between;font-size:13px;cursor:default;';
        item.innerHTML = `<span style="font-family:Georgia,serif">${c.name}</span><span style="color:#888;font-size:11px;">Dept. ${c.dept} — pop. ${(c.pop||0).toLocaleString('fr-FR')}</span>`;
        resultsEl.appendChild(item);
      });

      resultsEl.style.display = '';
      return;
    }

    // Prefix suggestions
    const suggestions = prefixMap.get(q);
    if (!suggestions || suggestions.size === 0) {
      const none = document.createElement('div');
      none.style.cssText = 'padding:8px 12px;font-size:13px;color:#888;font-style:italic;';
      none.textContent = 'No matching commune names.';
      resultsEl.appendChild(none);
      resultsEl.style.display = '';
      return;
    }

    const sorted = Array.from(suggestions).sort().slice(0, 12);
    const header = document.createElement('div');
    header.style.cssText = 'padding:8px 12px;border-bottom:1px solid #ede8e0;font-size:12px;color:#666;';
    header.textContent = `${suggestions.size} matching name${suggestions.size !== 1 ? 's' : ''}`;
    resultsEl.appendChild(header);

    sorted.forEach(name => {
      const matches = nameIndex.get(name.toLowerCase()) || [];
      const item = document.createElement('div');
      item.style.cssText = 'padding:7px 12px;border-bottom:1px solid #f0ece4;display:flex;justify-content:space-between;align-items:center;font-size:13px;cursor:pointer;';
      item.innerHTML = `<span style="font-family:Georgia,serif">${name}</span><span style="color:#888;font-size:11px;">${matches.length}×</span>`;
      item.addEventListener('mouseenter', () => item.style.background = '#f5f1eb');
      item.addEventListener('mouseleave', () => item.style.background = '');
      item.addEventListener('click', () => {
        inputEl.value = name;
        render(name);
      });
      resultsEl.appendChild(item);
    });

    resultsEl.style.display = '';
  }

  inputEl.addEventListener('input', () => render(inputEl.value));
  inputEl.addEventListener('focus', () => render(inputEl.value));

  document.addEventListener('click', e => {
    if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
      resultsEl.style.display = 'none';
    }
  });
}
