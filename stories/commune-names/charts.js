import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

async function main() {
  const res = await fetch('./data.json');
  const data = await res.json();

  // ── Stat callouts ──────────────────────────────────────────────────
  document.getElementById('stat-total').textContent = data.total.toLocaleString('fr-FR');
  document.getElementById('stat-unique').textContent = data.uniqueNames.toLocaleString('fr-FR');
  document.getElementById('stat-saint').textContent = data.saintTotal.toLocaleString('fr-FR');

  // ── Top names bar chart ────────────────────────────────────────────
  const top20 = data.topNames.slice(0, 20).reverse();

  const chartTopNames = Plot.plot({
    marginLeft: 180,
    marginRight: 40,
    marginTop: 10,
    marginBottom: 30,
    width: 680,
    height: 420,
    x: { label: 'Number of communes →', grid: true },
    y: { label: null },
    marks: [
      Plot.barX(top20, {
        y: 'name',
        x: 'count',
        fill: '#b32020',
        sort: { y: 'x' },
      }),
      Plot.text(top20, {
        y: 'name',
        x: 'count',
        text: d => d.count,
        dx: 6,
        fontSize: 11,
        fill: '#444',
      }),
      Plot.ruleX([0]),
    ],
    style: {
      fontFamily: 'var(--sans, Helvetica Neue, sans-serif)',
      fontSize: '12px',
      background: 'transparent',
    },
  });

  document.getElementById('chart-top-names').appendChild(chartTopNames);

  // ── Name length distribution ───────────────────────────────────────
  // Group lengths into bins for clarity
  const lengthBins = [];
  for (const { length, count } of data.lengthDistribution) {
    if (length <= 30) {
      lengthBins.push({ length, count });
    } else {
      const last = lengthBins[lengthBins.length - 1];
      if (last && last.length === 31) {
        last.count += count;
        last.label = '31+';
      } else {
        lengthBins.push({ length: 31, count, label: '31+' });
      }
    }
  }

  const chartLength = Plot.plot({
    marginLeft: 50,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 40,
    width: 680,
    height: 240,
    x: {
      label: 'Name length (characters) →',
      tickFormat: d => d === 31 ? '31+' : d,
    },
    y: { label: '← Communes', grid: true },
    marks: [
      Plot.barY(lengthBins, {
        x: 'length',
        y: 'count',
        fill: '#b32020',
        fillOpacity: 0.75,
      }),
      Plot.ruleY([0]),
    ],
    style: {
      fontFamily: 'var(--sans, Helvetica Neue, sans-serif)',
      fontSize: '12px',
      background: 'transparent',
    },
  });

  document.getElementById('chart-length-dist').appendChild(chartLength);

  // ── Shortest names table ────────────────────────────────────────────
  const shortestTbody = document.querySelector('#table-shortest tbody');
  if (shortestTbody) {
    shortestTbody.innerHTML = data.shortest.slice(0, 10).map(d => `
      <tr>
        <td class="place">${d.name}</td>
        <td>${d.length} char${d.length === 1 ? '' : 's'} · dept ${d.dept} · pop ${d.pop.toLocaleString('fr-FR')}</td>
      </tr>
    `).join('');
  }

  // ── Longest names table ─────────────────────────────────────────────
  const longestTbody = document.querySelector('#table-longest tbody');
  if (longestTbody) {
    longestTbody.innerHTML = data.longest.slice(0, 8).map(d => `
      <tr>
        <td class="place">${d.name}</td>
        <td>${d.length} chars · dept ${d.dept}</td>
      </tr>
    `).join('');
  }

  // ── Naming patterns bar table ───────────────────────────────────────
  const patternsEl = document.getElementById('patterns-list');
  if (patternsEl && data.namingPatterns) {
    const maxCount = Math.max(...data.namingPatterns.map(p => p.count));
    patternsEl.innerHTML = `
      <table>
        <thead>
          <tr>
            <td style="font-family:var(--sans);font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #ccc;">Prefix</td>
            <td style="font-family:var(--sans);font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #ccc;width:40%"></td>
            <td style="font-family:var(--sans);font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #ccc;text-align:right">Communes</td>
          </tr>
        </thead>
        <tbody>
          ${data.namingPatterns.map(p => `
            <tr>
              <td class="place">${p.prefix}</td>
              <td class="bar-cell">
                <div class="bar-bg">
                  <div class="bar-fill" style="width:${(p.count / maxCount * 100).toFixed(1)}%"></div>
                </div>
              </td>
              <td>${p.count.toLocaleString('fr-FR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

main().catch(err => console.error('commune-names charts error:', err));
