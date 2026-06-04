# Auto-draft aborted — 2026-06-04

## Issue

The startup checklist requires the following five story folders to be present before any draft work begins:

- `stories/pharmacy-myth/` ✅
- `stories/medical-deserts/` ✅
- `stories/baguettes/` ✅
- `stories/bars/` ✅
- `stories/commune-names/` ❌ **MISSING**

`commune-names` is absent from the repo and from all of git history (`git log --all` shows no commit ever creating it). This is not a wrong-checkout situation — the story simply has not been built yet.

## Why this is unusual

The run instructions list `commune-names` as a published story and also reference its data file (`stories/commune-names/communes-index.json`) as an available in-repo asset. Both are missing, which means either:

1. The instructions were written in anticipation of this story being published before the next auto-run, or
2. The story was drafted locally but never committed/pushed.

## What to do

Before the next auto-run, **publish the `commune-names` story** (or update the startup checklist and data-file references to remove it). Once `stories/commune-names/` exists on `main`, auto-drafts can proceed normally.

## What was NOT done

No story files were created. No research files were modified. Only this log entry was written.
