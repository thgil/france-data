# france-data

Data storytelling about France, built on top of the French government's
[`datagouv-mcp`](https://github.com/datagouv/datagouv-mcp) server.

One story per page. Plain HTML, CSS, and JS — no framework. Charts use
D3.js and Observable Plot via CDN.

## Structure

- `stories/<slug>/` — each published story (handcrafted `index.html`,
  snapshotted `data.json`, `meta.json` for the index build)
- `shared/` — shared editorial CSS, masthead, chart helpers
- `research/` — question log, story pipeline, hooks, dataset catalog,
  daily research logs, per-topic notes
- `scripts/` — Node build helpers (no runtime dependencies)

## Build

```bash
npm run build   # regenerates index.html from stories/*/meta.json
npm test        # runs build-script tests
```

## Adding a story

1. Pick a `💡 idea` from `research/story-ideas.md` and mark it
   `🔬 researching`.
2. Create `stories/<slug>/` with `meta.json`, `data.json`, `index.html`.
3. `npm run build` to rebuild the index.
4. Mark the idea `✅ published` in `story-ideas.md`.
