# Bus bunching

Measures headway regularity and bunching from a GTFS-RT VehiclePositions feed.
France publishes no archive of these feeds, so data has to be collected live.

```bash
pip install gtfs-realtime-bindings
python3 collect.py --every 20 --out positions.csv   # Bordeaux TBM by default; leave running
python3 analyze.py positions.csv --json summary.json
python3 test_analyze.py                              # synthetic check
```

## Paris (Île-de-France)

IDFM publishes no raw GPS. `collect_prim.py` polls PRIM's "Next Departures -
global query" (free account and API key at prim.iledefrance-mobilites.fr) and
infers a stop pass when a journey drops out of a stop's predictions.

```bash
PRIM_API_KEY=... python3 collect_prim.py --every 90 --out passes.csv
python3 analyze.py passes.csv --passes
```

The 1,000 calls/day quota limits polling to about every 90 s, so pass times are
accurate to roughly a minute. That is fine for 5 to 15 minute bus headways.

## Other networks

Any network's feed works via `--url` (find them at
https://transport.data.gouv.fr/datasets?format=gtfs-rt, look for the
"vehicle positions" feature).

Caveat: the reference headway is the observed median per route/stop/hour.
Joining the GTFS static schedule would give the true planned headway and let
this also measure punctuality and missing trips.
