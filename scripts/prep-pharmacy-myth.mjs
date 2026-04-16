// scripts/prep-pharmacy-myth.mjs
// Downloads the three IDF source CSVs, processes them, and writes
// pharmacies.json, communes.geojson, data-meta.json into stories/pharmacy-myth/.
//
// Run: node scripts/prep-pharmacy-myth.mjs
//
// Idempotent — overwrites outputs each run. No network on subsequent
// page loads; the published site reads only the produced files.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'stories', 'pharmacy-myth');

mkdirSync(OUT, { recursive: true });

const URLS = {
  pharmacyPoints: 'https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/carte-des-pharmacies-dile-de-france/exports/csv?use_labels=true',
  bpeSante:       'https://data.iledefrance.fr/explore/dataset/les-service-de-sante-par-commune-ou-par-arrondissement-base-permanente-des-equip/download?format=csv',
  bpeCommerces:   'https://data.iledefrance.fr/explore/dataset/les-commerces-par-commune-ou-arrondissement-base-permanente-des-equipements/download?format=csv',
};

// ---------------------------------------------------------------------------
// Fetch helper — aborts and throws on non-2xx
// ---------------------------------------------------------------------------
async function fetchText(url) {
  console.log(`Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`BLOCKED: HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

// ---------------------------------------------------------------------------
// CSV parser — handles:
//   • semicolon-separated (Opendatasoft default)
//   • double-quote text qualifier with embedded delimiters and newlines
//   • bare (unquoted) fields
// Returns: { headers: string[], rows: string[][] }
// ---------------------------------------------------------------------------
function parseCSV(text, delimiter = ';') {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        // Peek next char — escaped quote ""
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        // Closing quote
        inQuotes = false;
        i++;
        continue;
      }
      // Inside quotes: accumulate everything including \r\n
      field += ch;
      i++;
      continue;
    }

    // Outside quotes
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === delimiter) {
      row.push(field);
      field = '';
      i++;
      continue;
    }

    if (ch === '\r') {
      // Skip bare \r (Windows line endings)
      i++;
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Flush last field/row
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Remove trailing empty row that appears if file ends with \n
  while (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }

  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);

  return { headers, rows: dataRows };
}

// ---------------------------------------------------------------------------
// Convert parsed rows to array of objects using the header row
// ---------------------------------------------------------------------------
function toObjects(headers, rows) {
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined ? row[i].trim() : '';
    });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Build an address string from pharmacy point columns, skipping empty parts
// ---------------------------------------------------------------------------
function buildAddress(row) {
  const parts = [
    row['numvoie'],
    row['typvoie'],
    row['voie'],
  ].filter(Boolean).join(' ');

  const cityParts = [row['cp'], row['commune']].filter(Boolean).join(' ');

  return [parts, cityParts].filter(Boolean).join(', ');
}

// ---------------------------------------------------------------------------
// Parse a date string like "2005-03-01T00:00:00+00:00" or "2005-03-01" to
// ISO YYYY-MM-DD, or null if missing / un-parseable
// ---------------------------------------------------------------------------
function parseDate(str) {
  if (!str || str.trim() === '') return null;
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  return match[1];
}

// ---------------------------------------------------------------------------
// Safe parse of an integer (returns 0 on falsy/NaN)
// ---------------------------------------------------------------------------
function safeInt(val) {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

// ---------------------------------------------------------------------------
// Auto-detect delimiter: check whether first line contains ';' or ','
// ---------------------------------------------------------------------------
function detectDelimiter(text) {
  const firstLine = text.split('\n')[0];
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas     = (firstLine.match(/,/g) || []).length;
  return semicolons >= commas ? ';' : ',';
}

// ===========================================================================
// MAIN
// ===========================================================================

// 1. Download all three CSVs
console.log('\n=== Downloading source CSVs ===');
const [pharmacyCsv, santeCsv, commercesCsv] = await Promise.all([
  fetchText(URLS.pharmacyPoints),
  fetchText(URLS.bpeSante),
  fetchText(URLS.bpeCommerces),
]);

console.log(`Downloaded pharmacy CSV: ${pharmacyCsv.length.toLocaleString()} bytes`);
console.log(`Downloaded BPE santé CSV: ${santeCsv.length.toLocaleString()} bytes`);
console.log(`Downloaded BPE commerces CSV: ${commercesCsv.length.toLocaleString()} bytes`);

// ---------------------------------------------------------------------------
// 2. Parse pharmacy points
// ---------------------------------------------------------------------------
console.log('\n=== Parsing pharmacy points ===');
const pharmDelim = detectDelimiter(pharmacyCsv);
console.log(`  Detected delimiter: '${pharmDelim}'`);
const { headers: pharmHeaders, rows: pharmRawRows } = parseCSV(pharmacyCsv, pharmDelim);
console.log(`  Headers: ${pharmHeaders.join(' | ')}`);
const pharmObjects = toObjects(pharmHeaders, pharmRawRows);
console.log(`  Total rows parsed (incl. potential duplicates): ${pharmObjects.length}`);

// Column name mapping (use_labels=true means display labels, but the API may
// still use technical names). We try both possibilities.
function getCol(obj, ...candidates) {
  for (const c of candidates) {
    if (obj[c] !== undefined && obj[c] !== '') return obj[c];
  }
  return '';
}

let droppedNoCoords = 0;
const pharmacies = [];

for (const row of pharmObjects) {
  // Lat/lng may come as "lat"/"lng" or "Latitude"/"Longitude" etc.
  const latRaw = getCol(row, 'lat', 'latitude', 'Latitude', 'LAT', 'geo_point_2d');
  const lngRaw = getCol(row, 'lng', 'longitude', 'Longitude', 'LNG', 'long');

  let lat, lng;

  // geo_point_2d is "lat,lng"
  if (latRaw.includes(',')) {
    const parts = latRaw.split(',');
    lat = parseFloat(parts[0]);
    lng = parseFloat(parts[1]);
  } else {
    lat = parseFloat(latRaw);
    lng = parseFloat(lngRaw);
  }

  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    droppedNoCoords++;
    continue;
  }

  const name    = getCol(row, 'rs', 'RS', 'nom', 'name') || getCol(row, 'rslongue', 'RSLONGUE');
  const commune = getCol(row, 'commune', 'COMMUNE', 'libelle_commune', 'Commune');
  const dept    = getCol(row, 'departement', 'DEPARTEMENT', 'dept', 'Département', 'DEP');
  const rawDate = getCol(row, 'dateouv', 'DATEOUV', 'date_ouv', "Date d'ouverture", 'date_ouverture');
  const address = buildAddress({
    numvoie: getCol(row, 'numvoie', 'NUMVOIE', 'num_voie', 'Numéro de voie'),
    typvoie: getCol(row, 'typvoie', 'TYPVOIE', 'typ_voie', 'Type de voie'),
    voie:    getCol(row, 'voie', 'VOIE', 'Voie'),
    cp:      getCol(row, 'cp', 'CP', 'code_postal', 'Code Postal', 'Code postal'),
    commune,
  });

  // Round coords to 5 decimal places (~1 m precision), enough for map display
  pharmacies.push({
    name,
    address,
    commune,
    dept,
    lat:  Math.round(lat  * 1e5) / 1e5,
    lng:  Math.round(lng  * 1e5) / 1e5,
    dateouv: parseDate(rawDate),
  });
}

console.log(`  Valid pharmacy points: ${pharmacies.length}`);
console.log(`  Dropped (no coords):   ${droppedNoCoords}`);

// Sort by dateouv ascending; nulls go last
pharmacies.sort((a, b) => {
  if (a.dateouv === null && b.dateouv === null) return 0;
  if (a.dateouv === null) return 1;
  if (b.dateouv === null) return -1;
  return a.dateouv < b.dateouv ? -1 : a.dateouv > b.dateouv ? 1 : 0;
});

// Date range stats
const datesNonNull = pharmacies.filter(p => p.dateouv !== null).map(p => p.dateouv);
const dateMin = datesNonNull.length ? datesNonNull[0] : 'N/A';
const dateMax = datesNonNull.length ? datesNonNull[datesNonNull.length - 1] : 'N/A';
const pctNull = ((pharmacies.length - datesNonNull.length) / pharmacies.length * 100).toFixed(1);

// Note: datesNonNull is sorted ascending from the sort above
const sortedDates = [...datesNonNull].sort();
const dateMinVal = sortedDates[0] || 'N/A';
const dateMaxVal = sortedDates[sortedDates.length - 1] || 'N/A';

console.log(`  dateouv range: ${dateMinVal} → ${dateMaxVal}  (${pctNull}% null)`);

// ---------------------------------------------------------------------------
// 3. Parse BPE santé
// ---------------------------------------------------------------------------
console.log('\n=== Parsing BPE santé ===');
const santeDelim = detectDelimiter(santeCsv);
console.log(`  Detected delimiter: '${santeDelim}'`);
const { headers: santeHeaders, rows: santeRawRows } = parseCSV(santeCsv, santeDelim);
console.log(`  Headers: ${santeHeaders.join(' | ')}`);
const santeObjects = toObjects(santeHeaders, santeRawRows);
console.log(`  Total commune rows: ${santeObjects.length}`);

// ---------------------------------------------------------------------------
// 4. Parse BPE commerces
// ---------------------------------------------------------------------------
console.log('\n=== Parsing BPE commerces ===');
const commDelim = detectDelimiter(commercesCsv);
console.log(`  Detected delimiter: '${commDelim}'`);
const { headers: commHeaders, rows: commRawRows } = parseCSV(commercesCsv, commDelim);
console.log(`  Headers: ${commHeaders.join(' | ')}`);
const commObjects = toObjects(commHeaders, commRawRows);
console.log(`  Total commune rows: ${commObjects.length}`);

// Build a lookup map for commerces: departement_commune → row
const commMap = new Map();
for (const row of commObjects) {
  const code = getCol(row, 'departement_commune', 'Departement_Commune', 'code_commune', 'Code commune');
  if (code) commMap.set(code, row);
}

// ---------------------------------------------------------------------------
// 5. Build communes.geojson — join santé + commerces, compute densities
// ---------------------------------------------------------------------------
console.log('\n=== Building communes GeoJSON ===');

let droppedNoGeoShape = 0;
let droppedGeoParseError = 0;
let joinedCount = 0;
let notJoined = 0;

const IDF_DEPTS = new Set(['75', '77', '78', '91', '92', '93', '94', '95']);

const features = [];

let sumPharmaciesBpe = 0;
let sumBoulangeries = 0;

for (const row of santeObjects) {
  const code = getCol(row, 'departement_commune', 'Departement_Commune', 'code_commune', 'Code commune');
  const name = getCol(row, 'libelle_de_commune', 'Libelle_De_Commune', 'libelle_commune', 'Libelle de commune', 'Libellé de commune');
  const dept = getCol(row, 'departement', 'Departement', 'Département', 'dep', 'DEP');
  const popRaw = getCol(row, 'population_2010', 'Population_2010', 'population', 'Population 2010', 'pop_2010');
  const pharmCountRaw = getCol(row, 'pharmacie', 'Pharmacie', 'pharmacies');

  const geoShapeRaw = getCol(row, 'geo_shape', 'Geo Shape', 'geo_shape');

  if (!geoShapeRaw || geoShapeRaw.trim() === '') {
    droppedNoGeoShape++;
    continue;
  }

  let geometry;
  try {
    geometry = JSON.parse(geoShapeRaw);
  } catch (e) {
    droppedGeoParseError++;
    continue;
  }

  const population = safeInt(popRaw);
  const pharmacies_bpe = safeInt(pharmCountRaw);

  // Join commerces
  const commRow = commMap.get(code);
  let bakeries = 0;
  if (commRow) {
    bakeries = safeInt(getCol(commRow, 'boulangerie', 'Boulangerie', 'boulangeries'));
    joinedCount++;
  } else {
    notJoined++;
  }

  sumPharmaciesBpe += pharmacies_bpe;
  sumBoulangeries  += bakeries;

  const pharmaciesPer10k = population > 0
    ? Math.round((pharmacies_bpe / population) * 10000 * 100) / 100
    : 0;
  const bakeriesPer10k = population > 0
    ? Math.round((bakeries / population) * 10000 * 100) / 100
    : 0;

  features.push({
    type: 'Feature',
    geometry,
    properties: {
      code,
      name,
      dept,
      population,
      pharmacies: pharmacies_bpe,
      bakeries,
      pharmaciesPer10k,
      bakeriesPer10k,
    },
  });
}

console.log(`  Communes with geo_shape: ${features.length}`);
console.log(`  Dropped (no geo_shape):  ${droppedNoGeoShape}`);
console.log(`  Dropped (geo parse err): ${droppedGeoParseError}`);
console.log(`  Communes joined with commerces: ${joinedCount}`);
console.log(`  Communes NOT joined (no commerces row): ${notJoined}`);
console.log(`  Sum pharmacies (BPE): ${sumPharmaciesBpe}`);
console.log(`  Sum boulangeries (BPE): ${sumBoulangeries}`);

const communesGeoJSON = {
  type: 'FeatureCollection',
  features,
};

// ---------------------------------------------------------------------------
// 6. Validation summary
// ---------------------------------------------------------------------------
console.log('\n=== Validation Summary ===');
console.log(`  Pharmacy points (valid): ${pharmacies.length}  (expected ~3991)`);
console.log(`  Commune rows santé:      ${santeObjects.length}  (expected ~1300)`);
console.log(`  Commune rows commerces:  ${commObjects.length}  (expected ~1300)`);
console.log(`  GeoJSON features:        ${features.length}`);
console.log(`  dateouv range:           ${dateMinVal} → ${dateMaxVal}`);
console.log(`  dateouv null:            ${pharmacies.length - datesNonNull.length} (${pctNull}%)`);
console.log(`  BPE pharmacies total:    ${sumPharmaciesBpe}`);
console.log(`  BPE boulangeries total:  ${sumBoulangeries}`);

// ---------------------------------------------------------------------------
// 7. Build data-meta.json
// ---------------------------------------------------------------------------
const dataMeta = {
  vintage: {
    bpe: 'circa 2014',
    population: '2010 census',
    pharmacies_finess: 'datamaj per row, latest ~2010-2024',
  },
  sources: [
    {
      id: 'DS-001',
      label: 'BPE Services de santé par commune (IDF)',
      url: 'https://data.iledefrance.fr/explore/dataset/les-service-de-sante-par-commune-ou-par-arrondissement-base-permanente-des-equip/download?format=csv',
    },
    {
      id: 'DS-002',
      label: 'BPE Commerces par commune (IDF)',
      url: 'https://data.iledefrance.fr/explore/dataset/les-commerces-par-commune-ou-arrondissement-base-permanente-des-equipements/download?format=csv',
    },
    {
      id: 'DS-pharmacies-points',
      label: "Carte des pharmacies d'Île-de-France",
      url: 'https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/carte-des-pharmacies-dile-de-france/exports/csv?use_labels=true',
    },
  ],
  totals: {
    communes: features.length,
    pharmacies_individual: pharmacies.length,
    pharmacies_aggregate: sumPharmaciesBpe,
    bakeries_aggregate: sumBoulangeries,
  },
};

// ---------------------------------------------------------------------------
// 8. Write output files
// ---------------------------------------------------------------------------
console.log('\n=== Writing output files ===');

const pharmaciesJson = JSON.stringify(pharmacies);
writeFileSync(join(OUT, 'pharmacies.json'), pharmaciesJson, 'utf8');
console.log(`  pharmacies.json: ${(Buffer.byteLength(pharmaciesJson) / 1024).toFixed(0)} KB`);

const communesJson = JSON.stringify(communesGeoJSON);
writeFileSync(join(OUT, 'communes.geojson'), communesJson, 'utf8');
console.log(`  communes.geojson: ${(Buffer.byteLength(communesJson) / 1024).toFixed(0)} KB`);

const metaJson = JSON.stringify(dataMeta, null, 2);
writeFileSync(join(OUT, 'data-meta.json'), metaJson, 'utf8');
console.log(`  data-meta.json: ${(Buffer.byteLength(metaJson) / 1024).toFixed(0)} KB`);

console.log('\nDone.');
