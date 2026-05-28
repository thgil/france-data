/* ── Commune names — charts ── */

export function drawNameFrequencyChart(mountSelector, { mostCommon }) {
  const container = document.querySelector(mountSelector);
  if (!container) return;

  const top = mostCommon.slice(0, 15);
  const maxCount = top[0].count;

  container.innerHTML = '';
  container.style.cssText = 'width:100%;font-family:var(--sans,"Helvetica Neue",sans-serif);font-size:13px;';

  const rows = top.map((d, i) => {
    const pct = (d.count / maxCount * 100).toFixed(1);
    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:7px;">
        <div style="width:28px;text-align:right;font-size:11px;color:#aaa;flex-shrink:0;">${i + 1}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:Georgia,serif;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;">${d.name}</div>
          <div style="height:10px;background:#d8d0c0;border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:#b32020;border-radius:2px;transition:width 0.4s;"></div>
          </div>
        </div>
        <div style="width:24px;text-align:right;font-variant-numeric:tabular-nums;font-size:13px;flex-shrink:0;">${d.count}</div>
      </div>`;
  }).join('');

  container.innerHTML = rows;
}

export function drawLengthHistogram(mountSelector, { lengthDist }) {
  const container = document.querySelector(mountSelector);
  if (!container) return;

  // Group into buckets: 1, 2, 3, 4-6, 7-10, 11-15, 16-20, 21-30, 31+
  const buckets = [
    { label: '1', range: [1, 1] },
    { label: '2', range: [2, 2] },
    { label: '3', range: [3, 3] },
    { label: '4–6', range: [4, 6] },
    { label: '7–10', range: [7, 10] },
    { label: '11–15', range: [11, 15] },
    { label: '16–20', range: [16, 20] },
    { label: '21–30', range: [21, 30] },
    { label: '31+', range: [31, 99] },
  ];

  const totals = buckets.map(b => {
    const count = lengthDist
      .filter(d => d.len >= b.range[0] && d.len <= b.range[1])
      .reduce((s, d) => s + d.count, 0);
    return { label: b.label, count };
  });

  const maxCount = Math.max(...totals.map(t => t.count));

  container.innerHTML = '';
  container.style.cssText = 'width:100%;';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:flex-end;gap:6px;height:120px;padding:0 4px;';

  totals.forEach(({ label, count }) => {
    const heightPct = count / maxCount * 100;
    const col = document.createElement('div');
    col.style.cssText = `flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;`;
    col.innerHTML = `
      <div style="font-family:var(--sans,'Helvetica Neue',sans-serif);font-size:10px;color:#888;writing-mode:horizontal-tb;">${count > 0 ? count.toLocaleString('fr-FR') : ''}</div>
      <div style="width:100%;height:${heightPct}%;background:#b32020;border-radius:2px 2px 0 0;min-height:${count > 0 ? 2 : 0}px;"></div>
    `;
    wrap.appendChild(col);
  });

  container.appendChild(wrap);

  const labels = document.createElement('div');
  labels.style.cssText = 'display:flex;gap:6px;padding:4px 4px 0;';
  totals.forEach(({ label }) => {
    const l = document.createElement('div');
    l.style.cssText = 'flex:1;text-align:center;font-size:10px;color:#888;font-family:var(--sans,"Helvetica Neue",sans-serif);';
    l.textContent = label;
    labels.appendChild(l);
  });
  container.appendChild(labels);

  const axis = document.createElement('div');
  axis.style.cssText = 'text-align:center;font-size:10px;color:#aaa;margin-top:6px;font-family:var(--sans,"Helvetica Neue",sans-serif);';
  axis.textContent = 'Name length (characters)';
  container.appendChild(axis);
}
