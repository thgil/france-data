// charts.js — name-twins story visuals

const DEPT_NAMES = {
  '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence','05':'Hautes-Alpes',
  '06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes','09':'Ariège','10':'Aube',
  '11':'Aude','12':'Aveyron','13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal',
  '16':'Charente','17':'Charente-Maritime','18':'Cher','19':'Corrèze','2A':'Corse-du-Sud',
  '2B':'Haute-Corse','21':'Côte-d\'Or','22':'Côtes-d\'Armor','23':'Creuse','24':'Dordogne',
  '25':'Doubs','26':'Drôme','27':'Eure','28':'Eure-et-Loir','29':'Finistère',
  '30':'Gard','31':'Haute-Garonne','32':'Gers','33':'Gironde','34':'Hérault',
  '35':'Ille-et-Vilaine','36':'Indre','37':'Indre-et-Loire','38':'Isère','39':'Jura',
  '40':'Landes','41':'Loir-et-Cher','42':'Loire','43':'Haute-Loire','44':'Loire-Atlantique',
  '45':'Loiret','46':'Lot','47':'Lot-et-Garonne','48':'Lozère','49':'Maine-et-Loire',
  '50':'Manche','51':'Marne','52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle',
  '55':'Meuse','56':'Morbihan','57':'Moselle','58':'Nièvre','59':'Nord',
  '60':'Oise','61':'Orne','62':'Pas-de-Calais','63':'Puy-de-Dôme','64':'Pyrénées-Atlantiques',
  '65':'Hautes-Pyrénées','66':'Pyrénées-Orientales','67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône',
  '70':'Haute-Saône','71':'Saône-et-Loire','72':'Sarthe','73':'Savoie','74':'Haute-Savoie',
  '75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne','78':'Yvelines','79':'Deux-Sèvres',
  '80':'Somme','81':'Tarn','82':'Tarn-et-Garonne','83':'Var','84':'Vaucluse',
  '85':'Vendée','86':'Vienne','87':'Haute-Vienne','88':'Vosges','89':'Yonne',
  '90':'Territoire de Belfort','91':'Essonne','92':'Hauts-de-Seine','93':'Seine-Saint-Denis',
  '94':'Val-de-Marne','95':'Val-d\'Oise','971':'Guadeloupe','972':'Martinique',
  '973':'Guyane','974':'La Réunion','976':'Mayotte',
};

function deptName(code) {
  return DEPT_NAMES[code] || `Dept. ${code}`;
}

/* ── Short commune chip grid ─────────────────────────────────────────── */
export function renderShortGrid(selector, communes) {
  const el = document.querySelector(selector);
  if (!el) return;

  el.innerHTML = communes.map(c => {
    const isY = c.name === 'Y';
    const pop = (c.pop || 0).toLocaleString('fr-FR');
    const dept = deptName(c.dept);
    return `<div class="name-chip${isY ? ' y-chip' : ''}">
      <span class="chip-name">${c.name}</span>
      <span class="chip-meta">${pop} hab. · ${dept}</span>
    </div>`;
  }).join('');
}

/* ── Top names horizontal bar chart (Chart.js) ───────────────────────── */
export function drawTopNamesChart(selector, topNames) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
  script.onload = () => {
    const labels = topNames.map(d => d.name);
    const values = topNames.map(d => d.count);
    const colors = labels.map(l =>
      l === 'Sainte-Colombe' ? '#b32020' : '#8b7355'
    );

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Communes sharing this name',
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 2,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.raw} communes share this name`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 13,
            ticks: {
              stepSize: 1,
              font: { family: "'Helvetica Neue', sans-serif", size: 11 },
              color: '#888',
            },
            grid: { color: '#ece8e0' },
          },
          y: {
            ticks: {
              font: { family: 'Georgia, serif', size: 13 },
              color: '#1a1a1a',
            },
            grid: { display: false },
          },
        },
        layout: { padding: { right: 16 } },
      },
    });
  };
  document.head.appendChild(script);
}

/* ── Sainte-Colombe scatter map (MapLibre GL) ────────────────────────── */
export function drawColombeMap(selector, topEntry) {
  const container = document.querySelector(selector);
  if (!container || !topEntry) return;
  container.innerHTML = '';

  const communes = topEntry.communes.filter(c =>
    c.lng > -6 && c.lng < 10 && c.lat > 41 && c.lat < 52
  );

  import('https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js').then(({ default: maplibregl }) => {
    const map = new maplibregl.Map({
      container,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [2.5, 46.8],
      zoom: 4.8,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);

    map.on('load', () => {
      const geojson = {
        type: 'FeatureCollection',
        features: communes.map(c => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
          properties: {
            name: c.name,
            pop: c.pop,
            dept: c.dept,
            deptName: deptName(c.dept),
          },
        })),
      };

      map.addSource('colombes', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'colombe-halo',
        type: 'circle',
        source: 'colombes',
        paint: {
          'circle-radius': 14,
          'circle-color': '#b32020',
          'circle-opacity': 0.12,
        },
      });

      map.addLayer({
        id: 'colombe-dot',
        type: 'circle',
        source: 'colombes',
        paint: {
          'circle-radius': 6,
          'circle-color': '#b32020',
          'circle-opacity': 0.9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
        },
      });

      map.on('mouseenter', 'colombe-dot', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const p = e.features[0].properties;
        const pop = (p.pop || 0).toLocaleString('fr-FR');
        tooltip.innerHTML = `
          <span class="tt-name">${p.name}</span>
          <span class="tt-row">Dept. ${p.dept} — ${p.deptName}</span>
          <span class="tt-row">${pop} inhabitants</span>`;
        tooltip.style.display = 'block';
      });

      map.on('mousemove', 'colombe-dot', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.originalEvent.clientX - rect.left + 12;
        const y = e.originalEvent.clientY - rect.top - 12;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      });

      map.on('mouseleave', 'colombe-dot', () => {
        map.getCanvas().style.cursor = '';
        tooltip.style.display = 'none';
      });
    });
  });
}
