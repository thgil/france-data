# Auto-draft aborted — 2026-05-18

## Reason

The startup checklist requires all five of these folders to be present before proceeding:

```
stories/pharmacy-myth/
stories/medical-deserts/
stories/baguettes/
stories/bars/
stories/commune-names/
```

`stories/commune-names/` is **missing**. The git log confirms this is the correct `main` branch — it simply has only 4 published stories (pharmacy-myth, medical-deserts, baguettes, bars). The commune-names story has never been committed to the repository.

## What this means

The system prompt was written expecting `commune-names` to be published before this auto-draft session ran. It wasn't. The absence is not a bad-checkout issue — it is the next story in the pipeline that hasn't been built yet.

The referenced data file `stories/commune-names/communes-index.json` (35K commune names + centroids) also does not exist anywhere in the repo.

## What to do

Two options:

1. **Build commune-names first** (manually or in a future session where the prompt guard is relaxed for that specific slug). Candidate question: commune naming patterns, most common commune names, linguistic geography, etc. The data can be derived from `stories/medical-deserts/communes-apl.geojson` which already contains 35K commune names + geometry.

2. **Update the system prompt** to reflect reality: remove `commune-names` from the "must-have" checklist until it is published, and list it as an open story idea instead.

## Sessions checked

- `git log --oneline -5` confirms latest commit is "Add fourth story: Where France drinks — 49,385 bars mapped" (a0f7908)
- `ls stories/` shows: baguettes, bars, medical-deserts, pharmacy-myth (4 folders + .gitkeep)
- No `commune-names` branch exists anywhere in the repository
