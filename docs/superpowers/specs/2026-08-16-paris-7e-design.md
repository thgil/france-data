# Paris 7e — Civic Data Section, Design Spec

**Date:** 2026-08-16
**Status:** Design approved in chat; revised after external review; pending user review
**Depends on:** `2026-04-16-france-data-site-design.md` (shared shell, style, build)

## Purpose

A public accountability section covering the 7e arrondissement of Paris: who holds what power, what the arrondissement's money does, which projects get approved, which get abandoned, and how long each stage takes.

It has two jobs, and both matter:

1. **A civic resource.** A resident, journalist, or élu can arrive and understand how decisions and money actually move in the 7e, with every figure traceable to its source dataset.
2. **A working instrument.** The site's author is preparing real proposals to the Mairie du 7e — the first being a public running facility near Champ-de-Mars / École Militaire. The section produces the routing (which élu, which Direction, which funding mechanism, which deadline) and the evidence base those proposals need, and records what happened to each one.

The second job is the reason the first must be rigorous. A proposal arriving alongside a credible public data resource is a different object from an email from an unknown resident. It is also the reason the correction log below is part of the spec rather than hidden in review history: a section about accountability that quietly fixes its own errors would be self-refuting.

## Audience & Language

**Primary:** residents of the 7e, and the élus and civil servants who receive proposals.
**Secondary:** journalists, the existing france-data audience on X.

**Language:** English-first, French available via a toggle.

**Source terms are never translated.** Budget lines, `avancement` statuses, delegation wording, and Direction names appear verbatim in French in both renderings (`ETUDES`, `Fêtes et cérémonies`, `Direction des Affaires Scolaires`). A translated label cannot be cited back to the person who wrote it. English glosses sit alongside, never replacing.

## Voice

Drier than the story pages. The stories are allowed a "wait, really?" register; this section trades some of that for credibility with an institutional reader. Findings are stated plainly and sourced. No rhetoric about bureaucracy, no editorialising about individuals. The numbers carry the argument.

## The Unit-of-Analysis Rule

This governs every monetary figure in the section, and violating it produced the largest error in the first draft of this spec.

In `budget-participatif_operations-projets-gagnants-realisations`, **each row is an *operation*, and `budget_global_projet_gagnant` is the budget of the whole *project*, repeated on every one of that project's operation rows.** Summing that column across operations multiplies the money. Separately, **a citywide project appears as an operation in each arrondissement it touches, carrying its full citywide budget** — so a 7e operation row may carry €8M of Paris-wide money.

Therefore:

1. **Every money aggregation deduplicates by `identifiant_projet_gagnant`** before summing, or uses the project-level dataset `bp_projets_gagnants` instead.
2. **Local and citywide projects are reported separately, never combined into one 7e total.** A project is treated as 7e-local when `arrondissement_projet_gagnant = 75007`; when the project is registered elsewhere (typically 75004 for citywide schemes) but has an operation sited in the 7e, it is reported as "the local tranche of a citywide project" with the citywide budget labelled as citywide.
3. **Operation counts and money totals are stated as separate quantities**, because they answer different questions.

`transform.mjs` implements this once and every unit consumes it. Unit tests cover both the dedupe and the citywide-attribution split, using a fixture containing at least one multi-operation project and one citywide project sited in the 7e.

## Editorial Findings Verified

All figures below were verified against the live API and corrected after review. Each states its unit of analysis.

### The arrondissement's own investment budget was frozen at exactly €161,405, 2018–2023

| Exercice | Fonctionnement | Investissement |
|---|---|---|
| 2018 | €2,036,721 | €161,405 |
| 2019 | €2,043,313 | €161,405 |
| 2020 | €2,059,146 | €161,405 |
| 2021 | €2,128,824 | €161,405 |
| 2022 | €2,264,041 | €161,405 |
| 2023 | €2,264,097 | €161,405 |

Dépenses, Budget Primitif, `budgets-votes-etats-speciaux-darrondissements-m57-ville`. **The dataset ends at exercice 2023**; the section claims nothing about 2024–2026 and says so on the page.

### Abandoned projects: 11 operations, €309,500 of local money

Of 11 operations in the 7e marked `ABANDONNÉ`:

- **7 are 7e-local projects** totalling **€309,500** (ruche, panneaux, parcours de santé, jardin pédagogique, lampadaires, cultiver, éclairage Saint-Thomas).
- **4 are local tranches of citywide projects** registered to 75004 — "Paris aux piétons" (€8M), "Les œuvres d'art investissent la rue" (€3M), "Des jardins sur les murs" (€2M), "Des fontaines à boire dans tout Paris" (€2M). Those are citywide budgets, not 7e money.

The page reports both, separately, in those words.

### Budget Participatif still moves more into the 7e than the état spécial

2025 edition, deduplicated to project level: **€850,000 in `PROCEDURES`** (one project — "Rénover, améliorer et végétaliser les établissements scolaires du 7e" — spanning three operations) and **€1,010,000 not yet started** (two projects). Against €161,405 a year of local investment capacity, the directional conclusion holds: for a capital proposal, the Budget Participatif is the mechanism and the état spécial is not.

### Élus: unresolved, and blocking

`conseillerseres-darrondissements` returns 13 rows for the 7e; 12 carry a named delegation and one (the Maire) has `delegation: null`.

**The dataset's upstream `modified` date is 2021-12-01.** It therefore predates the March 2026 municipal elections and describes the 2020–2026 mandate. An earlier draft of this spec used it to "correct" a third-party summary that named a different holder for the `conseils de quartier et associations` delegation; that reasoning was invalid, because the dataset is the older source. **Neither list is currently verified.** See Blocking Preconditions.

## Structure

```
paris-7e/
├── index.html                      # Overview — the 7e at a glance
├── power/index.html                # Unit 1 — who holds what power
├── pipeline/index.html             # Unit 2 — every project, every status
├── money/index.html                # Unit 3 — budget & spending
├── proposals/index.html            # Unit 4 — the register
│   └── running-hub/index.html      #          first proposal
├── meta.json                       # Section card metadata (schema below)
├── section.css                     # Extends shared/style.css
├── section.js                      # i18n toggle, data loader, table/filter/map helpers
├── data/                           # GENERATED — never hand-edited
│   ├── elus.json
│   ├── pipeline.json
│   ├── etat-special.json
│   ├── ville-budget.json
│   ├── travaux.json
│   ├── marches.json
│   ├── quartiers.geojson
│   └── sources.json
└── content/                        # HAND-AUTHORED
    ├── proposals/running-hub.json
    ├── dates.json
    ├── theme-crosswalk.json        # theme → delegation → Direction
    ├── strings.en.json
    └── strings.fr.json
```

The `data/` vs `content/` split is load-bearing. Anything under `data/` is reproducible by rerunning the build and may be overwritten without review. Anything under `content/` is written by a person and is never touched by a script.

**`meta.json` schema** (consumed by `build-index.js`):

```json
{
  "slug": "paris-7e",
  "kind": "section",
  "title": "The 7th, in public",
  "dek": "Who decides, what it costs, and what actually gets built in one Paris arrondissement.",
  "topic": "Civic",
  "date": "2026-08-16",
  "readTime": "ongoing"
}
```

`kind: "section"` is what distinguishes it from a story; the section card renders above the story grid with its own styling.

## Data Pipeline

```
scripts/paris7e/
├── fetch.mjs            # Only module that touches the network
├── transform.mjs        # Pure functions: filter → dedupe → aggregate → shape   [tested]
├── build-data.mjs       # Orchestrates fetch → transform → write
└── transform.test.js    # Runs against committed fixtures, no network
```

**`fetch.mjs`** wraps the Opendatasoft Explore v2.1 API at `https://opendata.paris.fr/api/explore/v2.1/`. It handles pagination, gzip, and rate-limit headers (`X-RateLimit-Remaining`), and is the sole place a network call may appear in the build. It returns plain records, and captures each dataset's `metas.default.modified` alongside them.

**API typing gotchas**, to be encoded in `fetch.mjs` helpers so no caller re-learns them:
- `edition` and `exercice_comptable` are **date-typed**. `edition="2025"` raises `IncompatibleTypesInComparisonFilter`; the correct form is `edition=date'2025'`.
- Stage and status fields exist in **two variants** — `_operation` and `_projet` (`avancement_operation` / `avancement_projet`, `debut_etudes_operation` / `debut_etudes_projet`, and likewise for `lancement_procedure`, `lancement_travaux`, `livraison_prev`, `ouverture`). They can differ. Every computation names which variant it uses; time-in-stage uses the `_operation` variant, since operations are what physically happen.

**`transform.mjs`** contains only pure functions from records to output shapes: arrondissement filtering, the unit-of-analysis rule above, aggregation, and time-in-stage computation. This is the only part with unit tests, run against small committed fixtures captured from real responses — so `npm test` needs no network and cannot break because Paris changed something.

**`build-data.mjs`** writes `paris-7e/data/*.json` plus `sources.json`, which records for every dataset: `dataset_id`, source URL, `fetched_at`, **upstream `modified`**, and record count.

**Freshness is rendered, not just recorded.** Pages display the upstream `modified` date, not the fetch date. A dataset last touched in 2021 must not be presented with a 2026 freshness stamp — that would be the section laundering staleness into false confidence. Any dataset whose `modified` is more than 18 months old renders a staleness banner naming the date.

**Failure policy:** a fetch failure or schema mismatch aborts the whole build and writes nothing. Partial writes are never committed, because "commits only if changed" plus a silently short response would commit a data regression that looks like news. A failed refresh run leaves the last known-good data in place and fails loudly in Actions.

**Payload budget:** every generated JSON file stays under 2 MB. `comptage-velo-donnees-compteurs` (1.06M records) is never fetched wholesale — only a pre-aggregated daily series for counters within ~1km of Champ-de-Mars, if used at all.

### Refresh

`.github/workflows/refresh-paris7e.yml` — monthly cron plus `workflow_dispatch`.

**The refresh workflow deploys the site itself.** It does *not* rely on its own commit triggering `deploy.yml`: pushes made with the default `GITHUB_TOKEN` do not trigger `on: push` workflows, so a naive design would update the data on disk and silently never redeploy. The refresh job runs the build, commits only `paris-7e/data/**` when changed, then runs the same Pages build-and-deploy steps. The existing `concurrency: group: pages` serialises it against `deploy.yml`.

Permissions: `contents: write`, `pages: write`, `id-token: write`.

**Branch policy:** the bot commits to the repository's deployment branch only, touches only `paris-7e/data/**`, and rebases and retries once if the push is rejected by a concurrent human push. The current repo has `main` as the deploy trigger while the remote default is `v1-build` and work happens on `drafts/*`; **that divergence is resolved before this workflow is enabled**, and the workflow names one branch explicitly.

### Changes to existing code

- **`scripts/build-index.js`** gains the `kind: "section"` concept so `paris-7e` renders as a distinct card above the story grid rather than as a fake story. Test extended to cover section rendering and the story/section split.
- **`package.json`** test glob becomes `node --test scripts/*.test.js scripts/paris7e/*.test.js`. The obvious-looking `node --test scripts/` is **wrong**: it works on Node 20 but on Node ≥21 the positional argument is treated as a glob that matches the directory itself, which the runner then tries to execute as a module and fails with `MODULE_NOT_FOUND`. CI pins Node 20; the author's machine runs v24, and `engines` allows both. Shell-expanded explicit globs work on every version.

## Unit 1 — Power (`paris-7e/power/`)

**Blocked on the élus freshness problem — see Blocking Preconditions. Nothing in this unit ships until that is resolved.**

Presents two distinct kinds of power side by side, because conflating them is the most common mistake an outsider makes.

**Political.** The élus with delegations verbatim from `conseillerseres-darrondissements`, plus the Conseillers de Paris representing the 7e, each rendered with **the source dataset's own `modified` date** and a staleness banner where warranted.

**Executive.** Which city **Direction** pilots which category of project in the 7e, derived by aggregating `direction_pilote_operation` by `thematique` across Budget Participatif operations. This mapping is not published anywhere; it is inferred from what the city has actually done and is labelled as inference.

**Small-sample floor.** The 7e has roughly 97 operations spread across all themes, so many theme cells have n=1–2. Cells below a stated minimum render as "too few projects to say" rather than naming a Direction. This is the same rule applied to time-in-stage medians, and it applies here for the same reason.

**Routing widget.** Dropdown-driven: the user picks a theme and one of the four conseils de quartier. It returns the élu holding the matching delegation, the Direction that historically pilots that theme (subject to the small-sample floor), and the quartier's details. **No address geocoding and no runtime network calls** — quartier polygons ship as `quartiers.geojson` and the theme→delegation→Direction crosswalk is hand-curated in `content/theme-crosswalk.json`, because mapping a theme onto free-text delegations like `Culture, sports et santé` is an editorial judgement, not a computation.

**Contacts.** Links to the mairie's official published contact pages. No republished directory of individual phone numbers or emails. This preserves routing value, avoids standing up a personal-contact database, and stays correct when people change roles — which the 2026 elections make certain they have.

## Unit 2 — Pipeline (`paris-7e/pipeline/`)

Budget Participatif projects in the 7e from `budget-participatif_operations-projets-gagnants-realisations` (upstream `modified` today — this is the freshest source in the section).

- **Table:** title, edition, thématique, budget, status, direction pilote, stage dates. Sortable and filterable. Rows are operations; project-level budgets are labelled as such.
- **Map:** operation locations coloured by `avancement_operation`, using each record's own lat/lon. MapLibre GL via CDN, matching the existing story convention.
- **Funnel:** count of operations **and** deduplicated project value at each status, by edition, stated as two separate quantities. Observed statuses: `(non démarré)`, `ETUDES`, `PROCEDURES`, `TRAVAUX`, `LIVRAISON`, `FIN`, `ABANDONNÉ`. The build treats this list as open — an unrecognised status renders as itself and is never dropped.
- **Time-in-stage:** median months between `debut_etudes_operation`, `lancement_procedure_operation`, `lancement_travaux_operation`, `livraison_prev_operation`, and `ouverture_operation`. Produces statements of the form "an operation voted in edition N typically reaches travaux in X months." Below the sample floor, the page says so instead of printing a median.
- **The abandoned file:** all `ABANDONNÉ` operations, split into 7e-local projects and local tranches of citywide projects per the unit-of-analysis rule. The data records that projects were abandoned but not why, and the page states that limit rather than speculating.

## Unit 3 — Money (`paris-7e/money/`)

**A. État spécial d'arrondissement.** The 7e's own budget, line by line, by `chapitre` and `nature_reglementaire`, exercices 2018–2023, split by section and by Budget Primitif vs other votes. The frozen investment line is the lead finding.

**B. What actually got built.** `travaux_equipements_publics` filtered to `code_postal = 75007` yields **7 records**, all 2022–2023 school and conservatoire works. That is a paragraph with a small table, not a page section, and it is scoped accordingly. (The 436 figure in the source table is the citywide total.)

Cost parsing: `budget` arrives as a string in **three observed forms** — plain integer (`"390000"`), ASCII space (`"150 000"`), and **non-breaking space U+00A0** (`"116 400"`). The parser handles all three and surfaces unparseable values rather than coercing them to zero. The test fixture contains all three forms; a parser written only for ASCII space passes naive tests and fails in production.

**C. Budget Participatif money into the 7e** by edition, deduplicated to project level, local and citywide reported separately.

**D. Citywide context.** Paris voted budgets and comptes administratifs, and contracts from `liste-des-marches-de-la-collectivite-parisienne`.

### Attribution constraints

Stated on the page, not silently worked around.

- **`fournisseur_code_postal` is the supplier's registered address, not where the money was spent.** The page may claim "contracts awarded to suppliers registered in the 7e" and may not claim "money spent in the 7e."
- **Grants carry no arrondissement.** Both `subventions-versees-annexe-compte-administratif-a-partir-de-2018` and `subventions-associations-votees-` lack an arrondissement or address field, so grants are presented **citywide**. A fuzzy name-join against `liste_des_associations_parisiennes` is rejected as a basis for stated figures. `subventions-associations-votees-` does carry `numero_siret`, so a **deterministic SIRET join** is possible as a future addition — but it would yield "grants to organisations *registered* in the 7e," subject to exactly the same registered-address caveat as procurement, and must be labelled that way if built. Not in v1.
- **The citywide budget is not published split by arrondissement.** The section cannot show "the 7e's share of Paris spending" and will not estimate one.
- **Operation-row money is never summed without deduplication** (see The Unit-of-Analysis Rule).

Each page carries a **"What this page cannot tell you"** block making these limits explicit.

## Unit 4 — Proposals (`paris-7e/proposals/`)

A register, not a one-off page. Each proposal is a JSON record under `content/proposals/` rendering to a row in the register and, where warranted, its own detail page.

**Record shape:** id, title, status, location, problem statement, proposal, cost tiers, precedent, target mechanism, routing (élu / Direction / conseil de quartier / funding cycle), evaluation metrics, maintenance plan, and a dated status log.

**Register view:** PROBLEM → PROPOSAL → STATUS across all proposals — the citizen-side institutional memory that motivates this section.

**Seeded with:** `running-hub` (full detail page), `bosquet-street-furniture` (stub), `invalides-cycle-parking` (stub).

### Running hub detail page

Problem; candidate locations mapped; cost tiers at €20k / €75k / €250k; the Seoul Yeouinaru Runner Station precedent; a 12-month pilot with named metrics (users/day, vandalism incidents, maintenance cost, equipment uptime, satisfaction); an explicit maintenance and replacement plan; routing to the responsible élu, Direction, and Budget Participatif cycle; and a dated status log of every contact and response.

The status log is the component with the longest useful life. It converts scattered correspondence into a record that can be cited.

**Evidence limit:** no runner-count data exists. Bike counters near Champ-de-Mars may be shown as an active-mobility proxy, labelled as a proxy. They are not evidence of demand for a running facility and must not be presented as such.

**Scale context for the proposal itself:** at €20k–250k, the pilot is between an eighth and one and a half times the arrondissement's *entire annual investment budget* of €161,405. That is the single most important fact for choosing which mechanism to approach, and it belongs on the proposal page.

## Dates

The overview carries an upcoming-dates block: Conseil de Paris sessions, Budget Participatif cycle deadlines, conseil de quartier meetings, and the Forum des Associations.

**All of it is hand-curated in `content/dates.json`**, each entry with its own `checked_on` stamp, displayed. `ordre-du-jour-du-conseil-de-paris-...` cannot help: all seven of its fields are `text`, and the session date is French prose ("du lundi 15 février 2016 au mardi 16 février 2016"), so there is no queryable date field and no way to select future sessions. A dates widget that looks live while quietly rotting would be worse than no widget.

## Data Sources

All from `opendata.paris.fr`. Record counts verified 2026-08-16.

| Dataset ID | Use | Records | Upstream modified |
|---|---|---|---|
| `budget-participatif_operations-projets-gagnants-realisations` | Pipeline & statuses | 5,501 | 2026-08-16 |
| `bp_projets_gagnants` | Project-level budgets (dedupe source) | 1,446 | — |
| `budgets-votes-etats-speciaux-darrondissements-m57-ville` | 7e own budget, 2018–2023 | 15,791 | 2021-11-25 |
| `conseillerseres-darrondissements` | 7e élus & delegations | 390 | **2021-12-01** |
| `conseillers-de-paris` | Conseillers de Paris | 163 | 2023-01-03 |
| `conseils-quartiers` | Quartier polygons (`nar = 7`) | 117 | — |
| `travaux_equipements_publics` | Works delivered (7 in 75007) | 436 | — |
| `liste-des-marches-de-la-collectivite-parisienne` | Procurement | 17,639 | — |
| `budgets-votes-principaux-a-partir-de-2019-m57-ville-departement` | Citywide voted budget | 8,598 | — |
| `comptes-administratifs-budgets-principaux-a-partir-de-2019-m57-ville-departement` | Citywide actuals | 25,629 | — |
| `subventions-associations-votees-` | Grants, citywide only | 107,693 | — |
| `liste_des_associations_parisiennes` | Associations, context only | 70,993 | — |
| `comptage-velo-donnees-compteurs` | Active-mobility proxy (slice only) | 1,057,549 | — |

The four conseils de quartier at `nar = 7` are **École Militaire, Saint-Thomas d'Aquin, Gros Caillou, Invalides**.

API: CORS open (`access-control-allow-origin: *`), typical response ~120ms, rate limits exposed via `X-RateLimit-*`.

## Blocking Preconditions

Resolved before the dependent work starts.

1. **Verify current 7e élus and delegations against `mairie07.paris.fr` post-2026-elections.** The open dataset is from 2021-12-01 and describes the 2020–2026 mandate. Until resolved, Unit 1 does not ship. If the mairie site and the dataset disagree, the mairie site wins and the page says which source each row came from. Web search is not an acceptable source here — it returned a quartier list for the 7e containing Bercy, which is in the 12e.
2. **Resolve the branch topology** (`main` vs `v1-build` vs `drafts/*`) before enabling the refresh workflow, so the bot and humans are not committing to divergent branches.

## Testing

- **Unit tests** on every `transform.mjs` function, against committed fixtures. No network in the test path.
- **Specific coverage:** project-level deduplication by `identifiant_projet_gagnant`; the citywide-vs-local attribution split; the three budget-string forms including U+00A0; unrecognised `avancement` values passing through intact; time-in-stage and Direction inference returning "insufficient data" below the sample floor.
- **Extended** `build-index.test.js` for `kind: "section"` rendering and the story/section split.
- **Visual verification** of every map and chart before shipping, per project convention — timing and zoom bugs are not caught by reading code.
- **Provenance check:** every figure rendered on a page traces to an entry in `sources.json`.
- **Node version check:** `npm test` passes on both Node 20 (CI) and Node 24 (local).

## Non-Goals

- A DansMaRue-style defect tracker. Deliberately deferred; needs months of manual data entry before it says anything.
- Scraping conseil d'arrondissement minutes from PDFs.
- Any per-arrondissement estimate of the citywide budget.
- A personal-contact database for élus.
- SIRET-joined grant attribution in v1.
- French translation of source-data terms.

## Corrections Log

Errors in the first draft, corrected after review. Kept visible because a section about public accountability should show its own.

| Claim in draft 1 | Corrected |
|---|---|
| "~€15.3M of 7e projects abandoned" | 11 operations; **€309,500** of 7e-local money; €15M was citywide projects' global budgets attached to 7e operation rows |
| 2025 edition: €1.86M not started, €2.55M in procedures | **€1.01M** (2 projects) and **€850,000** (1 project across 3 operations) |
| "13 élus hold named delegations" | 12 hold named delegations; the 13th is the Maire, `delegation: null` |
| Élus dataset corrects a third-party summary | Dataset is from **2021-12-01** and predates the 2026 elections; neither source is verified |
| "frozen since 2018" | "frozen 2018–**2023**"; the dataset ends there |
| `node --test scripts/` fixes the test glob | Fails on Node ≥21; use explicit shell-expanded globs |
| Refresh commit triggers the Pages deploy | `GITHUB_TOKEN` pushes do not trigger `on: push`; refresh deploys itself |
| Budget strings are space-separated | Three forms, including non-breaking space U+00A0 |
| Open item: does `subventions-associations-votees-` have an arrondissement? | It does not. Grants stay citywide; SIRET join possible but out of v1 |
| Open item: Conseil de Paris agenda may hold future dates | It cannot — all fields are text, dates are French prose |
