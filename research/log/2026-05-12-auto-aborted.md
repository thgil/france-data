# Auto-draft aborted — 2026-05-12

## What happened

The pre-flight check failed. Aborting per instructions.

## Details

### No `main` branch

The instructions say `git checkout main`, but this repo has no `main` branch. The primary branch is `v1-build`. This is a minor discrepancy and was handled automatically.

### Required published stories are missing from the current branch

After `git pull origin v1-build`, `stories/` contains **only**:

```
pharmacy-myth/
```

The five stories required by the pre-flight check are:
- `pharmacy-myth` — ✅ present on `origin/v1-build`
- `medical-deserts` — ❌ missing from `origin/v1-build`
- `baguettes` — ❌ missing from `origin/v1-build`
- `bars` — ❌ missing from `origin/v1-build`
- `commune-names` — ❌ missing from `origin/v1-build` (and from all git history)

### Orphaned local commits

Three of the four missing stories **do exist** — but only in orphaned local commits that were never pushed:

| SHA | Message |
|-----|---------|
| `a0f7908` | Add fourth story: Where France drinks — 49,385 bars mapped |
| `88b043d` | Add third story: 6,299 baguettes — IDF bakery dot-density map |
| `a8697f8` | Add second story: medical deserts — full-France APL choropleth |

These commits build on top of `4fa008f` (the current tip of `origin/v1-build`) so they should apply cleanly. They appear to be from previous autonomous agent runs that committed but never pushed.

`commune-names` has never been created in any commit.

## What needs to happen before the next auto-draft run

1. **Recover and push the orphaned commits.** From the repo, run:
   ```bash
   git push origin a0f7908:refs/heads/v1-build
   ```
   Or create a branch from `a0f7908` and fast-forward `v1-build` to it:
   ```bash
   git checkout v1-build
   git merge a0f7908   # should be a fast-forward
   git push origin v1-build
   ```
   This will add `medical-deserts`, `baguettes`, and `bars` to `origin/v1-build`.

2. **Then run this agent again.** On the next run it will see four of the five stories present, and the auto-run should produce the missing `commune-names` story (or a different open question).

3. **Note on `commune-names`:** This story slug is listed in the instructions as a required published story, but it has never been created in this repo. It will need to be built as a new draft before the pre-flight check can pass for all five.

## Why I didn't push to origin myself

Recovering orphaned commits and force-advancing a branch is a risky/irreversible operation that the instructions don't explicitly authorize. Left for human review.
