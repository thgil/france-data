# Paris 7e — Civic Data Section, Design Spec

**Date:** 2026-08-16
**Status:** Design approved in chat; spec pending user review
**Depends on:** `2026-04-16-france-data-site-design.md` (shared shell, style, build)

## Purpose

A public accountability section covering the 7e arrondissement of Paris: who holds what power, what the arrondissement's money does, which projects get approved, which get abandoned, and how long each stage takes.

It has two jobs, and both matter:

1. **A civic resource.** A resident, journalist, or élu can arrive and understand how decisions and money actually move in the 7e, with every figure traceable to its source dataset.
2. **A working instrument.** The site's author is preparing real proposals to the Mairie du 7e — the first being a public running facility near Champ-de-Mars / École Militaire. The section produces the routing (which élu, which Direction, which funding mechanism, which deadline) and the evidence base those proposals need, and records what happened to each one.

The second job is the reason the first must be rigorous. A proposal arriving alongside a credible public data resource is a different object from an email from an unknown resident.

## Audience & Language

**Primary:** residents of the 7e, and the élus and civil servants who receive proposals.
**Secondary:** journalists, the existing france-data audience on X.

**Language:** English-first, French available via a toggle. This differs from the rest of the site only in that a French rendering is in scope from the start rather than deferred.

**Source terms are never translated.** Budget lines, `avancement` statuses, delegation wording, and Direction names appear verbatim in French in both renderings (`ETUDES`, `Fêtes et cérémonies`, `Direction des Affaires Scolaires`). A translated label cannot be cited back to the person who wrote it. English glosses sit alongside, never replacing.

## Voice

Drier than the story pages. The stories are allowed a "wait, really?" register; this section trades some of that for credibility with an institutional reader. Findings are stated plainly and sourced. No rhetoric about bureaucracy, no editorialising about individuals. The numbers carry the argument.

## Editorial Findings Already Verified

These came out of the data during design and anchor the section. All are reproducible from the datasets listed under Data Sources.

**The arrondissement's own investment budget has been frozen at exactly €161,405 since 2018.**

| Exercice | Fonctionnement | Investissement |
|---|---|---|
| 2018 | €2,036,721 | €161,405 |
| 2019 | €2,043,313 | €161,405 |
| 2020 | €2,059,146 | €161,405 |
| 2021 | €2,128,824 | €161,405 |
| 2022 | €2,264,041 | €161,405 |
| 2023 | €2,264,097 | €161,405 |

(Dépenses, Budget Primitif, `budgets-votes-etats-speciaux-darrondissements-m57-ville`.)

**The Budget Participatif moves far more money into the 7e than the état spécial does.** The 2025 edition alone carries roughly €1.86M of projects not yet started, plus €2.55M in procedures. Against €161,405 a year of local investment capacity, this identifies which mechanism a capital proposal should target.

**Roughly €15.3M of 7e projects across 11 operations are marked `ABANDONNÉ`**, concentrated in the 2014–2017 editions. What fails is as instructive as what ships.

**Thirteen élus hold named delegations in the 7e**, including one for `conseils de quartier et associations`. A widely-circulated summary the author was working from named a different person for that delegation, which is the concrete reason this section carries "verified as of" stamps rather than static text.

## Structure

```
paris-7e/
├── index.html                      # Overview — the 7e at a glance
├── power/index.html                # Unit 1 — who holds what power
├── pipeline/index.html             # Unit 2 — every project, every status
├── money/index.html                # Unit 3 — budget & spending
├── proposals/index.html            # Unit 4 — the register
│   └── running-hub/index.html      #          first proposal
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
    ├── strings.en.json
    └── strings.fr.json
```

The `data/` vs `content/` split is load-bearing. Anything under `data/` is reproducible by rerunning the build and may be overwritten without review. Anything under `content/` is written by a person and is never touched by a script.

## Data Pipeline

```
scripts/paris7e/
├── fetch.mjs            # Only module that touches the network
├── transform.mjs        # Pure functions: filter → aggregate → shape   [tested]
├── build-data.mjs       # Orchestrates fetch → transform → write
└── transform.test.js    # Runs against committed fixtures, no network
```

**`fetch.mjs`** wraps the Opendatasoft Explore v2.1 API at `https://opendata.paris.fr/api/explore/v2.1/`. It handles pagination, gzip, and rate-limit headers (`X-RateLimit-Remaining`), and is the sole place a network call may appear. It returns plain records.

**`transform.mjs`** contains only pure functions from records to output shapes. This is where the arrondissement filtering, aggregation, and time-in-stage computation live, and it is the only part with unit tests. Tests run against small committed fixtures captured from real responses, so `npm test` needs no network and cannot break because Paris changed something.

**`build-data.mjs`** writes `paris-7e/data/*.json` plus `sources.json`, which records for every dataset: `dataset_id`, source URL, `fetched_at`, and record count. Each page renders a provenance footer from `sources.json`, so any claim can be followed to the exact Paris dataset behind it.

### Refresh

`.github/workflows/refresh-paris7e.yml` — monthly cron plus `workflow_dispatch`. Runs `build-data.mjs`, and commits only if the output actually changed. That commit triggers the existing Pages deploy. Requires `contents: write`.

The commit history is a designed feature, not a side effect: it becomes a dated record of how 7e projects change status over time. Six months in, the repository can evidence that a given operation sat in `ETUDES` for fourteen months. A live-fetching page could never produce that.

### Changes to existing code

Both are required for the section to ship; neither is unrelated refactoring.

- **`scripts/build-index.js`** gains a `sections` concept so `paris-7e` renders as a distinct card above the story grid, instead of being modelled as a fake story. Reads `paris-7e/meta.json`. The existing test is extended to cover it.
- **`package.json`** test glob changes from `node --test scripts/*.test.js` to `node --test scripts/`, so tests in subdirectories run. Without this the new tests would be silently skipped, which is worse than not writing them.

## Unit 1 — Power (`paris-7e/power/`)

Presents two distinct kinds of power side by side, because conflating them is the most common mistake an outsider makes.

**Political.** The 13 élus with delegations verbatim from `conseillerseres-darrondissements`, plus the Conseillers de Paris representing the 7e from `conseillers-de-paris`. Each carries a "verified as of" date.

**Executive.** Which city **Direction** actually pilots which category of project in the 7e, derived by aggregating `direction_pilote_operation` and `direction_pilote_projet` by `thematique` across every Budget Participatif operation. This mapping is not published anywhere; it is inferred from what the city has actually done, and is labelled as such.

**Routing widget.** Given a theme and an address, returns: the élu holding the matching delegation, the Direction that historically pilots that theme in the 7e, and which of the four conseils de quartier contains the address. The last is a real point-in-polygon test against `conseils-quartiers` geometry (`nar = 7`), not a lookup table.

**Contacts.** The section links to the mairie's official published contact pages. It does not republish individual phone numbers or email addresses as a scraped directory. This preserves the routing value, avoids standing up a personal-contact database, and stays correct when people change roles — which the delegation discrepancy above shows they do.

## Unit 2 — Pipeline (`paris-7e/pipeline/`)

Every Budget Participatif project in the 7e from `budget-participatif_operations-projets-gagnants-realisations`, filtered on `arrondissement_operation = 75007`.

- **Table:** title, edition, thématique, budget, status, direction pilote, stage dates. Sortable and filterable.
- **Map:** project locations coloured by `avancement`, using the record's own lat/lon.
- **Funnel:** count and value at each status, by edition. Observed statuses: `(non démarré)`, `ETUDES`, `PROCEDURES`, `TRAVAUX`, `LIVRAISON`, `FIN`, `ABANDONNÉ`. The build must treat this list as open — an unrecognised status renders as itself and is never dropped.
- **Time-in-stage:** median months between `debut_etudes`, `lancement_procedure`, `lancement_travaux`, `livraison_prev`, and `ouverture`. Produces statements of the form "a project voted in edition N typically reaches travaux in X months." Where the sample is too small to support a median, the page says so instead of printing one.
- **The abandoned file:** all `ABANDONNÉ` operations with edition, theme, and cost. The data records that projects were abandoned but not why, and the page states that limit rather than speculating.

## Unit 3 — Money (`paris-7e/money/`)

**A. État spécial d'arrondissement.** The 7e's own budget, line by line, by `chapitre` and `nature_reglementaire`, across available exercices, split by section and by Budget Primitif vs other votes. The frozen investment line is the lead finding.

**B. What actually got built.** `travaux_equipements_publics` filtered to `code_postal = 75007`: equipment, type, sector, description, delivery date, cost. Note: `budget` arrives as a space-separated string (`"116 400"`) and must be parsed defensively, with unparseable values surfaced rather than coerced to zero.

**C. Budget Participatif money into the 7e** by edition, derived from the Unit 2 dataset. The contrast between B, C, and the état spécial investment line is the section's central strategic observation.

**D. Citywide context.** Paris voted budgets and comptes administratifs, and contracts from `liste-des-marches-de-la-collectivite-parisienne`.

### Attribution constraints

These are stated on the page, not silently worked around.

- **`fournisseur_code_postal` is the supplier's registered address, not where the money was spent.** The page may therefore claim "contracts awarded to suppliers registered in the 7e" and may not claim "money spent in the 7e."
- **`subventions-versees-annexe-compte-administratif-a-partir-de-2018` carries no arrondissement or address** — only beneficiary name and amount. Grants are therefore presented citywide. **Open item for planning:** check whether `subventions-associations-votees-` carries an arrondissement field. If it does, grants gain a 7e view. If it does not, they stay citywide; a fuzzy name-join against `liste_des_associations_parisiennes` is explicitly rejected as a basis for stated figures.
- **The citywide budget is not published split by arrondissement.** The section cannot show "the 7e's share of Paris spending" and will not estimate one.

Each page carries a **"What this page cannot tell you"** block making these limits explicit. The credibility of the rest of the section depends on it.

## Unit 4 — Proposals (`paris-7e/proposals/`)

A register, not a one-off page. Each proposal is a JSON record under `content/proposals/` rendering to a row in the register and, where warranted, its own detail page.

**Record shape:** id, title, status, location, problem statement, proposal, cost tiers, precedent, target mechanism, routing (élu / Direction / conseil de quartier / funding cycle), evaluation metrics, maintenance plan, and a dated status log.

**Register view:** PROBLEM → PROPOSAL → STATUS across all proposals — the citizen-side institutional memory that motivates this section.

**Seeded with:**
- `running-hub` — full detail page.
- `bosquet-street-furniture` — stub.
- `invalides-cycle-parking` — stub.

### Running hub detail page

Problem; candidate locations mapped; cost tiers at €20k / €75k / €250k; the Seoul Yeouinaru Runner Station precedent; a 12-month pilot with named metrics (users/day, vandalism incidents, maintenance cost, equipment uptime, satisfaction); an explicit maintenance and replacement plan; routing to the responsible élu, Direction, and Budget Participatif cycle; and a dated status log of every contact and response.

The status log is the component with the longest useful life. It converts scattered correspondence into a record that can be cited.

**Evidence limit:** no runner-count data exists. Bike counters near Champ-de-Mars (`comptage-velo-donnees-compteurs`) may be shown as an active-mobility proxy, labelled as a proxy. They are not evidence of demand for a running facility and must not be presented as such.

## Dates

The overview carries an upcoming-dates block: Conseil de Paris sessions, Budget Participatif cycle deadlines, conseil de quartier meetings, and the Forum des Associations.

Conseil de Paris agendas exist in open data (`ordre-du-jour-du-conseil-de-paris-conseil-municipal-et-departemental`). **The rest do not** — they are prose on `mairie07.paris.fr`. Those entries are hand-curated in `content/dates.json`, each with its own `checked_on` stamp, and the block displays that stamp. A dates widget that looks live while quietly rotting would be worse than no widget.

## Data Sources

All from `opendata.paris.fr` unless noted.

| Dataset ID | Use | Records |
|---|---|---|
| `budgets-votes-etats-speciaux-darrondissements-m57-ville` | 7e own budget, 2018– | 15,791 |
| `budget-participatif_operations-projets-gagnants-realisations` | Project pipeline & statuses | 5,501 |
| `bp_projets_gagnants` | Winning projects | 1,446 |
| `conseillerseres-darrondissements` | 7e élus & delegations | 390 |
| `conseillers-de-paris` | Conseillers de Paris | 163 |
| `conseils-quartiers` | Quartier polygons (`nar = 7`) | 117 |
| `travaux_equipements_publics` | Works delivered, 75007 | 436 |
| `liste-des-marches-de-la-collectivite-parisienne` | Procurement | 17,639 |
| `budgets-votes-principaux-a-partir-de-2019-m57-ville-departement` | Citywide voted budget | 8,598 |
| `comptes-administratifs-budgets-principaux-a-partir-de-2019-m57-ville-departement` | Citywide actuals | 25,629 |
| `ordre-du-jour-du-conseil-de-paris-conseil-municipal-et-departemental` | Agendas | 15,488 |
| `subventions-associations-votees-` | Grants (arrondissement field TBC) | 107,693 |
| `liste_des_associations_parisiennes` | Associations, context only | 70,993 |
| `comptage-velo-donnees-compteurs` | Active-mobility proxy | 1,057,549 |

API: CORS is open (`access-control-allow-origin: *`), typical response ~120ms, rate limits exposed via `X-RateLimit-*`.

## Testing

- **Unit tests** on every `transform.mjs` function, against committed fixtures. No network in the test path.
- **Specific coverage:** the space-separated budget string parser; unrecognised `avancement` values passing through intact; time-in-stage returning "insufficient data" rather than a misleading median on small samples; point-in-polygon quartier lookup against known 7e addresses.
- **Extended** `build-index.test.js` for the sections concept.
- **Visual verification** of every map and chart before shipping, per project convention — timing and zoom bugs are not caught by reading code.
- **Provenance check:** every figure rendered on a page traces to an entry in `sources.json`.

## Non-Goals

- A DansMaRue-style defect tracker. Discussed and deliberately deferred; it needs months of manual data entry before it says anything.
- Scraping conseil d'arrondissement minutes from PDFs.
- Any per-arrondissement estimate of the citywide budget.
- A personal-contact database for élus.
- French translation of source-data terms.

## Open Items for Planning

1. Does `subventions-associations-votees-` carry an arrondissement field? Determines whether grants get a 7e view or stay citywide.
2. Confirm current 7e delegations against `mairie07.paris.fr` at build time, and record the discrepancy handling if the dataset and the mairie site disagree.
3. Confirm the four 7e conseil de quartier names and polygons from `conseils-quartiers` where `nar = 7`.
4. Determine whether the Conseil de Paris agenda dataset contains future-dated sessions or only past ones. If only past, the dates block is fully hand-curated.
