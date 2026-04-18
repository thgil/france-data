#!/usr/bin/env python3
# scripts/prep-baguettes.py
# Generate bakery dot-density points for IDF communes.
# Reads stories/pharmacy-myth/communes.geojson
# Writes stories/baguettes/bakeries.json and stories/baguettes/stats.json
# No external dependencies — stdlib only.

import json
import random
import os
import math

random.seed(42)

DEPT_NAMES = {
    '75': 'Paris',
    '77': 'Seine-et-Marne',
    '78': 'Yvelines',
    '91': 'Essonne',
    '92': 'Hauts-de-Seine',
    '93': 'Seine-Saint-Denis',
    '94': 'Val-de-Marne',
    '95': "Val-d'Oise",
}

# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------

def point_in_polygon(x, y, polygon):
    """Ray casting algorithm. polygon is a list of [x, y] coordinate pairs."""
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def bbox(ring):
    """Return (min_x, min_y, max_x, max_y) for a coordinate ring."""
    xs = [c[0] for c in ring]
    ys = [c[1] for c in ring]
    return min(xs), min(ys), max(xs), max(ys)


def random_point_in_polygon(geometry):
    """
    Generate a single random point inside a GeoJSON Polygon or MultiPolygon.
    Uses bounding-box rejection sampling with the ray-casting test.
    For MultiPolygon, picks a sub-polygon weighted by bbox area.
    """
    if geometry['type'] == 'Polygon':
        rings = [geometry['coordinates'][0]]  # outer ring only
    elif geometry['type'] == 'MultiPolygon':
        rings = [poly[0] for poly in geometry['coordinates']]
    else:
        raise ValueError(f"Unsupported geometry type: {geometry['type']}")

    # For MultiPolygon, weight sub-polygons by their bounding box area
    # so larger polygons receive proportionally more attempts first.
    if len(rings) == 1:
        chosen_ring = rings[0]
    else:
        areas = []
        for ring in rings:
            x0, y0, x1, y1 = bbox(ring)
            areas.append((x1 - x0) * (y1 - y0))
        total = sum(areas)
        weights = [a / total for a in areas]
        chosen_ring = random.choices(rings, weights=weights, k=1)[0]

    x0, y0, x1, y1 = bbox(chosen_ring)

    # Safety limit: avoid infinite loop for very thin/degenerate polygons
    for _ in range(10_000):
        x = random.uniform(x0, x1)
        y = random.uniform(y0, y1)
        if point_in_polygon(x, y, chosen_ring):
            return x, y

    # Fallback: centroid of bbox (should be extremely rare)
    return (x0 + x1) / 2, (y0 + y1) / 2


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    geojson_path = os.path.join(project_root, 'stories', 'pharmacy-myth', 'communes.geojson')
    out_dir = os.path.join(project_root, 'stories', 'baguettes')
    os.makedirs(out_dir, exist_ok=True)

    print(f'Reading {geojson_path} …')
    with open(geojson_path, 'r', encoding='utf-8') as f:
        geojson = json.load(f)

    features = geojson['features']
    print(f'  {len(features)} communes loaded')

    # ── Generate dots ────────────────────────────────────────────────────────
    dots = []
    communes_with_bakeries = 0
    total_bakeries_placed = 0
    skipped = 0

    for feat in features:
        props = feat['properties']
        n = props.get('bakeries', 0)
        if n <= 0:
            continue

        communes_with_bakeries += 1
        geom = feat['geometry']
        name = props.get('name', '')
        dept = props.get('dept', '')

        for _ in range(n):
            lng, lat = random_point_in_polygon(geom)
            dots.append({
                'lat': round(lat, 6),
                'lng': round(lng, 6),
                'commune': name,
                'dept': dept,
            })
        total_bakeries_placed += n

        if communes_with_bakeries % 50 == 0:
            print(f'  … {communes_with_bakeries} communes processed, {total_bakeries_placed} dots so far')

    # Sort by département then commune
    dots.sort(key=lambda d: (d['dept'], d['commune']))

    print(f'\n  Total dots generated: {total_bakeries_placed}')
    print(f'  Communes with bakeries: {communes_with_bakeries}')

    # ── Write bakeries.json ──────────────────────────────────────────────────
    bakeries_path = os.path.join(out_dir, 'bakeries.json')
    with open(bakeries_path, 'w', encoding='utf-8') as f:
        json.dump(dots, f, ensure_ascii=False, separators=(',', ':'))
    bakeries_size_kb = os.path.getsize(bakeries_path) / 1024
    print(f'\nWrote {bakeries_path} ({bakeries_size_kb:.1f} KB, {len(dots)} points)')

    # ── Compute stats ────────────────────────────────────────────────────────
    total_pop = sum(f['properties'].get('population', 0) for f in features)

    # Top 10 communes by bakery count
    feat_with_bakeries = [
        f for f in features if f['properties'].get('bakeries', 0) > 0
    ]
    top_communes = sorted(
        feat_with_bakeries,
        key=lambda f: f['properties']['bakeries'],
        reverse=True
    )[:10]
    top_communes_list = [
        {
            'name': f['properties']['name'],
            'dept': f['properties']['dept'],
            'bakeries': f['properties']['bakeries'],
            'population': f['properties']['population'],
        }
        for f in top_communes
    ]

    # Top 10 by density (min pop 1000)
    dense_candidates = [
        f for f in features
        if f['properties'].get('bakeries', 0) > 0
        and f['properties'].get('population', 0) >= 1000
    ]
    top_density = sorted(
        dense_candidates,
        key=lambda f: f['properties'].get('bakeriesPer10k', 0),
        reverse=True
    )[:10]
    top_density_list = [
        {
            'name': f['properties']['name'],
            'dept': f['properties']['dept'],
            'bakeries': f['properties']['bakeries'],
            'population': f['properties']['population'],
            'bakeriesPer10k': round(f['properties'].get('bakeriesPer10k', 0), 2),
        }
        for f in top_density
    ]

    # Per-département summary
    dept_data = {}
    for f in features:
        p = f['properties']
        d = p.get('dept', '??')
        if d not in dept_data:
            dept_data[d] = {'dept': d, 'name': DEPT_NAMES.get(d, d), 'bakeries': 0, 'population': 0}
        dept_data[d]['bakeries'] += p.get('bakeries', 0)
        dept_data[d]['population'] += p.get('population', 0)

    departements = []
    for d, rec in sorted(dept_data.items()):
        pop = rec['population']
        bak = rec['bakeries']
        rec['per10k'] = round(bak / pop * 10000, 2) if pop > 0 else 0
        departements.append(rec)

    stats = {
        'totalBakeries': total_bakeries_placed,
        'totalCommunes': communes_with_bakeries,
        'totalPopulation': total_pop,
        'topCommunes': top_communes_list,
        'topDensity': top_density_list,
        'departements': departements,
    }

    stats_path = os.path.join(out_dir, 'stats.json')
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f'Wrote {stats_path}')

    # ── Console summary ──────────────────────────────────────────────────────
    print('\n── Summary ─────────────────────────────────────────────────────────')
    print(f'  Total bakeries:          {total_bakeries_placed:,}')
    print(f'  Communes with bakeries:  {communes_with_bakeries:,} / {len(features):,}')
    print(f'  Total IDF population:    {total_pop:,}')
    print(f'  Bakeries per 10k res.:   {total_bakeries_placed / total_pop * 10000:.1f}')
    print()
    print('  Top 5 communes by bakeries:')
    for c in top_communes_list[:5]:
        print(f'    {c["name"]:40s} {c["bakeries"]:>4} bakeries')
    print()
    print('  Top 5 communes by density (min pop 1,000):')
    for c in top_density_list[:5]:
        print(f'    {c["name"]:40s} {c["bakeriesPer10k"]:>6.1f} / 10k')
    print()
    print('  By département:')
    for d in departements:
        print(f'    {d["dept"]} {d["name"]:20s}  {d["bakeries"]:>5} bakeries  {d["per10k"]:>5.1f}/10k')
    print('────────────────────────────────────────────────────────────────────')


if __name__ == '__main__':
    main()
