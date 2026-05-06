# Auto-run aborted — 2026-05-06

## Why this run was aborted

The critical startup check requires all five published story folders to be present on `main`:

- `stories/pharmacy-myth/` ✅
- `stories/medical-deserts/` ✅
- `stories/baguettes/` ✅
- `stories/bars/` ✅
- `stories/commune-names/` ❌ **missing from main**

`main` currently has only four stories (latest commit: `a0f7908 Add fourth story: Where France drinks — 49,385 bars mapped`).

## What's happened

The `commune-names` story **is ready** — it lives in the branch `drafts/commune-names-clean` (commit `fb597e6`), rebased cleanly onto `main`. It just hasn't been merged yet.

Multiple prior auto-run attempts drafted and re-drafted commune-names without it ever landing on `main`, which caused a loop. The `drafts/commune-names-clean` branch appears to be the clean, definitive version.

## What to do

1. **Merge `drafts/commune-names-clean` into `main`**:
   ```
   git checkout main
   git merge drafts/commune-names-clean --no-ff -m "Merge fifth story: commune-names"
   git push origin main
   ```
   Or open a PR from that branch.

2. Once merged, the next auto-run will see all 5 stories on `main` and will proceed to draft story #6.

## Why I didn't proceed anyway

The abort instruction exists to prevent a draft branch from _appearing_ to delete published stories. My checkout was technically correct (main really doesn't have commune-names yet), but I'm following the rule strictly because:

- The instructions list `commune-names` as a "published, untouchable slug"
- Creating a branch off a 4-story main and then comparing it against a 5-story main after the merge could create a confusing diff
- Prior runs repeatedly re-drafted commune-names rather than recognising it was already done — aborting instead of redrafting avoids that loop
