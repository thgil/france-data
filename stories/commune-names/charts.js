/* charts.js — commune-names story */
(function () {

  /* ── Data (baked in; derived from communes-apl.geojson) ─────────────── */

  const LEN_DIST = [
    {len:1,count:1},{len:2,count:13},{len:3,count:154},{len:4,count:720},
    {len:5,count:1969},{len:6,count:3223},{len:7,count:3695},{len:8,count:3695},
    {len:9,count:3000},{len:10,count:2522},{len:11,count:1884},{len:12,count:1435},
    {len:13,count:1167},{len:14,count:1018},{len:15,count:1095},{len:16,count:1177},
    {len:17,count:1186},{len:18,count:1202},{len:19,count:1117},{len:20,count:1028},
    {len:21,count:923},{len:22,count:819},{len:23,count:649},{len:24,count:501},
    {len:25,count:329},{len:26,count:200},{len:27,count:105},{len:28,count:55},
    {len:29,count:53},{len:30,count:29},{len:31,count:12},{len:32,count:8},
    {len:33,count:2},{len:34,count:6},{len:35,count:7},{len:36,count:2},
    {len:37,count:3},{len:38,count:3},{len:39,count:1},{len:40,count:3},
    {len:41,count:1},{len:43,count:1},{len:45,count:1}
  ];

  const TOP_SAINTS = [
    ['Saint-Martin',203],['Saint-Jean',155],['Saint-Pierre',144],
    ['Saint-Germain',108],['Saint-Julien',78],['Saint-Laurent',77],
    ['Saint-Hilaire',68],['Saint-Georges',67],['Saint-André',64],
    ['Saint-Aubin',62],['Saint-Paul',54],['Saint-Michel',53]
  ];

  const TOP_DUPS = [
    ['Sainte-Colombe',12],['Saint-Sauveur',11],['Saint-Aubin',10],
    ['Beaulieu',10],['Saint-Marcel',9],['Saint-Michel',9],
    ['Le Pin',9],['Saint-Pierre',9],['Sainte-Marie',9],
    ['Saint-Rémy',8],['Saint-Clément',8],['Saint-Hilaire',8],
    ['Saint-Loup',8],['Beaumont',8],['Saint-Georges',8]
  ];

  /* ── SVG helpers ─────────────────────────────────────────────────────── */

  function svg(w, h) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', `0 0 ${w} ${h}`);
    el.setAttribute('width', w);
    el.setAttribute('height', h);
    el.style.cssText = 'max-width:100%;height:auto;display:block;overflow:visible';
    return el;
  }

  function rect(x, y, w, h, fill) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    el.setAttribute('x', x); el.setAttribute('y', y);
    el.setAttribute('width', w); el.setAttribute('height', h);
    el.setAttribute('fill', fill);
    return el;
  }

  function text(x, y, content, opts) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x', x); el.setAttribute('y', y);
    if (opts.anchor)    el.setAttribute('text-anchor', opts.anchor);
    if (opts.fontSize)  el.setAttribute('font-size', opts.fontSize);
    if (opts.fill)      el.setAttribute('fill', opts.fill);
    if (opts.fontFamily)el.setAttribute('font-family', opts.fontFamily);
    if (opts.fontWeight)el.setAttribute('font-weight', opts.fontWeight);
    el.textContent = content;
    return el;
  }

  function line(x1, y1, x2, y2, stroke, sw) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1',x1);el.setAttribute('y1',y1);
    el.setAttribute('x2',x2);el.setAttribute('y2',y2);
    el.setAttribute('stroke',stroke);el.setAttribute('stroke-width',sw||1);
    return el;
  }

  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const INK  = '#1a1a1a';
  const MUTE = '#aaa';
  const ACCENT = '#b32020';

  /* ── Chart 1: Name length distribution (histogram) ───────────────────── */

  function renderLengthChart(mount) {
    const W = 680, H = 220;
    const PAD = { top: 16, right: 20, bottom: 40, left: 48 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    // Bucket lengths 1-35, merge 36+ into one
    const buckets = [];
    for (let i = 1; i <= 35; i++) {
      const entry = LEN_DIST.find(d => d.len === i);
      buckets.push({ label: String(i), count: entry ? entry.count : 0 });
    }
    const overflow = LEN_DIST.filter(d => d.len > 35).reduce((s,d) => s + d.count, 0);
    buckets.push({ label: '36+', count: overflow });

    const maxCount = Math.max(...buckets.map(b => b.count));
    const barW = chartW / buckets.length;
    const gap = 1;

    const el = svg(W, H);

    // Gridlines + y-axis labels
    const yTicks = [1000, 2000, 3000];
    yTicks.forEach(v => {
      const y = PAD.top + chartH * (1 - v / maxCount);
      el.appendChild(line(PAD.left, y, PAD.left + chartW, y, '#e8e2d8', 1));
      el.appendChild(text(PAD.left - 6, y + 4, v.toLocaleString(), {
        anchor: 'end', fontSize: 10, fill: MUTE, fontFamily: SANS
      }));
    });

    // Bars
    buckets.forEach((b, i) => {
      const barH = (b.count / maxCount) * chartH;
      const x = PAD.left + i * barW + gap / 2;
      const y = PAD.top + chartH - barH;
      // Highlight the two peaks (len 7 and 8) and the secondary hump (15-18)
      let fill = '#c4956a';
      if (i === 6 || i === 7) fill = ACCENT;
      else if (i >= 14 && i <= 17) fill = '#8c6b4a';
      el.appendChild(rect(x, y, barW - gap, barH, fill));
    });

    // X-axis ticks (every 5 lengths)
    [5, 10, 15, 20, 25, 30, 35].forEach(v => {
      const i = v - 1; // 0-indexed
      const x = PAD.left + (i + 0.5) * barW;
      el.appendChild(line(x, PAD.top + chartH, x, PAD.top + chartH + 4, MUTE, 1));
      el.appendChild(text(x, PAD.top + chartH + 14, String(v), {
        anchor: 'middle', fontSize: 10, fill: MUTE, fontFamily: SANS
      }));
    });
    // "36+" label
    {
      const x = PAD.left + 35 * barW + barW / 2;
      el.appendChild(text(x, PAD.top + chartH + 14, '36+', {
        anchor: 'middle', fontSize: 10, fill: MUTE, fontFamily: SANS
      }));
    }

    // X axis baseline
    el.appendChild(line(PAD.left, PAD.top + chartH, PAD.left + chartW, PAD.top + chartH, '#c8c0b0', 1));

    // X-axis label
    el.appendChild(text(PAD.left + chartW / 2, H - 4, 'Characters in name', {
      anchor: 'middle', fontSize: 11, fill: MUTE, fontFamily: SANS
    }));

    // Annotation: first peak
    el.appendChild(text(PAD.left + 6.5 * barW, PAD.top + 8, '7–8 chars: 3,695 each', {
      anchor: 'middle', fontSize: 10, fill: ACCENT, fontFamily: SANS, fontWeight: '600'
    }));

    // Annotation: second bump
    el.appendChild(text(PAD.left + 16 * barW, PAD.top + chartH * 0.35, 'Saint-X-de-Y', {
      anchor: 'middle', fontSize: 10, fill: '#8c6b4a', fontFamily: SANS
    }));
    el.appendChild(text(PAD.left + 16 * barW, PAD.top + chartH * 0.35 + 13, 'secondary bump', {
      anchor: 'middle', fontSize: 10, fill: '#8c6b4a', fontFamily: SANS
    }));

    mount.appendChild(el);
  }

  /* ── Chart 2: Top Saint-X families (horizontal bar chart) ─────────────── */

  function renderSaintsChart(mount) {
    const W = 680, ROW = 28, PAD = { top: 8, right: 80, bottom: 8, left: 120 };
    const rows = TOP_SAINTS.length;
    const H = PAD.top + rows * ROW + PAD.bottom;
    const chartW = W - PAD.left - PAD.right;
    const maxVal = TOP_SAINTS[0][1];

    const el = svg(W, H);

    TOP_SAINTS.forEach(([name, count], i) => {
      const y = PAD.top + i * ROW;
      const barLen = (count / maxVal) * chartW;

      // Label
      el.appendChild(text(PAD.left - 8, y + ROW / 2 + 4, name, {
        anchor: 'end', fontSize: 13, fill: INK,
        fontFamily: "'Georgia', serif"
      }));

      // Bar
      const fill = i === 0 ? ACCENT : '#c4956a';
      el.appendChild(rect(PAD.left, y + 4, barLen, ROW - 8, fill));

      // Count label
      el.appendChild(text(PAD.left + barLen + 6, y + ROW / 2 + 4, String(count), {
        anchor: 'start', fontSize: 12, fill: INK, fontFamily: SANS
      }));
    });

    mount.appendChild(el);
  }

  /* ── Chart 3: Most duplicated names (horizontal bar) ─────────────────── */

  function renderDupsChart(mount) {
    const W = 680, ROW = 28, PAD = { top: 8, right: 60, bottom: 8, left: 148 };
    const rows = TOP_DUPS.length;
    const H = PAD.top + rows * ROW + PAD.bottom;
    const chartW = W - PAD.left - PAD.right;
    const maxVal = TOP_DUPS[0][1];

    const el = svg(W, H);

    TOP_DUPS.forEach(([name, count], i) => {
      const y = PAD.top + i * ROW;
      const barLen = (count / maxVal) * chartW;
      const fill = i === 0 ? ACCENT : '#c4956a';

      el.appendChild(text(PAD.left - 8, y + ROW / 2 + 4, name, {
        anchor: 'end', fontSize: 13, fill: INK,
        fontFamily: "'Georgia', serif"
      }));

      el.appendChild(rect(PAD.left, y + 4, barLen, ROW - 8, fill));

      el.appendChild(text(PAD.left + barLen + 6, y + ROW / 2 + 4, `×${count}`, {
        anchor: 'start', fontSize: 12, fill: INK, fontFamily: SANS
      }));
    });

    mount.appendChild(el);
  }

  /* ── Boot ────────────────────────────────────────────────────────────── */

  function init() {
    const m1 = document.getElementById('chart-length');
    const m2 = document.getElementById('chart-saints');
    const m3 = document.getElementById('chart-dups');
    if (m1) renderLengthChart(m1);
    if (m2) renderSaintsChart(m2);
    if (m3) renderDupsChart(m3);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
