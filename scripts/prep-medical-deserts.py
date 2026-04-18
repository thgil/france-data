#!/usr/bin/env python3
"""
Prep script for the medical-deserts story.
Reads APL 2023 XLSX (built-in XML parser, no deps) + communes-1000m.geojson,
joins by commune code, writes output files to stories/medical-deserts/.

Run: python3 scripts/prep-medical-deserts.py

Inputs (download first):
  /tmp/apl-gp.xlsx            — from DREES APL dataset
  /tmp/communes-1000m.geojson — from data.gouv.fr contours-administratifs

Outputs:
  stories/medical-deserts/communes-apl.geojson  — 35K communes with APL + pop
  stories/medical-deserts/data-meta.json         — summary stats
"""

import zipfile
import xml.etree.ElementTree as ET
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'stories' / 'medical-deserts'
OUT.mkdir(parents=True, exist_ok=True)

XLSX_PATH = '/tmp/apl-gp.xlsx'
GEO_PATH = '/tmp/communes-1000m.geojson'

# ── Step 1: Parse APL XLSX (sheet 3 = 2023 data) ─────────────────────────────

print('Reading APL XLSX...')
xlsx = zipfile.ZipFile(XLSX_PATH)
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

# Shared strings
ss = []
tree = ET.parse(xlsx.open('xl/sharedStrings.xml'))
for si in tree.findall('.//s:si', ns):
    t = si.find('.//s:t', ns)
    ss.append(t.text if t is not None and t.text else '')

# Parse sheet 3
tree = ET.parse(xlsx.open('xl/worksheets/sheet3.xml'))
rows = tree.findall('.//s:row', ns)

# Find data start (row after "Code commune INSEE" header + units row)
data_start = None
for i, row in enumerate(rows):
    cells = []
    for c in row.findall('s:c', ns):
        v = c.find('s:v', ns)
        val = v.text if v is not None else ''
        if c.get('t') == 's' and val:
            idx = int(val)
            val = ss[idx] if idx < len(ss) else val
        cells.append(val)
    if cells and cells[0] == 'Code commune INSEE':
        data_start = i + 2  # skip units row
        break

if data_start is None:
    print('ERROR: Could not find header row in sheet 3')
    sys.exit(1)

# Extract commune data
apl_data = {}
for row in rows[data_start:]:
    cells = []
    for c in row.findall('s:c', ns):
        v = c.find('s:v', ns)
        val = v.text if v is not None else ''
        if c.get('t') == 's' and val:
            idx = int(val)
            val = ss[idx] if idx < len(ss) else val
        cells.append(val)
    if len(cells) >= 8 and cells[0]:
        code = cells[0].zfill(5)
        try:
            apl = round(float(cells[2]), 2) if cells[2] else None
            pop = int(float(cells[7])) if cells[7] else 0
        except (ValueError, IndexError):
            apl, pop = None, 0
        if apl is not None:
            apl_data[code] = {'apl': apl, 'name': cells[1], 'pop': pop}

print(f'  APL records: {len(apl_data)}')

# ── Step 2: Read and join commune GeoJSON ─────────────────────────────────────

print('Reading communes GeoJSON...')
with open(GEO_PATH) as f:
    geo = json.load(f)

print(f'  Features in GeoJSON: {len(geo["features"])}')

# Join APL data and quantize coordinates
matched = 0
unmatched_codes = []

def quantize_coords(coords, precision=4):
    """Reduce coordinate precision to save file size."""
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], precision), round(coords[1], precision)]
    return [quantize_coords(c, precision) for c in coords]

for feature in geo['features']:
    code = feature['properties'].get('code', '')
    if code in apl_data:
        d = apl_data[code]
        feature['properties']['apl'] = d['apl']
        feature['properties']['pop'] = d['pop']
        feature['properties']['communeName'] = d['name']
        feature['properties']['dept'] = code[:2]
        # Classify
        if d['apl'] < 1.0:
            feature['properties']['category'] = 'severe'
        elif d['apl'] < 2.5:
            feature['properties']['category'] = 'desert'
        elif d['apl'] < 4.0:
            feature['properties']['category'] = 'adequate'
        else:
            feature['properties']['category'] = 'well-served'
        matched += 1
    else:
        feature['properties']['apl'] = None
        feature['properties']['pop'] = 0
        feature['properties']['communeName'] = feature['properties'].get('nom', '')
        feature['properties']['dept'] = code[:2]
        feature['properties']['category'] = 'no-data'
        unmatched_codes.append(code)

    # Quantize coordinates (4 decimals ≈ 11m precision, fine for 1000m polygons)
    geom = feature['geometry']
    geom['coordinates'] = quantize_coords(geom['coordinates'])

    # Strip unneeded original properties to save space
    keep = {'code', 'apl', 'pop', 'communeName', 'dept', 'category'}
    feature['properties'] = {k: v for k, v in feature['properties'].items() if k in keep}

print(f'  Matched: {matched}')
print(f'  Unmatched: {len(unmatched_codes)}')
if unmatched_codes[:5]:
    print(f'  Sample unmatched: {unmatched_codes[:5]}')

# ── Step 3: Write output GeoJSON ──────────────────────────────────────────────

out_geo = OUT / 'communes-apl.geojson'
print(f'Writing {out_geo}...')
with open(out_geo, 'w') as f:
    json.dump(geo, f, separators=(',', ':'))

size_mb = os.path.getsize(out_geo) / 1024 / 1024
print(f'  Size: {size_mb:.1f} MB')

# ── Step 4: Compute summary stats ────────────────────────────────────────────

communes_with_apl = [f['properties'] for f in geo['features'] if f['properties']['apl'] is not None]
total_pop = sum(c['pop'] for c in communes_with_apl)
desert = [c for c in communes_with_apl if c['apl'] < 2.5]
severe = [c for c in communes_with_apl if c['apl'] < 1.0]
well = [c for c in communes_with_apl if c['apl'] >= 4.0]

# Worst départements (pop-weighted APL)
from collections import defaultdict
dept_stats = defaultdict(lambda: {'pop': 0, 'weighted_apl': 0, 'desert_pop': 0, 'commune_count': 0, 'desert_count': 0})
for c in communes_with_apl:
    d = c['dept']
    dept_stats[d]['pop'] += c['pop']
    dept_stats[d]['weighted_apl'] += c['apl'] * c['pop']
    dept_stats[d]['commune_count'] += 1
    if c['apl'] < 2.5:
        dept_stats[d]['desert_pop'] += c['pop']
        dept_stats[d]['desert_count'] += 1

dept_summary = []
for dept, s in dept_stats.items():
    if s['pop'] > 0:
        dept_summary.append({
            'dept': dept,
            'avgApl': round(s['weighted_apl'] / s['pop'], 2),
            'pop': s['pop'],
            'desertPop': s['desert_pop'],
            'desertPct': round(100 * s['desert_pop'] / s['pop'], 1),
            'communes': s['commune_count'],
            'desertCommunes': s['desert_count'],
        })
dept_summary.sort(key=lambda x: x['avgApl'])

# Notable communes
notable = []
for c in communes_with_apl:
    if c['pop'] > 5000 and c['apl'] < 2.5:
        notable.append({'code': c['code'], 'name': c['communeName'], 'apl': c['apl'], 'pop': c['pop']})
notable.sort(key=lambda x: x['apl'])

meta = {
    'vintage': 'APL 2023 (DREES), population 2021 (INSEE)',
    'sources': [
        {'id': 'DS-APL', 'label': "APL aux médecins généralistes 2023 (DREES)", 'url': 'https://www.data.gouv.fr/datasets/laccessibilite-potentielle-localisee-apl'},
        {'id': 'DS-CONTOURS', 'label': 'Contours administratifs communes 2025 1000m', 'url': 'https://www.data.gouv.fr/datasets/contours-administratifs'},
    ],
    'totals': {
        'communes': len(communes_with_apl),
        'population': total_pop,
        'desert_communes': len(desert),
        'desert_population': sum(c['pop'] for c in desert),
        'severe_communes': len(severe),
        'severe_population': sum(c['pop'] for c in severe),
        'well_served_communes': len(well),
        'well_served_population': sum(c['pop'] for c in well),
    },
    'apl_distribution': {
        'min': round(min(c['apl'] for c in communes_with_apl), 2),
        'p10': round(sorted(c['apl'] for c in communes_with_apl)[len(communes_with_apl) // 10], 2),
        'p25': round(sorted(c['apl'] for c in communes_with_apl)[len(communes_with_apl) // 4], 2),
        'median': round(sorted(c['apl'] for c in communes_with_apl)[len(communes_with_apl) // 2], 2),
        'p75': round(sorted(c['apl'] for c in communes_with_apl)[3 * len(communes_with_apl) // 4], 2),
        'p90': round(sorted(c['apl'] for c in communes_with_apl)[9 * len(communes_with_apl) // 10], 2),
        'max': round(max(c['apl'] for c in communes_with_apl), 2),
        'desert_threshold': 2.5,
    },
    'worst_departements': dept_summary[:10],
    'best_departements': dept_summary[-5:][::-1],
    'notable_towns_in_desert': notable[:15],
}

out_meta = OUT / 'data-meta.json'
print(f'Writing {out_meta}...')
with open(out_meta, 'w') as f:
    json.dump(meta, f, indent=2)

print('\nDone.')
print(f'  communes-apl.geojson: {size_mb:.1f} MB')
print(f'  data-meta.json: {os.path.getsize(out_meta) / 1024:.1f} KB')
