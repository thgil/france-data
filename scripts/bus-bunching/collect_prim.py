#!/usr/bin/env python3
"""Infer bus stop passes in Île-de-France from PRIM predicted arrivals.

IDFM publishes no raw GPS. Its "Next Departures - global query" API (SIRI Lite
estimated-timetable) gives, for every vehicle journey, predicted times at its
upcoming stops. A journey that was due at a stop and then drops out of that
stop's predictions has passed it; its last predicted time is the pass time.

Usage: PRIM_API_KEY=... python3 collect_prim.py [--every 90] [--out passes.csv]

The default quota is 1,000 calls/day, so --every 90 (960/day) is the floor.
Output rows feed analyze.py --passes.
"""
import argparse, csv, gzip, json, os, sys, time, urllib.request
from datetime import datetime

URL = "https://prim.iledefrance-mobilites.fr/marketplace/estimated-timetable?LineRef=ALL"
DUE_WITHIN = 120  # a dropped call only counts as a pass if it was due within this many seconds


def ts(s):
    return int(datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()) if s else None


def val(x):
    return x.get("value", "") if isinstance(x, dict) else (x or "")


def calls(doc):
    """Yield (journey, line, direction, stop, expected_ts) for every upcoming call."""
    for d in doc["Siri"]["ServiceDelivery"].get("EstimatedTimetableDelivery", []):
        for frame in d.get("EstimatedJourneyVersionFrame", []):
            for j in frame.get("EstimatedVehicleJourney", []):
                jid = val(j.get("DatedVehicleJourneyRef")) or val(j.get("FramedVehicleJourneyRef", {}).get("DatedVehicleJourneyRef"))
                line, direction = val(j.get("LineRef")), val(j.get("DirectionRef"))
                for c in j.get("EstimatedCalls", {}).get("EstimatedCall", []):
                    t = ts(c.get("ExpectedArrivalTime") or c.get("ExpectedDepartureTime"))
                    if jid and t:
                        yield jid, line, direction, val(c.get("StopPointRef")), t


def diff(prev, cur, now):
    """Calls present last poll, gone now, and due by now: those are passes."""
    for k, (line, direction, t) in prev.items():
        if k not in cur and t <= now + DUE_WITHIN:
            yield {"route_id": line, "direction_id": direction, "stop_id": k[1],
                   "vehicle_id": k[0], "vehicle_ts": min(t, now)}


def fetch(key):
    req = urllib.request.Request(URL, headers={"apikey": key, "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(req, timeout=60) as r:
        body = r.read()
        return json.loads(gzip.decompress(body) if r.headers.get("Content-Encoding") == "gzip" else body)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--every", type=int, default=90)
    ap.add_argument("--out", default="passes.csv")
    a = ap.parse_args()
    key = os.environ["PRIM_API_KEY"]
    new = not os.path.exists(a.out)
    prev = {}
    with open(a.out, "a", newline="") as f:
        w = csv.DictWriter(f, ["route_id", "direction_id", "stop_id", "vehicle_id", "vehicle_ts"])
        if new:
            w.writeheader()
        while True:
            now = int(time.time())
            try:
                cur = {(j, s): (l, d, t) for j, l, d, s, t in calls(fetch(key))}
                rows = list(diff(prev, cur, now)) if prev else []
                w.writerows(rows)
                f.flush()
                prev = cur
                print(f"{time.strftime('%H:%M:%S')} {len(cur)} calls, {len(rows)} passes", file=sys.stderr)
            except Exception as ex:
                print(f"poll failed: {ex}", file=sys.stderr)
            time.sleep(max(1, a.every - (time.time() - now)))


if __name__ == "__main__":
    main()
