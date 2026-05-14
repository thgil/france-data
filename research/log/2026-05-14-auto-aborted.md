# Auto-draft aborted — 2026-05-14

## Reason

The mandatory pre-flight check failed. `stories/commune-names/` is absent from the repository.

The instructions require five published story folders to be present before any work proceeds:

- `stories/pharmacy-myth/` ✅
- `stories/medical-deserts/` ✅
- `stories/baguettes/` ✅
- `stories/bars/` ✅
- `stories/commune-names/` ❌ **MISSING**

`git log --all` shows no commit that ever added this folder — it was never created in this repository. The system prompt references it as a published story, but the repo does not contain it.

## What was done

- `git checkout main && git pull origin main` — succeeded, up to date.
- `ls stories/` — showed only 4 folders, not 5.
- No story work was attempted.
- No existing files were modified.

## Recommended action

Either:
1. Create the `commune-names` story and merge it to main before running auto-draft again, or
2. Update the auto-draft instructions to remove `commune-names` from the required pre-flight list if it is not yet published.
