# Auto-draft aborted — 2026-05-15

## Reason

The `stories/commune-names/` folder is **missing** from the main branch.

The draft agent's startup check requires all five published story folders to be present:
- `stories/pharmacy-myth/` ✅
- `stories/medical-deserts/` ✅
- `stories/baguettes/` ✅
- `stories/bars/` ✅
- `stories/commune-names/` ❌ **MISSING**

`git log --oneline -5` shows only four stories committed. The most recent commit
is "Add fourth story: Where France drinks — 49,385 bars mapped", confirming that
`commune-names` has not yet been published to main.

## What this means

The agent's system prompt lists `commune-names` as a published story that must not be
touched, but it does not yet exist in the repo. This is likely a discrepancy between the
prompt (which was written anticipating future stories) and the actual repository state.

## Action taken

No story was written. No existing files were modified. This log note is committed on a
draft branch so the discrepancy is visible to the user.

## Recommendation

Either:
1. Create and merge the `commune-names` story so the repo matches the system prompt, OR
2. Update the system prompt to reflect the actual set of published stories (currently 4).

Once resolved, re-run the agent.
