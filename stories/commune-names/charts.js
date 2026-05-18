// charts.js — commune-names story
// All charts drawn with vanilla Canvas 2D API; no dependencies.

(function () {

  // ── Name-length histogram ───────────────────────────────────────────
  // Bucket counts computed from the 35,014-commune dataset.
  // Buckets: length 1 through 30+
  const lengthBuckets = [
    { label: '1',  count: 1    },
    { label: '2',  count: 13   },
    { label: '3',  count: 154  },
    { label: '4',  count: 720  },
    { label: '5',  count: 1969 },
    { label: '6',  count: 3223 },
    { label: '7',  count: 3695 },
    { label: '8',  count: 3695 },
    { label: '9',  count: 3000 },
    { label: '10', count: 2522 },
    { label: '11', count: 1884 },
    { label: '12', count: 1435 },
    { label: '13', count: 1167 },
    { label: '14', count: 1018 },
    { label: '15', count: 1095 },
    { label: '16', count: 1177 },
    { label: '17', count: 1186 },
    { label: '18', count: 1202 },
    { label: '19', count: 1117 },
    { label: '20', count: 1028 },
    { label: '21', count: 923  },
    { label: '22', count: 819  },
    { label: '23', count: 649  },
    { label: '24', count: 501  },
    { label: '25', count: 329  },
    { label: '26', count: 200  },
    { label: '27', count: 105  },
    { label: '28', count: 55   },
    { label: '29', count: 53   },
    { label: '30+', count: 65  },
  ];

  // ── Top duplicate names ─────────────────────────────────────────────
  const topDuplicates = [
    { name: 'Sainte-Colombe', count: 12 },
    { name: 'Saint-Sauveur',  count: 11 },
    { name: 'Saint-Aubin',    count: 10 },
    { name: 'Beaulieu',       count: 10 },
    { name: 'Saint-Marcel',   count: 9  },
    { name: 'Saint-Michel',   count: 9  },
    { name: 'Le Pin',         count: 9  },
    { name: 'Saint-Pierre',   count: 9  },
    { name: 'Sainte-Marie',   count: 9  },
    { name: 'Saint-Rémy',     count: 8  },
    { name: 'Saint-Clément',  count: 8  },
    { name: 'Saint-Hilaire',  count: 8  },
    { name: 'Saint-Loup',     count: 8  },
    { name: 'Beaumont',       count: 8  },
    { name: 'Verrières',      count: 8  },
  ];

  // ── Prefix data ─────────────────────────────────────────────────────
  const prefixes = [
    { label: 'Saint-',   count: 3587, total: 35014 },
    { label: 'La …',     count: 1054, total: 35014 },
    { label: 'Mont…',    count: 772,  total: 35014 },
    { label: 'Le …',     count: 758,  total: 35014 },
    { label: 'Les …',    count: 328,  total: 35014 },
    { label: 'Sainte-',  count: 295,  total: 35014 },
    { label: 'Beau…',    count: 222,  total: 35014 },
    { label: 'Château-', count: 30,   total: 35014 },
  ];

  // ── Draw histogram ──────────────────────────────────────────────────
  function drawHistogram() {
    const canvas = document.getElementById('lengthChart');
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.parentElement.clientWidth || 760;
    const cssH = 280;
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const padL = 52, padR = 12, padT = 12, padB = 40;
    const w = cssW - padL - padR;
    const h = cssH - padT - padB;

    const maxCount = Math.max(...lengthBuckets.map(b => b.count));
    const yTick = 1000;
    const yMax = Math.ceil(maxCount / yTick) * yTick;

    const barW = w / lengthBuckets.length;
    const gap  = Math.max(1, barW * 0.12);

    const accent = '#b32020';
    const mute   = '#aaa';
    const ink    = '#1a1a1a';

    // Y-axis gridlines and labels
    ctx.font = `11px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let v = 0; v <= yMax; v += yTick) {
      const y = padT + h - (v / yMax) * h;
      ctx.strokeStyle = v === 0 ? '#bbb' : '#e8e0d4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + w, y);
      ctx.stroke();
      ctx.fillStyle = mute;
      ctx.fillText(v === 0 ? '0' : (v / 1000) + 'k', padL - 6, y);
    }

    // Bars
    lengthBuckets.forEach((b, i) => {
      const x = padL + i * barW + gap / 2;
      const bw = barW - gap;
      const bh = (b.count / yMax) * h;
      const y = padT + h - bh;
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.78;
      ctx.fillRect(x, y, bw, bh);
      ctx.globalAlpha = 1;
    });

    // X-axis labels (every 5)
    ctx.fillStyle = mute;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    lengthBuckets.forEach((b, i) => {
      if (i === 0 || (i + 1) % 5 === 0 || b.label === '30+') {
        const x = padL + i * barW + barW / 2;
        ctx.fillText(b.label, x, padT + h + 6);
      }
    });

    // X axis label
    ctx.fillStyle = ink;
    ctx.font = `11px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Characters in name', padL + w / 2, padT + h + 26);
  }

  // ── Build duplicate-names grid ──────────────────────────────────────
  function buildDupGrid() {
    const grid = document.getElementById('dupGrid');
    if (!grid) return;
    const max = topDuplicates[0].count;
    topDuplicates.forEach((d, i) => {
      const row = document.createElement('div');
      row.className = 'dup-row';
      const pct = Math.round((d.count / max) * 100);
      row.innerHTML = `
        <span class="dup-rank">${i + 1}</span>
        <span class="dup-name">${d.name}</span>
        <span class="dup-bar-wrap">
          <span class="dup-bar" style="width:${pct}%"></span>
          <span class="dup-count">${d.count}× in France</span>
        </span>`;
      grid.appendChild(row);
    });
  }

  // ── Build prefix bars ───────────────────────────────────────────────
  function buildPrefixGrid() {
    const grid = document.getElementById('prefixGrid');
    if (!grid) return;
    const max = prefixes[0].count;
    prefixes.forEach(p => {
      const pct = Math.round((p.count / max) * 100);
      const labelEl = document.createElement('span');
      labelEl.className = 'prefix-label';
      labelEl.textContent = p.label;

      const track = document.createElement('div');
      track.className = 'prefix-bar-track';
      const fill = document.createElement('div');
      fill.className = 'prefix-bar-fill';
      fill.style.width = pct + '%';
      track.appendChild(fill);

      const countEl = document.createElement('span');
      countEl.className = 'prefix-count';
      countEl.textContent = p.count.toLocaleString('en-US') + ' communes';

      grid.appendChild(labelEl);
      grid.appendChild(track);
      grid.appendChild(countEl);
    });
  }

  // ── Init ────────────────────────────────────────────────────────────
  function init() {
    buildDupGrid();
    buildPrefixGrid();
    drawHistogram();
    window.addEventListener('resize', drawHistogram, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
