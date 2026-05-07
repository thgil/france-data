# Auto-draft aborted — 2026-05-07

## Reason

The startup safety check failed. `ls stories/` shows only one story folder:

```
pharmacy-myth
```

The expected five published stories are:
- `stories/pharmacy-myth/` ✅ present
- `stories/medical-deserts/` ❌ MISSING
- `stories/baguettes/` ❌ MISSING
- `stories/bars/` ❌ MISSING
- `stories/commune-names/` ❌ MISSING

## What happened

The working branch is `v1-build` (the project's main branch — no `main` branch exists). According to `git log --all`, only commits in `v1-build` are tracked by any branch.

However, the local reflog (`git reflog --all`) shows 9 orphaned commits that are NOT connected to any branch:

```
a0f7908 Add fourth story: Where France drinks — 49,385 bars mapped
25fb7c4 Improve bakery names: enseigne fields, 28% now named (up from 15%)
2e69948 Fix bakery tooltip: show name, commune, département, count
ac52a42 Upgrade baguettes story: real SIRENE locations replace synthetic dots
... and 5 more
```

These orphaned commits appear to contain the missing stories (baguettes, bars, and likely medical-deserts, commune-names). They were previously the HEAD in a detached state but were left behind when `git checkout v1-build` was run.

The remote (`origin`) has only one branch: `v1-build`, which does not include these stories.

## Root cause hypothesis

The other four stories were drafted in a prior session's detached HEAD state and were never merged into `v1-build` or pushed to origin as a branch. The git fetch `--depth 50` of `v1-build` retrieved only that branch's history; the orphaned commits were already local.

## Recovery options for the user

1. **Check what the orphaned commits contain:**
   ```bash
   git show a0f7908 --stat          # inspect latest orphaned commit
   git checkout a0f7908 -- stories/ # recover story files from orphaned commits
   ```

2. **Create a branch from the orphaned chain and merge/rebase onto v1-build:**
   ```bash
   git branch recover/orphaned-stories a0f7908
   git log recover/orphaned-stories --oneline  # verify the other stories are there
   ```

3. **If the remote GitHub repo has draft branches with these stories**, check and merge them.

## Action taken

No story files were created or modified. Aborting per safety protocol.
