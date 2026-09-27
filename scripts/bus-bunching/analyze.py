#!/usr/bin/env python3
"""Headway regularity and bunching from collected vehicle positions.

Usage: python3 analyze.py positions.csv [--json out.json]
       python3 analyze.py passes.csv --passes   # from collect_prim.py

Method: a vehicle "passes" a stop the first time the feed reports it at or
heading to that stop's successor, i.e. when its stop_id changes; the pass
time is the vehicle timestamp of that change. Headways are the gaps between
consecutive vehicles passing the same (route, direction, stop). Each headway
is compared with the median headway for that route/direction/stop/hour, which
stands in for the scheduled headway when no GTFS static schedule is joined.

  bunched : headway < 25% of the reference headway
  gap     : headway > 150% of the reference headway
  CoV     : std/mean of headways (0 = perfectly regular; >0.5 is poor)
"""
import argparse, csv, json, statistics as st
from collections import defaultdict
from datetime import datetime

BUNCH, GAP = 0.25, 1.5


def stop_passes(rows):
    """Yield (route, dir, stop_left, ts) each time a vehicle's stop_id changes."""
    by_vehicle = defaultdict(list)
    for r in rows:
        if r["stop_id"] and r["route_id"]:
            by_vehicle[r["vehicle_id"]].append(r)
    for obs in by_vehicle.values():
        obs.sort(key=lambda r: int(r["vehicle_ts"]))
        prev = None
        for r in obs:
            if prev and r["trip_id"] == prev["trip_id"] and r["stop_id"] != prev["stop_id"]:
                yield prev["route_id"], prev["direction_id"], prev["stop_id"], int(r["vehicle_ts"])
            prev = r


def headways(passes):
    by_key = defaultdict(list)
    for route, d, stop, ts in passes:
        by_key[(route, d, stop)].append(ts)
    out = []
    for (route, d, stop), ts in by_key.items():
        ts = sorted(set(ts))
        for a, b in zip(ts, ts[1:]):
            h = b - a
            if 0 < h < 3 * 3600:  # drop overnight / service gaps
                out.append({"route": route, "dir": d, "stop": stop, "ts": b, "h": h,
                            "hour": datetime.fromtimestamp(b).hour})
    ref = defaultdict(list)
    for x in out:
        ref[(x["route"], x["dir"], x["stop"], x["hour"])].append(x["h"])
    ref = {k: st.median(v) for k, v in ref.items() if len(v) >= 3}
    return [dict(x, ref=ref[k]) for x in out
            if (k := (x["route"], x["dir"], x["stop"], x["hour"])) in ref]


def summarize(hw):
    by_route = defaultdict(list)
    for x in hw:
        by_route[x["route"]].append(x)
    routes = []
    for route, xs in by_route.items():
        hs = [x["h"] for x in xs]
        routes.append({
            "route": route,
            "headways": len(xs),
            "median_headway_min": round(st.median(hs) / 60, 1),
            "cov": round(st.pstdev(hs) / st.mean(hs), 2),
            "bunched_pct": round(100 * sum(x["h"] < BUNCH * x["ref"] for x in xs) / len(xs), 1),
            "gap_pct": round(100 * sum(x["h"] > GAP * x["ref"] for x in xs) / len(xs), 1),
        })
    routes.sort(key=lambda r: -r["bunched_pct"])
    allx = hw or [{"h": 1, "ref": 1}]
    return {
        "network": {
            "headways": len(hw),
            "bunched_pct": round(100 * sum(x["h"] < BUNCH * x["ref"] for x in allx) / len(allx), 1) if hw else None,
            "gap_pct": round(100 * sum(x["h"] > GAP * x["ref"] for x in allx) / len(allx), 1) if hw else None,
        },
        "routes": routes,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv")
    ap.add_argument("--json")
    ap.add_argument("--passes", action="store_true", help="input is stop passes (collect_prim.py), not positions")
    a = ap.parse_args()
    with open(a.csv) as f:
        rows = csv.DictReader(f)
        passes = ((r["route_id"], r["direction_id"], r["stop_id"], int(r["vehicle_ts"])) for r in rows) if a.passes else stop_passes(rows)
        s = summarize(headways(passes))
    print(f"network: {s['network']}")
    print(f"{'route':>8} {'n':>6} {'med(min)':>9} {'CoV':>5} {'bunch%':>7} {'gap%':>6}")
    for r in s["routes"][:25]:
        print(f"{r['route']:>8} {r['headways']:>6} {r['median_headway_min']:>9} {r['cov']:>5} {r['bunched_pct']:>7} {r['gap_pct']:>6}")
    if a.json:
        with open(a.json, "w") as f:
            json.dump(s, f, indent=1)


if __name__ == "__main__":
    main()
