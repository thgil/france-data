# Auto-draft aborted — 2026-05-29

## What happened

The startup check requires these five story folders to be present on `main`:

```
pharmacy-myth, medical-deserts, baguettes, bars, commune-names
```

`commune-names` is **missing**. The workflow instructions call for an immediate abort
when any of these folders is absent.

## What the repo actually contains

Four published stories on `main` (confirmed via `git log --oneline`):

| Story | Commit |
|---|---|
| pharmacy-myth | (initial) |
| medical-deserts | `a8697f8` |
| baguettes | `88b043d` |
| bars | `a0f7908` |

`commune-names` does not appear anywhere in the git history, in `research/story-ideas.md`,
or on any branch. The file `stories/commune-names/communes-index.json` (referenced in the
workflow instructions as an in-repo asset) also does not exist.

## Why this is not a corrupted-checkout problem

The checkout is correct — `git pull origin main` succeeded and the working tree matches
`HEAD`. The abort condition fired because the workflow instructions were written anticipating
a fifth story (`commune-names`) that has not yet been created or merged.

## Safe to proceed?

Yes — from a git-safety standpoint. A new story created from this base would show only
additions in the diff, with zero deletions of any published story folder. The step-7
sanity check (`git diff --stat main`) would confirm this before any commit.

However, the instructions are explicit: abort if the folder is missing. Honouring that
here so the user can decide whether to:

1. Create / merge the `commune-names` draft first, then re-run this agent, **or**
2. Update the workflow `ls stories/` check to reflect the actual current list (4 stories),
   and the "Published, untouchable slugs" section to remove `commune-names` until it ships.

## Recommended next action

Update the workflow instructions to match the repo's actual state — either remove
`commune-names` from the required list until it's merged, or create that story and
merge it first.

Once the instructions match the repo, re-run the autonomous draft agent; there are
several strong open questions (Q-034 baguette capital, Q-037 most common commune name,
Q-039 shortest commune name, Q-029 roundabouts) that are buildable from existing
in-repo data.
