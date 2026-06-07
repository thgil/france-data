/**
 * commune-names/charts.js
 * Chart.js-based charts for the commune names story.
 * Loaded via CDN in the HTML.
 */

const CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

async function loadChartJS() {
  if (window.Chart) return window.Chart;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CHART_CDN;
    s.onload = () => resolve(window.Chart);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const BAR_COLOR = '#8b2020';
const BAR_HOVER = '#b32020';

function defaultFont() {
  return { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: 12, color: INK };
}

export async function drawTopNamesChart(selector, topNames) {
  const Chart = await loadChartJS();
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const labels = topNames.map(d => d.name);
  const values = topNames.map(d => d.count);
  const maxVal = Math.max(...values);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: values.map((v, i) => i === 0 ? BAR_HOVER : BAR_COLOR),
        borderWidth: 0,
        borderRadius: 1,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: 'easeOutQuart' },
      layout: { padding: { right: 40 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: PAPER,
          borderColor: '#b8b0a0',
          borderWidth: 1,
          titleColor: INK,
          bodyColor: '#444',
          titleFont: { family: 'Georgia, serif', size: 13 },
          bodyFont: defaultFont(),
          padding: 10,
          callbacks: {
            title: items => items[0].label,
            label: item => `${item.raw} communes share this name`,
          }
        },
        datalabels: { display: false },
      },
      scales: {
        x: {
          grid: { color: '#e8e0d0', drawBorder: false },
          ticks: {
            font: defaultFont(),
            color: MUTE,
            stepSize: 1,
            precision: 0,
          },
          border: { display: false },
          max: maxVal + 1,
        },
        y: {
          grid: { display: false, drawBorder: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: INK,
          },
          border: { display: false },
        }
      }
    }
  });
}

export async function drawLengthHistogram(selector, lenDist) {
  const Chart = await loadChartJS();
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  // Build labels from 1 to 45
  const maxLen = 45;
  const labels = [];
  const values = [];
  for (let i = 1; i <= maxLen; i++) {
    labels.push(String(i));
    values.push(lenDist[i] || 0);
  }

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(l => {
          const n = Number(l);
          if (n <= 2) return BAR_HOVER;       // very short — highlight
          if (n >= 40) return BAR_HOVER;      // very long — highlight
          return BAR_COLOR;
        }),
        borderWidth: 0,
        borderRadius: 1,
        categoryPercentage: 1.0,
        barPercentage: 0.85,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: PAPER,
          borderColor: '#b8b0a0',
          borderWidth: 1,
          titleColor: INK,
          bodyColor: '#444',
          titleFont: defaultFont(),
          bodyFont: defaultFont(),
          padding: 10,
          callbacks: {
            title: items => `${items[0].label} characters`,
            label: item => `${item.raw.toLocaleString('fr-FR')} communes`,
          }
        },
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: {
            font: defaultFont(),
            color: MUTE,
            maxRotation: 0,
            callback: (val, i) => {
              const n = Number(labels[i]);
              return n === 1 || n % 5 === 0 ? String(n) : '';
            },
          },
          border: { display: false },
        },
        y: {
          grid: { color: '#e8e0d0', drawBorder: false },
          ticks: {
            font: defaultFont(),
            color: MUTE,
          },
          border: { display: false },
          title: {
            display: true,
            text: 'communes',
            font: defaultFont(),
            color: MUTE,
          }
        }
      }
    }
  });
}

export function populateTables(shortest, longest) {
  const shortTbody = document.querySelector('#table-shortest tbody');
  if (shortTbody) {
    shortTbody.innerHTML = shortest.slice(0, 12).map((c, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${escHtml(c.name)}<span class="dept-pill">${escHtml(c.dept)}</span></td>
        <td>${c.len} ch.</td>
      </tr>`
    ).join('');
  }

  const longTbody = document.querySelector('#table-longest tbody');
  if (longTbody) {
    longTbody.innerHTML = longest.slice(0, 8).map((c, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${escHtml(c.name)}<span class="dept-pill">${escHtml(c.dept)}</span></td>
        <td>${c.len} ch.</td>
      </tr>`
    ).join('');
  }
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
