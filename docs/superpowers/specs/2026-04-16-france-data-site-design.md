# France Data Site — Design Spec

**Date:** 2026-04-16
**Status:** Design approved by user, pending final spec review

## Purpose

A long-term personal project: a data storytelling website about France, built on top of the official `datagouv-mcp` server (the French government's MCP endpoint to `data.gouv.fr`). Each story surfaces a surprising, counterintuitive, or illuminating finding from French public data, presented as a self-contained visual essay.

The site doubles as the user's daily X content engine: the research loop generates interesting facts, the user edits the voice, and the story (or a standalone "hook") gets shared on X.

## Audience & Voice

**Primary:** French citizens curious about their own country.
**Secondary:** International audiences, data enthusiasts, journalists.

**Language:** English-first. French terms kept where they add character (commune, département, pharmacie, boulangerie). A French translation layer may be added later; not in initial scope.

**Tone:** Playful data storytelling with serious depth when the data calls for it. Inspired by The Pudding and light data journalism (FiveThirtyEight era). Personal voice, not institutional. The "wait, really?" factor is the editorial north star.

## Visual Direction

**Editorial** style:
- Serif headlines (Georgia or similar) for story titles
- Sans-serif (Helvetica / system) for body and chart labels
- Warm off-white paper background (`#faf7f2`)
- Red category accents (`#b32020`)
- Clean masthead with issue number and date
- Charts integrate into the page like a print publication — they are part of the narrative flow, not floating widgets

Reference feel: The Atlantic / NYT Opinion sections. Authoritative but human. Credibility through typography, personality through the writing.

## Site Structure

```
france-data/
├── index.html                    # Grid of story cards (generated)
├── shared/
│   ├── style.css                 # Shared typography, layout primitives, masthead
│   ├── nav.js                    # Injects masthead/nav into every story page
│   └── charts.js                 # Reusable D3 / Plot chart helpers
├── stories/
│   └── <slug>/
│       ├── index.html            # Self-contained story page
│       ├── data.json             # Pre-processed data snapshot for this story
│       └── charts.js             # Story-specific visualizations
├── research/
│   ├── questions.md              # Master question log (Q-### IDs, status, links)
│   ├── story-ideas.md            # Vetted pitches with status pipeline
│   ├── hooks.md                  # Punchy X-shareable one-liners
│   ├── datasets.md               # Catalog of interesting datasets (DS-### IDs)
│   ├── log/
│   │   └── YYYY-MM-DD.md         # Daily research session notes
│   └── topics/
│       ├── demographics.md
│       ├── economy.md
│       ├── health.md
│       ├── education.md
│       ├── environment.md
│       ├── transport.md
│       └── culture.md
├── scripts/
│   ├── build-index.js            # Scans stories/, generates index.html
│   └── generate-card.js          # Creates a shareable image / summary for X
└── docs/
    └── superpowers/specs/        # Design and implementation specs
```

### Cross-linking convention

Everything uses short IDs so research traces cleanly from question → finding → dataset → story.

- Questions: `Q-001`, `Q-002`, …
- Datasets: `DS-001`, `DS-002`, …
- Stories reference the question ID that spawned them
- Topic files link back to questions and forward to stories
- Hooks and story-ideas reference the Q-### that generated them

Example `questions.md` entry:
```markdown
## Q-012: Are there really more pharmacies than bakeries?
- Status: researched
- Topic: [economy](topics/economy.md#pharmacies)
- Datasets: [DS-003](datasets.md#ds-003), [DS-008](datasets.md#ds-008)
- Story: [pharmacies-vs-bakeries](/stories/pharmacies-vs-bakeries/)
- Finding: 21,000 pharmacies vs ~35,000 bakeries total, but France has more
  pharmacies per capita than almost any EU country.
```

### Story-idea pipeline

Each idea in `story-ideas.md` carries one of four statuses, visible at a glance:

- 💡 `idea` — pitched, awaiting greenlight
- 🔬 `researching` — approved, data being gathered
- ✏️ `drafting` — story page being written
- ✅ `published` — live on the site

## Tech Stack

- **HTML / CSS / JS** — no framework. Each story is handcrafted.
- **D3.js** (via CDN) — primary charting library, full creative control.
- **Observable Plot** (via CDN) — quick/standard charts where D3 is overkill.
- **Intersection Observer** — for scroll-driven animations in longer stories.
- **Node.js build script** — reads `stories/`, writes `index.html`. Also generates per-story share cards. No bundler, no transpilation.

Rationale: the project's value is in the data + writing + per-story custom visuals, not in framework ergonomics. A static site with a tiny build step keeps maintenance near-zero and deploy free.

## Data Source

**`https://mcp.data.gouv.fr/mcp`** — the official hosted datagouv-mcp endpoint. Public, no API key required, read-only.

Available MCP tools we'll use:
- `search_datasets`, `get_dataset_info`, `list_dataset_resources`, `get_resource_info`, `query_resource_data`
- `search_dataservices`, `get_dataservice_info`, `get_dataservice_openapi_spec`
- `get_metrics`

**Data handling:** during research, we query the MCP server live. Once a story is scoped, we snapshot the relevant data as `data.json` inside the story folder. The published site never calls the MCP server — stories load fast and don't break if the upstream API changes.

## Workflows

### Story production (human-in-the-loop)

```
1. DISCOVER  — Claude queries datagouv-mcp, logs findings to research/log/
2. HOOK      — Surprising fact → hooks.md with Q-### reference
3. PITCH     — Full story idea added to story-ideas.md:
                - Hook (what's surprising)
                - Data available (datasets, coverage, gaps)
                - Visual angle (chart type or story structure)
                - Draft X summary (1-2 sentences)
4. APPROVE   — User greenlights which pitches become stories
5. BUILD     — Claude creates stories/<slug>/, snapshots data, writes HTML + charts,
               writes the narrative
6. EDIT      — User reviews, adjusts voice, final pass
7. PUBLISH   — Deploy, user shares on X with the prepared summary
```

### Daily research loop

Triggered by the user via `/loop` or ad hoc session:

1. Claude picks a topic area (rotating through demographics, economy, health, education, environment, transport, culture).
2. Queries `datagouv-mcp` for datasets related to pending questions in that topic.
3. Answers questions where data allows, notes blockers where it doesn't.
4. Generates new questions from findings.
5. Writes a dated log entry in `research/log/YYYY-MM-DD.md` covering: datasets explored, questions answered, questions opened, hooks surfaced, pitches added.
6. Surfaces 1-3 concrete pitches or hooks for user review.

### Seeding

Before the first research run, Claude seeds `questions.md` with 30-50 starter questions across all topic areas. Question categories:

- **Counterintuitive** — assumptions people get wrong about France
- **Comparisons** — region vs region, France vs peers
- **Time series** — dramatic changes over 10/20/50 years
- **Superlatives** — most, least, biggest, smallest, first, last
- **Local quirks** — outlier communes and départements
- **Daily life** — commutes, spending, healthcare access, schools

## Deployment

Static files on GitHub Pages, Netlify, or Vercel free tier. Push to `main` → deploy. Decision between the three is deferred to implementation.

## What Is Deliberately Out of Scope (v1)

- A CMS — markdown + HTML editing is fine for one person.
- French translation layer — English-first, translation later if it matters.
- Live data — all published data is snapshotted at build time.
- User accounts, comments, analytics tooling — pure content site.
- Automated publishing to X — user remains the final editor and publisher.
- Frameworks (React, Astro, Next) — unnecessary for this project's shape.

## Open Questions (Deferred)

- Site name — intentionally not decided yet. Will surface options once the first story or two exists and the personality is concrete.
- Hosting choice (Pages / Netlify / Vercel) — decide at deploy time.
- Share-card generation — HTML-to-image pipeline choice (Playwright, Satori, or manual) — decide when we start building `generate-card.js`.

## Success Criteria (for v1 launch)

- The repo structure is in place, including an empty but navigable `research/` directory with seeded questions.
- One complete story is published, with data snapshot, custom charts, and a prepared X summary.
- The daily research loop has been run at least once end-to-end, producing log entry + hooks + pitch.
- The site builds and deploys to a live URL.
