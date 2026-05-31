# Auto-draft aborted — 2026-05-31

## Reason

The pre-flight check requires `stories/commune-names/` to be present before any draft work begins. That folder is **missing** from the repository.

## What was checked

```
git checkout main && git pull origin main  # succeeded, "Already up to date"
ls stories/
# baguettes
# bars
# medical-deserts
# pharmacy-myth
```

`commune-names` does not appear in any commit across the entire git log (20 commits checked). The most recent commit is:

```
a0f7908 Add fourth story: Where France drinks — 49,385 bars mapped
```

There is no commit that ever added `stories/commune-names/`.

## Why this triggers the abort rule

The workflow instructions list **five** required published story folders:
- `stories/pharmacy-myth/` ✅ present
- `stories/medical-deserts/` ✅ present
- `stories/baguettes/` ✅ present
- `stories/bars/` ✅ present
- `stories/commune-names/` ❌ **MISSING**

The instructions say: *"If any of those five published story folders is missing, ABORT IMMEDIATELY — your checkout is wrong and any work you do will appear to delete published stories."*

## Hypothesis

`commune-names` is referenced in the workflow instructions as if it has been published, but it was never committed to the repo. The workflow also references `stories/commune-names/communes-index.json` as an in-repo data source. It appears this story either:

1. Was planned and described in the instructions before being actually committed, or
2. Was accidentally omitted from the repository.

## Recommended action for human reviewer

Either:
- Publish the `commune-names` story first, then re-run this workflow, OR
- Update the workflow instructions to remove `commune-names` from the required-folders check if it has not been published yet.
