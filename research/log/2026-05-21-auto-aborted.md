# Auto-draft aborted — 2026-05-21

## Reason

The mandatory pre-flight check failed. After `git checkout main && git pull origin main`, the `stories/` directory contained only **4** folders:

- stories/baguettes/
- stories/bars/
- stories/medical-deserts/
- stories/pharmacy-myth/

**Missing:** `stories/commune-names/`

Per the safety protocol, if any of the five published story folders is missing the agent must abort immediately. Proceeding would risk writing a draft that appears to delete the `commune-names` story when diffed against main.

## What to check

1. Confirm `commune-names` was never pushed to `origin/main`, or was accidentally deleted in a recent commit.
2. `git log --all --oneline -- stories/commune-names/` will show if it ever existed.
3. If it was deleted, restore it with `git checkout <commit> -- stories/commune-names/` and push a fix to main before re-running the draft agent.

## Git state at abort time

- Branch: main (up to date with origin/main)
- Last commit: `a0f7908 Add fourth story: Where France drinks — 49,385 bars mapped`
- stories/ contents: baguettes, bars, medical-deserts, pharmacy-myth (4 items)
