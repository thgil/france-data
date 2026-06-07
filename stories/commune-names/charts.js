// Pre-computed stats extracted from communes-apl.geojson (35,014 communes)
export const STATS = {
  total: 35014,
  distinct: 32764,
  duplicates: 2250,
  avgLength: 11.8,
  hyphenated: 13410,
  withArticle: 2220,
  totalSaints: 3891,

  shortest: [
    { name: "Y",  dept: "Somme (80)",      pop: 89 },
    { name: "Sy", dept: "Ardennes (08)",   pop: 54 },
    { name: "By", dept: "Doubs (25)",      pop: 86 },
    { name: "Bû", dept: "Eure-et-Loir (28)", pop: 2022 },
    { name: "Oô", dept: "Haute-Garonne (31)", pop: 103 },
    { name: "Oz", dept: "Isère (38)",       pop: 213 },
    { name: "Eu", dept: "Seine-Maritime (76)", pop: 6591 },
    { name: "Gy", dept: "Haute-Saône (70)", pop: 1001 },
  ],

  longest: [
    { name: "Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson", dept: "Marne (51)", pop: 491, len: 45 },
    { name: "Beaujeu-Saint-Vallier-Pierrejux-et-Quitteur",   dept: "Haute-Saône (70)", pop: 1047, len: 43 },
    { name: "Saint-Martin-de-Bienfaite-la-Cressonnière",     dept: "Calvados (14)",    pop: 758, len: 41 },
    { name: "Montigny-Mornay-Villeneuve-sur-Vingeanne",      dept: "Côte-d'Or (21)",   pop: 439, len: 40 },
    { name: "La Vacquerie-et-Saint-Martin-de-Castries",      dept: "Hérault (34)",     pop: 421, len: 40 },
  ],

  topRepeated: [
    { name: "Sainte-Colombe", count: 12 },
    { name: "Saint-Sauveur",  count: 11 },
    { name: "Saint-Aubin",    count: 10 },
    { name: "Beaulieu",       count: 10 },
    { name: "Saint-Marcel",   count: 9  },
    { name: "Saint-Michel",   count: 9  },
    { name: "Le Pin",         count: 9  },
    { name: "Saint-Pierre",   count: 9  },
    { name: "Sainte-Marie",   count: 9  },
    { name: "Saint-Rémy",     count: 8  },
    { name: "Saint-Clément",  count: 8  },
    { name: "Saint-Hilaire",  count: 8  },
    { name: "Saint-Loup",     count: 8  },
    { name: "Beaumont",       count: 8  },
    { name: "Verrières",      count: 8  },
    { name: "Saint-Hippolyte",count: 8  },
    { name: "Saint-Georges",  count: 8  },
    { name: "Saint-Médard",   count: 8  },
    { name: "Saint-Paul",     count: 8  },
    { name: "Brion",          count: 7  },
  ],

  lengthDist: [
    {len:1,count:1},{len:2,count:13},{len:3,count:154},{len:4,count:720},
    {len:5,count:1969},{len:6,count:3223},{len:7,count:3695},{len:8,count:3695},
    {len:9,count:3000},{len:10,count:2522},{len:11,count:1884},{len:12,count:1435},
    {len:13,count:1167},{len:14,count:1018},{len:15,count:1095},{len:16,count:1177},
    {len:17,count:1186},{len:18,count:1202},{len:19,count:1117},{len:20,count:1028},
    {len:21,count:923},{len:22,count:819},{len:23,count:649},{len:24,count:501},
    {len:25,count:329},{len:26,count:200},{len:27,count:105},{len:28,count:55},
    {len:29,count:53},{len:30,count:29},{len:31,count:12},{len:32,count:8},
    {len:33,count:2},{len:34,count:6},{len:35,count:7},{len:36,count:2},
    {len:37,count:3},{len:38,count:3},{len:39,count:1},{len:40,count:3},
    {len:41,count:1},{len:43,count:1},{len:45,count:1}
  ]
};

export function drawRepeatedChart(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = STATS.topRepeated.slice(0, 15);
  const maxCount = data[0].count;

  const isSaint = name => /^sainte?[-\s]/i.test(name);

  container.innerHTML = data.map(d => {
    const pct = (d.count / maxCount * 100).toFixed(1);
    const saint = isSaint(d.name);
    return `
      <div class="bar-row">
        <div class="bar-label">${d.name}</div>
        <div class="bar-track">
          <div class="bar-fill${saint ? ' bar-saint' : ''}" style="width:${pct}%"></div>
        </div>
        <div class="bar-value">${d.count}</div>
      </div>`;
  }).join('');
}

export function drawLengthChart(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Group into buckets of 3 for readability
  const buckets = [];
  for (let lo = 1; lo <= 45; lo += 3) {
    const hi = lo + 2;
    const count = STATS.lengthDist
      .filter(d => d.len >= lo && d.len <= hi)
      .reduce((s, d) => s + d.count, 0);
    buckets.push({ lo, hi, count });
  }
  const maxCount = Math.max(...buckets.map(b => b.count));

  container.innerHTML = buckets.map(b => {
    const pct = (b.count / maxCount * 100).toFixed(1);
    const label = b.lo === b.hi ? `${b.lo}` : `${b.lo}–${b.hi}`;
    const isAvg = b.lo <= 12 && b.hi >= 10;
    return `
      <div class="hist-col${isAvg ? ' hist-avg' : ''}">
        <div class="hist-bar" style="height:${pct}%"></div>
        <div class="hist-label">${label}</div>
      </div>`;
  }).join('');
}
