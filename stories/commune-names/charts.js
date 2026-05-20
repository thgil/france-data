// Pre-computed from 35,014 communes (INSEE COG / DREES APL 2023)

const TOP20 = [
  { name: 'Sainte-Colombe', count: 12 },
  { name: 'Saint-Sauveur',  count: 11 },
  { name: 'Saint-Aubin',    count: 10 },
  { name: 'Beaulieu',       count: 10 },
  { name: 'Saint-Marcel',   count:  9 },
  { name: 'Saint-Michel',   count:  9 },
  { name: 'Le Pin',         count:  9 },
  { name: 'Saint-Pierre',   count:  9 },
  { name: 'Sainte-Marie',   count:  9 },
  { name: 'Saint-Rémy',     count:  8 },
  { name: 'Saint-Clément',  count:  8 },
  { name: 'Saint-Hilaire',  count:  8 },
  { name: 'Saint-Loup',     count:  8 },
  { name: 'Beaumont',       count:  8 },
  { name: 'Verrières',      count:  8 },
  { name: 'Saint-Hippolyte',count:  8 },
  { name: 'Saint-Georges',  count:  8 },
  { name: 'Saint-Médard',   count:  8 },
  { name: 'Saint-Paul',     count:  8 },
  { name: 'Brion',          count:  7 },
];

const DUP_TOP20 = [
  { name: 'Sainte-Colombe', count: 12, depts: '05·17·25·33·35·40·46·50·69·76·77·89' },
  { name: 'Saint-Sauveur',  count: 11, depts: '05·21·24·29·31·33·38·54·60·70·80' },
  { name: 'Saint-Aubin',    count: 10, depts: '02·10·21·36·39·40·47·59·62·91' },
  { name: 'Beaulieu',       count: 10, depts: '07·15·21·34·36·38·43·58·61·63' },
  { name: 'Saint-Marcel',   count:  9, depts: '01·08·27·36·54·56·70·71·73' },
  { name: 'Saint-Michel',   count:  9, depts: '02·09·16·31·32·34·45·64·82' },
  { name: 'Le Pin',         count:  9, depts: '03·14·17·30·39·44·77·79·82' },
  { name: 'Saint-Pierre',   count:  9, depts: '04·15·31·39·51·67·97×3' },
  { name: 'Sainte-Marie',   count:  9, depts: '08·15·25·32·35·58·65·97×2' },
  { name: 'Saint-Rémy',     count:  8, depts: '01·12·14·19·21·24·71·79' },
  { name: 'Saint-Clément',  count:  8, depts: '02·03·07·15·19·30·54·89' },
  { name: 'Saint-Hilaire',  count:  8, depts: '03·11·25·31·43·46·63·91' },
  { name: 'Saint-Loup',     count:  8, depts: '03·17·23·39·41·50·51·82' },
  { name: 'Beaumont',       count:  8, depts: '07·19·32·43·54·63·74·89' },
  { name: 'Verrières',      count:  8, depts: '08·10·12·16·51·61·63·86' },
  { name: 'Saint-Hippolyte',count:  8, depts: '12·15·17·25·33·37·66·68' },
  { name: 'Saint-Georges',  count:  8, depts: '15·16·32·47·57·62·82·97' },
  { name: 'Saint-Médard',   count:  8, depts: '16·17·31·32·36·46·57·64' },
  { name: 'Saint-Paul',     count:  8, depts: '19·33·60·61·65·87·88·97' },
  { name: 'Brion',          count:  7, depts: '01·36·38·48·71·86·89' },
];

export function drawNamesChart(selector) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const labels  = TOP20.map(d => d.name).reverse();
  const values  = TOP20.map(d => d.count).reverse();
  const isSaint = labels.map(l => l.startsWith('Saint') || l.startsWith('Sainte'));

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: isSaint.map(s => s ? '#b32020' : '#5a7fa0'),
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
            label: ctx => ` ${ctx.parsed.x} communes named ${ctx.label}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#ede8e0' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'number of communes with this name',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#aaa',
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 13 },
            color: ctx => isSaint[ctx.index] ? '#b32020' : '#1a1a1a',
          },
        },
      },
    },
  });
}

export function populateDupGrid(selector) {
  const grid = document.querySelector(selector);
  if (!grid) return;

  grid.innerHTML = DUP_TOP20.map(d => `
    <div class="dup-row">
      <span class="dup-name">${d.name}</span>
      <span class="dup-count">${d.count}×</span>
      <span class="dup-depts">${d.depts}</span>
    </div>
  `).join('');
}
