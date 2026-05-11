/* desert-math/charts.js — chart rendering for the desert-math story */

const COLORS = {
  severe:      '#a31a00',
  desert:      '#c75000',
  adequate:    '#5f7d40',
  'well-served': '#2a5c18',
};

const CAT_LABELS = {
  severe:        'Severe (APL < 1)',
  desert:        'Desert (APL 1–2.5)',
  adequate:      'Adequate (APL 2.5–4)',
  'well-served': 'Well-served (APL > 4)',
};

/* ── Dual comparison chart: % communes vs % population ─────────────── */
export function drawComparisonChart(selector, { categories }) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Draw two horizontal stacked bars
  const comData = categories.map(c => ({ cat: c.cat, pct: c.communePct, label: c.label, color: COLORS[c.cat] }));
  const popData = categories.map(c => ({ cat: c.cat, pct: c.popPct, label: c.label, color: COLORS[c.cat] }));

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 680 140');
  svg.style.width = '100%';
  svg.style.maxWidth = '680px';
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  const W = 680, BAR_H = 36, GAP = 20, LABEL_W = 110, BAR_W = W - LABEL_W - 20;
  const rows = [
    { label: '% of communes', data: comData, y: 10 },
    { label: '% of population', data: popData, y: 10 + BAR_H + GAP },
  ];

  rows.forEach(({ label, data, y }) => {
    // Row label
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', LABEL_W - 8);
    t.setAttribute('y', y + BAR_H / 2 + 4);
    t.setAttribute('text-anchor', 'end');
    t.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    t.setAttribute('font-size', '11');
    t.setAttribute('font-weight', '600');
    t.setAttribute('letter-spacing', '0.5');
    t.setAttribute('fill', '#555');
    t.textContent = label;
    svg.appendChild(t);

    // Stacked segments
    let x = LABEL_W;
    data.forEach(seg => {
      const w = (seg.pct / 100) * BAR_W;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', Math.max(w, 0));
      rect.setAttribute('height', BAR_H);
      rect.setAttribute('fill', seg.color);
      svg.appendChild(rect);

      // Percentage label inside bar if wide enough
      if (w > 28) {
        const pct = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pct.setAttribute('x', x + w / 2);
        pct.setAttribute('y', y + BAR_H / 2 + 4);
        pct.setAttribute('text-anchor', 'middle');
        pct.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
        pct.setAttribute('font-size', w > 50 ? '12' : '10');
        pct.setAttribute('fill', '#fff');
        pct.setAttribute('font-weight', '600');
        pct.textContent = seg.pct.toFixed(1) + '%';
        svg.appendChild(pct);
      }

      x += w;
    });
  });

  // Legend
  const legendY = 10 + 2 * (BAR_H + GAP) + 8;
  let lx = LABEL_W;
  comData.forEach(seg => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    circle.setAttribute('x', lx);
    circle.setAttribute('y', legendY);
    circle.setAttribute('width', 10);
    circle.setAttribute('height', 10);
    circle.setAttribute('rx', 2);
    circle.setAttribute('fill', seg.color);
    svg.appendChild(circle);

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', lx + 14);
    t.setAttribute('y', legendY + 9);
    t.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    t.setAttribute('font-size', '11');
    t.setAttribute('fill', '#444');
    t.textContent = CAT_LABELS[seg.cat];
    svg.appendChild(t);
    lx += 155;
  });

  svg.setAttribute('viewBox', `0 0 ${W} ${legendY + 18}`);
  container.appendChild(svg);
}

/* ── Size vs desert rate chart ──────────────────────────────────────── */
export function drawSizeChart(selector, { sizes }) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = 680, BAR_H = 28, GAP = 8, LABEL_W = 130, BAR_W = W - LABEL_W - 80;
  const height = sizes.length * (BAR_H + GAP) + 20;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.width = '100%';
  svg.style.maxWidth = `${W}px`;
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  sizes.forEach((s, i) => {
    const y = 10 + i * (BAR_H + GAP);
    const pct = s.desertPct;
    const w = (pct / 100) * BAR_W;
    const isHeavy = pct > 40;

    // Background track
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    track.setAttribute('x', LABEL_W);
    track.setAttribute('y', y);
    track.setAttribute('width', BAR_W);
    track.setAttribute('height', BAR_H);
    track.setAttribute('fill', '#f0ece4');
    track.setAttribute('rx', 3);
    svg.appendChild(track);

    // Desert fill
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', LABEL_W);
    bar.setAttribute('y', y);
    bar.setAttribute('width', Math.max(w, 0));
    bar.setAttribute('height', BAR_H);
    bar.setAttribute('rx', 3);
    bar.setAttribute('fill', isHeavy ? '#c75000' : '#d08040');
    svg.appendChild(bar);

    // Row label (commune size)
    const lt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lt.setAttribute('x', LABEL_W - 8);
    lt.setAttribute('y', y + BAR_H / 2 + 4);
    lt.setAttribute('text-anchor', 'end');
    lt.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    lt.setAttribute('font-size', '11');
    lt.setAttribute('fill', '#555');
    lt.textContent = s.label;
    svg.appendChild(lt);

    // Percentage label
    const pt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    pt.setAttribute('x', LABEL_W + BAR_W + 8);
    pt.setAttribute('y', y + BAR_H / 2 + 4);
    pt.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    pt.setAttribute('font-size', '11');
    pt.setAttribute('font-weight', '600');
    pt.setAttribute('fill', isHeavy ? '#c75000' : '#6b4020');
    pt.textContent = pct.toFixed(0) + '%';
    svg.appendChild(pt);
  });

  svg.setAttribute('viewBox', `0 0 ${W} ${height}`);
  container.appendChild(svg);
}

/* ── Top desert communes table ──────────────────────────────────────── */
export function populateLargestDeserts(selector, { topDesertCommunes }) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;

  tbody.innerHTML = topDesertCommunes.slice(0, 10).map((c, i) => {
    const aplBar = `<span style="display:inline-block;width:${Math.round(c.apl / 5 * 80)}px;height:6px;background:#c75000;vertical-align:middle;border-radius:2px;margin-right:6px"></span>`;
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${c.name}</td>
      <td class="dept">dept. ${c.dept}</td>
      <td class="num">${c.pop.toLocaleString('fr-FR')}</td>
      <td class="apl">${aplBar}${c.apl.toFixed(2)}</td>
    </tr>`;
  }).join('');
}
