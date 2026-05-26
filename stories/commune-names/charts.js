/* charts.js — commune-names story */

const COLORS = {
  red:    '#b32020',
  redLt:  '#d45f5f',
  ink:    '#1a1a1a',
  muted:  '#888',
  paper:  '#faf7f2',
  rule:   '#d8d0c0',
  bar:    '#b32020',
  barLt:  'rgba(179,32,32,0.18)',
};

function baseChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: COLORS.paper,
        borderColor: COLORS.rule,
        borderWidth: 1,
        titleColor: COLORS.ink,
        bodyColor: COLORS.ink,
        titleFont: { family: 'Georgia, serif', size: 13 },
        bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 2,
      },
    },
    scales: {
      x: {
        ticks: {
          font: { family: "'Helvetica Neue', sans-serif", size: 11 },
          color: COLORS.muted,
        },
        grid: { color: 'rgba(0,0,0,0.06)' },
        border: { color: COLORS.rule },
      },
      y: {
        ticks: {
          font: { family: 'Georgia, serif', size: 12 },
          color: COLORS.ink,
        },
        grid: { display: false },
        border: { color: COLORS.rule },
      },
    },
  };
}

export function drawDupesChart(canvasId, topDupes) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const labels = topDupes.map(d => d.name);
  const values = topDupes.map(d => d.count);

  const opts = baseChartOptions();
  opts.indexAxis = 'y';
  opts.scales.x.ticks = {
    ...opts.scales.x.ticks,
    stepSize: 1,
    font: { family: "'Helvetica Neue', sans-serif", size: 11 },
    color: COLORS.muted,
  };
  opts.scales.y.ticks = {
    font: { family: 'Georgia, serif', size: 12 },
    color: COLORS.ink,
  };
  opts.plugins.tooltip.callbacks = {
    title: items => items[0].label,
    label: item => ` ${item.raw} communes share this name`,
  };

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, i) => i === 0 ? COLORS.red : COLORS.redLt),
        borderColor: labels.map((_, i) => i === 0 ? COLORS.red : 'rgba(179,32,32,0.4)'),
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: opts,
  });
}

export function drawLengthChart(canvasId, lengthDist) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Group short lengths individually, bin longer ones for readability
  const filtered = lengthDist.filter(d => d.length >= 1 && d.length <= 45);
  const labels = filtered.map(d => d.length === 1 ? '1' : d.length % 5 === 0 ? String(d.length) : '');
  const displayLabels = filtered.map(d => String(d.length));

  const opts = baseChartOptions();
  opts.scales.x = {
    ...opts.scales.x,
    ticks: {
      font: { family: "'Helvetica Neue', sans-serif", size: 10 },
      color: COLORS.muted,
      maxRotation: 0,
      callback: function(val, idx) {
        const l = filtered[idx]?.length;
        if (!l) return '';
        if (l === 1 || l % 5 === 0) return l;
        return '';
      },
    },
    title: {
      display: true,
      text: 'Name length (characters)',
      font: { family: "'Helvetica Neue', sans-serif", size: 11 },
      color: COLORS.muted,
    },
  };
  opts.scales.y = {
    ...opts.scales.y,
    ticks: {
      font: { family: "'Helvetica Neue', sans-serif", size: 11 },
      color: COLORS.muted,
    },
    title: {
      display: true,
      text: 'Number of communes',
      font: { family: "'Helvetica Neue', sans-serif", size: 11 },
      color: COLORS.muted,
    },
    grid: { color: 'rgba(0,0,0,0.06)' },
    border: { color: COLORS.rule },
  };
  opts.plugins.tooltip.callbacks = {
    title: items => `${items[0].label} characters`,
    label: item => ` ${item.raw.toLocaleString('fr-FR')} communes`,
  };

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: displayLabels,
      datasets: [{
        data: filtered.map(d => d.count),
        backgroundColor: filtered.map(d => {
          if (d.length === 1) return COLORS.red;
          if (d.length <= 2) return COLORS.redLt;
          if (d.length >= 38) return COLORS.redLt;
          return 'rgba(179,32,32,0.22)';
        }),
        borderColor: 'rgba(179,32,32,0.35)',
        borderWidth: 1,
        borderRadius: 1,
        barPercentage: 0.95,
        categoryPercentage: 0.95,
      }],
    },
    options: opts,
  });
}

export function drawSaintChart(canvasId, topSaintDepts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // dept code → name mapping for key ones
  const deptNames = {
    '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence','05':'Hautes-Alpes',
    '06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes','09':'Ariège','10':'Aube',
    '11':'Aude','12':'Aveyron','13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal',
    '16':'Charente','17':'Charente-Maritime','18':'Cher','19':'Corrèze','21':'Côte-d\'Or',
    '22':'Côtes-d\'Armor','23':'Creuse','24':'Dordogne','25':'Doubs','26':'Drôme',
    '27':'Eure','28':'Eure-et-Loir','29':'Finistère','30':'Gard','31':'Haute-Garonne',
    '32':'Gers','33':'Gironde','34':'Hérault','35':'Ille-et-Vilaine','36':'Indre',
    '37':'Indre-et-Loire','38':'Isère','39':'Jura','40':'Landes','41':'Loir-et-Cher',
    '42':'Loire','43':'Haute-Loire','44':'Loire-Atlantique','45':'Loiret','46':'Lot',
    '47':'Lot-et-Garonne','48':'Lozère','49':'Maine-et-Loire','50':'Manche','51':'Marne',
    '52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle','55':'Meuse','56':'Morbihan',
    '57':'Moselle','58':'Nièvre','59':'Nord','60':'Oise','61':'Orne','62':'Pas-de-Calais',
    '63':'Puy-de-Dôme','64':'Pyrénées-Atlantiques','65':'Hautes-Pyrénées','66':'Pyrénées-Orientales',
    '67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône','70':'Haute-Saône','71':'Saône-et-Loire',
    '72':'Sarthe','73':'Savoie','74':'Haute-Savoie','75':'Paris','76':'Seine-Maritime',
    '77':'Seine-et-Marne','78':'Yvelines','79':'Deux-Sèvres','80':'Somme','81':'Tarn',
    '82':'Tarn-et-Garonne','83':'Var','84':'Vaucluse','85':'Vendée','86':'Vienne',
    '87':'Haute-Vienne','88':'Vosges','89':'Yonne','90':'Territoire de Belfort',
    '91':'Essonne','92':'Hauts-de-Seine','93':'Seine-Saint-Denis','94':'Val-de-Marne',
    '95':'Val-d\'Oise','97':'DOM-TOM',
  };

  const top15 = topSaintDepts.slice(0, 15);
  const labels = top15.map(d => deptNames[d.dept] || `Dept ${d.dept}`);
  const values = top15.map(d => d.pct);

  const opts = baseChartOptions();
  opts.indexAxis = 'y';
  opts.scales.x = {
    ...opts.scales.x,
    ticks: {
      font: { family: "'Helvetica Neue', sans-serif", size: 11 },
      color: COLORS.muted,
      callback: v => `${v}%`,
    },
    title: {
      display: true,
      text: '% of communes with Saint-/Sainte- name',
      font: { family: "'Helvetica Neue', sans-serif", size: 11 },
      color: COLORS.muted,
    },
    max: 35,
    grid: { color: 'rgba(0,0,0,0.06)' },
    border: { color: COLORS.rule },
  };
  opts.scales.y.ticks = {
    font: { family: 'Georgia, serif', size: 12 },
    color: COLORS.ink,
  };
  opts.plugins.tooltip.callbacks = {
    title: items => items[0].label,
    label: item => {
      const d = top15[item.dataIndex];
      return ` ${item.raw}% — ${d.saints} of ${d.total} communes`;
    },
  };

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: top15.map((_, i) => i === 0 ? COLORS.red : COLORS.redLt),
        borderColor: top15.map((_, i) => i === 0 ? COLORS.red : 'rgba(179,32,32,0.4)'),
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: opts,
  });
}
