// stories/bar-per-head/charts.js
// Ranked horizontal bar chart of 96 metropolitan départements by bars per 10,000 residents.
// Export: drawRankChart(selector, stats)

// Group classifications for colour-coding
const CORSE   = new Set(['2A','2B']);
const MASSIF  = new Set(['48','15','23','43','12','58','19','03','07','36','46']);
const ALPINE  = new Set(['05','73','04']);
const PARIS   = new Set(['75']);
const IDF_SUB = new Set(['77','95','78','92','91','93','94']);

function groupOf(dept) {
  if (CORSE.has(dept))   return 'corse';
  if (MASSIF.has(dept))  return 'massif';
  if (ALPINE.has(dept))  return 'alpine';
  if (PARIS.has(dept))   return 'paris';
  if (IDF_SUB.has(dept)) return 'idf';
  return 'other';
}

const COLOURS = {
  corse:  '#a63c2c',   // island red
  massif: '#c67c00',   // amber (matches bars story)
  alpine: '#7a9e6b',   // mountain green
  paris:  '#4a5ea8',   // Haussmann blue
  idf:    '#8098c0',   // muted blue
  other:  '#b0a898',   // warm grey
};

const LABELS = {
  corse:  'Corse',
  massif: 'Massif Central',
  alpine: 'Alpes',
  paris:  'Paris',
  idf:    'Banlieues IDF',
  other:  '',
};

export function drawRankChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const depts = stats.depts;
  const national = stats.nationalPer10k;
  const maxVal   = depts[0].per10k;

  // Layout constants
  const rowH   = 24;
  const labelW = 180;
  const numW   = 46;
  const padTop = 32;
  const padBot = 24;
  const padR   = 16;

  const svgNS = 'http://www.w3.org/2000/svg';

  function makeSVG() {
    const totalH = padTop + depts.length * rowH + padBot;
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 700 ${totalH}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', totalH);
    svg.style.display = 'block';
    svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
    svg.style.fontSize = '12px';

    const barW = 700 - labelW - numW - padR;

    // Column headers
    const hdrY = padTop - 8;
    const hdr = document.createElementNS(svgNS, 'text');
    hdr.setAttribute('x', labelW + barW / 2);
    hdr.setAttribute('y', hdrY);
    hdr.setAttribute('text-anchor', 'middle');
    hdr.setAttribute('fill', '#888');
    hdr.setAttribute('font-size', '10');
    hdr.setAttribute('letter-spacing', '1');
    hdr.textContent = 'BARS PER 10,000 RESIDENTS';
    svg.appendChild(hdr);

    // National average line
    const avgX = labelW + (national / maxVal) * barW;

    depts.forEach((d, i) => {
      const y    = padTop + i * rowH;
      const mid  = y + rowH / 2;
      const barX = labelW;
      const bw   = (d.per10k / maxVal) * barW;
      const grp  = groupOf(d.dept);
      const col  = COLOURS[grp];

      // Row background (subtle zebra)
      if (i % 2 === 0) {
        const bg = document.createElementNS(svgNS, 'rect');
        bg.setAttribute('x', 0);
        bg.setAttribute('y', y);
        bg.setAttribute('width', 700);
        bg.setAttribute('height', rowH);
        bg.setAttribute('fill', '#faf7f2');
        svg.appendChild(bg);
      }

      // Rank number
      const rank = document.createElementNS(svgNS, 'text');
      rank.setAttribute('x', 22);
      rank.setAttribute('y', mid + 4);
      rank.setAttribute('text-anchor', 'middle');
      rank.setAttribute('fill', '#bbb');
      rank.setAttribute('font-size', '9');
      rank.textContent = i + 1;
      svg.appendChild(rank);

      // Département name
      const lbl = document.createElementNS(svgNS, 'text');
      lbl.setAttribute('x', 34);
      lbl.setAttribute('y', mid + 4);
      lbl.setAttribute('fill', grp === 'other' ? '#333' : col);
      lbl.setAttribute('font-size', grp !== 'other' ? '11.5' : '11');
      lbl.setAttribute('font-weight', ['corse','massif','paris','idf'].includes(grp) ? '600' : '400');
      lbl.textContent = d.name;
      svg.appendChild(lbl);

      // Bar
      const bar = document.createElementNS(svgNS, 'rect');
      bar.setAttribute('x', barX);
      bar.setAttribute('y', y + 5);
      bar.setAttribute('width', Math.max(bw, 1));
      bar.setAttribute('height', rowH - 10);
      bar.setAttribute('fill', col);
      bar.setAttribute('rx', '2');
      svg.appendChild(bar);

      // Value label
      const val = document.createElementNS(svgNS, 'text');
      val.setAttribute('x', barX + bw + 4);
      val.setAttribute('y', mid + 4);
      val.setAttribute('fill', '#555');
      val.setAttribute('font-size', '10');
      val.setAttribute('font-variant-numeric', 'tabular-nums');
      val.textContent = d.per10k.toFixed(1);
      svg.appendChild(val);
    });

    // National average line (draw on top)
    const avgLine = document.createElementNS(svgNS, 'line');
    avgLine.setAttribute('x1', avgX);
    avgLine.setAttribute('y1', padTop - 14);
    avgLine.setAttribute('x2', avgX);
    avgLine.setAttribute('y2', padTop + depts.length * rowH);
    avgLine.setAttribute('stroke', '#c44');
    avgLine.setAttribute('stroke-width', '1');
    avgLine.setAttribute('stroke-dasharray', '4 3');
    avgLine.setAttribute('opacity', '0.7');
    svg.appendChild(avgLine);

    const avgLbl = document.createElementNS(svgNS, 'text');
    avgLbl.setAttribute('x', avgX + 4);
    avgLbl.setAttribute('y', padTop - 16);
    avgLbl.setAttribute('fill', '#c44');
    avgLbl.setAttribute('font-size', '9');
    avgLbl.setAttribute('letter-spacing', '0.5');
    avgLbl.textContent = `national avg ${national}`;
    svg.appendChild(avgLbl);

    return svg;
  }

  container.appendChild(makeSVG());

  // Legend
  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:10px;font-size:11px;font-family:var(--sans,"Helvetica Neue",sans-serif);color:#555;';
  for (const [grp, label] of Object.entries(LABELS)) {
    if (!label) continue;
    const item = document.createElement('span');
    item.style.cssText = 'display:inline-flex;align-items:center;gap:5px;';
    item.innerHTML = `<span style="width:10px;height:10px;border-radius:2px;background:${COLOURS[grp]};display:inline-block;flex-shrink:0;"></span>${label}`;
    legend.appendChild(item);
  }
  container.appendChild(legend);
}
