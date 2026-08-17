# Paris 7e data coverage, audited 2026-08-17

## 1. The answer

We do have 2024, 2025 and 2026 data. Six of the fourteen datasets the section touches carry data from the last twelve months, and three of those were refreshed today. What we do not have is **arrondissement-level money after 2023**, and that is the whole of the real gap. The citywide budget is published in full but has no arrondissement dimension at all (fields are chapitre, nature, fonction; there is no geography). The only per-arrondissement money series is the état spécial d'arrondissement, and its two datasets have been dormant since a data_processed stamp of 2023-08-01: `budgets-votes-etats-speciaux-darrondissements-m57-ville` stops at exercice 2023, `comptes-administratifs-etats-speciaux-darrondissement` stops at 2022. There is no successor in the 490-dataset catalogue and no mirror on data.gouv.fr that is newer.

Two second-order problems sit underneath that. First, our élus data is now factually wrong: `conseillerseres-darrondissements` (last modified 2021-12-01) still lists the 2020-2026 council, and the March 2026 municipales replaced it. Four names we publish (MONPLAISIR, LEBELT, BARTHELEMY, DELGADO) are not on the current 7e council. Second, `travaux_equipements_publics` is dead (frozen 2023-10-16) and for the 7e has only 7 rows, all delivered 2022 or 2023, so our "works delivered" figures cannot be taken past 2023.

The rest is fixable by swapping sources, and every swap is named in section 3.

One distinction to hold on to throughout: **a stale `modified` stamp and stale data are different problems.** Most of this catalogue sets `modified_updates_on_data_change: false`, so `metas.default.modified` is a publication-event date, not a data date. Several datasets carry data years newer than their own stamp. Judge coverage by grouping on the time field, never by the stamp.

## 2. Every dataset in use

Nine datasets are declared in `paris-7e/data/sources.json`. Five more are cited in `data/site-context.json` and `content/proposals/running-hub.json`. All fourteen are below.

Verdicts: **current** = carries data from the last 12 months. **lagging** = newest data is 2024 or the newest closed year. **frozen** = stops before 2024. **snapshot** = no time field, so coverage cannot be measured from the data.

| dataset_id | upstream `modified` | actual data coverage | 7e coverage | verdict |
|---|---|---|---|---|
| `budget-participatif_operations-projets-gagnants-realisations` | 2026-08-17 | editions 2014-2019, 2021-2025; milestones forward to 2027 | 97 operations, all 11 editions; 2023 n=6, 2024 n=5, 2025 n=8 | current |
| `comptage-velo-donnees-compteurs` | 2026-08-17 | hourly, rolling window 2025-07-16 to 2026-08-16 | both Pont des Invalides counters live | current (rolling, no archive) |
| `fontaines-a-boire` | 2026-08-17 | outage windows 2019-05-02 to 2026-08-13 | `commune = "PARIS 7EME ARRONDISSEMENT"` | current |
| `sanisettesparis` | 2026-08-16 | no time field; `statut` is a live operational value | 15 records, `arrondissement = "75007"` | current / snapshot |
| `conseils-quartiers` | 2026-08-01 | no time field, geometry only | 4 quartier polygons (025-028) | current / snapshot |
| `comptes-administratifs-budgets-principaux-a-partir-de-2019-m57-ville-departement` | 2025-08-26 | exercices 2019-2024, no gaps; 2024 = 12.20bn dépenses | citywide only, no arrondissement field | lagging (2024 is the newest closed year) |
| `liste-des-marches-de-la-collectivite-parisienne` | **2024-05-02, but `data_processed` 2025-10-16** | annee_de_notification 2013-2024; max date 2024-12-31 | 72 rows on supplier postcode 75007; 2024 n=3 | lagging. Stamp understates it, data still stops at 2024 |
| `travaux_equipements_publics` | 2023-10-16 | annee_livraison 2022-2025 citywide, but 2024 n=2 and 2025 n=1 | 7 rows, all 2022 or 2023 | frozen for our purposes. Citywide 2024/2025 rows are planned deliveries recorded in 2023 |
| `budgets-votes-etats-speciaux-darrondissements-m57-ville` | **2021-11-25, but data reaches 2023** | exercices 2018-2023; `where=exercice_comptable>=date'2024'` returns 0 | 7e present every year 2018-2023 | frozen. Stale stamp AND stale data, from different years |
| `budgets-votes-principaux-a-partir-de-2019-m57-ville-departement` | 2020-11-25 | exercices 2019-2021, and broken: every 2020 row sums to 0.00, 2021 has no Budget Primitif, only 460 Budget Suppl. rows | citywide only | frozen and defective. See section 5 note |
| `budgets-votes-autorisations-de-programmes-a-partir-de-2018-m57-ville-departement` | 2020-11-25 | exercices 2018-2022 | citywide only | frozen |
| `conseillerseres-darrondissements` | 2021-12-01 | no time field; content is the 2020-2026 mandature | 13 rows for "Mairie du 7eme" | **frozen and now wrong**. Superseded by the March 2026 election |
| `conseillers-de-paris` | 2023-01-03 | no time field; 2020-2026 mandature | 4 rows, arrondissement 7 | **frozen and now wrong** |
| `liste_des_associations_parisiennes` | 2015-02-27 | no time field at all | 1,900 rows for 75007, but only 64 distinct names | frozen, eleven-year-old snapshot |

Stamp-versus-data mismatches worth naming explicitly, because reading only the metadata will mislead you in both directions:

- `budgets-votes-etats-speciaux-darrondissements-m57-ville`: stamp 2021, data to 2023.
- `liste-des-marches-de-la-collectivite-parisienne`: stamp 2024-05, `data_processed` 2025-10-16, data to 2024-12-31.
- `travaux_equipements_publics`: stamp 2023-10, but carries 2024 and 2025 `annee_livraison` values. Those are plans recorded in 2023, not confirmed deliveries.
- `deliberation-emploi` (not in use): stamp 2025-07-03, `data_processed` 2026-01-07.

And one geography trap: citywide coverage is not 7e coverage. `travaux_equipements_publics` reaches 2025 citywide and 2023 in the 7e.

## 3. Sources to add or switch to

| Replace / add | New dataset | What it gains |
|---|---|---|
| Replace `conseillerseres-darrondissements` and `conseillers-de-paris` | data.gouv.fr Répertoire National des Élus, dataset `5c34c4d1634f4173183a64f1`, file `elus-conseiller-darrondissement-ca.csv`, refreshed 2026-08-11 | The actual current council. 503 Paris rows, 11 for "Paris 7Eme Secteur", every mandate starting 2026-03-15 to 2026-03-25. DATI as maire (function start 2026-04-06), LE QUERE 1er adjoint, GAUDE 2e, POISSON 3e, LEVY 4e, BERNARD 5e, plus CHEVREUL, DAUVERGNE, DE BRAQUILANGES, LAROCK, ROUILLON. Adds date of birth and CSP. Loses delegation text and political group, which have no post-2026 open-data source. |
| Add alongside | data.gouv.fr `69b82a7de5d58cc06ad35ce0`, municipales 2026 first round | 7e settled in round one, 15 March 2026: 34,354 inscrits, 63.37% turnout, "Changer Paris 7ème" 58.77% and 10 of 11 seats, plus 25 polling-station rows. |
| Replace `travaux_equipements_publics` | `parissetransforme` (opendata.paris.fr), modified 2026-08-17 | Same subject, live. 54 rows for 75007 against our 7, with 15 delivered in 2024 and 7 in 2025 (école Duquesne schoolyard 2025-11-10, conservatoire Erik-Satie thermal works 2025-08-30). Caveats: 30 of 54 have a null `date_liv`, and there is no budget field, so our 2.7M EUR total has no equivalent there. |
| Add | `chantiers-a-paris`, modified 2026-08-17 | 186 open worksites in the 7e right now: 1 started 2023, 12 in 2024, 39 in 2025, 134 in 2026. Note it measures street disruption, not municipal investment: only 13 of 186 are Ville de Paris, 132 are private building works, 41 network operators. Historical siblings share the schema back to 2019 (`chantiers-a-paris-copie` 2019 through `historique-chantiers-a-paris-en-2024`). |
| Switch procurement from `liste-des-marches-de-la-collectivite-parisienne` | Consolidated DECP, data.gouv.fr `608c055b35eb4e6ee20eb325`, `decp.parquet`, republished 2026-08-17. Official raw JSON alternative: `5cd57bf68b4c4179299eb0e9` | 20 months fresher. Filter `acheteur_id = 21750001600019` ("VILLE DE PARIS (MAIRIE)"): 2024 n=1,269, 2025 n=1,202, 2026 n=857, max notification 2026-08-14. Adds procedure type, CPV, offres reçues, social and environmental clauses. Cost: no arrondissement. `lieuExecution` is only ever 75056 or dept 75, so the 7e route is joining the 1,635 distinct titulaire SIRETs since 2024 to SIRENE. Keep the ODS file only for pre-2019 history (DECP has 8 Paris rows before 2019). |
| Replace `liste_des_associations_parisiennes` | `subventions-associations-votees-`, modified 2026-07-28, 107,693 rows | annee_budgetaire 2013-2026: 2024 n=6,903, 2025 n=6,966 (293.6M EUR voted), 2026 n=1,230 (131.7M EUR). 107,486 rows carry `numero_siret`, so it joins to SIRENE and can be cut to 75007. This is the only fresh money dataset that can reach the 7e at all. |
| Add for the 2025 city exercice | OFGL `ofgl-base-communes` at data.ofgl.fr (same Explore v2.1 API), refreshed 2026-07-29 | Paris (`com_code 75056`) exercice 2025: 934 rows, budget principal plus ~20 annexes, 53 agrégats. Dépenses de fonctionnement 7.46bn, recettes 8.26bn, dépenses d'équipement 1.18bn, frais de personnel 2.84bn, encours de dette 11.36bn, épargne brute 801m. One full year ahead of anything Paris publishes itself. Cost: agrégat level only, no chapitre/nature/fonction, no arrondissement. |
| Add for arrondissement execution history | `comptes-administratifs-etats-speciaux-darrondissement`, 38,574 rows | Executed (not voted) arrondissement spend, exercices 2009-2022, `budget` field carries "Mairie 7ème". Not fresher, but four extra years at the front and the only source for what was actually spent. |
| Add alongside the BP operations table | `bp_projets_gagnants` (1,446 rows, modified 2026-08-14) and `budget_participatif_nombre_votants_opendata` (11 rows, modified 2026-05-06) | Clean project-level view with budgets: 46 winning projects in 75007, 5 in 2024, 3 in 2025. Voter totals per edition, citywide only, reaching 162,395 in 2025 (the record). |

Nothing beats the budget participatif operations table we already use. Avoid `budget-participatif_operations-projets-gagnants-realisations-test`: a stale March 2025 duplicate that stops at the 2024 edition and types every column as text.

## 4. Gated or unpublished

| What | Classification | URL checked | Notes |
|---|---|---|---|
| Per-arrondissement split of the citywide budget | not-published | `opendata.paris.fr/api/explore/v2.1/catalog/datasets/comptes-administratifs-budgets-principaux-a-partir-de-2019-m57-ville-departement/records` | The breakdown axes are chapitre, nature, fonction. No arrondissement column exists in any citywide budget dataset. Only the état spécial is per-arrondissement: 7e voted dépenses 2,293,850 (2018) rising to 2,745,271 (2023), against a city budget in the billions. Do not promise a 7e share of the city budget. A bottom-up proxy from geocoded project data is an estimate and must be labelled as one. |
| Submitted and rejected Budget Participatif ideas | public-web-page-only | `https://decider.paris.fr/decider/jsp/site/Portal.jsp?page=search-solr&conf=default&query=...` | Open data publishes winners only. The OAuth redirect on decider.paris.fr is a silent SSO probe, not a wall: the chain ends 200 on the working portal and idea pages read fine anonymously. Login is needed only to vote or submit. `consultation_status_text:NONLAUREAT` returns 1,903 citywide, 42 for the 7e; 89 DECIDER_BUDGET documents for the 7e in total. `SOUMIS` returns 0 and `NONRETENU` returns 0, so the funnel above the vote is genuinely not exposed. `bp_projets_gagnants.lien_projet_soumis` is the join key back to these pages. Note `budgetparticipatif.paris.fr` is NXDOMAIN; `budgetparticipatif.paris` 301s to that dead name. Cite decider.paris.fr. |
| The eleven `participation-citoyenne-consultations-numeriques-YYYY` datasets | empty shells | catalogue records_count | All have 0 records; they are attachment shelves. The 2015 shelf holds `BP 2015 - Boîte à idées.csv`, 6.6 MB, 368,359 lines, the only submitted-ideas dump in Paris open data, and it covers the 2015 edition alone. The 2022 shelf's BP-titled file is a satisfaction survey, not ideas. |
| Conseil d'arrondissement minutes and adopted deliberations | pdf-only | `https://mairie07.paris.fr/pages/comptes-rendus-13999`, `https://mairie07.paris.fr/pages/conseil-d-arrondissement-deliberations-adoptees-22150` | 88 PV PDFs (2014 to 2026, current through the CA of 11 June 2026) and 27 deliberation PDFs (2022 to 2026, latest 11 July 2026), all on cdn.paris.fr with content-hash filenames. The human-written link labels are the only date metadata and parse reliably. |
| Conseil d'arrondissement agendas (ordres du jour) | pdf-only, and abandoned | `https://mairie07.paris.fr/pages/ordres-du-jour-14000` | 61 PDFs, year navigation stops at 2022, latest is 21 June 2022. Nothing since. The catalogue's `ordre-du-jour-du-conseil-de-paris-...` covers the Conseil de Paris only and stops at 2 May 2018 despite its "depuis janvier 2015" title. All seven of its fields are text, so a date filter fails outright with `IncompatibleTypesInComparisonFilter`. |
| Conseil de quartier meeting dates | public-web-page-only | `https://mairie07.paris.fr/pages/agenda-des-reunions-citoyennes-14008` | Prose only, page last updated 05/05/2026 and already stale. No ICS or calendar feed (grep for .ics/webcal found only an SVG icon id). `conseils-quartiers` is geometry only. Do not promise a live calendar. |
| Current 7e élus as machine-readable from the mairie | public-web-page-only | `https://mairie07.paris.fr/elus/adjoints-a-la-maire` and siblings | The listing pages are client-rendered from an Algolia index (app `L53ZNZVW5W`, index `Elected_production_v4`, search-only key in the page source). Individual `/pages/<slug>` pages are server-rendered and carry delegation, group, obfuscated email, phone. The site publishes 11 people with delegations, but looks mid-update: its own group facet still contains "en cours d'actualisation", and Chevreul's lead text says "Adjoint au Maire" while her mandate field says conseillère d'arrondissement. Use the RNE for names; treat the mairie site as the only source for delegations and re-check before publishing. |
| HAROPA cahier des prescriptions, berges de Seine | pdf-only | `https://www.haropaport.com/sites/default/files/media/documents/Cahier_prescriptions_berges_Seine.pdf` | 200, application/pdf, 27,928,184 bytes. Apur summary at `apur.org/sites/default/files/4p221_prescription_berges_seine.pdf` (5.6 MB). HAROPA's HTML pages 403 scripted clients even with a browser UA; the direct file paths serve fine. No structured or geospatial version exists. Extracting the prescriptions as data is manual work, not a parse job. |

## 5. Verification results

Fable re-ran every published figure against the live API on 2026-08-17. **Eleven claim groups checked. Ten reproduced exactly. One is now wrong, in four figures, all in the `velo` claim.**

| Claim | Stated | Actual today | Why |
|---|---|---|---|
| velo | 1,063,264 movements 2025-07-17 to 2026-08-15 | **1,060,131** | The rolling window moved |
| velo | about 2,694 per day | **2,684** (1,060,131 / 395 inclusive days) | Follows from the total |
| velo | 1,371 per day north-south | **1,366** (539,493 / 395) | N-S counter now starts 2025-07-17T08:00; earlier hours dropped out of the window |
| velo | 1,323 per day south-north | **1,318** (520,638 / 395) | S-N counter has no 2025-07-17 rows at all; min date is now 2025-07-18T00:00 |

This is not an error in how the figure was computed. `comptage-velo-donnees-compteurs` is a rolling ~13-month window, and the front of the claimed period has since been trimmed. Every figure is 0.3 to 0.4% high, uniformly, which is what dropping a partial day at the start looks like. The lesson for the build: **any figure derived from this dataset expires.** Either state the extraction date in the copy and accept drift, or recompute on every build.

Everything else reproduced exactly: the état spécial series (Investissement 161,405 in every year 2018-2023, Fonctionnement 2,036,721 to 2,264,097), the 11 abandoned BP operations and their 309,500 EUR local / 15,000,000 EUR citywide split, the 28 local FIN projects at 5,902,600 EUR and 10 citywide at 31,200,000 EUR, the eight Champ-de-Mars projects (3 delivered at 2,640,000, 5 abandoned at 134,500), project 11141 and its three operations, the BP streams comparison (13,542,100 over 10 editions, mean 1,354,210; travaux 2,705,000 over 2 years, mean 1,352,500; both 8.4x the 161,405 line), the Champ-de-Mars fountains and sanisettes (19 / 18 available / 7 sanisettes), the per-resident ratio (48,015 and 2,103,778 residents, 3.36 EUR against 1,251 EUR, 372x), and the associations claim (22 distinct sport associations in 75007, zero running clubs).

Three caveats surfaced during verification that are worth carrying into the copy:

- The 161,405 investment line comes from a dataset whose last exercice is 2023. Label it as a 2023-or-earlier figure.
- The 372x per-resident ratio compares two **voted** Budget Primitif figures, which is a consistent basis. On executed figures it would be about 316x. That is a methodological choice, not an error, but state which basis is used.
- The `travaux_equipements_publics` mean of 1,352,500 per year is arithmetic only. The real split is 230,000 in 2022 and 2,475,000 in 2023.

Always deduplicate BP money by `identifiant_projet_gagnant` before summing, and never combine arrondissement-scale and Paris-scale budgets into one total.

## 6. How to refresh next year

Run this in August. The date logic below assumes an August pass.

### 6.0 Ground rules, read these first

- Always `curl -s --compressed`.
- **Never judge coverage by `metas.default.modified`.** Most of this catalogue has `modified_updates_on_data_change: false`. Check `metas.default.data_processed` as a second signal, then group on the actual time field. That is the only answer that counts.
- `exercice_comptable` is **date-typed** in `budgets-votes-etats-speciaux-darrondissements-m57-ville` and `budgets-votes-principaux-a-partir-de-2019-...` (groups return `2019-01-01T00:00:00+00:00`, filters need `date'2025'`) and **text-typed** in `comptes-administratifs-...` and `...autorisations-de-programmes...` (groups return `2019`, filters need `"2025"`). Match the type or you get `IncompatibleTypesInComparisonFilter`.
- An aggregation returns `total_count: 1`, not the group count. Page with `limit=100&offset=N` until you get a short page, and count the rows yourself.
- Learn filter values before filtering. The values are not what you would guess: `arrondissement_operation` is `"75007"` not `"7"`; `conseillerseres-darrondissements.arrondissement` is `"Mairie du 7eme"`; `budgets-votes-etats-speciaux...arrondissement` is `"Mairie 7ème"` (with the accent); `fontaines-a-boire.commune` is `"PARIS 7EME ARRONDISSEMENT"` (not `"PARIS 7EME"`, which returns 0); `dossiers-recents-durbanisme.commune` is `7`. Group on the filter field first.

### 6.1 The three commands you need

```bash
API=https://opendata.paris.fr/api/explore/v2.1/catalog/datasets

# a. Freshness and true processing date for one dataset
curl -s --compressed "$API/<id>" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin)["metas"]["default"]; \
    print(d["modified"], d.get("data_processed"), d.get("modified_updates_on_data_change"))'

# b. Year histogram on the real time field (date-typed and text-typed both work here)
curl -s --compressed "$API/<id>/records?group_by=<year_field>&select=count(*)%20as%20n&limit=100"

# c. Prove a year is absent rather than assuming it
curl -s --compressed "$API/<id>/records?where=exercice_comptable%3E%3Ddate'2025'&limit=1"   # date-typed
curl -s --compressed "$API/<id>/records?where=exercice_comptable%3E%3D%222025%22&limit=1"   # text-typed
```

Full catalogue sweep, needed whenever you are looking for a replacement. It is 5 pages of 100, `total_count` 490 as of 2026-08-17:

```bash
for o in 0 100 200 300 400; do
  curl -s --compressed "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets?limit=100&offset=$o" > cat_$o.json
done
# then grep ids and titles locally for: budget, march, comptes, conseil, etats-speciaux,
# associa, travaux, chantier, elu, deliberation
```

### 6.2 Per-dataset checklist

Datasets that should have gained a new year, check these first:

| Dataset | Expect | When it normally lands | The check |
|---|---|---|---|
| `comptes-administratifs-budgets-principaux-a-partir-de-2019-m57-ville-departement` | exercice **2025** | Late August. The 2024 exercice arrived with the 2025-08-26 refresh, and the 2019-2024 series has no gaps. This is the most reliable annual gain in the set. | histogram on `exercice_comptable` (text-typed, filter `"2025"`) |
| `liste-des-marches-de-la-collectivite-parisienne` | notifications through **2025-12-31** | Declared cadence Annuelle. Last `data_processed` 2025-10-16. | `group_by=annee_de_notification`, and `select=max(date_de_notification)` |
| `subventions-associations-votees-` | 2026 filling out, 2027 opening | Rolling, refreshed roughly monthly | `group_by=annee_budgetaire` |
| `budget-participatif_operations-projets-gagnants-realisations` | a 2026 edition | Refreshed daily. There was no 2026 edition in the catalogue as of 2026-08-17. | `group_by=edition` |
| OFGL `ofgl-base-communes` at data.ofgl.fr | exercice **2026** | Refreshed 2026-07-29 with 2025. Expect late July. | filter `com_code = "75056"`, group on exercice |
| RNE `5c34c4d1634f4173183a64f1` on data.gouv.fr | quarterly refresh; function labels firming up | The 2026-08-11 refresh noted post-election updates still in progress, so labels were provisional | re-download `elus-conseiller-darrondissement-ca.csv`, filter `Paris 7Eme Secteur` |
| `historique-chantiers-a-paris-en-YYYY` | a **2025** file | The 2024 file was published 2025-09-15. Expect a 2025 file around September 2026. As of 2026-08-17 no 2025 file existed: grepping all 490 ids and titles for "2025" returned only elections and consultations. | catalogue sweep, grep ids for `chantiers` |

Datasets to check for signs of life, but do not expect movement:

| Dataset | Last exercice | What revival looks like |
|---|---|---|
| `budgets-votes-etats-speciaux-darrondissements-m57-ville` | 2023 | Any row with `exercice_comptable >= date'2024'`. This is the single most valuable thing to check: it is the only per-arrondissement voted budget. If it revives, the whole money section can be brought current. |
| `comptes-administratifs-etats-speciaux-darrondissement` | 2022 | Same check, text-typed filter. Its execution counterpart. |
| `budgets-votes-principaux-a-partir-de-2019-m57-ville-departement` | 2021, and defective | Both dormant since 2020-11-25. If a successor appears it will be a new dataset id, so run the catalogue sweep and grep for `budgets-votes`. |
| `budgets-votes-autorisations-de-programmes-a-partir-de-2018-...` | 2022 | Same. |
| `travaux_equipements_publics` | 2023 in the 7e | Frozen since 2023-10-16. If it has not moved, it should be out of the build entirely; `parissetransforme` is the live successor. |
| `conseillerseres-darrondissements`, `conseillers-de-paris` | 2020-2026 mandature | Check whether the Ville has finally refreshed for the 2026 council. Until then, use the RNE. A refresh is worth catching because these are the only source of delegation text and political group. |
| `liste_des_associations_parisiennes` | frozen 2015 | Do not expect anything. Use `subventions-associations-votees-`. |

Figures to recompute unconditionally, because their source changes under them:

- All four `velo` figures. `comptage-velo-donnees-compteurs` is a rolling window and the numbers drift every day. Re-derive with `sum(sum_counts)` over an explicitly stated date range, and put that range in the copy.
- `fontaines-a-boire` and `sanisettesparis` counts. Both refresh daily and carry live operational status.
- `chantiers-a-paris` counts for the 7e. 134 of 186 open worksites started in 2026, so this turns over fast.
- Any DECP figure. The consolidated parquet republishes daily.

### 6.3 Confirming a gap is real

Before writing "no data exists", run and record all three:

1. The catalogue sweep in 6.1, grepping ids **and** titles **and** keywords, accent-normalised.
2. The Administration et Finances Publiques theme listing (65 datasets as of 2026-08-17), read by eye. It caught nothing the id grep missed, but it is the cross-check.
3. data.gouv.fr, both organisation-scoped and open search:
   ```bash
   curl -s --compressed "https://www.data.gouv.fr/api/1/datasets/?organization=534fff89a3a7292c64a77eb7&q=<term>"
   ```
   The Ville de Paris organisation id is `534fff89a3a7292c64a77eb7`. Note that nearly everything it publishes there is a mirror of the ODS datasets with identical timestamps. In 2026 it returned **0** results for both `march` and `commande`: Paris has no DECP page of its own, its contracts reach the national channel via the Maximilien buyer profile.

Then write down which searches you ran. "I did not find it" and "it does not exist" are different claims and only the first is ever provable this way.

## 7. What is missing

### Missing and not obtainable

- **A 7e share of the citywide budget.** No source apportions citywide spending by arrondissement. Not the ODS catalogue, not OFGL, not the DGFiP balances comptables (both are commune-level for all of Paris). The état spécial is the only per-arrondissement money that exists, and it is the delegated fraction only: roughly 2.7M EUR against billions. I did not exhaustively check every DGFiP file, so treat "no arrondissement split anywhere" as not-found rather than proven absent.
- **État spécial d'arrondissement for 2024, 2025, 2026.** Both datasets confirmed empty past their last exercice, no successor in the catalogue, no fresher mirror on data.gouv.fr. The same publisher (Direction des Finances et des Achats) refreshed the citywide comptes administratifs on 2025-08-26 with exercice 2024, so the arrondissement series specifically is being left behind.
- **BP ideas rejected at triage.** `SOUMIS` and `NONRETENU` return 0 documents on decider's own search index. The funnel above the vote cannot be reconstructed from anything public.
- **Submitted BP ideas for editions 2016 onward.** Published once, for 2015 only, as a CSV attachment. I listed the attachment titles for all eleven yearly shelves and found no equivalent.
- **Conseil de Paris agendas, séances, voeux, amendements or vote records after May 2018.** Nothing in either catalogue. No procès-verbal or compte rendu dataset of any kind for the Conseil de Paris. I searched data.gouv.fr with four queries and found only mirrors and other collectivités; I did not exhaust the phrasing space.
- **Conseil d'arrondissement agendas after June 2022.** The mairie stopped publishing them.
- **Delegation text and political group for the post-2026 council, as open data.** The RNE does not carry them and the Paris datasets have not been refreshed. The mairie website is the only source, and it is scraping.
- **A multi-year cycling trend at Pont des Invalides.** The counter dataset is a rolling ~13-month window with no archive behind it. Nothing before 2025-07-16 is available.

### Missing but obtainable with effort

- **7e procurement.** DECP has Paris contracts to 2026-08-14 but no arrondissement. Join the 1,635 distinct titulaire SIRETs notified since 2024 to SIRENE and filter on 75007 addresses. Doable, and it is the only way to get past the 2024 wall.
- **7e subventions.** `subventions-associations-votees-` has no arrondissement field but 107,486 of 107,693 rows carry `numero_siret`. Same SIRENE join. This is the only fresh money source that can be cut to the 7e at all.
- **Losing BP ideas for the 7e.** 42 of them, browsable as HTML on decider.paris.fr. Scrape the Solr result rows and follow each "Je découvre l'idée" link. `bp_projets_gagnants.lien_projet_soumis` gives a join key back to open data.
- **Conseil d'arrondissement minutes and adopted deliberations.** 88 + 27 PDFs on cdn.paris.fr. Filenames are content hashes, so the link text is the only date metadata, but labels like "PV du CA du jeudi 11 juin 2026" parse reliably. Text extraction from the PDFs is a further step.
- **Current élus with delegations.** Either scrape the 11 server-rendered `/pages/<slug>` URLs, or read the site's own public Algolia index (`POST https://L53ZNZVW5W-dsn.algolia.net/1/indexes/Elected_production_v4/query`, header `X-Algolia-API-Key: f9594bd99919b6e18613111b3d2c1b7c`, body `{"facetFilters":[["mairie_id:7"]],"hitsPerPage":100}`). That is the public search backend the page itself uses. It is scraping, not an official source, and the site looked mid-update in August 2026, so re-check names before publishing.
- **Conseil de quartier meeting dates.** Parse the prose under the "Conseils de quartiers" heading on the agenda page. Expect it to be months stale and to break on any rewrite.
- **HAROPA berges prescriptions as data.** Manual extraction from a 28 MB PDF. Budget for it properly.
- **Multi-year 7e worksite counts.** The `chantiers-a-paris` historical family (2019 through 2024) shares an identical schema: 1,536 rows for 75007 in 2023, 1,377 in 2024. A chart is straightforward; a 2025 file has not appeared yet.
- **CA 2025 for the city.** The dataset stops at 2024, but a compte administratif 2025 would normally have been voted around June 2026 and may exist as a paris.fr document or deliberation. I did not check outside the open data portal. Meanwhile `evaluation-climat-du-budget-d-ela-collectivite` already carries a 2025 `compte_administratif_total` headline, which the CA dataset itself does not publish.
