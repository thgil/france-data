// stories/commune-names/charts.js
// SVG chart rendering for the commune-names story.
// No external dependencies — pure DOM + SVG.

const PAPER   = '#faf7f2';
const INK     = '#1a1a1a';
const MUTE    = '#888';
const ACCENT  = '#b32020';
const BAR_CLR = '#b32020';
const BAR_DIM = '#e8d4d4';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ── Horizontal bar chart ─────────────────────────────────────────────────────
// rows: [{ label, value }], sorted descending by caller
export function drawHorizBar(containerEl, rows, { unit = '', accent = BAR_CLR } = {}) {
  const W = 680;
  const ROW_H = 32;
  const LABEL_W = 220;
  const BAR_MAX = W - LABEL_W - 60; // 60px for value text
  const H = rows.length * ROW_H + 20;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:680px;display:block;margin:0 auto;overflow:visible'
  });

  const maxVal = Math.max(...rows.map(r => r.value));

  rows.forEach((row, i) => {
    const y = i * ROW_H + 10;
    const barW = (row.value / maxVal) * BAR_MAX;

    // label
    const label = svgEl('text', {
      x: LABEL_W - 8,
      y: y + ROW_H / 2 + 5,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '13',
      fill: INK
    });
    label.textContent = row.label;
    svg.appendChild(label);

    // bar track
    const track = svgEl('rect', {
      x: LABEL_W,
      y: y + 6,
      width: BAR_MAX,
      height: ROW_H - 14,
      rx: 2,
      fill: '#ede8e0'
    });
    svg.appendChild(track);

    // bar fill
    if (barW > 0) {
      const bar = svgEl('rect', {
        x: LABEL_W,
        y: y + 6,
        width: barW,
        height: ROW_H - 14,
        rx: 2,
        fill: accent
      });
      svg.appendChild(bar);
    }

    // value text
    const val = svgEl('text', {
      x: LABEL_W + BAR_MAX + 8,
      y: y + ROW_H / 2 + 5,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '12',
      fill: MUTE
    });
    val.textContent = row.value + (unit ? ' ' + unit : '');
    svg.appendChild(val);
  });

  containerEl.innerHTML = '';
  containerEl.appendChild(svg);
}

// ── Name length histogram ─────────────────────────────────────────────────────
export function drawLengthHist(containerEl, lengthDist) {
  const W = 680;
  const H = 240;
  const PAD = { top: 16, right: 24, bottom: 40, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // Only show lengths 1-35 (tail after 35 is noise)
  const filtered = lengthDist.filter(d => d.len <= 35);
  const maxCount = Math.max(...filtered.map(d => d.count));
  const minLen = 1;
  const maxLen = 35;
  const binCount = maxLen - minLen + 1;
  const binW = plotW / binCount;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:680px;display:block;margin:0 auto;overflow:visible'
  });

  // Y gridlines and labels
  const yTicks = [0, 1000, 2000, 3000, 4000];
  yTicks.forEach(t => {
    const y = PAD.top + plotH - (t / maxCount) * plotH;
    const line = svgEl('line', {
      x1: PAD.left, x2: PAD.left + plotW,
      y1: y, y2: y,
      stroke: t === 0 ? '#999' : '#e0d8cc',
      'stroke-width': t === 0 ? 1 : 0.5
    });
    svg.appendChild(line);

    if (t > 0) {
      const lbl = svgEl('text', {
        x: PAD.left - 6,
        y: y + 4,
        'text-anchor': 'end',
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': '10',
        fill: MUTE
      });
      lbl.textContent = (t / 1000) + 'k';
      svg.appendChild(lbl);
    }
  });

  // Bars
  for (let len = minLen; len <= maxLen; len++) {
    const d = filtered.find(x => x.len === len);
    const count = d ? d.count : 0;
    const barH = (count / maxCount) * plotH;
    const x = PAD.left + (len - minLen) * binW;
    const y = PAD.top + plotH - barH;

    const bar = svgEl('rect', {
      x: x + 1,
      y,
      width: Math.max(binW - 2, 1),
      height: barH,
      fill: len >= 7 && len <= 9 ? ACCENT : '#c4b8a8'
    });
    svg.appendChild(bar);
  }

  // X axis labels every 5
  for (let len = 5; len <= maxLen; len += 5) {
    const x = PAD.left + (len - minLen) * binW + binW / 2;
    const lbl = svgEl('text', {
      x,
      y: PAD.top + plotH + 16,
      'text-anchor': 'middle',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '11',
      fill: MUTE
    });
    lbl.textContent = len;
    svg.appendChild(lbl);
  }

  // Axis label
  const axisLabel = svgEl('text', {
    x: PAD.left + plotW / 2,
    y: H - 4,
    'text-anchor': 'middle',
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '10',
    'letter-spacing': '1',
    fill: MUTE
  });
  axisLabel.textContent = 'CHARACTERS IN NAME';
  svg.appendChild(axisLabel);

  // Annotation: peak at 7–9
  const peakX = PAD.left + (8 - minLen) * binW + binW / 2;
  const peak = filtered.find(x => x.len === 8);
  const peakY = PAD.top + plotH - (peak ? peak.count / maxCount : 0) * plotH;
  const ann = svgEl('text', {
    x: peakX + 28,
    y: peakY + 4,
    'font-family': 'Georgia, serif',
    'font-size': '11',
    'font-style': 'italic',
    fill: ACCENT
  });
  ann.textContent = 'peak: 7–9 chars';
  svg.appendChild(ann);

  containerEl.innerHTML = '';
  containerEl.appendChild(svg);
}
