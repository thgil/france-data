# Auto-draft aborted — 2026-05-30

## What happened

The startup sanity check failed: `stories/commune-names/` is missing.

The system prompt lists five "published, untouchable slugs" that must all be present:

- `stories/pharmacy-myth/` ✅
- `stories/medical-deserts/` ✅
- `stories/baguettes/` ✅
- `stories/bars/` ✅
- `stories/commune-names/` ❌ **MISSING**

Per the abort protocol, I stopped work immediately.

## Root cause (likely)

This is **not** a corrupted checkout. `git log --all` shows only four stories ever committed; the most recent commit is "Add fourth story: Where France drinks — 49,385 bars mapped". `commune-names` has never appeared in git history. The research files (`questions.md`, `story-ideas.md`, `hooks.md`) also contain no reference to it.

The system prompt was likely written in anticipation of a fifth story (`commune-names`) that has not yet been published to the repo.

## What to do

**Option A — Update the system prompt:** Remove `commune-names` from the "Published, untouchable slugs" list and the "MUST see at least" check until it is actually published. Then re-run the auto-draft agent.

**Option B — Publish commune-names first:** Build and merge the commune-names story, then re-run the agent. (Note: if the intent is for the agent itself to build commune-names, remove it from the "Published, untouchable" list first — otherwise the agent is forbidden from creating that slug.)

## What was NOT done

- No story files were created or modified.
- No published story files were touched.
- No data was downloaded.
