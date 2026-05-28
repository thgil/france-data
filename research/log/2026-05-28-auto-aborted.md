# Auto-draft aborted — 2026-05-28

## Reason

The workflow guard requires `stories/commune-names/` to exist before proceeding. It is listed in the instructions as a "published, untouchable slug" and as a source of reusable data (`stories/commune-names/communes-index.json`). That folder is **missing**.

## Investigation

- `git checkout main && git pull origin main` succeeded cleanly.
- `ls stories/` shows: `baguettes`, `bars`, `medical-deserts`, `pharmacy-myth` — **four stories, not five**.
- `git log --all --oneline | grep commune` returned nothing — `commune-names` is not in any branch or commit.
- `commune-names` was never built; this is not a bad-checkout issue.

## What likely happened

The workflow instructions were written in anticipation of `commune-names` being the fifth published story, but a run to build it hasn't happened yet (or was interrupted before pushing). The spec got ahead of the repo.

## What to do next

Two options:

**A) Run the workflow again with updated awareness**  
The workflow instructions can be amended to remove `commune-names` from the "must-see" guard and instead treat it as the *next story to build*. Good candidate questions from `research/questions.md`:
- **Q-037** (🟢 open): What is the single most common commune name in France?
- **Q-039** (🟢 open): Which commune in France has the shortest official name?

Data is available: `stories/medical-deserts/communes-apl.geojson` contains 34,886 communes with full names. No download needed.

**B) Tell the agent to build `commune-names`**  
Re-run with an explicit instruction to build `commune-names` as the next story, bypassing the abort guard for this one run since the git state is confirmed correct.

## Git state at abort time

```
Branch:  main (HEAD)
Stories: baguettes, bars, medical-deserts, pharmacy-myth
Log:     a0f7908 Add fourth story: Where France drinks — 49,385 bars mapped
```
