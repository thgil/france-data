# France Data Site v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1 of the France data storytelling site: scaffolded repo, seeded research infrastructure, one complete published story, one daily research loop executed end-to-end, and a live deploy.

**Architecture:** Static HTML/CSS/JS site with one story per folder. A Node build script scans `stories/` and regenerates `index.html`. Research lives in markdown under `research/` with cross-linked Q-### / DS-### IDs. Data for stories is snapshotted to `data.json` at research time so the published site never hits the MCP server.

**Tech Stack:** HTML / CSS / vanilla JS, D3.js + Observable Plot via CDN, Node 20+ (built-in test runner, no dependencies), `datagouv-mcp` hosted at `https://mcp.data.gouv.fr/mcp`. Deploy target: GitHub Pages.

---

## File Structure

Files this plan creates:

- `package.json` — declares Node engine + build/test scripts (no runtime deps)
- `.gitignore` — ignores `.superpowers/`, `node_modules/`, `.DS_Store`
- `README.md` — one-paragraph project overview + how to build/add a story
- `index.html` — auto-generated grid of story cards (rebuilt by `scripts/build-index.js`)
- `shared/style.css` — editorial typography, masthead, card grid, story-page primitives
- `shared/nav.js` — injects masthead into every story page at runtime
- `shared/charts.js` — reusable D3 / Plot helpers (reserved for Task 6; empty stub for now)
- `scripts/build-index.js` — reads `stories/*/meta.json`, writes `index.html`
- `scripts/build-index.test.js` — Node test runner tests for the build script
- `stories/.gitkeep` — keeps the folder in git while it's empty
- `stories/<slug>/index.html` — one full story (Task 6)
- `stories/<slug>/data.json` — data snapshot for that story
- `stories/<slug>/meta.json` — card metadata (title, dek, topic, slug, date)
- `research/questions.md` — seeded with 40 starter questions
- `research/story-ideas.md` — empty pipeline header + legend
- `research/hooks.md` — empty file with format explanation
- `research/datasets.md` — empty catalog header
- `research/log/README.md` — explains log format
- `research/log/YYYY-MM-DD.md` — first research session entry (Task 5)
- `research/topics/{demographics,economy,health,education,environment,transport,culture}.md` — seven topic files

Each file has one clear responsibility. The split between `meta.json` and `index.html` per story keeps structured metadata (for the index build) separate from the handcrafted narrative page.

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `README.md`
- Modify: `.gitignore` (already created by brainstorming; append entries)
- Create: `stories/.gitkeep`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "france-data",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Data storytelling about France, built on datagouv-mcp.",
  "scripts": {
    "build": "node scripts/build-index.js",
    "test": "node --test scripts/"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create `README.md`**

```markdown
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
```

- [ ] **Step 3: Append to `.gitignore`**

Current contents are `.superpowers/`. Add the rest:

```gitignore
.superpowers/
node_modules/
.DS_Store
```

- [ ] **Step 4: Create `stories/.gitkeep`** (empty file)

Run: `mkdir -p stories && touch stories/.gitkeep`

- [ ] **Step 5: Verify**

Run: `ls -la && cat package.json && cat .gitignore`
Expected: `package.json`, `README.md`, `.gitignore` with three lines, and a `stories/` directory containing `.gitkeep`.

- [ ] **Step 6: Commit**

```bash
git add package.json README.md .gitignore stories/.gitkeep
git commit -m "Scaffold project: package.json, README, stories/"
```

---

## Task 2: Shared Editorial Styling

**Files:**
- Create: `shared/style.css`
- Create: `shared/nav.js`
- Create: `shared/charts.js`

- [ ] **Step 1: Create `shared/style.css`**

```css
/* ===== France Data — shared editorial styles ===== */

:root {
  --paper: #faf7f2;
  --ink: #1a1a1a;
  --ink-soft: #3a3a3a;
  --ink-mute: #666;
  --rule: #1a1a1a;
  --accent: #b32020;
  --card-hover: #f0ece4;
  --max-width: 1080px;
  --serif: Georgia, 'Times New Roman', serif;
  --sans: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
}

body { line-height: 1.5; }

/* Masthead */
.masthead {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 32px 24px 16px;
  border-bottom: 1px solid var(--rule);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.masthead a { color: inherit; text-decoration: none; }
.masthead .wordmark { font-weight: 700; font-family: var(--serif); font-size: 14px; letter-spacing: 1px; text-transform: none; }
.masthead .meta { color: var(--ink-mute); }

/* Page frame */
.page {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 32px 24px 96px;
}

/* Story page typography */
.story-header { margin: 48px 0 32px; }
.story-kicker {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}
.story-title {
  font-family: var(--serif);
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.1;
  font-weight: 700;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
}
.story-dek {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1.45;
  color: var(--ink-soft);
  margin: 0 0 24px;
  font-style: italic;
}
.story-meta {
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ink-mute);
  display: flex;
  gap: 16px;
}

.story p {
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.6;
  color: var(--ink);
  max-width: 680px;
  margin: 0 auto 20px;
}

.story h2 {
  font-family: var(--serif);
  font-size: 28px;
  line-height: 1.2;
  margin: 48px auto 16px;
  max-width: 680px;
}

.story figure { margin: 48px 0; }
.story figcaption {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink-mute);
  max-width: 680px;
  margin: 12px auto 0;
}

/* Index grid */
.index-intro {
  max-width: 720px;
  margin: 48px 0 64px;
}
.index-intro h1 {
  font-family: var(--serif);
  font-size: 48px;
  margin: 0 0 16px;
  font-weight: 700;
}
.index-intro p {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1.5;
  color: var(--ink-soft);
  margin: 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

.story-card {
  background: var(--paper);
  border: 1px solid transparent;
  padding: 24px;
  display: block;
  color: inherit;
  text-decoration: none;
  transition: background 150ms ease, border-color 150ms ease;
}
.story-card:hover {
  background: var(--card-hover);
  border-color: var(--rule);
}

.story-card .kicker {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}
.story-card h2 {
  font-family: var(--serif);
  font-size: 24px;
  line-height: 1.2;
  margin: 0 0 12px;
  font-weight: 700;
}
.story-card .dek {
  font-family: var(--serif);
  font-size: 15px;
  line-height: 1.5;
  color: var(--ink-soft);
  margin: 0 0 16px;
  font-style: italic;
}
.story-card .meta {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--ink-mute);
}

/* Footer */
.site-footer {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 32px 24px;
  border-top: 1px solid var(--rule);
  font-size: 12px;
  color: var(--ink-mute);
  display: flex;
  justify-content: space-between;
}
.site-footer a { color: inherit; }
```

- [ ] **Step 2: Create `shared/nav.js`**

```javascript
// Injects the shared masthead into every story page.
// Usage: <script src="/shared/nav.js" defer></script> at the top of <body>.

(function () {
  const mount = document.getElementById('masthead');
  if (!mount) return;

  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();

  mount.className = 'masthead';
  mount.innerHTML = `
    <a href="/" class="wordmark">France, by the numbers</a>
    <span class="meta">${month} ${year}</span>
  `;
})();
```

- [ ] **Step 3: Create `shared/charts.js`** (stub — filled in per-story)

```javascript
// shared/charts.js
// Reserved for reusable D3 / Observable Plot helpers. Start empty;
// promote a helper here the first time a second story needs the same
// pattern. Don't invent abstractions speculatively.

export {};
```

- [ ] **Step 4: Verify**

Run: `ls shared/ && wc -l shared/style.css`
Expected: three files present; style.css is roughly 150+ lines.

- [ ] **Step 5: Commit**

```bash
git add shared/
git commit -m "Add shared editorial stylesheet, masthead injector, charts stub"
```

---

## Task 3: Build Script (TDD)

**Files:**
- Create: `scripts/build-index.js`
- Create: `scripts/build-index.test.js`

The build script reads every `stories/*/meta.json`, sorts by date descending, and writes a static `index.html` with cards linking to each story. Using Node's built-in test runner (Node 20+) so there are zero dev dependencies.

### meta.json contract

Each story folder contains a `meta.json` like:

```json
{
  "slug": "pharmacies-vs-bakeries",
  "title": "More pharmacies than bakeries. Really.",
  "dek": "The French love bread. But they go to the pharmacie more often than the boulangerie — by a wide margin.",
  "topic": "Economy",
  "date": "2026-04-20",
  "readTime": "5 min read"
}
```

- [ ] **Step 1: Write the failing test**

Create `scripts/build-index.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildIndex } from './build-index.js';

function makeTempProject() {
  const root = mkdtempSync(join(tmpdir(), 'france-data-'));
  mkdirSync(join(root, 'stories'));
  mkdirSync(join(root, 'shared'));
  writeFileSync(join(root, 'shared', 'style.css'), '/* test */');
  return root;
}

function addStory(root, meta) {
  const dir = join(root, 'stories', meta.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta));
  writeFileSync(join(dir, 'index.html'), '<p>story</p>');
}

test('buildIndex writes an index.html that lists every story card', () => {
  const root = makeTempProject();
  addStory(root, {
    slug: 'pharmacies-vs-bakeries',
    title: 'More pharmacies than bakeries. Really.',
    dek: 'French pharmacies outnumber the bakeries per capita.',
    topic: 'Economy',
    date: '2026-04-20',
    readTime: '5 min read'
  });

  buildIndex(root);

  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /More pharmacies than bakeries/);
  assert.match(html, /href="\/stories\/pharmacies-vs-bakeries\/"/);
  assert.match(html, /Economy/);
  assert.match(html, /5 min read/);
  assert.match(html, /<link rel="stylesheet" href="\/shared\/style.css">/);

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex sorts stories newest-first by date', () => {
  const root = makeTempProject();
  addStory(root, { slug: 'older', title: 'Older story', dek: '-', topic: 'X', date: '2026-01-01', readTime: '1 min' });
  addStory(root, { slug: 'newer', title: 'Newer story', dek: '-', topic: 'X', date: '2026-05-01', readTime: '1 min' });

  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');

  const newerIdx = html.indexOf('Newer story');
  const olderIdx = html.indexOf('Older story');
  assert.ok(newerIdx > -1 && olderIdx > -1, 'both stories present');
  assert.ok(newerIdx < olderIdx, 'newer story appears before older story');

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex renders an empty-state when no stories exist', () => {
  const root = makeTempProject();
  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /No stories yet/);
  rmSync(root, { recursive: true, force: true });
});

test('buildIndex ignores folders without a meta.json (e.g. drafts)', () => {
  const root = makeTempProject();
  mkdirSync(join(root, 'stories', 'draft-story'), { recursive: true });
  writeFileSync(join(root, 'stories', 'draft-story', 'index.html'), '<p>wip</p>');
  // No meta.json — should be skipped.

  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /draft-story/);

  rmSync(root, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npm test`
Expected: import error — `build-index.js` does not exist yet, or `buildIndex` is undefined.

- [ ] **Step 3: Implement `scripts/build-index.js`**

```javascript
// scripts/build-index.js
// Reads stories/*/meta.json and writes a static index.html.
// Run: node scripts/build-index.js  (or: npm run build)

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function loadStories(projectRoot) {
  const storiesDir = join(projectRoot, 'stories');
  if (!existsSync(storiesDir)) return [];

  return readdirSync(storiesDir)
    .map((name) => join(storiesDir, name))
    .filter((p) => {
      try { return statSync(p).isDirectory(); } catch { return false; }
    })
    .map((dir) => {
      const metaPath = join(dir, 'meta.json');
      if (!existsSync(metaPath)) return null;
      try {
        return JSON.parse(readFileSync(metaPath, 'utf8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function renderCard(story) {
  return `
    <a class="story-card" href="/stories/${escapeHtml(story.slug)}/">
      <div class="kicker">${escapeHtml(story.topic)}</div>
      <h2>${escapeHtml(story.title)}</h2>
      <p class="dek">${escapeHtml(story.dek)}</p>
      <div class="meta">${escapeHtml(story.date)} · ${escapeHtml(story.readTime)}</div>
    </a>`;
}

function renderIndex(stories) {
  const intro = `
    <section class="index-intro">
      <h1>France, by the numbers.</h1>
      <p>Data stories pulled from the French government's open data platform — demographics, economy, health, and the occasional statistical oddity.</p>
    </section>`;

  const body = stories.length
    ? `<section class="cards-grid">${stories.map(renderCard).join('\n')}</section>`
    : `<section class="cards-grid"><p class="dek">No stories yet — check back soon.</p></section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>France, by the numbers</title>
  <link rel="stylesheet" href="/shared/style.css">
</head>
<body>
  <header id="masthead"></header>
  <main class="page">
    ${intro}
    ${body}
  </main>
  <footer class="site-footer">
    <span>Data from <a href="https://www.data.gouv.fr">data.gouv.fr</a></span>
    <span>Built with care, one story at a time.</span>
  </footer>
  <script src="/shared/nav.js" defer></script>
</body>
</html>
`;
}

export function buildIndex(projectRoot) {
  const stories = loadStories(projectRoot);
  const html = renderIndex(stories);
  writeFileSync(join(projectRoot, 'index.html'), html);
  return { count: stories.length, path: join(projectRoot, 'index.html') };
}

// Entry point when run as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, '..');
  const result = buildIndex(root);
  console.log(`Built ${result.path} (${result.count} stories)`);
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npm test`
Expected: 4 passing tests, 0 failures.

- [ ] **Step 5: Run the build against the real (empty) project**

Run: `npm run build && head -20 index.html`
Expected: `Built .../index.html (0 stories)` and an `index.html` that renders the "No stories yet" empty state.

- [ ] **Step 6: Open the generated index in a browser to verify visual**

Run: `open index.html`
Expected: warm off-white page, serif masthead wordmark "France, by the numbers" with the current month/year on the right, empty-state dek below.

- [ ] **Step 7: Commit**

```bash
git add scripts/ index.html
git commit -m "Add build-index script with tests; generate initial empty index.html"
```

---

## Task 4: Seed Research Infrastructure

**Files:**
- Create: `research/questions.md`
- Create: `research/story-ideas.md`
- Create: `research/hooks.md`
- Create: `research/datasets.md`
- Create: `research/log/README.md`
- Create: `research/topics/demographics.md`
- Create: `research/topics/economy.md`
- Create: `research/topics/health.md`
- Create: `research/topics/education.md`
- Create: `research/topics/environment.md`
- Create: `research/topics/transport.md`
- Create: `research/topics/culture.md`

- [ ] **Step 1: Create `research/questions.md` with 40 seed questions**

```markdown
# Questions

Running list of questions about France worth answering with open data.
Each question has a status, topic, and (once researched) links to
datasets and the resulting story.

## Status legend

- 🟢 **open** — not yet investigated
- 🟡 **researching** — data being explored
- 🔵 **blocked** — data not available / quality insufficient
- ✅ **answered** — finding recorded in topic file (and maybe a story)

---

## Demographics

### Q-001: Which département has aged the fastest over the last 20 years?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-002: What commune has France's highest crude birth rate?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-003: How has France's fertility rate actually changed since 2000, and where is it rising?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-004: Which French cities have the oldest and youngest median ages?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-005: What share of communes lose population every year?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-006: Where are the "centenarian capitals" — communes with the most residents over 100?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

## Economy

### Q-007: Are there really more pharmacies than bakeries in France?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-008: Which commune has the highest median household income?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-009: Which commune has the most registered businesses per capita?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-010: How much of France's GDP comes from Île-de-France alone?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-011: Which industries employ the most French workers today, and how does that compare to 1980?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-012: Where are micro-enterprises growing fastest?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

## Health

### Q-013: Which département has the longest life expectancy at birth?
- Status: 🟢 open
- Topic: [health](topics/health.md)

### Q-014: How many "medical deserts" are there in France, and where?
- Status: 🟢 open
- Topic: [health](topics/health.md)

### Q-015: Which commune has the most doctors per capita?
- Status: 🟢 open
- Topic: [health](topics/health.md)

### Q-016: How has hospital access (distance to nearest hospital) changed in the last 10 years?
- Status: 🟢 open
- Topic: [health](topics/health.md)

### Q-017: Which regions have the best cancer survival rates?
- Status: 🟢 open
- Topic: [health](topics/health.md)

## Education

### Q-018: Which département sends the highest share of students to classes préparatoires?
- Status: 🟢 open
- Topic: [education](topics/education.md)

### Q-019: Where are France's top-performing lycées, by baccalauréat results?
- Status: 🟢 open
- Topic: [education](topics/education.md)

### Q-020: How many primary schools have closed in rural France since 2000?
- Status: 🟢 open
- Topic: [education](topics/education.md)

### Q-021: What is the gender gap in French STEM higher education, by field?
- Status: 🟢 open
- Topic: [education](topics/education.md)

### Q-022: Which cities have the highest student population per capita?
- Status: 🟢 open
- Topic: [education](topics/education.md)

## Environment

### Q-023: Which commune has France's worst recorded air quality?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

### Q-024: How much forest does France actually have, and is it growing or shrinking?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

### Q-025: Which regions produce the most renewable energy per capita?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

### Q-026: How many cows does France have, and where are they densest?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

### Q-027: What's the most polluted river in France, by recent monitoring?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

## Transport

### Q-028: Which commune is farthest from a TGV station?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

### Q-029: How many roundabouts does France have, and is it really the world leader?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

### Q-030: Which département has the most traffic deaths per capita?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

### Q-031: Which cities have the most kilometers of bike lane per capita?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

### Q-032: Which TER line is the most consistently delayed?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

## Culture

### Q-033: Which commune has the most bars per capita?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-034: Where is the "baguette capital" — the commune with the most bakeries per capita?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-035: How many communes have a public library, and how many don't?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-036: Which region files the most patents per capita?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-037: What is the single most common commune name in France?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-038: Where are France's most-visited cultural sites (museums, monuments) actually located?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-039: Which commune in France has the shortest official name?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-040: Which département borrows the most books from public libraries per capita?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)
```

- [ ] **Step 2: Create `research/story-ideas.md`**

```markdown
# Story Ideas

Greenlit and pitched story ideas, with a visible status pipeline.

## Status pipeline

- 💡 **idea** — pitched, awaiting user greenlight
- 🔬 **researching** — approved, data being gathered
- ✏️ **drafting** — story page being written
- ✅ **published** — live on the site

## Pitch template

When adding a new pitch, use this shape:

```
### <slug>: <title>
- Status: 💡 idea
- Source question: [Q-###](questions.md#q-###)
- Hook: <one-sentence "wait, really?">
- Data: <which datasets, coverage, gaps>
- Angle: <chart type or narrative structure>
- Draft X summary: <1-2 sentences ready to tweet>
```

---

## Pitches

_(none yet — Task 5 will add the first pitch.)_
```

- [ ] **Step 3: Create `research/hooks.md`**

```markdown
# Hooks

Punchy one-liners surfaced during research. Each is a potential X post
on its own, whether or not it becomes a full story. Format:

`- 🔥 <one-liner with numbers> [Q-###]`

Use Q-### references so we can trace each hook back to the question
that surfaced it.

---

_(none yet — Task 5 will add the first hooks.)_
```

- [ ] **Step 4: Create `research/datasets.md`**

```markdown
# Dataset Catalog

Interesting datasets discovered on data.gouv.fr, with stable IDs so
questions, hooks, and stories can cross-link to them. When adding an
entry, include the URL, publisher, last-updated date, coverage, and
any caveats about quality.

## Entry template

```
### DS-###: <short name>
- URL: <https://www.data.gouv.fr/...>
- Publisher: <org>
- Coverage: <time range, geographic scope>
- Formats: <CSV, GeoJSON, ...>
- Notes: <caveats, missing years, encoding oddities>
- Used by: <Q-###, Q-### ...>
```

---

_(none yet — Task 5 will add the first entries.)_
```

- [ ] **Step 5: Create `research/log/README.md`**

```markdown
# Research Log

One file per research session, named `YYYY-MM-DD.md` (append `-2`,
`-3` if multiple sessions in one day). Each entry covers:

- **Topic focus** — which area was explored this session
- **Datasets explored** — what we looked at, including dead ends (link DS-###)
- **Questions touched** — which Q-###s were advanced, answered, or blocked
- **Hooks surfaced** — facts worth dropping into hooks.md
- **Pitches added** — new entries in story-ideas.md
- **Open threads** — what to pick up next time

Log entries are durable context for the daily research loop — they let
future sessions pick up without re-discovering yesterday's findings.
```

- [ ] **Step 6: Create the seven topic files**

Each topic file uses the same skeleton. Create them with this template (only the `# Title` line changes):

`research/topics/demographics.md`:
```markdown
# Demographics — France

Notes, findings, and links for demographic questions. Each section
corresponds to a finding from one or more questions; link back to the
Q-### that sparked the work.

---

_(empty — populated as research progresses.)_
```

Repeat for: `economy.md`, `health.md`, `education.md`, `environment.md`, `transport.md`, `culture.md`, changing only the `# Title` heading.

- [ ] **Step 7: Verify the research tree**

Run: `find research -type f | sort`
Expected:
```
research/datasets.md
research/hooks.md
research/log/README.md
research/questions.md
research/story-ideas.md
research/topics/culture.md
research/topics/demographics.md
research/topics/economy.md
research/topics/education.md
research/topics/environment.md
research/topics/health.md
research/topics/transport.md
```

Also: `grep -c '^### Q-' research/questions.md` should output `40`.

- [ ] **Step 8: Commit**

```bash
git add research/
git commit -m "Seed research infrastructure: 40 questions, topic files, pipeline templates"
```

---

## Task 5: First Research Session (Daily Loop, Round 1)

This is the first end-to-end run of the daily research loop. It exercises the infrastructure from Task 4 using the `datagouv-mcp` server, produces a log entry, and surfaces at least one hook and one story pitch for user review.

**Files:**
- Create: `research/log/2026-04-16.md` (or today's date)
- Modify: `research/questions.md` (update statuses)
- Modify: `research/datasets.md` (add DS-### entries)
- Modify: `research/hooks.md` (add at least one hook)
- Modify: `research/story-ideas.md` (add at least one pitch)
- Modify: `research/topics/<topic>.md` (add findings)

**Note on MCP access:** the `datagouv-mcp` server is at `https://mcp.data.gouv.fr/mcp`. If it is not already configured in the user's Claude Code MCP servers, add it before this task. Use `claude mcp add datagouv-mcp --url https://mcp.data.gouv.fr/mcp` or the platform's equivalent.

- [ ] **Step 1: Confirm MCP connectivity**

Run: list MCP tools and verify that `search_datasets`, `get_dataset_info`, `list_dataset_resources`, `get_resource_info`, `query_resource_data`, `search_dataservices`, `get_dataservice_info`, `get_dataservice_openapi_spec`, and `get_metrics` are all available. If any are missing, stop and reconfigure the MCP server before continuing.

- [ ] **Step 2: Pick today's topic focus**

Choose one topic from `research/topics/` to focus this session. For Round 1, pick **economy** — it contains the bakeries-vs-pharmacies question (Q-007) that has already been validated as interesting in the design phase, which means we can move through the loop end-to-end quickly.

Mark Q-007 in `questions.md` as `🟡 researching`.

- [ ] **Step 3: Discover relevant datasets**

Using `search_datasets`, search for candidate datasets to answer the picked questions. For Q-007, try queries like "pharmacies", "officines", "boulangeries", "commerces", "SIRENE", "répertoire des entreprises". For each promising result, call `get_dataset_info` and `list_dataset_resources` to confirm coverage and file format.

Aim to touch 3-5 questions this session, not just one. If a second question becomes easy to answer while poking around, take it.

- [ ] **Step 4: Query data and collect findings**

For each question you are advancing, call `query_resource_data` (respecting the 100MB CSV / 12.5MB XLSX limits) or `get_resource_info` to pull enough data to answer or confirm the question. Record what you found (including counter-evidence or surprises) in your notes.

- [ ] **Step 5: Catalog datasets in `research/datasets.md`**

For every dataset you actually used, add a `DS-###` entry using the template from Task 4, Step 4. Include URL, publisher, coverage, format, and any caveats. Link back by listing the Q-### under `Used by:`.

- [ ] **Step 6: Update `research/questions.md` with statuses and findings**

For each question you advanced:
- Change status to ✅ answered, 🔵 blocked, or 🟡 researching (still open).
- Append `Datasets: [DS-###](datasets.md#ds-###), ...`
- Append `Finding:` with a one-sentence summary of what the data showed.

- [ ] **Step 7: Update `research/topics/<topic>.md` with detail**

For each finding worth keeping, add a section in the relevant topic file with the longer write-up — the numbers, the context, any caveats. Cross-link back to the Q-### at the top of each section.

- [ ] **Step 8: Add hooks to `research/hooks.md`**

Pull out the standalone punchy lines from your findings. Aim for at least one hook, ideally 3-5. Format: `- 🔥 <one-liner with numbers> [Q-###]`.

- [ ] **Step 9: Add at least one pitch to `research/story-ideas.md`**

Pick the most surprising / most chart-worthy finding from this session and write a full pitch using the template from Task 4, Step 2. Status: `💡 idea`. This is what the user will greenlight before Task 6.

- [ ] **Step 10: Write the research log entry**

Create `research/log/YYYY-MM-DD.md` (use today's date). Template:

```markdown
# Research Log — YYYY-MM-DD

**Topic focus:** <topic>
**Session duration:** <approx>

## Datasets explored
- [DS-###: <name>](../datasets.md#ds-###) — <one-line reason>
- (include dead ends too, briefly)

## Questions touched
- **Q-###** (<slug>) — <what happened: answered / blocked / partial>
- ...

## Hooks surfaced
- 🔥 <hook> [Q-###]
- ...

## Pitches added
- **<slug>** ([Q-###](../questions.md#q-###)) — <one-line>

## Open threads
- <things to pick up next session>
```

- [ ] **Step 11: Present surfaced hooks and pitches to the user for greenlight**

Stop here and report to the user:
- The log entry path
- The hooks added (quote them)
- The pitch(es) added, and ask the user which one to build as the first story

Do not proceed to Task 6 until the user picks a pitch.

- [ ] **Step 12: Commit**

```bash
git add research/
git commit -m "First research session: log, datasets, hooks, pitches for <topic>"
```

---

## Task 6: Build the First Story

This task builds the story the user greenlights in Task 5, Step 11. The shape is the same regardless of which pitch wins — the specifics (narrative, chart choices) flow from the pitch.

**Files:**
- Create: `stories/<slug>/meta.json`
- Create: `stories/<slug>/data.json`
- Create: `stories/<slug>/index.html`
- Create: `stories/<slug>/charts.js`
- Modify: `research/story-ideas.md` (update status)
- Modify: `research/questions.md` (link the resulting story)
- Modify: `index.html` (regenerated by build)

- [ ] **Step 1: Mark the pitch as `🔬 researching` in `story-ideas.md`**

- [ ] **Step 2: Create the story folder**

Run: `mkdir -p stories/<slug>` (using the slug from the approved pitch)

- [ ] **Step 3: Re-query and snapshot the data**

Using the datasets from the pitch, pull the exact rows/aggregations the story needs via `query_resource_data` and/or direct resource downloads. Reshape the data to the minimum shape the charts need (don't ship the raw firehose) and write it to `stories/<slug>/data.json`.

Keep the reshaping logic documented inline — a comment at the top of `data.json` is awkward (JSON has no comments), so add a brief "Data snapshot" paragraph inside the story explaining what was selected from what source, and record the exact MCP queries and transformations in the matching `research/log/` entry.

- [ ] **Step 4: Create `stories/<slug>/meta.json`**

Use the card metadata from the pitch:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "dek": "<dek / subhead — italic in the UI>",
  "topic": "<Economy | Demographics | ...>",
  "date": "YYYY-MM-DD",
  "readTime": "<N min read>"
}
```

- [ ] **Step 5: Write `stories/<slug>/charts.js`**

Story-specific chart code. Import D3 or Plot from CDN via `import` in the HTML; this file should export named functions like `drawComparisonBars(containerSelector, data)` that accept a DOM selector and the relevant slice of `data.json`. Keep charts focused — one exported function per chart.

- [ ] **Step 6: Write `stories/<slug>/index.html`**

Template (fill in `<TITLE>`, `<DEK>`, `<TOPIC>`, `<DATE>`, `<READ_TIME>`, and the story body):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><TITLE> — France, by the numbers</title>
  <link rel="stylesheet" href="/shared/style.css">
</head>
<body class="story">
  <header id="masthead"></header>
  <main class="page">
    <article>
      <header class="story-header">
        <div class="story-kicker"><TOPIC></div>
        <h1 class="story-title"><TITLE></h1>
        <p class="story-dek"><DEK></p>
        <div class="story-meta">
          <span><DATE></span>
          <span><READ_TIME></span>
        </div>
      </header>

      <p>Opening paragraph: state the surprising fact, hook the reader.</p>

      <figure>
        <div id="chart-1"></div>
        <figcaption>Figure 1. <caption here>. Source: <data source link>.</figcaption>
      </figure>

      <p>Second beat: add context. Why is it surprising? What's the real story behind the headline number?</p>

      <h2>Subhead for the deeper point</h2>

      <p>Deeper paragraph. Add a second chart if the story needs it.</p>

      <figure>
        <div id="chart-2"></div>
        <figcaption>Figure 2. <caption here>. Source: <data source link>.</figcaption>
      </figure>

      <p>Closing paragraph: the takeaway. What does this tell us about France?</p>
    </article>
  </main>
  <footer class="site-footer">
    <span>Data from <a href="https://www.data.gouv.fr">data.gouv.fr</a></span>
    <span><a href="/">← all stories</a></span>
  </footer>

  <script src="/shared/nav.js" defer></script>
  <script type="module">
    import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
    import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
    import { drawComparisonBars } from "./charts.js";

    const data = await fetch("./data.json").then(r => r.json());
    drawComparisonBars("#chart-1", data);
    // drawSecondChart("#chart-2", data);
  </script>
</body>
</html>
```

- [ ] **Step 7: Write the narrative prose**

Draft the actual paragraphs — this is the story's voice. Keep the "playful but serious" tone from the spec. Use French terms (commune, département, pharmacie, boulangerie) naturally, not performatively. Read the draft aloud before you consider it done — if it sounds like a press release, rewrite.

- [ ] **Step 8: Draft the X summary inside the matching `story-ideas.md` entry**

Under the pitch, add:

```
- Published URL: /stories/<slug>/
- X summary (draft):
  <1-2 sentence tweet draft, with the number, the surprise, and a hint at what's in the story>
```

- [ ] **Step 9: Update the pitch status to `✏️ drafting` while working and `✅ published` after Step 12**

- [ ] **Step 10: Link the resulting story from `research/questions.md`**

For the source question Q-###, append:

```
- Story: [<slug>](/stories/<slug>/)
```

- [ ] **Step 11: Rebuild the index and verify locally**

```bash
npm run build
```

Expected output: `Built .../index.html (1 stories)`.

Open `index.html` in a browser. Expected: the masthead, the index intro, and one card linking to `/stories/<slug>/`. Click the card; the story page opens with the masthead, serif headline, dek, and charts rendering from `data.json`.

If a chart doesn't render, open the browser console, read the error, fix, reload. Typical issues: path mismatches (`./data.json` vs `/stories/<slug>/data.json`), D3 version mismatches, or missing `type="module"` on the script tag.

- [ ] **Step 12: Re-run the build-index tests to confirm nothing regressed**

Run: `npm test`
Expected: 4 passing tests.

- [ ] **Step 13: Commit**

```bash
git add stories/<slug>/ index.html research/
git commit -m "Add first story: <slug>"
```

- [ ] **Step 14: Hand to the user for edit pass**

Report the local URL (`file:///.../index.html` or `stories/<slug>/index.html`) and list: the story title, dek, X summary. Ask the user to edit voice / tone / phrasing before deploy. Do not proceed to Task 7 until the user says the story reads well.

---

## Task 7: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md` (add live URL once known)

GitHub Pages on a `main` branch is the simplest host for a static site with no build step beyond our own build. The `gh-pages` workflow runs `npm run build`, then publishes the repo root as the Pages artifact.

- [ ] **Step 1: Confirm the repo has a GitHub remote**

Run: `git remote -v`
Expected: an `origin` pointing to `github.com/<user>/france-data.git`. If none, stop and have the user create a GitHub repo and add it:

```bash
gh repo create france-data --private --source=. --remote=origin
git push -u origin main
```

- [ ] **Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Run tests
        run: npm test
      - name: Build index
        run: npm run build
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Enable GitHub Pages (GitHub Actions source)**

Run: `gh api -X PUT repos/:owner/:repo/pages -f source[branch]=main -f build_type=workflow 2>/dev/null` — or, if that errors, enable via the GitHub UI at `Settings → Pages → Source → GitHub Actions`.

- [ ] **Step 4: Commit and push**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deploy workflow"
git push origin main
```

- [ ] **Step 5: Watch the workflow**

Run: `gh run watch`
Expected: the workflow succeeds. The deploy step prints a `page_url`.

- [ ] **Step 6: Verify the live site**

Open the printed `page_url` in a browser. Expected: the masthead, the index intro, and the first story card. Click into the story and confirm charts render.

- [ ] **Step 7: Add the live URL to README.md**

Add a "Live site" line near the top of `README.md`:

```markdown
**Live site:** <https://<user>.github.io/france-data/>
```

- [ ] **Step 8: Commit**

```bash
git add README.md
git commit -m "Document live site URL"
git push origin main
```

---

## Self-Review Notes (filled in during plan authoring)

**Spec coverage:**
- Repo structure ✅ Task 1 + 2
- Shared editorial styling ✅ Task 2
- Cross-linking convention ✅ Task 4 (IDs, templates)
- Story pipeline statuses ✅ Task 4 (`story-ideas.md` legend) + Task 6 (status transitions)
- Build script ✅ Task 3 (with tests)
- Seed 30-50 questions ✅ Task 4 (40 questions)
- First research session ✅ Task 5
- First published story ✅ Task 6
- Deploy ✅ Task 7
- Out-of-scope items (CMS, French layer, live data, automated publishing) correctly absent from the plan

**Placeholders:** None that reference missing code. Task 6 intentionally defers content specifics to the pitch the user approves in Task 5 — the task provides the full scaffolding (meta.json schema, HTML template, chart function shape) so the engineer has everything needed to turn a pitch into a story. The `<slug>`, `<TITLE>`, etc. in Task 6 are parameterized by the pitch, not unresolved TODOs.

**Type consistency:** `meta.json` fields (`slug`, `title`, `dek`, `topic`, `date`, `readTime`) are identical between the test fixture (Task 3 Step 1), the build script reader (Task 3 Step 3), and the story folder creation (Task 6 Step 4). The card-render field names match CSS class names in `style.css`.

**Deferred decisions not blocking v1:**
- Share-card generator (`scripts/generate-card.js`) is deferred; the spec marks it as an open question. Not needed for the v1 success criteria.
- Site name — stays as "France, by the numbers" placeholder in the masthead. Will be revisited after story 1 or 2 exists.
