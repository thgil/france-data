/* dept-bars: ranked horizontal bar chart of bars per 1,000 by département */

(function () {
  const DATA_URL = 'dept-bars-data.json';
  const NATIONAL_AVG = 0.733;

  // Region colour palette
  const REGION_COLORS = {
    'Auvergne-Rhône-Alpes': '#4e7c59',
    'Bourgogne-Franche-Comté': '#7b5ea7',
    'Bretagne': '#2b6bb0',
    'Centre-Val de Loire': '#b0862b',
    'Corse': '#c0392b',
    'Grand Est': '#5b8a8a',
    'Hauts-de-France': '#3d6b9e',
    'Île-de-France': '#1a1a1a',
    'Normandie': '#4a7a6a',
    'Pays de la Loire': '#6b8e4e',
    'Occitanie': '#a0522d',
    'Nouvelle-Aquitaine': '#7a6b3a',
    'Provence-Alpes-Côte d Azur': '#c47a2d',
    'Outre-mer': '#888',
    'Autre': '#aaa',
  };

  const HIGHLIGHTED = new Set(['2B', '2A', '48', '15', '75', '91', '78', '92', '95']);

  let allData = [];
  let filtered = [];

  function formatPer1000(v) {
    return v.toFixed(2);
  }

  function buildTopBottomTables(data) {
    const sorted = [...data].sort((a, b) => b.per1000 - a.per1000);
    const top = sorted.slice(0, 8);
    const bottom = sorted.slice(-8).reverse();

    function fillTable(id, rows, valueClass) {
      const tbody = document.querySelector(`#${id} tbody`);
      if (!tbody) return;
      tbody.innerHTML = '';
      rows.forEach((d) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="dept-num">${d.dept}</span>${d.name}</td>
          <td class="${valueClass}">${formatPer1000(d.per1000)}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    fillTable('table-top', top, '');
    fillTable('table-bottom', bottom, '');
  }

  function drawChart(data) {
    const canvas = document.getElementById('rank-chart');
    if (!canvas) return;

    // Sort descending
    const sorted = [...data].sort((a, b) => b.per1000 - a.per1000);

    const ROW_H = 22;
    const LABEL_W = 170;
    const VALUE_W = 44;
    const BAR_MAX = Math.max(...sorted.map(d => d.per1000)) * 1.08;
    const MARGIN = { top: 28, right: VALUE_W + 12, bottom: 24, left: LABEL_W };

    const dpr = window.devicePixelRatio || 1;
    const wrapW = canvas.parentElement.clientWidth || 640;
    const BAR_AREA = Math.max(200, wrapW - MARGIN.left - MARGIN.right);
    const totalH = MARGIN.top + sorted.length * ROW_H + MARGIN.bottom;

    canvas.width = wrapW * dpr;
    canvas.height = totalH * dpr;
    canvas.style.width = wrapW + 'px';
    canvas.style.height = totalH + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const scale = (v) => (v / BAR_MAX) * BAR_AREA;

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, wrapW, totalH);

    // Header labels
    ctx.font = '600 10px var(--sans, Helvetica Neue, sans-serif)';
    ctx.fillStyle = '#888';
    ctx.letterSpacing = '0.8px';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillText('DÉPARTEMENT', LABEL_W - 8, 14);
    ctx.textAlign = 'center';
    ctx.fillText('BARS / 1 000', LABEL_W + BAR_AREA / 2, 14);
    ctx.letterSpacing = '0';

    // National average line (header)
    const avgX = LABEL_W + scale(NATIONAL_AVG);
    ctx.strokeStyle = '#d4a';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(avgX, MARGIN.top - 4);
    ctx.lineTo(avgX, MARGIN.top + sorted.length * ROW_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // National avg label
    ctx.font = '10px var(--mono, Courier New, monospace)';
    ctx.fillStyle = '#b080a0';
    ctx.textAlign = 'center';
    ctx.fillText('avg', avgX, 14);

    sorted.forEach((d, i) => {
      const y = MARGIN.top + i * ROW_H;
      const barW = scale(d.per1000);
      const isHighlighted = HIGHLIGHTED.has(d.dept);
      const color = REGION_COLORS[d.region] || '#aaa';

      // Row background
      if (i % 2 === 0) {
        ctx.fillStyle = '#faf9f7';
        ctx.fillRect(0, y, wrapW, ROW_H);
      }

      // Bar
      ctx.fillStyle = color + (isHighlighted ? '' : '88');
      ctx.fillRect(LABEL_W, y + 4, barW, ROW_H - 8);

      // Department label (right-aligned in label zone)
      ctx.font = isHighlighted
        ? '600 11px var(--sans, Helvetica Neue, sans-serif)'
        : '11px var(--sans, Helvetica Neue, sans-serif)';
      ctx.fillStyle = isHighlighted ? '#1a1a1a' : '#444';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.name, LABEL_W - 8, y + ROW_H / 2);

      // Dept code (mono, smaller)
      ctx.font = '9px var(--mono, Courier New, monospace)';
      ctx.fillStyle = '#aaa';
      const nameMetrics = ctx.measureText(d.name);

      // Value label (right of bar area)
      ctx.font = isHighlighted
        ? '600 11px var(--mono, Courier New, monospace)'
        : '11px var(--mono, Courier New, monospace)';
      ctx.fillStyle = isHighlighted ? '#1a1a1a' : '#888';
      ctx.textAlign = 'left';
      ctx.fillText(formatPer1000(d.per1000), LABEL_W + barW + 5, y + ROW_H / 2);
    });

    // Bottom axis line
    const axisY = MARGIN.top + sorted.length * ROW_H;
    ctx.strokeStyle = '#d8d0c0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(LABEL_W, axisY);
    ctx.lineTo(wrapW, axisY);
    ctx.stroke();

    // X axis labels
    ctx.font = '10px var(--mono, Courier New, monospace)';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    [0, 0.5, 1.0, 1.5, 2.0].forEach(v => {
      if (v > BAR_MAX) return;
      const x = LABEL_W + scale(v);
      ctx.fillText(v.toFixed(1), x, axisY + 4);
      ctx.strokeStyle = '#ece8e0';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x, MARGIN.top);
      ctx.lineTo(x, axisY);
      ctx.stroke();
    });

    // Store sorted for tooltip
    canvas._sorted = sorted;
    canvas._margin = MARGIN;
    canvas._rowH = ROW_H;
    canvas._wrapW = wrapW;
  }

  function setupTooltip(canvas) {
    const tip = document.getElementById('tooltip');
    if (!tip || !canvas) return;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const mouseX = e.clientX - rect.left;
      const sorted = canvas._sorted;
      const margin = canvas._margin;
      const rowH = canvas._rowH;

      if (!sorted || mouseX < 0 || mouseX > canvas._wrapW) {
        tip.style.opacity = 0;
        return;
      }

      const idx = Math.floor((mouseY - margin.top) / rowH);
      if (idx < 0 || idx >= sorted.length) {
        tip.style.opacity = 0;
        return;
      }

      const d = sorted[idx];
      tip.innerHTML = `
        <strong>${d.name}</strong> (${d.dept})<br>
        ${formatPer1000(d.per1000)} bars per 1,000 residents<br>
        <span style="color:#aaa">${d.bars.toLocaleString('fr-FR')} bars · ${Math.round(d.pop / 1000)}k residents</span><br>
        <span style="color:#aaa">${d.region}</span>
      `;
      tip.style.opacity = 1;
      tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 240) + 'px';
      tip.style.top = (e.clientY - 10) + 'px';
    });

    canvas.addEventListener('mouseleave', () => {
      tip.style.opacity = 0;
    });
  }

  function applyFilter(filter) {
    const overseas = new Set(['971', '972', '973', '974', '976']);
    filtered = filter === 'metro'
      ? allData.filter(d => !overseas.has(d.dept) && d.dept !== '97')
      : allData.filter(d => d.dept !== '97');

    drawChart(filtered);
    buildTopBottomTables(filtered);
    setupTooltip(document.getElementById('rank-chart'));
  }

  async function main() {
    const resp = await fetch(DATA_URL);
    allData = await resp.json();

    // Default: all except aggregated 97
    applyFilter('all');

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });

    // Redraw on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        applyFilter(
          document.querySelector('.filter-btn.active')?.dataset.filter || 'all'
        );
      }, 150);
    });
  }

  main();
})();
