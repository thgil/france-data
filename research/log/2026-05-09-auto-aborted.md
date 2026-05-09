# Auto-draft aborted — 2026-05-09

## Reason

The `commune-names` story folder is missing from the `main` branch.

**Required stories per instructions:** pharmacy-myth, medical-deserts, baguettes, bars, commune-names  
**Found in main:** pharmacy-myth, medical-deserts, baguettes, bars  
**Missing:** `stories/commune-names/`

## Context

The remote has multiple `drafts/auto-...-commune-names` branches (and a `commune-names-clean` branch), indicating the story has been drafted but not yet merged to `main`. The abort rule exists to prevent creating a new draft from a base that is missing a published story, which would cause that story to appear deleted if the draft were later merged.

## Action required

Merge the commune-names story into `main` before the next auto-draft run. Once `commune-names` is in main, the abort condition will be cleared.

The `commune-names-clean` branch appears to be the most likely candidate.
