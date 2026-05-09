# Auto-draft aborted — 2026-05-09

## What happened

The session start check failed. The `v1-build` branch (the repo's only remote branch, equivalent to `main`) is missing 4 of the 5 required published story folders:

| Story folder | Present on v1-build? |
|---|---|
| `stories/pharmacy-myth/` | ✅ yes |
| `stories/medical-deserts/` | ❌ missing |
| `stories/baguettes/` | ❌ missing |
| `stories/bars/` | ❌ missing |
| `stories/commune-names/` | ❌ missing |

Per the abort rule: *"If any of those five published story folders is missing, ABORT IMMEDIATELY — your checkout is wrong and any work you do will appear to delete published stories."*

## What the git history shows

When the session started in a detached HEAD state (at `refs/heads/v1-build`), git warned that **9 commits were "left behind, not connected to any branch"**, including:

- `a0f7908` — Add fourth story: Where France drinks — 49,385 bars mapped
- `25fb7c4` — Improve bakery names: enseigne fields, 28% now named
- `2e69948` — Fix bakery tooltip
- `ac52a42` — Upgrade baguettes story: real SIRENE locations
- …and 5 more

These dangling commits contain the missing stories, but they are not on any branch and were not reachable from `origin/v1-build`.

The GitHub repo shows **30+ draft branches** for baguettes, commune-names, bars, medical-deserts etc., none of which have been merged into `v1-build`.

## What likely happened

Previous agent runs created stories and pushed them to draft branches, but the user has not yet merged any of these drafts into `v1-build`. The system prompt treats them as "published" but they have not actually been merged into the main branch.

## What the user should do

1. Review and merge the pending draft branches (or at least the story branches for medical-deserts, baguettes, bars, commune-names) into `v1-build`.
2. Or update the system prompt to reflect which stories are actually merged/published on `v1-build`.
3. Once `v1-build` has all 5 story folders, re-run this agent.

## Draft branches that likely contain the missing stories

- `drafts/auto-2026-05-05-1627-baguettes` or `drafts/auto-2026-05-05-1819-baguettes`
- `drafts/auto-2026-05-05-2015-commune-names` (and several later commune-names variants)
- `drafts/auto-2026-05-06-2017-bar-density` (bars)
- Various medical-deserts / APL drafts (e.g. `drafts/auto-2026-05-07-1623-city-doctors`, `drafts/auto-2026-05-07-1820-health-league`)
