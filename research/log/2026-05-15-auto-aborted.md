# Auto-draft aborted — 2026-05-15

## What happened

The startup invariant check failed. The agent instructions require all five of these
story folders to be present before proceeding:

- stories/pharmacy-myth/ ✅
- stories/medical-deserts/ ✅
- stories/baguettes/ ✅
- stories/bars/ ✅
- stories/commune-names/ ❌ **MISSING**

`stories/commune-names/` does not exist in `stories/`, and there is no commit in
the git log that ever added it. The four published stories are intact; this is not
a corrupted checkout.

## Likely explanation

The agent instructions appear to have been written in anticipation of `commune-names`
being published, listing it as the fifth required story. It has not been published yet
in the actual repository.

The instructions also reference `stories/commune-names/communes-index.json` as an
existing data file to reuse — that file will not exist until the story is built.

## Recommended action

If `commune-names` is intended to be the **next story** to build, either:

1. Remove `commune-names` from the "must-see" list in the agent instructions until
   it is published, **or**
2. Confirm to the agent that it is safe to treat `commune-names` as the story to
   build this run (the abort guard exists to catch wrong checkouts, not missing
   future stories).

No files were modified. The agent took no further action.
