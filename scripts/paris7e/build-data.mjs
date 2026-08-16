// scripts/paris7e/build-data.mjs
// Orchestrates fetch -> transform -> write for the paris-7e section.
//
// Run: node scripts/paris7e/build-data.mjs
//
// Failure policy: any fetch failure or schema mismatch aborts the whole build
// and writes nothing. Every output is built in memory and size-checked first;
// the first write happens only after the last transform succeeds. A failed run
// therefore leaves the last known-good data on disk untouched.
//
// Not fetched: comptage-velo-donnees-compteurs. It holds ~1.06M records and no
// unit in v1 uses it. The bike counters are at best an active-mobility proxy for
// the running-hub proposal, they are not evidence of demand for a running
// facility, and pulling a million rows to render a proxy would blow the payload
// budget for nothing. If it is ever added it must be a pre-aggregated daily
// series for counters within ~1km of Champ-de-Mars, never the raw dataset.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  fetchAllRecords,
  fetchAggregate,
  fetchDatasetMeta,
  whereTextEquals,
  whereNumberEquals,
  whereAll,
  rateLimit,
} from './fetch.mjs';

import {
  SAMPLE_FLOOR,
  dedupeProjects,
  splitLocalVsCitywide,
  statusFunnel,
  abandonedFile,
  deliveredFile,
  siteContext,
  timeInStage,
  directionByTheme,
  filterEtatSpecial,
  aggregateEtatSpecial,
  filterTravaux,
  aggregateTravaux,
  filterMarches,
  aggregateMarches,
  filterQuartiers,
  quartiersToGeoJSON,
  filterElus,
  shapeElus,
  shapeConseillersDeParis,
  normaliseExercice,
  roundMoney,
  MARCHES_ATTRIBUTION_NOTE,
} from './transform.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'paris-7e', 'data');

const ARRONDISSEMENT_CODE = '75007';
const QUARTIER_NAR = 7;
// The label differs between datasets: the état spécial says "Mairie 7ème",
// the élus dataset says "Mairie du 7ème". Both are verified against the API.
const ETAT_SPECIAL_LABEL = 'Mairie 7ème';
const ELUS_LABEL = 'Mairie du 7ème';
const CONSEILLERS_DE_PARIS_LABEL = '7';

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const STALE_AFTER_MONTHS = 18;

const DATASETS = {
  bpOperations: 'budget-participatif_operations-projets-gagnants-realisations',
  etatSpecial: 'budgets-votes-etats-speciaux-darrondissements-m57-ville',
  elus: 'conseillerseres-darrondissements',
  conseillersDeParis: 'conseillers-de-paris',
  quartiers: 'conseils-quartiers',
  travaux: 'travaux_equipements_publics',
  marches: 'liste-des-marches-de-la-collectivite-parisienne',
  villeBudgetVotes: 'budgets-votes-principaux-a-partir-de-2019-m57-ville-departement',
  villeComptes: 'comptes-administratifs-budgets-principaux-a-partir-de-2019-m57-ville-departement',
  fontaines: 'fontaines-a-boire',
  sanisettes: 'sanisettesparis',
  veloCounts: 'comptage-velo-donnees-compteurs',
};

// The Champ-de-Mars study area, used to establish what a running facility would
// and would not need to ask for. Kept as one constant so every figure derived
// from it is derived from the same box.
const CHAMP_DE_MARS_BBOX = '48.8515,2.2930,48.8620,2.3120';

// Pont des Invalides, both directions. The nearest counters to the 7e running
// corridor. An active-mobility proxy, never a runner count.
const INVALIDES_COUNTERS = ['100056223-101056223', '100056046-101056046'];

// Fields the transforms depend on. A missing one means the upstream schema
// changed and the build must stop rather than write a quietly wrong file.
const REQUIRED_FIELDS = {
  bpOperations: [
    'identifiant_operation',
    'identifiant_projet_gagnant',
    'budget_global_projet_gagnant',
    'arrondissement_operation',
    'arrondissement_projet_gagnant',
    'avancement_operation',
    'thematique',
    'direction_pilote_operation',
    'edition',
    'debut_etudes_operation',
    'lancement_procedure_operation',
    'lancement_travaux_operation',
    'livraison_prev_operation',
    'ouverture_operation',
  ],
  etatSpecial: [
    'exercice_comptable',
    'arrondissement',
    'section_budgetaire_i_f',
    'sens_depense_recette',
    'type_du_vote',
    'budgets_votes_pmt',
  ],
  elus: ['arrondissement', 'nom', 'prenom', 'fonction_dans_l_executif', 'delegation'],
  conseillersDeParis: ['nom', 'prenom', 'arrondissement', 'groupe'],
  quartiers: ['no_consqrt', 'nom_quart', 'nar', 'geom'],
  travaux: ['adresse', 'code_postal', 'equipement', 'budget', 'annee_livraison'],
  marches: ['num_marche', 'objet_du_marche', 'fournisseur_code_postal', 'montant_max'],
  fontaines: ['voie', 'modele', 'dispo', 'commune'],
  sanisettes: ['adresse', 'horaire', 'acces_pmr', 'arrondissement'],
};

function log(message) {
  console.log(message);
}

// A record set whose first row lacks a required key is a schema mismatch.
// Null values are fine; absent keys are not.
function assertSchema(name, records, fields) {
  if (records.length === 0) {
    throw new Error(`${name}: zero records returned. Refusing to overwrite good data with an empty file.`);
  }
  const sample = records[0];
  const missing = fields.filter(field => !(field in sample));
  if (missing.length > 0) {
    throw new Error(`${name}: schema mismatch, missing field(s) ${missing.join(', ')}`);
  }
}

function monthsSince(isoDate) {
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

function sourceEntry(meta, recordCount, fetchedAt) {
  const age = monthsSince(meta.modified);
  return {
    dataset_id: meta.dataset_id,
    title: meta.title,
    url: meta.url,
    api_url: meta.api_url,
    fetched_at: fetchedAt,
    // Upstream freshness. Pages render this, never fetched_at.
    modified: meta.modified,
    modified_age_months: age,
    stale: age !== null && age > STALE_AFTER_MONTHS,
    record_count: recordCount,
    upstream_record_count: meta.records_count,
  };
}

async function main() {
  const fetchedAt = new Date().toISOString();
  const sources = [];
  const outputs = new Map();

  // -------------------------------------------------------------------------
  // Fetch. Any throw here ends the process before a single file is written.
  // -------------------------------------------------------------------------
  log('Fetching from opendata.paris.fr');

  const metas = {};
  for (const [key, datasetId] of Object.entries(DATASETS)) {
    metas[key] = await fetchDatasetMeta(datasetId);
    log(`  meta ${datasetId}: modified ${metas[key].modified}`);
  }

  const bp = await fetchAllRecords(DATASETS.bpOperations, {
    where: whereTextEquals('arrondissement_operation', ARRONDISSEMENT_CODE),
  });
  assertSchema('bpOperations', bp.results, REQUIRED_FIELDS.bpOperations);
  log(`  ${DATASETS.bpOperations}: ${bp.results.length} operations (via ${bp.via})`);

  const es = await fetchAllRecords(DATASETS.etatSpecial, {
    where: whereTextEquals('arrondissement', ETAT_SPECIAL_LABEL),
  });
  assertSchema('etatSpecial', es.results, REQUIRED_FIELDS.etatSpecial);
  log(`  ${DATASETS.etatSpecial}: ${es.results.length} rows (via ${es.via})`);

  const elus = await fetchAllRecords(DATASETS.elus, {
    where: whereTextEquals('arrondissement', ELUS_LABEL),
  });
  assertSchema('elus', elus.results, REQUIRED_FIELDS.elus);

  const cdp = await fetchAllRecords(DATASETS.conseillersDeParis, {
    where: whereTextEquals('arrondissement', CONSEILLERS_DE_PARIS_LABEL),
  });
  assertSchema('conseillersDeParis', cdp.results, REQUIRED_FIELDS.conseillersDeParis);

  const quartiers = await fetchAllRecords(DATASETS.quartiers, {
    where: whereNumberEquals('nar', QUARTIER_NAR),
  });
  assertSchema('quartiers', quartiers.results, REQUIRED_FIELDS.quartiers);

  const travaux = await fetchAllRecords(DATASETS.travaux, {
    where: whereTextEquals('code_postal', ARRONDISSEMENT_CODE),
  });
  assertSchema('travaux', travaux.results, REQUIRED_FIELDS.travaux);

  const marches = await fetchAllRecords(DATASETS.marches, {
    where: whereTextEquals('fournisseur_code_postal', ARRONDISSEMENT_CODE),
  });
  assertSchema('marches', marches.results, REQUIRED_FIELDS.marches);

  // Site context for the Champ-de-Mars study area. Establishes what is already
  // built there, so a proposal does not ask for water and toilets that exist.
  const fontaines = await fetchAllRecords(DATASETS.fontaines, {
    where: `in_bbox(geo_point_2d,${CHAMP_DE_MARS_BBOX})`,
  });
  assertSchema('fontaines', fontaines.results, REQUIRED_FIELDS.fontaines);

  const sanisettes = await fetchAllRecords(DATASETS.sanisettes, {
    where: `in_bbox(geo_point_2d,${CHAMP_DE_MARS_BBOX})`,
  });
  assertSchema('sanisettes', sanisettes.results, REQUIRED_FIELDS.sanisettes);

  // Bike counters, aggregated server-side: the raw table is 1.06M rows.
  const veloRows = [];
  for (const counter of INVALIDES_COUNTERS) {
    // fetchAggregate returns the rows directly, not a { results } envelope.
    const agg = await fetchAggregate(DATASETS.veloCounts, {
      where: whereTextEquals('id_compteur', counter),
      select: 'sum(sum_counts) as total,count(*) as hours,min(date) as first_seen,max(date) as last_seen',
      groupBy: 'nom_compteur',
    });
    for (const row of agg) veloRows.push({ id_compteur: counter, ...row });
  }
  if (veloRows.length === 0) {
    throw new Error('veloCounts: no counter aggregates returned. Refusing to write a proxy with no data behind it.');
  }
  log(`  ${DATASETS.veloCounts}: ${veloRows.length} counter aggregates`);

  // Citywide budget context, aggregated server-side. The raw tables are 8,598
  // and 25,629 rows and the section only ever shows totals from them. Note the
  // date-typed exercice_comptable comes back as a full ISO timestamp here.
  const villeVotes = await fetchAggregate(DATASETS.villeBudgetVotes, {
    select: 'exercice_comptable,budget,groupe_d_autorisation_i_f,sens_depense_recette,etape_budgetaire,sum(budget_vote_pmt) as total',
    groupBy: 'exercice_comptable,budget,groupe_d_autorisation_i_f,sens_depense_recette,etape_budgetaire',
  });
  const villeComptes = await fetchAggregate(DATASETS.villeComptes, {
    select: 'exercice_comptable,budget,section_budgetaire_i_f,sens_depense_recette,sum(mandate_titre_apres_regul) as total',
    groupBy: 'exercice_comptable,budget,section_budgetaire_i_f,sens_depense_recette',
  });
  if (villeVotes.length === 0 || villeComptes.length === 0) {
    throw new Error('citywide budget aggregation returned no rows');
  }

  // exercice_comptable is date-typed in the votes table and text-typed in the
  // comptes table, so the same field arrives as 2019-01-01T00:00:00+00:00 in one
  // and "2019" in the other. Both become the four-digit year, with the raw value
  // kept, or a page joining the two tables by year silently matches nothing.
  const normaliseVilleRows = rows =>
    rows.map(row => ({
      ...row,
      exercice_comptable: normaliseExercice(row.exercice_comptable),
      exercice_comptable_raw: row.exercice_comptable,
      total: roundMoney(row.total),
    }));

  log(`  rate limit: ${rateLimit.remaining} of ${rateLimit.limit} remaining, resets ${rateLimit.reset}`);

  // -------------------------------------------------------------------------
  // Transform. Pure, so a throw here is a bug, not a network problem.
  // -------------------------------------------------------------------------
  log('Transforming');

  const projects = dedupeProjects(bp.results);
  const split = splitLocalVsCitywide(projects, ARRONDISSEMENT_CODE);

  const byEdition = new Map();
  for (const project of projects) {
    const edition = project.edition ?? '(sans édition)';
    if (!byEdition.has(edition)) byEdition.set(edition, []);
    byEdition.get(edition).push(project);
  }
  const editions = [...byEdition.entries()]
    .map(([edition, editionProjects]) => {
      const editionSplit = splitLocalVsCitywide(editionProjects, ARRONDISSEMENT_CODE);
      return {
        edition,
        project_count: editionProjects.length,
        local_project_count: editionSplit.local_count,
        citywide_project_count: editionSplit.citywide_count,
        local_total: editionSplit.local_total,
        citywide_total: editionSplit.citywide_total,
        local_budget_unknown: editionSplit.local_budget_unknown,
        citywide_budget_unknown: editionSplit.citywide_budget_unknown,
      };
    })
    .sort((a, b) => String(b.edition).localeCompare(String(a.edition)));

  outputs.set('pipeline.json', {
    arrondissement: ARRONDISSEMENT_CODE,
    generated_from: DATASETS.bpOperations,
    unit_of_analysis:
      'Rows in operations[] are operations. Money is only ever summed over projects[], which is deduplicated by identifiant_projet_gagnant. Local and citywide totals are separate and must not be added together.',
    operation_count: bp.results.length,
    project_count: projects.length,
    operations: bp.results,
    projects,
    local_project_count: split.local_count,
    citywide_project_count: split.citywide_count,
    local_total: split.local_total,
    citywide_total: split.citywide_total,
    local_budget_unknown: split.local_budget_unknown,
    citywide_budget_unknown: split.citywide_budget_unknown,
    editions,
    funnel: statusFunnel(bp.results, ARRONDISSEMENT_CODE),
    abandoned: abandonedFile(bp.results, ARRONDISSEMENT_CODE),
    delivered: deliveredFile(bp.results, ARRONDISSEMENT_CODE),
    time_in_stage: timeInStage(bp.results),
    direction_by_theme: directionByTheme(bp.results),
    sample_floor: SAMPLE_FLOOR,
  });

  outputs.set('etat-special.json', {
    arrondissement_label: ETAT_SPECIAL_LABEL,
    generated_from: DATASETS.etatSpecial,
    ...aggregateEtatSpecial(filterEtatSpecial(es.results, ETAT_SPECIAL_LABEL)),
  });

  outputs.set('elus.json', {
    arrondissement_label: ELUS_LABEL,
    // Unit 1 does not ship until these lists are verified against
    // mairie07.paris.fr. The élus dataset predates the March 2026 elections.
    verified_against_mairie: false,
    elus_source: DATASETS.elus,
    elus_modified: metas.elus.modified,
    conseillers_de_paris_source: DATASETS.conseillersDeParis,
    conseillers_de_paris_modified: metas.conseillersDeParis.modified,
    elus: shapeElus(filterElus(elus.results, ELUS_LABEL)),
    conseillers_de_paris: shapeConseillersDeParis(cdp.results),
  });

  outputs.set('quartiers.geojson', quartiersToGeoJSON(filterQuartiers(quartiers.results, QUARTIER_NAR)));

  outputs.set('travaux.json', {
    code_postal: ARRONDISSEMENT_CODE,
    generated_from: DATASETS.travaux,
    ...aggregateTravaux(filterTravaux(travaux.results, ARRONDISSEMENT_CODE)),
  });

  outputs.set('marches.json', {
    generated_from: DATASETS.marches,
    ...aggregateMarches(filterMarches(marches.results, ARRONDISSEMENT_CODE), ARRONDISSEMENT_CODE),
  });

  outputs.set('site-context.json', {
    study_area: CHAMP_DE_MARS_BBOX,
    // What already exists on site. The point of this file is to narrow an ask,
    // not to widen one.
    ...siteContext(fontaines.results, sanisettes.results, veloRows, {
      fontainesSource: DATASETS.fontaines,
      sanisettesSource: DATASETS.sanisettes,
      veloSource: DATASETS.veloCounts,
    }),
  });

  outputs.set('ville-budget.json', {
    scope: 'citywide',
    // Paris does not publish the citywide budget split by arrondissement. This
    // file is context only; no share of it is attributable to the 7e.
    arrondissement_share_available: false,
    votes_source: DATASETS.villeBudgetVotes,
    comptes_source: DATASETS.villeComptes,
    votes: normaliseVilleRows(villeVotes),
    comptes: normaliseVilleRows(villeComptes),
  });

  // -------------------------------------------------------------------------
  // Provenance
  // -------------------------------------------------------------------------
  sources.push(sourceEntry(metas.bpOperations, bp.results.length, fetchedAt));
  sources.push(sourceEntry(metas.etatSpecial, es.results.length, fetchedAt));
  sources.push(sourceEntry(metas.elus, elus.results.length, fetchedAt));
  sources.push(sourceEntry(metas.conseillersDeParis, cdp.results.length, fetchedAt));
  sources.push(sourceEntry(metas.quartiers, quartiers.results.length, fetchedAt));
  sources.push(sourceEntry(metas.travaux, travaux.results.length, fetchedAt));
  sources.push(sourceEntry(metas.marches, marches.results.length, fetchedAt));
  sources.push(sourceEntry(metas.villeBudgetVotes, villeVotes.length, fetchedAt));
  sources.push(sourceEntry(metas.villeComptes, villeComptes.length, fetchedAt));

  outputs.set('sources.json', {
    generated_at: fetchedAt,
    stale_after_months: STALE_AFTER_MONTHS,
    notes: {
      freshness: 'Pages render modified, the upstream date. fetched_at is provenance, not freshness.',
      marches: MARCHES_ATTRIBUTION_NOTE,
      subventions:
        'Grants carry no arrondissement field and are therefore not in this build. They can only be presented citywide.',
      comptage_velo:
        'comptage-velo-donnees-compteurs is deliberately not fetched in v1: 1.06M records, no unit uses it, and it is only ever a labelled proxy.',
    },
    datasets: sources,
  });

  // -------------------------------------------------------------------------
  // Serialise and size-check everything before the first write.
  // -------------------------------------------------------------------------
  const serialised = new Map();
  for (const [name, value] of outputs) {
    const json = JSON.stringify(value);
    const bytes = Buffer.byteLength(json);
    if (bytes > MAX_FILE_BYTES) {
      throw new Error(
        `${name} is ${(bytes / 1024 / 1024).toFixed(2)} MB, over the ${MAX_FILE_BYTES / 1024 / 1024} MB payload budget. Nothing written.`
      );
    }
    serialised.set(name, { json, bytes });
  }

  // -------------------------------------------------------------------------
  // Write. Only reached when every fetch, schema check, transform and size
  // check has passed.
  // -------------------------------------------------------------------------
  mkdirSync(OUT, { recursive: true });
  for (const [name, { json, bytes }] of serialised) {
    writeFileSync(join(OUT, name), json, 'utf8');
    log(`  wrote ${name}: ${(bytes / 1024).toFixed(0)} KB`);
  }

  log(`Done. ${serialised.size} files in paris-7e/data/`);
}

main().catch(error => {
  console.error(`BUILD FAILED: ${error.message}`);
  if (error.cause) console.error(`  cause: ${error.cause.message}`);
  console.error('  No files were written. The last known-good data is unchanged.');
  process.exitCode = 1;
});
