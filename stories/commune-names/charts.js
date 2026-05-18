// charts.js — commune-names story
// All charts are drawn from stats.json (pre-computed, no heavy data file needed).

async function loadStats() {
  const res = await fetch('./stats.json');
  if (!res.ok) throw new Error(`stats.json: HTTP ${res.status}`);
  return res.json();
}

function fmtNum(n) {
  return n.toLocaleString('fr-FR');
}

// ── Name length histogram ────────────────────────────────────────────────────
function drawHistogram(svgEl, lengthDist) {
  const entries = Object.entries(lengthDist)
    .map(([k, v]) => ({ len: +k, count: v }))
    .filter(d => d.len <= 50)
    .sort((a, b) => a.len - b.len);

  const W = svgEl.parentElement.clientWidth || 700;
  const H = 220;
  const marginL = 36, marginR = 12, marginT = 8, marginB = 40;
  const innerW = W - marginL - marginR;
  const innerH = H - marginT - marginB;

  const maxCount = Math.max(...entries.map(d => d.count));
  const minLen = entries[0].len;
  const maxLen = entries[entries.length - 1].len;
  const bandW = innerW / (maxLen - minLen + 1);
  const gap = Math.max(0, bandW * 0.1);

  svgEl.setAttribute('width', W);
  svgEl.setAttribute('height', H);
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const yScale = v => innerH - (v / maxCount) * innerH;

  let html = `<g transform="translate(${marginL},${marginT})">`;

  // Bars
  for (const d of entries) {
    const x = (d.len - minLen) * bandW + gap / 2;
    const bw = bandW - gap;
    const bh = (d.count / maxCount) * innerH;
    const y = innerH - bh;
    html += `<rect class="hist-bar" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}">
      <title>${d.len} chars: ${fmtNum(d.count)} communes</title>
    </rect>`;
  }

  // Y-axis gridlines + labels
  const yTicks = [0, 1000, 2000, 3000];
  for (const t of yTicks) {
    if (t > maxCount) continue;
    const y = yScale(t);
    html += `<line x1="0" y1="${y.toFixed(1)}" x2="${innerW}" y2="${y.toFixed(1)}" stroke="#e0d8cc" stroke-width="1"/>`;
    html += `<text class="axis-label" x="-4" y="${(y + 4).toFixed(1)}" text-anchor="end">${t === 0 ? '' : fmtNum(t)}</text>`;
  }

  // X-axis labels (every 5 chars)
  for (let len = 5; len <= maxLen; len += 5) {
    const x = (len - minLen) * bandW + bandW / 2;
    html += `<text class="axis-label" x="${x.toFixed(1)}" y="${(innerH + 18).toFixed(1)}" text-anchor="middle">${len}</text>`;
  }

  // X-axis label
  html += `<text class="axis-label" x="${(innerW / 2).toFixed(1)}" y="${(innerH + 36).toFixed(1)}" text-anchor="middle">name length (characters)</text>`;

  html += '</g>';
  svgEl.innerHTML = html;
}

// ── Prefix horizontal bar chart ──────────────────────────────────────────────
function drawPrefixes(svgEl, prefixes) {
  const top = prefixes.slice(0, 12);
  const rowH = 28;
  const W = svgEl.parentElement.clientWidth || 700;
  const marginL = 96, marginR = 60, marginT = 8, marginB = 8;
  const innerW = W - marginL - marginR;
  const H = top.length * rowH + marginT + marginB;
  const maxVal = top[0].count;

  svgEl.setAttribute('width', W);
  svgEl.setAttribute('height', H);
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);

  let html = `<g transform="translate(${marginL},${marginT})">`;

  for (let i = 0; i < top.length; i++) {
    const d = top[i];
    const y = i * rowH;
    const bw = (d.count / maxVal) * innerW;
    const midY = y + rowH / 2;

    html += `<rect class="bar-rect" x="0" y="${(y + 4).toFixed(1)}" width="${bw.toFixed(1)}" height="${(rowH - 8).toFixed(1)}">
      <title>${d.word}: ${fmtNum(d.count)} communes</title>
    </rect>`;
    html += `<text class="bar-label" x="-6" y="${(midY + 5).toFixed(1)}" text-anchor="end">${d.word}</text>`;
    html += `<text class="bar-value" x="${(bw + 6).toFixed(1)}" y="${(midY + 4).toFixed(1)}">${fmtNum(d.count)}</text>`;
  }

  html += '</g>';
  svgEl.setAttribute('height', H);
  svgEl.innerHTML = html;
}

// ── Tables ────────────────────────────────────────────────────────────────────
function populateShortestTable(stats) {
  const tbody = document.querySelector('#table-shortest tbody');
  if (!tbody) return;
  tbody.innerHTML = stats.shortest.map((c, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${c.name}<span class="sub">dept ${c.dept} · ${fmtNum(c.pop)} inhabitants</span></td>
    </tr>`
  ).join('');
}

function populateLongestTable(stats) {
  const tbody = document.querySelector('#table-longest tbody');
  if (!tbody) return;
  tbody.innerHTML = stats.longest.slice(0, 8).map((c, i) =>
    `<tr>
      <td class="rank">${c.name.length} ch.</td>
      <td class="place">${c.name}<span class="sub">dept ${c.dept} · ${fmtNum(c.pop)} inhabitants</span></td>
    </tr>`
  ).join('');
}

function populateDupeGrid(stats) {
  const grid = document.getElementById('dupe-grid');
  if (!grid) return;
  grid.innerHTML = stats.topDupes.map(d =>
    `<div class="dupe-pill">${d.name}<span class="dupe-count">${d.count} communes</span></div>`
  ).join('');
}

function populateCallouts(stats) {
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmtNum(val);
  };
  setEl('cn-total', stats.total);
  setEl('cn-saint', stats.saintCount);
  setEl('cn-duped', stats.dupedCommunes);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  try {
    const stats = await loadStats();

    populateCallouts(stats);
    populateShortestTable(stats);
    populateLongestTable(stats);
    populateDupeGrid(stats);

    const histEl = document.getElementById('chart-hist');
    if (histEl) drawHistogram(histEl, stats.lengthDist);

    const prefEl = document.getElementById('chart-prefixes');
    if (prefEl) drawPrefixes(prefEl, stats.topPrefixes);
  } catch (err) {
    console.error('Failed to load commune-names story data:', err);
  }
}

main();
