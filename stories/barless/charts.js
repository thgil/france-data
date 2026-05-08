// stories/barless/charts.js
// Draws the tier chart (% of communes with no bar, by population size)
// and the large-barless-towns table.

const TIERS = [
  { label: "Under 100",   total: 3513,  barless: 3389, pct: 96.5 },
  { label: "100–499",     total: 14913, barless: 12967, pct: 87.0 },
  { label: "500–999",     total: 6593,  barless: 4347,  pct: 65.9 },
  { label: "1,000–1,999", total: 4519,  barless: 1900,  pct: 42.0 },
  { label: "2,000–4,999", total: 3228,  barless: 589,   pct: 18.2 },
  { label: "5,000–9,999", total: 1191,  barless: 65,    pct: 5.5  },
  { label: "10,000–19,999", total: 537, barless: 8,     pct: 1.5  },
  { label: "20,000+",     total: 520,   barless: 0,     pct: 0.0  },
];

const LARGE_BARLESS = [
  { name: "Villefontaine",           dept: "38", pop: 19083, note: "Planned new town, Grenoble area" },
  { name: "Fontenay-le-Fleury",      dept: "78", pop: 13455, note: "Western Paris suburb" },
  { name: "Allonnes",                dept: "72", pop: 11013, note: "Suburb of Le Mans" },
  { name: "Castelginest",            dept: "31", pop: 10876, note: "Suburb of Toulouse" },
  { name: "Parempuyre",              dept: "33", pop: 10142, note: "Suburb of Bordeaux" },
  { name: "Saint-Pierre-du-Mont",    dept: "40", pop: 9871,  note: "Near Mont-de-Marsan" },
  { name: "Saint-Lys",               dept: "31", pop: 9686,  note: "Suburb of Toulouse" },
  { name: "Fontaine-lès-Dijon",      dept: "21", pop: 8847,  note: "Suburb of Dijon" },
  { name: "Périgny",                 dept: "17", pop: 8741,  note: "Near La Rochelle" },
  { name: "La Salvetat-Saint-Gilles",dept: "31", pop: 8524,  note: "Suburb of Toulouse" },
  { name: "Wintzenheim",             dept: "68", pop: 7989,  note: "Alsace — droit local" },
  { name: "Boussy-Saint-Antoine",    dept: "91", pop: 7980,  note: "Paris suburb (Essonne)" },
  { name: "Claix",                   dept: "38", pop: 7859,  note: "Suburb of Grenoble" },
  { name: "Martignas-sur-Jalle",     dept: "33", pop: 7850,  note: "Suburb of Bordeaux" },
  { name: "Eckbolsheim",             dept: "67", pop: 7199,  note: "Alsace — droit local" },
];

function fmtNum(n) {
  return n.toLocaleString("fr-FR");
}

export function drawTierChart(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const maxPct = 100;

  const rows = TIERS.map(tier => {
    const barPct = (tier.pct / maxPct) * 100;
    const opacity = tier.pct === 0 ? 0 : 0.18 + (tier.pct / 100) * 0.72;
    const bgColor = `rgba(179, 32, 32, ${opacity.toFixed(2)})`;

    return `<div class="tier-row">
      <div class="tier-label">${tier.label}</div>
      <div class="tier-bar-wrap">
        <div class="tier-bar" style="width:${barPct.toFixed(1)}%;background:${bgColor}"></div>
      </div>
      <div class="tier-pct">${tier.pct === 0 ? "0%" : tier.pct + "%"}</div>
      <div class="tier-count">${fmtNum(tier.barless)} / ${fmtNum(tier.total)}</div>
    </div>`;
  }).join("");

  container.innerHTML = `<div class="tier-chart">${rows}</div>`;
}

export function drawBarlessTable(selector) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;

  tbody.innerHTML = LARGE_BARLESS.map((c, i) => `<tr>
    <td class="rank">${i + 1}</td>
    <td class="place">${c.name}</td>
    <td class="note-col">${c.note}</td>
    <td>${fmtNum(c.pop)}</td>
  </tr>`).join("");
}
