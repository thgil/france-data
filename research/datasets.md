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

### DS-APL: APL aux médecins généralistes 2023 (DREES)
- URL: https://www.data.gouv.fr/datasets/laccessibilite-potentielle-localisee-apl
- Publisher: DREES (Direction de la recherche, des études, de l'évaluation et des statistiques)
- Coverage: All communes in metropolitan France and overseas territories. APL scores for 2023, population base INSEE 2021. 34,886 communes.
- Formats: CSV, XLS
- Notes: APL = accessibilité potentielle localisée. Measures estimated GP consultations accessible per standardised resident per year, using a catchment-area model that accounts for distance and demand. Threshold: < 2.5 = sous-dense (medical desert); < 1.0 = severe. Some small communes have null scores. Vintage 2023 is the most recent as of April 2026.
- Used by: Q-014

### DS-CONTOURS: Contours administratifs communes 2025 (data.gouv.fr)
- URL: https://www.data.gouv.fr/datasets/contours-administratifs
- Publisher: data.gouv.fr / Etalab
- Coverage: All French communes including overseas territories. 2025 vintage, 1000m simplification level.
- Formats: GeoJSON, TopoJSON, Shapefile
- Notes: Used for commune polygon boundaries. The 1000m-simplified version is suitable for national-scale choropleth rendering (~10 MB GeoJSON). Joined to DREES APL data via INSEE commune code. Includes overseas territories (Guyane, Martinique, Guadeloupe, La Réunion, Mayotte) with their actual coordinates.
- Used by: Q-014

### DS-003: Base Sirene des entreprises et de leurs établissements (national)
- URL: https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret
- Publisher: INSEE
- Coverage: every registered business in France. Updated monthly. Latest snapshot 1 April 2026.
- Formats: ZIP (CSV) and Parquet. StockEtablissement is 2.6 GB ZIP / 2.0 GB Parquet.
- Notes: **Too large for the MCP Tabular API.** For aggregations at NAF level (e.g. all `4773Z` pharmacies, `1071C` bakeries), download the parquet and process locally. Treat as the canonical national source when we want to promote a story from "IDF only" to "France-wide."
- Used by: (referenced for follow-up; not yet used in a story)

### DS-SIRENE-BARS: SIRENE — Débits de boissons actifs (national, NAF 56.30Z)
- URL: https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret
- Geolocation: https://www.data.gouv.fr/datasets/geolocalisation-des-etablissements-du-repertoire-sirene-pour-les-etudes-statistiques
- Publisher: INSEE
- Coverage: All active establishments in metropolitan France and overseas territories with NAF code 56.30Z (débits de boissons — bars, pubs, brasseries, cafés serving alcohol). March 2026 snapshot. 49,385 geocoded points.
- Formats: Extracted as CSV from the national SIRENE parquet, joined to SIRENE Géolocalisation for lat/lng. Output: bars.json (3.8 MB) with fields lat, lng, commune, name, dept.
- Notes: NAF 56.30Z covers all licensed premises serving alcohol for on-site consumption. 59% of establishments carry a registered business name (denominationUniteLegale or enseigne fields); the rest trade anonymously. Same pipeline as DS-003 / baguettes story — filter parquet by NAF, join geocoords, export to JSON. Département field derived from commune code prefix.
- Used by: Q-033, Story 4 (bars)
