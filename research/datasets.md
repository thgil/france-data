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

## Entries

### DS-001: BPE — Services de santé par commune (Île-de-France)
- URL: https://www.data.gouv.fr/datasets/les-services-de-sante-par-commune-ou-par-arrondissement-base-permanente-des-equipements-idf
- Resource (CSV): https://data.iledefrance.fr/explore/dataset/les-service-de-sante-par-commune-ou-par-arrondissement-base-permanente-des-equip/download?format=csv
- Resource ID (Tabular API): `e405ce09-6d40-4505-835b-3f10f33632ac`
- Publisher: Région Île-de-France (republishing INSEE Base Permanente des Équipements)
- Coverage: 1,300 communes / Paris arrondissements in IDF. Population field is from 2010 census; equipment counts circa 2014 BPE vintage.
- Formats: CSV, JSON, XLS, SHP
- Notes: Counts include `pharmacie`, `laboratoire_d_analyses_medicales`, `etablissement_sante_court_sejour`, `urgences`, `maternite`, etc. **IDF only** — for national coverage we'd need the INSEE BPE national release (which redirects off-platform on data.gouv.fr). For commune-level density story, IDF is rich enough — it hosts ~19% of the French population.
- Used by: Q-007

### DS-002: BPE — Commerces par commune (Île-de-France)
- URL: https://www.data.gouv.fr/datasets/les-commerces-par-commune-ou-arrondissement-base-permanente-des-equipements-idf
- Resource (CSV): https://data.iledefrance.fr/explore/dataset/les-commerces-par-commune-ou-arrondissement-base-permanente-des-equipements/download?format=csv
- Resource ID (Tabular API): `c627e81a-a353-462d-a471-c2e645a9d14c`
- Publisher: Région Île-de-France (republishing INSEE BPE)
- Coverage: same 1,300 IDF communes / arrondissements; same vintage as DS-001.
- Formats: CSV, JSON, XLS, SHP
- Notes: Counts include `boulangerie`, `boucherie_charcuterie`, `epicerie`, `supermarche`, `librairie_papeterie_journaux`, `magasin_de_vetements`, etc. Pairs cleanly with DS-001 for cross-category density comparisons.
- Used by: Q-007

### DS-004: Carte des pharmacies d'Île-de-France
- URL: https://data.iledefrance.fr/explore/dataset/carte-des-pharmacies-dile-de-france/information/
- Resource (CSV): https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/carte-des-pharmacies-dile-de-france/exports/csv?use_labels=true
- Dataset ID: `595917a8a3a7291dd09c8092`
- Publisher: Région Île-de-France
- Coverage: Île-de-France only. 3,991 individual pharmacy points with FINESS identifier, address, lat/lng, and ouverture date. Date range spans roughly 1900–2024 (some historical records have implausible early dates).
- Formats: CSV, JSON, GeoJSON, SHP
- Notes: 3,991 individual pharmacy points with FINESS ID, address, lat/lng, and ouverture date. Joinable to BPE communes via the `commune` and postal-code fields. Column `dateouv` (date d'ouverture) is the pharmacy opening date; a small number of rows are missing it or carry placeholder dates (e.g. 1900-01-01). Column `rs` is the registered name; `rslongue` is the long-form name. Address built from `numvoie`, `typvoie`, `voie`, `cp`, `commune`.
- Used by: Q-007

### DS-005: france-geojson — Communes (simplified, ~2022 COG)
- URL: https://github.com/gregoiredavid/france-geojson
- Resource (GeoJSON): https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes-version-simplifiee.geojson
- Publisher: Grégoire David (open-source mirror of INSEE COG + IGN ADMIN-EXPRESS)
- Coverage: 35,228 metropolitan communes. Each feature has `code` (INSEE commune code) and `nom` (official name). No population or other attributes — geometry only.
- Formats: GeoJSON (simplified polygons, ~19 MB)
- Notes: Simplified geometries (suitable for web display, not precision analysis). Vintage is approximately 2022; communes created or merged since will differ from the current COG. For name analysis, only `code` and `nom` are needed.
- Used by: Q-037, Q-039

### DS-003: Base Sirene des entreprises et de leurs établissements (national)
- URL: https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret
- Publisher: INSEE
- Coverage: every registered business in France. Updated monthly. Latest snapshot 1 April 2026.
- Formats: ZIP (CSV) and Parquet. StockEtablissement is 2.6 GB ZIP / 2.0 GB Parquet.
- Notes: **Too large for the MCP Tabular API.** For aggregations at NAF level (e.g. all `4773Z` pharmacies, `1071C` bakeries), download the parquet and process locally. Treat as the canonical national source when we want to promote a story from "IDF only" to "France-wide."
- Used by: (referenced for follow-up; not yet used in a story)
