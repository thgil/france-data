# Auto-draft aborted — 2026-05-22

## What happened

The agent start-check requires that `stories/commune-names/` exists before proceeding. It was not present.

## Why this is not a bad checkout

`commune-names` has never been committed to this repository. A full `git log --oneline --all` shows only four published stories:

- `baguettes` (88b043d)
- `bars` (a0f7908)
- `medical-deserts` (a8697f8)
- `pharmacy-myth` (earlier)

There is no commit mentioning `commune-names` anywhere. The abort guard's premise — *"your checkout is wrong"* — does not apply here. The repo is in the correct state; `commune-names` simply hasn't been created yet.

## The mismatch

The agent system prompt lists `commune-names` as a fifth required published story and references two data files that don't exist:
- `stories/commune-names/communes-index.json`
- `stories/commune-names/` folder

These were anticipated by the prompt author but never shipped.

## Recommendation

**Option A (preferred):** Update the agent system prompt to remove `commune-names` from the required-folder checklist, OR make the checklist dynamic (check `git log` rather than a hard-coded list).

**Option B:** Run the agent once with `commune-names` explicitly allowed as the new draft story so it can be created and merged, then subsequent runs will pass the check.

**Option C:** Remove `commune-names` from the data-reuse references in the prompt and rely only on the four files that do exist:
- `stories/medical-deserts/communes-apl.geojson`
- `stories/pharmacy-myth/communes.geojson` + `pharmacies.json`
- `stories/baguettes/bakeries.json`
- `stories/bars/bars.json`

## What was ready to go

There are many open 🟢 questions in `questions.md` that are answerable with existing in-repo data. Candidate stories using no new downloads:

- **Forest cover by département** — APL geojson has dept codes + populations, could be joined with forest data
- **Oldest/youngest communes** — naming patterns in the communes data
- **Bar density by département** — bars.json (49K points) + population from APL geojson
- **Medical desert + bar density correlation** — bars.json × APL scores, does the *diagonale du vide* show up in bars too?

The last one is particularly strong: bars.json (49,385 national points) can be aggregated by département and crossed against APL scores from communes-apl.geojson to show whether low-healthcare areas also have fewer/more bars. No downloads needed.

## What to do next

Fix the system prompt, then re-run. The data is there; the guard condition is the only blocker.
