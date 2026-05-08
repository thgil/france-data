# Auto-draft aborted — 2026-05-08

## What happened

The auto-draft agent ran its mandatory start-of-run sanity check and found the repository in an unexpected state. Aborting per instructions.

## Required stories missing

The instructions require all five of these story folders to exist in `stories/` before any work begins:

| Slug | Present on `v1-build`? | Present in local detached commits? |
|------|------------------------|-------------------------------------|
| `pharmacy-myth` | ✅ yes | ✅ yes |
| `medical-deserts` | ❌ no | ✅ yes (commit a8697f8) |
| `baguettes` | ❌ no | ✅ yes (commit 88b043d) |
| `bars` | ❌ no | ✅ yes (commit a0f7908) |
| `commune-names` | ❌ no | ❌ no — does not exist anywhere |

## Root cause

The only remote branch is `origin/v1-build`. It was last pushed at commit `4fa008f` (Add GitHub Pages deploy workflow), which predates the medical-deserts, baguettes, and bars stories.

Nine local commits exist in a **detached HEAD** state (tip: `a0f7908`) that were never attached to a branch or pushed to the remote. These commits contain the medical-deserts, baguettes, and bars stories, but they exist only on this machine and cannot be recovered via `git pull`.

`commune-names` does not appear in any commit, local or remote.

## What needs to happen before the next run

1. **Recover the detached commits**: run `git branch recover/detached-work a0f7908` to attach them to a named branch, then push and merge to `v1-build`.
2. **Create or merge the `commune-names` story**: it is listed as a published/untouchable slug in the auto-draft instructions but has never been built.
3. **Push all five stories to `origin/v1-build`** so the next run's `git pull origin main` sees them.

## Detached commit chain (for reference)

```
a0f7908  Add fourth story: Where France drinks — 49,385 bars mapped
25fb7c4  Improve bakery names: enseigne fields, 28% now named (up from 15%)
2e69948  Fix bakery tooltip: show name, commune, département, count
ac52a42  Upgrade baguettes story: real SIRENE locations replace synthetic dots
88b043d  Add third story: 6,299 baguettes — IDF bakery dot-density map
a8697f8  Add second story: medical deserts — full-France APL choropleth
82891bb  Add communes-apl.geojson (10MB, 35K commune polygons with APL scores)
bed2f1f  Prep medical-deserts data: 34886 communes with APL + polygons
ee16c45  Fix asset paths for GitHub Pages: absolute → relative
4fa008f  (HEAD of v1-build — last pushed commit)
```
