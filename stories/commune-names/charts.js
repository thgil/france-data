/* commune-names/charts.js — name length histogram + duplicate names bar chart */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const ACCENT = '#b32020';
const FILL   = '#c67c00';
const FILL_LIGHT = '#e8d8b0';

/* ── Length distribution data ───────────────────────────────────────── */
const LENGTH_DATA = [
  {length:'1',count:1},{length:'2',count:13},{length:'3',count:154},
  {length:'4',count:720},{length:'5',count:1969},{length:'6',count:3223},
  {length:'7',count:3695},{length:'8',count:3695},{length:'9',count:3000},
  {length:'10',count:2522},{length:'11',count:1884},{length:'12',count:1435},
  {length:'13',count:1167},{length:'14',count:1018},{length:'15',count:1095},
  {length:'16',count:1177},{length:'17',count:1186},{length:'18',count:1202},
  {length:'19',count:1117},{length:'20',count:1028},{length:'21',count:923},
  {length:'22',count:819},{length:'23',count:649},{length:'24',count:501},
  {length:'25',count:329},{length:'26+',count:492},
];

/* ── Duplicate names data ───────────────────────────────────────────── */
const DUPE_DATA = [
  {name:'Sainte-Colombe',count:12},{name:'Saint-Sauveur',count:11},
  {name:'Saint-Aubin',count:10},{name:'Beaulieu',count:10},
  {name:'Saint-Marcel',count:9},{name:'Saint-Michel',count:9},
  {name:'Le Pin',count:9},{name:'Saint-Pierre',count:9},
  {name:'Sainte-Marie',count:9},{name:'Saint-Rémy',count:8},
  {name:'Saint-Clément',count:8},{name:'Saint-Hilaire',count:8},
  {name:'Saint-Loup',count:8},{name:'Beaumont',count:8},
  {name:'Verrières',count:8},
];

/* ── Sainte-Colombe chips ────────────────────────────────────────────── */
const COLOMBES = [
  {dept:'05',name:'Hautes-Alpes',pop:59},
  {dept:'17',name:'Charente-Maritime',pop:107},
  {dept:'25',name:'Doubs',pop:464},
  {dept:'33',name:'Gironde',pop:426},
  {dept:'35',name:'Ille-et-Vilaine',pop:360},
  {dept:'40',name:'Landes',pop:622},
  {dept:'46',name:'Lot',pop:230},
  {dept:'50',name:'Manche',pop:184},
  {dept:'69',name:'Rhône',pop:1953},
  {dept:'76',name:'Seine-Maritime',pop:222},
  {dept:'77',name:'Seine-et-Marne',pop:1793},
  {dept:'89',name:'Yonne',pop:185},
];

function buildColombeChips() {
  const container = document.getElementById('colombe-chips');
  if (!container) return;
  container.innerHTML = COLOMBES.map(c =>
    `<span class="colombe-chip"><span class="colombe-dept">${c.dept}</span> ${c.name} <span style="color:#aaa;font-size:11px">(pop. ${c.pop.toLocaleString('fr-FR')})</span></span>`
  ).join('');
}

function buildLengthChart() {
  const canvas = document.getElementById('chart-lengths');
  if (!canvas) return;

  const labels = LENGTH_DATA.map(d => d.length);
  const values = LENGTH_DATA.map(d => d.count);
  const colors = values.map((_, i) => (i === 6 || i === 7) ? FILL : FILL_LIGHT);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `${ctx[0].label} characters`,
            label: ctx => `${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
          backgroundColor: '#faf7f2',
          titleColor: INK,
          bodyColor: '#444',
          borderColor: '#b8b0a0',
          borderWidth: 1,
          padding: 10,
          titleFont: { family: 'Georgia, serif', size: 13 },
          bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
        },
        annotation: {},
      },
      scales: {
        x: {
          ticks: {
            color: MUTE,
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            maxRotation: 0,
          },
          grid: { display: false },
          border: { color: '#d8d0c0' },
        },
        y: {
          ticks: {
            color: MUTE,
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            callback: v => v.toLocaleString('fr-FR'),
            maxTicksLimit: 5,
          },
          grid: { color: '#ede8e0' },
          border: { display: false },
        },
      },
    },
  });
}

function buildDupeChart() {
  const canvas = document.getElementById('chart-dupes');
  if (!canvas) return;

  const sorted = [...DUPE_DATA].reverse();
  const labels = sorted.map(d => d.name);
  const values = sorted.map(d => d.count);
  const colors = values.map((v, i) => i === sorted.length - 1 ? ACCENT : FILL_LIGHT);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
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
            title: ctx => ctx[0].label,
            label: ctx => `${ctx.parsed.x} communes share this name`,
          },
          backgroundColor: '#faf7f2',
          titleColor: INK,
          bodyColor: '#444',
          borderColor: '#b8b0a0',
          borderWidth: 1,
          padding: 10,
          titleFont: { family: 'Georgia, serif', size: 13 },
          bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
        },
      },
      scales: {
        x: {
          min: 0,
          max: 14,
          ticks: {
            color: MUTE,
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            stepSize: 2,
          },
          grid: { color: '#ede8e0' },
          border: { display: false },
        },
        y: {
          ticks: {
            color: INK,
            font: { family: 'Georgia, serif', size: 12 },
          },
          grid: { display: false },
          border: { color: '#d8d0c0' },
        },
      },
    },
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildColombeChips();
  buildLengthChart();
  buildDupeChart();
});
