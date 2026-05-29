/* charts.js — commune-names story */

/**
 * Draw a horizontal bar chart into a container element.
 * @param {string} selector  CSS selector for the container
 * @param {Array}  data      [{label, value}]
 * @param {object} opts      {maxValue, color, unit, labelWidth}
 */
export function drawHBar(selector, data, opts = {}) {
  const el = document.querySelector(selector);
  if (!el) return;

  const color     = opts.color      || '#b32020';
  const unit      = opts.unit       || '';
  const labelW    = opts.labelWidth || 180;
  const maxVal    = opts.maxValue   || Math.max(...data.map(d => d.value));

  const rows = data.map((d, i) => {
    const pct = (d.value / maxVal) * 100;
    return `
      <div class="hbar-row" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <div class="hbar-label" style="width:${labelW}px;min-width:${labelW}px;font-family:Georgia,serif;font-size:13px;color:#1a1a1a;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${d.label}">${d.label}</div>
        <div style="flex:1;background:#ede8e0;border-radius:2px;height:16px;position:relative;">
          <div style="width:${pct}%;background:${color};height:100%;border-radius:2px;transition:width 0.6s ease;"></div>
        </div>
        <div style="width:3ch;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:#444;font-variant-numeric:tabular-nums;text-align:right;">${d.value}${unit}</div>
      </div>`;
  });

  el.innerHTML = rows.join('');
}

/**
 * Draw a length-histogram bar chart.
 * @param {string} selector
 * @param {Array}  distData  [[length, count], ...]
 */
export function drawLengthHistogram(selector, distData) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Bucket into groups for readability
  const buckets = [
    { label: '1–5', min: 1, max: 5 },
    { label: '6–9', min: 6, max: 9 },
    { label: '10–13', min: 10, max: 13 },
    { label: '14–17', min: 14, max: 17 },
    { label: '18–21', min: 18, max: 21 },
    { label: '22–29', min: 22, max: 29 },
    { label: '30+', min: 30, max: 999 },
  ];

  const counts = buckets.map(b => {
    const total = distData
      .filter(([len]) => len >= b.min && len <= b.max)
      .reduce((sum, [, cnt]) => sum + cnt, 0);
    return { label: b.label, value: total };
  });

  const maxVal = Math.max(...counts.map(d => d.value));
  const chartHeight = 120;

  const bars = counts.map(d => {
    const h = Math.round((d.value / maxVal) * chartHeight);
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
        <div style="font-family:'Helvetica Neue',sans-serif;font-size:10px;color:#888;font-variant-numeric:tabular-nums;">${d.value.toLocaleString('fr-FR')}</div>
        <div style="width:100%;max-width:48px;height:${chartHeight}px;display:flex;align-items:flex-end;">
          <div style="width:100%;height:${h}px;background:#b32020;border-radius:2px 2px 0 0;"></div>
        </div>
        <div style="font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#444;">${d.label}</div>
      </div>`;
  });

  el.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:8px;padding:0 8px;">
      ${bars.join('')}
    </div>
    <div style="font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#888;margin-top:8px;text-align:center;">characters in commune name</div>`;
}

/**
 * Render the name gallery (shortest / longest).
 */
export function drawNameGallery(selector, items, { highlight } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;

  el.innerHTML = items.map(item => {
    const isHighlight = highlight && item.name === highlight;
    return `
      <div class="name-card${isHighlight ? ' name-card--highlight' : ''}">
        <span class="name-card__name">${item.name}</span>
        <span class="name-card__meta">${item.len} chars · ${deptLabel(item.dept)} · pop. ${item.pop.toLocaleString('fr-FR')}</span>
      </div>`;
  }).join('');
}

function deptLabel(dept) {
  const known = {
    '75': 'Paris', '13': 'Bouches-du-Rhône', '69': 'Rhône',
    '80': 'Somme', '51': 'Marne', '14': 'Calvados',
    '76': 'Seine-Maritime', '77': 'Seine-et-Marne',
  };
  return known[dept] ? `Dept. ${dept} (${known[dept]})` : `Dept. ${dept}`;
}

/**
 * Render duplicate-name cards.
 */
export function drawDuplicates(selector, items) {
  const el = document.querySelector(selector);
  if (!el) return;

  el.innerHTML = items.slice(0, 12).map((item, i) => `
    <div class="hbar-row" style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;">
      <div style="width:1.8ch;font-family:'Helvetica Neue',sans-serif;font-size:10px;color:#aaa;text-align:right;">${i + 1}</div>
      <div style="flex:1;font-family:Georgia,serif;font-size:14px;color:#1a1a1a;">${item.name}</div>
      <div style="font-family:'Helvetica Neue',sans-serif;font-size:13px;color:#444;font-variant-numeric:tabular-nums;">${item.count}×</div>
      <div style="font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#888;">${item.depts.map(d => `Dept. ${d}`).join(', ')}</div>
    </div>`).join('');
}
