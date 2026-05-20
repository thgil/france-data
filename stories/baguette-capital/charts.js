// stories/baguette-capital/charts.js
// SVG bar charts for the baguette-capital story.
// Exports: drawTopChart, drawDistributionChart

const GOLD     = '#c8860a';
const GOLD_DIM = '#d4a017';
const SERIF    = "Georgia, 'Times New Roman', serif";
const SANS     = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function svgEl(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function makeSVG(w, h) {
  const svg = svgEl('svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.style.width = '100%';
  svg.style.display = 'block';
  return svg;
}

function addText(svg, x, y, content, { anchor = 'start', size = 12, family = SANS, fill = '#333', weight = 'normal' } = {}) {
  const el = svgEl('text');
  el.setAttribute('x', x);
  el.setAttribute('y', y);
  el.setAttribute('text-anchor', anchor);
  el.setAttribute('font-size', size);
  el.setAttribute('font-family', family);
  el.setAttribute('fill', fill);
  el.setAttribute('font-weight', weight);
  el.textContent = content;
  svg.appendChild(el);
  return el;
}

function addRect(svg, x, y, w, h, fill, { opacity = 1, rx = 0 } = {}) {
  const el = svgEl('rect');
  el.setAttribute('x', x);
  el.setAttribute('y', y);
  el.setAttribute('width', Math.max(0, w));
  el.setAttribute('height', Math.max(0, h));
  el.setAttribute('fill', fill);
  el.setAttribute('opacity', opacity);
  if (rx) el.setAttribute('rx', rx);
  svg.appendChild(el);
  return el;
}

function addLine(svg, x1, y1, x2, y2, stroke = '#e0dbd2', width = 1) {
  const el = svgEl('line');
  el.setAttribute('x1', x1); el.setAttribute('y1', y1);
  el.setAttribute('x2', x2); el.setAttribute('y2', y2);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', width);
  svg.appendChild(el);
}

// Shorten "Paris Xe Arrondissement" → "Paris Xe arr."
function shortName(name) {
  return name.replace(/\s+Arrondissement$/, ' arr.');
}

// ── Horizontal bar chart: top communes by bakeries per 10k ───────────────────

export function drawTopChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container || !data?.length) return;

  const LABEL_W = 210;
  const BAR_H   = 26;
  const GAP      = 9;
  const W        = 700;
  const PAD_TOP  = 22;
  const PAD_BOT  = 8;
  const VALUE_W  = 44;  // room for "37.6" after bar
  const BAR_AREA = W - LABEL_W - VALUE_W - 8;
  const H = PAD_TOP + data.length * (BAR_H + GAP) - GAP + PAD_BOT;
  const maxVal = Math.max(...data.map(d => d.per10k));

  const svg = makeSVG(W, H);

  // Column header
  addText(svg, LABEL_W + 2, PAD_TOP - 5, 'Bakeries per 10,000 residents', {
    size: 10, fill: '#aaa',
  });

  data.forEach((d, i) => {
    const y = PAD_TOP + i * (BAR_H + GAP);
    const barW = Math.max(2, (d.per10k / maxVal) * BAR_AREA);
    const isWinner = i === 0;

    // Subtle alternating row background
    if (i % 2 === 0) {
      addRect(svg, 0, y, W, BAR_H, '#f5f1eb', { opacity: 0.55 });
    }

    // Label: "Commune (dept)"
    const label = `${shortName(d.name)} (${d.dept})`;
    addText(svg, LABEL_W - 6, y + BAR_H / 2 + 4, label, {
      anchor: 'end', size: 13, family: SERIF, fill: '#1a1a1a',
    });

    // Bar
    const barFill = isWinner ? GOLD : GOLD_DIM;
    const barOpacity = isWinner ? 1 : 0.68;
    addRect(svg, LABEL_W + 2, y + 3, barW, BAR_H - 6, barFill, {
      opacity: barOpacity, rx: 2,
    });

    // Per10k value
    addText(svg, LABEL_W + 2 + barW + 6, y + BAR_H / 2 + 4, d.per10k.toFixed(1), {
      size: 12, fill: '#555',
    });
  });

  container.appendChild(svg);
}

// ── Vertical bar chart: distribution of bakeries per commune ─────────────────

export function drawDistributionChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container || !data?.length) return;

  const W        = 640;
  const H        = 240;
  const PAD_L    = 44;
  const PAD_R    = 12;
  const PAD_T    = 28;
  const PAD_B    = 44;
  const CHART_W  = W - PAD_L - PAD_R;
  const CHART_H  = H - PAD_T - PAD_B;

  const maxCount = Math.max(...data.map(d => d.count));
  const n        = data.length;
  const slotW    = CHART_W / n;
  const barW     = slotW * 0.62;
  const barOff   = (slotW - barW) / 2;

  const svg = makeSVG(W, H);

  // Y gridlines and labels
  const yTicks = [200, 400, 600];
  yTicks.forEach(tick => {
    if (tick > maxCount * 1.05) return;
    const y = PAD_T + CHART_H - (tick / maxCount) * CHART_H;
    addLine(svg, PAD_L, y, W - PAD_R, y, '#e8e4dc', 1);
    addText(svg, PAD_L - 6, y + 4, tick.toString(), {
      anchor: 'end', size: 10, fill: '#bbb',
    });
  });

  // Bars
  data.forEach((d, i) => {
    const bh  = Math.max(2, (d.count / maxCount) * CHART_H);
    const x   = PAD_L + i * slotW + barOff;
    const y   = PAD_T + CHART_H - bh;
    const isZero = d.label === '0';

    addRect(svg, x, y, barW, bh, isZero ? '#bfb8ac' : GOLD_DIM, {
      opacity: isZero ? 1 : 0.8, rx: 2,
    });

    // Count above bar
    addText(svg, x + barW / 2, y - 5, d.count.toString(), {
      anchor: 'middle', size: 11, fill: '#555',
    });

    // X-axis label
    addText(svg, x + barW / 2, H - PAD_B + 16, d.label, {
      anchor: 'middle', size: 12, fill: '#666',
    });
  });

  // X-axis label
  addText(svg, PAD_L + CHART_W / 2, H - 4, 'Bakeries in commune', {
    anchor: 'middle', size: 11, fill: '#aaa',
  });

  // Y-axis label
  const yLabel = svgEl('text');
  yLabel.setAttribute('x', 10);
  yLabel.setAttribute('y', PAD_T + CHART_H / 2);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-size', 10);
  yLabel.setAttribute('font-family', SANS);
  yLabel.setAttribute('fill', '#aaa');
  yLabel.setAttribute('transform', `rotate(-90, 10, ${PAD_T + CHART_H / 2})`);
  yLabel.textContent = 'Communes';
  svg.appendChild(yLabel);

  container.appendChild(svg);
}
