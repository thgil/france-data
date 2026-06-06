# Auto-draft aborted — 2026-06-06

## Reason

Mandatory pre-flight check failed: `stories/commune-names/` is missing from the working tree.

The instructions require all five published story folders to be present before any draft work:
- `stories/pharmacy-myth/` ✅
- `stories/medical-deserts/` ✅
- `stories/baguettes/` ✅
- `stories/bars/` ✅
- `stories/commune-names/` ❌ **MISSING**

## Context

`git log` shows only four stories committed to main (bars, baguettes, medical-deserts, pharmacy-myth). The `commune-names` story is referenced extensively in the system instructions (as a published story with `communes-index.json` data) but its folder does not appear in the repository.

Possible explanations:
- `commune-names` has not been published to this repo yet (it exists elsewhere or was never committed)
- The system instructions were written in anticipation of a fifth story that hasn't landed

## What I did NOT do

Per the abort protocol, I made no changes to any story folders and did not create any new story content.

## Recommendation

Add `stories/commune-names/` to main (if it exists) or update the pre-flight checklist in the system instructions to reflect the actual published set (currently 4 stories, not 5). Once that is resolved, re-run the auto-draft agent.
