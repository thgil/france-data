/**
 * commune-names/charts.js
 * Pure SVG / DOM charts for the commune names story.
 */

export function drawTopNamesChart(containerId, topNames) {
  const el = document.querySelector(containerId);
  if (!el) return;

  const max = topNames[0].count;

  el.innerHTML = topNames.map((d, i) => {
    const pct = (d.count / max) * 100;
    const deptStr = d.depts.length <= 6
      ? d.depts.join(', ')
      : d.depts.slice(0, 6).join(', ') + ` +${d.depts.length - 6}`;
    return `
      <div class="bar-row" style="--pct:${pct.toFixed(1)}%">
        <div class="bar-rank">${i + 1}</div>
        <div class="bar-label">
          <span class="bar-name">${d.name}</span>
          <span class="bar-depts">depts ${deptStr}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill"></div>
        </div>
        <div class="bar-count">${d.count}</div>
      </div>`;
  }).join('');
}

export function drawLengthHistogram(containerId, bins) {
  const el = document.querySelector(containerId);
  if (!el) return;

  const max = Math.max(...bins.map(b => b.count));

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const W = 600, H = 160, padL = 8, padR = 8, padT = 8, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${padL},${padT})`);
  svg.appendChild(g);

  const bw = plotW / bins.length;

  bins.forEach((bin, i) => {
    const bh = (bin.count / max) * plotH;
    const x = i * bw;
    const y = plotH - bh;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + 1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(bw - 2, 1));
    rect.setAttribute('height', bh);
    rect.setAttribute('fill', '#8b6914');
    rect.setAttribute('opacity', '0.75');
    g.appendChild(rect);

    // Label every other tick
    if (i % 3 === 0 || bin.start === 1) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + bw / 2);
      text.setAttribute('y', plotH + 16);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '9');
      text.setAttribute('fill', '#888');
      text.setAttribute('font-family', 'Helvetica Neue, sans-serif');
      text.textContent = bin.start;
      g.appendChild(text);
    }
  });

  // baseline
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', 0);
  line.setAttribute('y1', plotH);
  line.setAttribute('x2', plotW);
  line.setAttribute('y2', plotH);
  line.setAttribute('stroke', '#ccc');
  line.setAttribute('stroke-width', '1');
  g.appendChild(line);

  el.appendChild(svg);
}
