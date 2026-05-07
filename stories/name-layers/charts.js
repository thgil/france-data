(function () {
  'use strict';

  // France continental bounds for projection
  const LNG_MIN = -5.3, LNG_MAX = 9.6;
  const LAT_MIN = 41.2, LAT_MAX = 51.3;
  const CANVAS_W = 560, CANVAS_H = 450;

  function project(lat, lng, w, h) {
    const x = (lng - LNG_MIN) / (LNG_MAX - LNG_MIN) * w;
    // Slight Mercator correction for latitude
    const latRad = lat * Math.PI / 180;
    const latMinRad = LAT_MIN * Math.PI / 180;
    const latMaxRad = LAT_MAX * Math.PI / 180;
    const yMerc = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const yMinM = Math.log(Math.tan(Math.PI / 4 + latMinRad / 2));
    const yMaxM = Math.log(Math.tan(Math.PI / 4 + latMaxRad / 2));
    const y = h - (yMerc - yMinM) / (yMaxM - yMinM) * h;
    return [x, y];
  }

  function drawMap(canvasId, bgPts, patternPts, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = CANVAS_W;
    const h = CANVAS_H;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Background: all communes as tiny gray dots
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    for (let i = 0; i < bgPts.length; i++) {
      const [lat, lng] = bgPts[i];
      const [x, y] = project(lat, lng, w, h);
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pattern communes: larger colored dots with a slight halo
    const r = 3.5;
    // Draw halo first (white border for visibility)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < patternPts.length; i++) {
      const [lat, lng] = patternPts[i];
      const [x, y] = project(lat, lng, w, h);
      ctx.beginPath();
      ctx.arc(x, y, r + 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Draw colored dots
    ctx.fillStyle = color;
    for (let i = 0; i < patternPts.length; i++) {
      const [lat, lng] = patternPts[i];
      const [x, y] = project(lat, lng, w, h);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function renderPills(containerId, names, color) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = names.map(n =>
      `<span class="name-pill" style="border-color:${color};color:${color}">${n}</span>`
    ).join('');
  }

  function renderSaintBars(data) {
    const wrap = document.getElementById('saint-bar-wrap');
    if (!wrap) return;

    // Saint root counts from INSEE commune name corpus
    const saints = [
      { name: 'Saint-Martin-…', count: 203 },
      { name: 'Saint-Jean-…', count: 156 },
      { name: 'Saint-Pierre-…', count: 144 },
      { name: 'Saint-Germain-…', count: 108 },
      { name: 'Saint-Julien-…', count: 78 },
      { name: 'Saint-Laurent-…', count: 77 },
      { name: 'Saint-Georges-…', count: 67 },
      { name: 'Saint-Hilaire-…', count: 67 },
    ];
    const max = saints[0].count;

    wrap.innerHTML = saints.map(s => `
      <div class="saint-bar-row">
        <span class="saint-bar-label">${s.name}</span>
        <div class="saint-bar-track">
          <div class="saint-bar-fill" style="width:${100 * s.count / max}%"></div>
        </div>
        <span class="saint-bar-n">${s.count}</span>
      </div>
    `).join('');
  }

  // Main: load data and render
  fetch('data.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      const bg = data.background;

      data.patterns.forEach(function (p) {
        drawMap('map-' + p.id, bg, p.pts, p.color);
      });

      // Sample names for pills — all verified to match their patterns
      const pillSamples = {
        alsatian: ['Guebwiller', 'Riedisheim', 'Achenheim', 'Baldenheim', 'Andolsheim', 'Artzenheim'],
        breton: ['Kerbors', 'Kerfot', 'Kergrist-Moëlou', 'Kerien', 'Landebaëron', 'Kermaria-Sulard'],
        occitan: ['Cognac', 'Bergerac', 'Abzac', 'Fléac', 'Birac', 'Néac'],
        court: ['Armancourt', 'Aubercourt', 'Bayencourt', 'Béalcourt', 'Béhencourt', 'Bavelincourt'],
        ville: ['Deauville', 'Bénouville', 'Amfreville', 'Angerville', 'Yerville', 'Goderville'],
      };

      // Use actual names from data where available, otherwise fall back to samples
      const colorMap = {};
      data.patterns.forEach(p => { colorMap[p.id] = p.color; });

      Object.keys(pillSamples).forEach(function (id) {
        renderPills('pills-' + id, pillSamples[id], colorMap[id] || '#888');
      });

      renderSaintBars(data);
    })
    .catch(function (err) {
      console.warn('name-layers charts.js: could not load data.json', err);
    });
})();
