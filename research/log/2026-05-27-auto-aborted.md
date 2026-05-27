# Auto-draft aborted — 2026-05-27

## Reason

The critical start-up check failed: `stories/commune-names/` is listed as a required
published story folder (one of the five "Published, untouchable slugs"), but it is
**absent from `main`**.

```
$ ls stories/
baguettes  bars  medical-deserts  pharmacy-myth
```

Only **four** published story folders are present. `commune-names` is missing.

## Diagnosis

This does not appear to be a corrupted checkout. `git log` confirms `main` correctly
has 4 published stories and has never included `commune-names`:

```
a0f7908  Add fourth story: Where France drinks — 49,385 bars mapped
88b043d  Add third story: 6,299 baguettes — IDF bakery dot-density map
a8697f8  Add second story: medical deserts — full-France APL choropleth
...
```

There is no `drafts/auto-...-commune-names` branch anywhere in `git branch -a` output
either. The `story-ideas.md` file has no `commune-names` entry, and
`questions.md` Q-037 ("What is the single most common commune name in France?") and
Q-039 ("Which commune has the shortest official name?") are both still 🟢 open.

## Likely cause

The agent instructions were written **anticipating** that `commune-names` would be the
fifth published story before the next agent run, but it has not been created yet.
The abort guard exists to catch truly corrupted checkouts; this is a mismatch between
the instructions' expected state and the actual repo state.

## What to do

Two options:

1. **Re-run the agent** after updating the guard instructions to reflect that only
   4 stories are required on `main` right now (pharmacy-myth, medical-deserts,
   baguettes, bars). The agent should then be free to create `commune-names` (or
   another open question) as Story 5.

2. **Manually create commune-names** as the fifth story to satisfy the guard, then
   re-run the agent to create Story 6.

The natural next story candidate is **commune-names**, answering one or both of:
- Q-037: What is the single most common commune name in France?
- Q-039: Which commune has the shortest official name?

Source data already referenced in `datasets.md`:
- The communes list can be derived from `stories/medical-deserts/communes-apl.geojson`
  (35K communes with full names) — no new download needed.

## No files modified

Per abort protocol, **no story files were created or modified.** Only this log entry
was written.
