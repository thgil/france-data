# Auto-draft aborted — 2026-05-30

## Reason

The pre-flight check failed: `stories/commune-names/` is missing from `main`.

The instructions require that all five of the following folders exist before any work begins:

- `stories/pharmacy-myth/` ✅
- `stories/medical-deserts/` ✅
- `stories/baguettes/` ✅
- `stories/bars/` ✅
- `stories/commune-names/` ❌ **MISSING**

`git log --oneline -5` shows the latest story commit as:

```
a0f7908 Add fourth story: Where France drinks — 49,385 bars mapped
```

So only four stories exist on `main`. The `commune-names` story is either still on a draft branch or has not yet been created. Proceeding without it would risk corrupting the branch baseline or producing misleading diffs.

## Action required

Please merge the `commune-names` story to `main` (or remove it from the required-stories list in the workflow) before running the auto-draft agent again.

## What was NOT done

- No new story was started.
- No published story files were touched.
- The abort was triggered at the initial sanity-check step.
