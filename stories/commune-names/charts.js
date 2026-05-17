async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

function hbar(svgEl, data, { labelKey, valueKey, color = '#8b3a00', labelMaxWidth = 280, barMaxWidth = 280, height = 28, gap = 6 } = {}) {
  const items = data;
  const maxVal = Math.max(...items.map(d => d[valueKey]));
  const svgWidth = labelMaxWidth + barMaxWidth + 60;
  const svgHeight = items.length * (height + gap);

  svgEl.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svgEl.setAttribute('height', svgHeight);

  const ns = 'http://www.w3.org/2000/svg';

  items.forEach((d, i) => {
    const y = i * (height + gap);
    const barW = Math.max(2, (d[valueKey] / maxVal) * barMaxWidth);

    // Label
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', labelMaxWidth - 8);
    label.setAttribute('y', y + height / 2 + 1);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d[labelKey];
    svgEl.appendChild(label);

    // Bar
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', labelMaxWidth);
    rect.setAttribute('y', y + 4);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', height - 8);
    rect.setAttribute('fill', color);
    rect.setAttribute('opacity', '0.85');
    svgEl.appendChild(rect);

    // Value label
    const val = document.createElementNS(ns, 'text');
    val.setAttribute('x', labelMaxWidth + barW + 6);
    val.setAttribute('y', y + height / 2 + 1);
    val.setAttribute('dominant-baseline', 'middle');
    val.setAttribute('font-family', "'Helvetica Neue', Helvetica, sans-serif");
    val.setAttribute('font-size', '12');
    val.setAttribute('fill', '#555');
    val.textContent = d[valueKey];
    svgEl.appendChild(val);
  });
}

function lengthHistogram(svgEl, lenHist) {
  const ns = 'http://www.w3.org/2000/svg';
  const bucketSize = 2;
  const buckets = [];
  for (let lo = 1; lo <= 45; lo += bucketSize) {
    const hi = lo + bucketSize - 1;
    const count = lenHist
      .filter(d => d.len >= lo && d.len <= hi)
      .reduce((s, d) => s + d.count, 0);
    buckets.push({ label: `${lo}`, lo, hi, count });
  }

  const W = 680, H = 160;
  const padL = 40, padR = 10, padT = 10, padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.setAttribute('height', H);

  const maxCount = Math.max(...buckets.map(b => b.count));
  const bw = plotW / buckets.length;

  // Y axis label
  const yLabel = document.createElementNS(ns, 'text');
  yLabel.setAttribute('x', 8);
  yLabel.setAttribute('y', padT + plotH / 2);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('dominant-baseline', 'middle');
  yLabel.setAttribute('transform', `rotate(-90, 8, ${padT + plotH / 2})`);
  yLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  yLabel.setAttribute('font-size', '10');
  yLabel.setAttribute('fill', '#888');
  yLabel.textContent = 'communes';
  svgEl.appendChild(yLabel);

  // Gridlines
  [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = padT + plotH - frac * plotH;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', padL);
    line.setAttribute('x2', padL + plotW);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', frac === 0 ? '#999' : '#e8e0d4');
    line.setAttribute('stroke-width', '1');
    svgEl.appendChild(line);

    if (frac > 0) {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', padL - 4);
      t.setAttribute('y', y);
      t.setAttribute('text-anchor', 'end');
      t.setAttribute('dominant-baseline', 'middle');
      t.setAttribute('font-family', "'Helvetica Neue', sans-serif");
      t.setAttribute('font-size', '10');
      t.setAttribute('fill', '#aaa');
      t.textContent = Math.round(frac * maxCount).toLocaleString('fr-FR');
      svgEl.appendChild(t);
    }
  });

  // Bars
  buckets.forEach((b, i) => {
    const bh = (b.count / maxCount) * plotH;
    const x = padL + i * bw;
    const y = padT + plotH - bh;

    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x + 1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(1, bw - 2));
    rect.setAttribute('height', bh);
    rect.setAttribute('fill', '#8b3a00');
    rect.setAttribute('opacity', '0.75');
    svgEl.appendChild(rect);

    // X tick labels every 4 buckets
    if (i % 4 === 0) {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', x + bw / 2);
      t.setAttribute('y', padT + plotH + 14);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-family', "'Helvetica Neue', sans-serif");
      t.setAttribute('font-size', '10');
      t.setAttribute('fill', '#888');
      t.textContent = b.lo;
      svgEl.appendChild(t);
    }
  });

  // X axis label
  const xLabel = document.createElementNS(ns, 'text');
  xLabel.setAttribute('x', padL + plotW / 2);
  xLabel.setAttribute('y', H - 2);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  xLabel.setAttribute('font-size', '10');
  xLabel.setAttribute('fill', '#888');
  xLabel.textContent = 'name length (characters)';
  svgEl.appendChild(xLabel);
}

async function main() {
  const data = await loadJSON('./story-data.json');

  // Short names grid
  const grid = document.getElementById('short-names-grid');
  if (grid) {
    const deptNames = {
      '08': 'Ardennes', '25': 'Doubs', '28': 'Eure-et-Loir', '31': 'Haute-Garonne',
      '38': 'Isère', '61': 'Orne', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
      '70': 'Haute-Saône', '76': 'Seine-Maritime', '80': 'Somme', '95': 'Val-d\'Oise'
    };
    grid.innerHTML = data.shortest.map(s =>
      `<div class="short-name-tag">
        <span class="sn-name">${s.name}</span>
        <span class="sn-dept">${s.dept}</span>
      </div>`
    ).join('');
  }

  // Chart: longest names
  const chartLongest = document.getElementById('chart-longest');
  if (chartLongest) {
    hbar(chartLongest, data.longest, {
      labelKey: 'name',
      valueKey: 'len',
      color: '#8b3a00',
      labelMaxWidth: 340,
      barMaxWidth: 200,
      height: 30,
      gap: 6
    });
  }

  // Chart: name length histogram
  const chartLengths = document.getElementById('chart-lengths');
  if (chartLengths) {
    lengthHistogram(chartLengths, data.lenHist);
  }

  // Chart: prefix breakdown
  const chartPrefixes = document.getElementById('chart-prefixes');
  if (chartPrefixes) {
    hbar(chartPrefixes, data.prefixes, {
      labelKey: 'prefix',
      valueKey: 'count',
      color: '#5a6e3a',
      labelMaxWidth: 140,
      barMaxWidth: 380,
      height: 28,
      gap: 6
    });
  }

  // Chart: top names
  const chartTopNames = document.getElementById('chart-top-names');
  if (chartTopNames) {
    hbar(chartTopNames, data.topNames.slice(0, 15), {
      labelKey: 'name',
      valueKey: 'count',
      color: '#2e5a8e',
      labelMaxWidth: 240,
      barMaxWidth: 280,
      height: 26,
      gap: 5
    });
  }
}

main().catch(err => console.error('charts.js error:', err));
