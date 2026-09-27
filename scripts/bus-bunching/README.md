# Bus bunching

Measures headway regularity and bunching from a GTFS-RT VehiclePositions feed.
France publishes no archive of these feeds, so data has to be collected live.

```bash
pip install gtfs-realtime-bindings
python3 collect.py --every 20 --out positions.csv   # Bordeaux TBM by default; leave running
python3 analyze.py positions.csv --json summary.json
python3 test_analyze.py                              # synthetic check
```

Any network's feed works via `--url` (find them at
https://transport.data.gouv.fr/datasets?format=gtfs-rt, look for the
"vehicle positions" feature).

Caveat: the reference headway is the observed median per route/stop/hour.
Joining the GTFS static schedule would give the true planned headway and let
this also measure punctuality and missing trips.
