#!/usr/bin/env python3
"""Poll a GTFS-RT VehiclePositions feed and append one row per vehicle per poll.

Usage: python3 collect.py [--url URL] [--every 20] [--out positions.csv]

Default feed is Bordeaux TBM (transport.data.gouv.fr resource 83026).
Needs: pip install gtfs-realtime-bindings
"""
import argparse, csv, os, sys, time, urllib.request
from google.transit import gtfs_realtime_pb2

TBM = "https://bdx.mecatran.com/utw/ws/gtfsfeed/vehicles/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt"
FIELDS = ["poll_ts", "feed_ts", "vehicle_ts", "vehicle_id", "trip_id", "route_id",
          "direction_id", "stop_id", "current_stop_sequence", "current_status", "lat", "lon"]


def parse(blob, poll_ts):
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(blob)
    for e in feed.entity:
        if not e.HasField("vehicle"):
            continue
        v = e.vehicle
        yield {
            "poll_ts": poll_ts,
            "feed_ts": feed.header.timestamp,
            "vehicle_ts": v.timestamp or feed.header.timestamp,
            "vehicle_id": v.vehicle.id or e.id,
            "trip_id": v.trip.trip_id,
            "route_id": v.trip.route_id,
            "direction_id": v.trip.direction_id if v.trip.HasField("direction_id") else "",
            "stop_id": v.stop_id,
            "current_stop_sequence": v.current_stop_sequence if v.HasField("current_stop_sequence") else "",
            "current_status": gtfs_realtime_pb2.VehiclePosition.VehicleStopStatus.Name(v.current_status),
            "lat": round(v.position.latitude, 6),
            "lon": round(v.position.longitude, 6),
        }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=TBM)
    ap.add_argument("--every", type=int, default=20, help="seconds between polls")
    ap.add_argument("--out", default="positions.csv")
    a = ap.parse_args()
    new = not os.path.exists(a.out)
    with open(a.out, "a", newline="") as f:
        w = csv.DictWriter(f, FIELDS)
        if new:
            w.writeheader()
        while True:
            t = int(time.time())
            try:
                with urllib.request.urlopen(a.url, timeout=15) as r:
                    rows = list(parse(r.read(), t))
                w.writerows(rows)
                f.flush()
                print(f"{time.strftime('%H:%M:%S')} {len(rows)} vehicles", file=sys.stderr)
            except Exception as ex:  # keep polling through transient errors
                print(f"poll failed: {ex}", file=sys.stderr)
            time.sleep(max(1, a.every - (time.time() - t)))


if __name__ == "__main__":
    main()
