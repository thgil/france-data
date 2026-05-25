# Auto-draft aborted — 2026-05-25

## Reason

The pre-flight check failed: `stories/commune-names/` is absent from the repo.

The agent instructions require all five of these folders to be present before proceeding:

- `stories/pharmacy-myth/` ✅
- `stories/medical-deserts/` ✅
- `stories/baguettes/` ✅
- `stories/bars/` ✅
- `stories/commune-names/` ❌ **missing**

## What was verified

- `git checkout main && git pull origin main` — completed cleanly, already up to date
- `git log --oneline -5` — most recent commit is "Add fourth story: Where France drinks — 49,385 bars mapped"
- Only **4** story folders exist in `stories/`; `commune-names` has never been committed per the full git log

## This is NOT a stale-checkout problem

The checkout is correct. `commune-names` was never published to this repo — it is not a case of a deleted or stale branch. The repo is genuinely at 4 stories.

## Root cause

The agent instructions were written anticipating a repo state where `commune-names` is already the fifth published story (and its data file `stories/commune-names/communes-index.json` exists). That state has not been reached yet.

The instructions also reference `communes-index.json` as available in-repo data, but that file does not exist.

## Recommendation

The next step is to **create the `commune-names` story** (questions Q-037 and Q-039 are strong candidates — most common commune name, shortest commune name). Both are answerable from the national communes dataset (COG from INSEE, ~35K rows, well under 50 MB).

Once `commune-names` is published, future auto-draft runs can proceed normally.

Suggested data source: [COG communes CSV from INSEE](https://www.insee.fr/fr/information/2560452) or the communes GeoJSON already at `stories/medical-deserts/communes-apl.geojson` (which contains commune names for all 35K communes).
