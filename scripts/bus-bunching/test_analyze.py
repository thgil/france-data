"""Synthetic check: a regular route should show no bunching, a bunched one should."""
import random, unittest
from analyze import stop_passes, headways, summarize


def simulate(route, n_buses, headway, jitter, stops=10, hop=90, start=1_700_000_000):
    rows = []
    for b in range(n_buses):
        t0 = start + b * headway + random.uniform(-jitter, jitter)
        for s in range(stops):
            for k in range(3):  # three polls per stop
                rows.append({"vehicle_id": f"{route}-{b}", "trip_id": f"{route}-t{b}", "route_id": route,
                             "direction_id": "0", "stop_id": f"S{s}", "vehicle_ts": str(int(t0 + s * hop + k * 20))})
    return rows


class T(unittest.TestCase):
    def test_bunching_detected(self):
        random.seed(1)
        rows = simulate("REG", 40, 600, 30) + simulate("BUN", 40, 600, 0)
        # make every other BUN bus run 1 minute behind the previous one
        for r in rows:
            if r["route_id"] == "BUN" and int(r["vehicle_id"].split("-")[1]) % 2:
                r["vehicle_ts"] = str(int(r["vehicle_ts"]) - 540)
        s = {r["route"]: r for r in summarize(headways(stop_passes(rows)))["routes"]}
        self.assertEqual(s["REG"]["bunched_pct"], 0)
        self.assertLess(s["REG"]["cov"], 0.15)
        self.assertGreater(s["BUN"]["bunched_pct"], 40)
        self.assertGreater(s["BUN"]["cov"], 0.5)


    def test_prim_diff(self):
        from collect_prim import calls, diff
        doc = {"Siri": {"ServiceDelivery": {"EstimatedTimetableDelivery": [{"EstimatedJourneyVersionFrame": [{"EstimatedVehicleJourney": [
            {"DatedVehicleJourneyRef": {"value": "J1"}, "LineRef": {"value": "L"}, "DirectionRef": {"value": "A"},
             "EstimatedCalls": {"EstimatedCall": [
                 {"StopPointRef": {"value": "S1"}, "ExpectedArrivalTime": "2026-09-27T10:00:00Z"},
                 {"StopPointRef": {"value": "S2"}, "ExpectedArrivalTime": "2026-09-27T10:05:00Z"}]}}]}]}]}}}
        prev = {(j, s): (l, d, t) for j, l, d, s, t in calls(doc)}
        t0 = prev[("J1", "S1")][2]
        cur = {k: v for k, v in prev.items() if k[1] != "S1"}
        out = list(diff(prev, cur, t0 + 30))
        self.assertEqual([(o["stop_id"], o["vehicle_ts"]) for o in out], [("S1", t0)])
        # a far-future call vanishing (e.g. trip cancelled) is not a pass
        self.assertEqual(list(diff(prev, {}, t0 - 600)), [])


if __name__ == "__main__":
    unittest.main()
