# Auto-draft aborted — 2026-05-28

## Reason

The mandatory pre-flight check failed. The five required published story folders must all be present on `main` before any draft work begins. After a fresh `git checkout main && git pull origin main`, the following check:

```
ls stories/
```

returned only four folders:
- `baguettes` ✅
- `bars` ✅
- `medical-deserts` ✅
- `pharmacy-myth` ✅
- `commune-names` ❌ **MISSING**

Searching all branches and the full git log confirmed that `stories/commune-names/` was **never committed to this repository** — it is not a checkout or sync issue. There is no branch containing it.

## Action taken

Aborted immediately per instructions. No story work was started, and no existing story files were touched.

## Recommended next steps

1. Determine whether `commune-names` was lost in a force-push or was simply never published. The research files (`questions.md`, `story-ideas.md`, `hooks.md`) may reference it as published — if so, those references should be reviewed.
2. Either publish the `commune-names` story manually, or update the agent instructions to remove it from the required-presence list.
3. Re-run the agent after the pre-flight check would pass.
