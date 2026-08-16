// scripts/paris7e/transform.test.js
// Unit tests for transform.mjs. No network. Every input comes from a committed
// fixture captured from opendata.paris.fr, or from a small hand-built array
// where an exact expected value has to be checkable by hand.
//
// Run: node --test scripts/paris7e/*.test.js

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SAMPLE_FLOOR,
  OPERATION_STAGE_FIELDS,
  MARCHES_ATTRIBUTION_BASIS,
  parseBudgetString,
  dedupeProjects,
  splitLocalVsCitywide,
  timeInStage,
  directionByTheme,
  statusFunnel,
  abandonedFile,
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
} from './transform.mjs';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

function fixture(name) {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));
}

const bpOperations = fixture('bp-operations.json').results;
const travaux7e = fixture('travaux-75007.json').results;
const travauxOther = fixture('travaux-other.json').results;
const esInvestissement = fixture('etat-special-7e-investissement.json').results;
const esFonctionnement = fixture('etat-special-7e-fonctionnement.json').results;
const es8e = fixture('etat-special-8e.json').results;
const elus7e = fixture('elus-7e.json').results;
const quartiers = fixture('quartiers.json').results;
const marches7e = fixture('marches-75007.json').results;
const marchesOther = fixture('marches-other.json').results;
const catalogConseillers = fixture('catalog-conseillers.json');

const NBSP = '\u00A0';

// ---------------------------------------------------------------------------
// Fixture integrity. If these fail, every other assertion below is meaningless.
// ---------------------------------------------------------------------------

test('fixtures contain a multi-operation project', () => {
  const counts = new Map();
  for (const row of bpOperations) {
    const id = row.identifiant_projet_gagnant;
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  const multi = [...counts.values()].filter(n => n > 1);
  assert.ok(multi.length > 0, 'at least one project spans several operations');
  assert.ok(Math.max(...multi) >= 3, 'at least one project spans three or more');
});

test('fixtures contain a citywide project sited in the 7e', () => {
  const citywide = bpOperations.filter(
    r => r.arrondissement_operation === '75007' && r.arrondissement_projet_gagnant !== '75007'
  );
  assert.ok(citywide.length > 0);
  assert.ok(citywide.some(r => r.arrondissement_projet_gagnant === '75004'));
});

test('fixtures contain all three budget-string forms including U+00A0', () => {
  const budgets = [...travaux7e, ...travauxOther].map(r => r.budget);
  assert.ok(budgets.some(b => /^\d+$/.test(b)), 'plain integer form');
  assert.ok(budgets.some(b => b.includes(' ')), 'ASCII space form');
  assert.ok(budgets.some(b => b.includes(NBSP)), 'U+00A0 non-breaking space form');
});

// ---------------------------------------------------------------------------
// parseBudgetString
// ---------------------------------------------------------------------------

test('parseBudgetString handles the plain integer form', () => {
  assert.equal(parseBudgetString('390000'), 390000);
  assert.equal(parseBudgetString('0'), 0);
});

test('parseBudgetString handles the ASCII space form', () => {
  assert.equal(parseBudgetString('150 000'), 150000);
  assert.equal(parseBudgetString('3 460 000'), 3460000);
});

test('parseBudgetString handles the U+00A0 non-breaking space form', () => {
  assert.equal(parseBudgetString(`116${NBSP}400`), 116400);
  assert.equal(parseBudgetString(`80${NBSP}000`), 80000);
});

test('parseBudgetString handles narrow and thin space separators', () => {
  assert.equal(parseBudgetString('116\u202F400'), 116400);
  assert.equal(parseBudgetString('116\u2009400'), 116400);
});

test('parseBudgetString accepts numbers unchanged', () => {
  assert.equal(parseBudgetString(161405), 161405);
  assert.equal(parseBudgetString(0), 0);
});

test('parseBudgetString returns null, never 0, for unparseable input', () => {
  for (const bad of [null, undefined, '', '   ', 'n/a', 'NC', '-', 'about 40k', {}, [], NaN, Infinity]) {
    assert.equal(parseBudgetString(bad), null, `expected null for ${JSON.stringify(bad)}`);
  }
});

test('parseBudgetString parses every budget in the travaux fixtures', () => {
  for (const row of [...travaux7e, ...travauxOther]) {
    assert.equal(typeof parseBudgetString(row.budget), 'number', `budget ${JSON.stringify(row.budget)}`);
  }
});

// ---------------------------------------------------------------------------
// dedupeProjects: the Unit-of-Analysis Rule
// ---------------------------------------------------------------------------

test('dedupeProjects collapses operation rows to one row per identifiant_projet_gagnant', () => {
  const projects = dedupeProjects(bpOperations);
  const ids = projects.map(p => p.identifiant_projet_gagnant);
  assert.equal(new Set(ids).size, ids.length, 'no project id appears twice');
  assert.ok(projects.length < bpOperations.length, 'dedupe actually removed rows');
  assert.equal(projects.length, 58);
  assert.equal(bpOperations.length, 97);
});

test('dedupeProjects counts a multi-operation project once and records its operations', () => {
  const rows = [
    { identifiant_projet_gagnant: 12498, identifiant_operation: 8511, budget_global_projet_gagnant: 850000, avancement_operation: 'PROCEDURES', arrondissement_projet_gagnant: '75007', titre_projet_gagnant: 'Rénover', edition: '2025' },
    { identifiant_projet_gagnant: 12498, identifiant_operation: 8625, budget_global_projet_gagnant: 850000, avancement_operation: 'PROCEDURES', arrondissement_projet_gagnant: '75007', titre_projet_gagnant: 'Rénover', edition: '2025' },
    { identifiant_projet_gagnant: 12498, identifiant_operation: 8627, budget_global_projet_gagnant: 850000, avancement_operation: '(non démarré)', arrondissement_projet_gagnant: '75007', titre_projet_gagnant: 'Rénover', edition: '2025' },
  ];
  const projects = dedupeProjects(rows);
  assert.equal(projects.length, 1);
  assert.equal(projects[0].budget, 850000, 'budget is the project budget, not the sum of three rows');
  assert.equal(projects[0].operation_count, 3);
  assert.deepEqual(projects[0].operation_ids, [8511, 8625, 8627]);
  assert.deepEqual(projects[0].operation_statuses.sort(), ['(non démarré)', 'PROCEDURES']);
});

test('summing budgets over operation rows multiplies money; dedupe is what prevents it', () => {
  const naive = bpOperations.reduce((n, r) => n + (r.budget_global_projet_gagnant || 0), 0);
  const projects = dedupeProjects(bpOperations);
  const deduped = projects.reduce((n, p) => n + (p.budget ?? 0), 0);
  assert.ok(naive > deduped, 'the naive sum is inflated');
});

test('dedupeProjects flags rows whose project budget disagrees between operations', () => {
  const rows = [
    { identifiant_projet_gagnant: 1, identifiant_operation: 10, budget_global_projet_gagnant: 1000, arrondissement_projet_gagnant: '75007' },
    { identifiant_projet_gagnant: 1, identifiant_operation: 11, budget_global_projet_gagnant: 2000, arrondissement_projet_gagnant: '75007' },
  ];
  const [project] = dedupeProjects(rows);
  assert.equal(project.budget_conflict, true);
  assert.deepEqual(project.budget_values_seen, [1000, 2000]);
});

test('dedupeProjects keeps rows with no project id instead of merging them together', () => {
  const rows = [
    { identifiant_projet_gagnant: null, identifiant_operation: 1, budget_global_projet_gagnant: 100, arrondissement_projet_gagnant: '75007' },
    { identifiant_projet_gagnant: null, identifiant_operation: 2, budget_global_projet_gagnant: 200, arrondissement_projet_gagnant: '75007' },
  ];
  const projects = dedupeProjects(rows);
  assert.equal(projects.length, 2);
  assert.ok(projects.every(p => p.project_id_missing === true));
});

test('dedupeProjects returns unparseable project budgets as null, not 0', () => {
  const rows = [
    { identifiant_projet_gagnant: 5, identifiant_operation: 1, budget_global_projet_gagnant: 'n/a', arrondissement_projet_gagnant: '75007' },
  ];
  const [project] = dedupeProjects(rows);
  assert.equal(project.budget, null);
});

// ---------------------------------------------------------------------------
// splitLocalVsCitywide
// ---------------------------------------------------------------------------

test('splitLocalVsCitywide separates 7e-local projects from citywide ones', () => {
  const projects = dedupeProjects(bpOperations);
  const split = splitLocalVsCitywide(projects, '75007');
  assert.ok(split.local.every(p => p.arrondissement_projet_gagnant === '75007'));
  assert.ok(split.citywide.every(p => p.arrondissement_projet_gagnant !== '75007'));
  assert.equal(split.local.length + split.citywide.length, projects.length);
});

test('splitLocalVsCitywide reports two totals and never a combined one', () => {
  const projects = dedupeProjects(bpOperations);
  const split = splitLocalVsCitywide(projects, '75007');
  assert.equal(typeof split.local_total, 'number');
  assert.equal(typeof split.citywide_total, 'number');
  const keys = Object.keys(split);
  assert.ok(!keys.some(k => /combined|grand_total|^total$/.test(k)), `no combined total, got ${keys.join(',')}`);
});

test('splitLocalVsCitywide labels a citywide project with the arrondissement it is registered to', () => {
  const projects = dedupeProjects(bpOperations);
  const { citywide } = splitLocalVsCitywide(projects, '75007');
  const parisAuxPietons = citywide.find(p => p.identifiant_projet_gagnant === 1962);
  assert.ok(parisAuxPietons, 'Paris aux piétons is in the citywide bucket');
  assert.equal(parisAuxPietons.scope, 'citywide');
  assert.equal(parisAuxPietons.registered_arrondissement, '75004');
  assert.equal(parisAuxPietons.budget, 8000000);
  assert.equal(parisAuxPietons.budget_is_citywide, true);
});

test('splitLocalVsCitywide keeps unparseable budgets out of the totals and counts them', () => {
  const projects = [
    { identifiant_projet_gagnant: 1, arrondissement_projet_gagnant: '75007', budget: 100 },
    { identifiant_projet_gagnant: 2, arrondissement_projet_gagnant: '75007', budget: null },
    { identifiant_projet_gagnant: 3, arrondissement_projet_gagnant: '75004', budget: null },
  ];
  const split = splitLocalVsCitywide(projects, '75007');
  assert.equal(split.local_total, 100);
  assert.equal(split.local_budget_unknown, 1);
  assert.equal(split.citywide_total, 0);
  assert.equal(split.citywide_budget_unknown, 1);
});

// ---------------------------------------------------------------------------
// The abandoned file: the finding this section leads with
// ---------------------------------------------------------------------------

test('abandonedFile reproduces the verified 7e figures: 11 operations, 7 local projects, €309,500', () => {
  const file = abandonedFile(bpOperations, '75007');
  assert.equal(file.operation_count, 11);
  assert.equal(file.local.length, 7);
  assert.equal(file.local_total, 309500);
  assert.equal(file.citywide.length, 4);
  assert.equal(file.citywide_total, 15000000);
  assert.ok(!('total' in file), 'local and citywide money are never combined');
});

// ---------------------------------------------------------------------------
// statusFunnel
// ---------------------------------------------------------------------------

test('statusFunnel reports operation counts and project counts as separate quantities', () => {
  const funnel = statusFunnel(bpOperations, '75007');
  const totalOps = funnel.statuses.reduce((n, s) => n + s.operation_count, 0);
  assert.equal(totalOps, bpOperations.length);
  const fin = funnel.statuses.find(s => s.status === 'FIN');
  assert.ok(fin.operation_count >= fin.project_count, 'operations outnumber or equal projects');
  assert.equal(typeof fin.local_project_total, 'number');
  assert.equal(typeof fin.citywide_project_total, 'number');
});

test('statusFunnel passes an unrecognised avancement value through intact', () => {
  const rows = [
    { identifiant_projet_gagnant: 1, identifiant_operation: 1, avancement_operation: 'STATUT INCONNU', budget_global_projet_gagnant: 500, arrondissement_projet_gagnant: '75007' },
  ];
  const funnel = statusFunnel(rows, '75007');
  const statuses = funnel.statuses.map(s => s.status);
  assert.ok(statuses.includes('STATUT INCONNU'), 'unknown status is kept, not dropped');
});

test('statusFunnel warns that a project spanning statuses is counted under each', () => {
  const rows = [
    { identifiant_projet_gagnant: 1, identifiant_operation: 1, avancement_operation: 'PROCEDURES', budget_global_projet_gagnant: 850000, arrondissement_projet_gagnant: '75007' },
    { identifiant_projet_gagnant: 1, identifiant_operation: 2, avancement_operation: '(non démarré)', budget_global_projet_gagnant: 850000, arrondissement_projet_gagnant: '75007' },
  ];
  const funnel = statusFunnel(rows, '75007');
  assert.equal(funnel.statuses.length, 2);
  assert.ok(funnel.statuses.every(s => s.project_count === 1));
  assert.equal(funnel.projects_may_appear_under_several_statuses, true);
});

// ---------------------------------------------------------------------------
// timeInStage
// ---------------------------------------------------------------------------

test('timeInStage uses the _operation date fields, not the _projet ones', () => {
  assert.deepEqual(OPERATION_STAGE_FIELDS, [
    'debut_etudes_operation',
    'lancement_procedure_operation',
    'lancement_travaux_operation',
    'livraison_prev_operation',
    'ouverture_operation',
  ]);
  const rows = Array.from({ length: SAMPLE_FLOOR }, (_, i) => ({
    identifiant_operation: i,
    debut_etudes_operation: '2020-01',
    lancement_procedure_operation: '2020-03',
    // The _projet variant disagrees on purpose. It must be ignored.
    debut_etudes_projet: '2010-01',
    lancement_procedure_projet: '2019-01',
  }));
  const result = timeInStage(rows);
  const first = result.transitions[0];
  assert.equal(first.from, 'debut_etudes_operation');
  assert.equal(first.to, 'lancement_procedure_operation');
  assert.equal(first.median_months, 2);
  assert.equal(result.fields_used, 'operation');
});

test('timeInStage computes the median in months over odd and even samples', () => {
  const make = (start, end) => ({ debut_etudes_operation: start, lancement_procedure_operation: end });
  const odd = [make('2020-01', '2020-02'), make('2020-01', '2020-04'), make('2020-01', '2020-10'), make('2020-01', '2020-11'), make('2020-01', '2021-01')];
  assert.equal(timeInStage(odd).transitions[0].median_months, 9);
  assert.equal(timeInStage(odd).transitions[0].n, 5);

  const even = [...odd, make('2020-01', '2020-05')];
  // sorted gaps: 1, 3, 4, 9, 10, 12 -> median (4 + 9) / 2 = 6.5
  assert.equal(timeInStage(even).transitions[0].median_months, 6.5);
});

test('timeInStage returns an insufficient-data marker below the sample floor', () => {
  const rows = Array.from({ length: SAMPLE_FLOOR - 1 }, () => ({
    debut_etudes_operation: '2020-01',
    lancement_procedure_operation: '2020-03',
  }));
  const first = timeInStage(rows).transitions[0];
  assert.equal(first.insufficient_data, true);
  assert.equal(first.median_months, null);
  assert.equal(first.n, SAMPLE_FLOOR - 1);
  assert.equal(first.sample_floor, SAMPLE_FLOOR);
});

test('timeInStage reports the sample floor it applied', () => {
  assert.equal(timeInStage(bpOperations).sample_floor, SAMPLE_FLOOR);
  assert.equal(timeInStage(bpOperations, { floor: 40 }).sample_floor, 40);
});

test('timeInStage parses both YYYY-MM and full ISO timestamps', () => {
  const rows = Array.from({ length: SAMPLE_FLOOR }, () => ({
    debut_etudes_operation: '2020-01-01T00:00:00+00:00',
    lancement_procedure_operation: '2020-07',
  }));
  assert.equal(timeInStage(rows).transitions[0].median_months, 6);
});

test('timeInStage ignores rows with a missing endpoint and excludes negative gaps', () => {
  const rows = [
    { debut_etudes_operation: '2020-01', lancement_procedure_operation: '2020-03' },
    { debut_etudes_operation: '2020-01', lancement_procedure_operation: null },
    { debut_etudes_operation: null, lancement_procedure_operation: '2020-03' },
    { debut_etudes_operation: '2020-06', lancement_procedure_operation: '2020-01' },
  ];
  const first = timeInStage(rows, { floor: 1 }).transitions[0];
  assert.equal(first.n, 1);
  assert.equal(first.excluded_negative, 1);
  assert.equal(first.median_months, 2);
});

test('timeInStage counts the operations that entered the stage, not only those that left it', () => {
  const rows = [
    { debut_etudes_operation: '2020-01', lancement_procedure_operation: '2020-03' },
    { debut_etudes_operation: '2020-01', lancement_procedure_operation: '2020-05' },
    // Entered études and never reached procédure: stalled or abandoned. It is
    // excluded from the median and must still be visible in the denominator.
    { debut_etudes_operation: '2020-01', lancement_procedure_operation: null },
    { debut_etudes_operation: '2020-06', lancement_procedure_operation: '2020-01' },
    { debut_etudes_operation: null, lancement_procedure_operation: '2020-03' },
  ];
  const first = timeInStage(rows, { floor: 1 }).transitions[0];
  assert.equal(first.n, 2);
  assert.equal(first.n_entered, 4);
  assert.equal(first.excluded_negative, 1);
});

test('timeInStage flags the transitions that end on a forecast date', () => {
  const transitions = timeInStage(bpOperations).transitions;
  const toLivraison = transitions.find(t => t.to === 'livraison_prev_operation');
  const fromLivraison = transitions.find(t => t.from === 'livraison_prev_operation');
  assert.equal(toLivraison.to_is_forecast, true);
  assert.equal(toLivraison.from_is_forecast, false);
  assert.equal(fromLivraison.from_is_forecast, true);
  assert.equal(transitions[0].to_is_forecast, false);
});

test('timeInStage covers every consecutive pair of stage fields', () => {
  const result = timeInStage(bpOperations);
  assert.equal(result.transitions.length, OPERATION_STAGE_FIELDS.length - 1);
  for (const t of result.transitions) {
    assert.ok(t.n >= 0);
    if (t.insufficient_data) assert.equal(t.median_months, null);
    else assert.equal(typeof t.median_months, 'number');
  }
});

// ---------------------------------------------------------------------------
// directionByTheme
// ---------------------------------------------------------------------------

test('directionByTheme names the dominant Direction where the sample allows', () => {
  const rows = Array.from({ length: SAMPLE_FLOOR }, (_, i) => ({
    thematique: 'Environnement',
    direction_pilote_operation: i === 0 ? 'Direction des Espaces Verts' : 'Direction des Affaires Scolaires',
  }));
  const [theme] = directionByTheme(rows);
  assert.equal(theme.thematique, 'Environnement');
  assert.equal(theme.n, SAMPLE_FLOOR);
  assert.equal(theme.insufficient_data, false);
  assert.equal(theme.direction, 'Direction des Affaires Scolaires');
  assert.equal(theme.direction_n, SAMPLE_FLOOR - 1);
  assert.deepEqual(theme.directions[0], { direction: 'Direction des Affaires Scolaires', n: SAMPLE_FLOOR - 1 });
});

test('directionByTheme returns an insufficient-data marker below the sample floor', () => {
  const rows = Array.from({ length: SAMPLE_FLOOR - 1 }, () => ({
    thematique: 'Sport',
    direction_pilote_operation: 'Direction de la Jeunesse et des Sports',
  }));
  const [theme] = directionByTheme(rows);
  assert.equal(theme.insufficient_data, true);
  assert.equal(theme.direction, null, 'no Direction is named below the floor');
  assert.equal(theme.n, SAMPLE_FLOOR - 1);
  assert.equal(theme.sample_floor, SAMPLE_FLOOR);
});

test('directionByTheme applies the floor to the real 7e sample', () => {
  const themes = directionByTheme(bpOperations);
  const solidarites = themes.find(t => t.thematique === 'Solidarités');
  assert.ok(solidarites, 'the n=1 theme is still listed');
  assert.equal(solidarites.insufficient_data, true);
  assert.equal(solidarites.direction, null);

  const environnement = themes.find(t => t.thematique === 'Environnement');
  assert.equal(environnement.insufficient_data, false);
  assert.equal(typeof environnement.direction, 'string');

  const total = themes.reduce((n, t) => n + t.n, 0);
  assert.equal(total, bpOperations.length, 'every operation lands in exactly one theme');
});

test('directionByTheme is marked as inference, not published fact', () => {
  const themes = directionByTheme(bpOperations);
  assert.ok(themes.every(t => t.basis === 'inferred_from_operations'));
});

// ---------------------------------------------------------------------------
// État spécial
// ---------------------------------------------------------------------------

test('filterEtatSpecial keeps only the named arrondissement', () => {
  const rows = [...esInvestissement, ...es8e];
  const kept = filterEtatSpecial(rows, 'Mairie 7ème');
  assert.equal(kept.length, esInvestissement.length);
  assert.ok(kept.every(r => r.arrondissement === 'Mairie 7ème'));
});

test('aggregateEtatSpecial reproduces the frozen investment line, 2018 to 2023', () => {
  const agg = aggregateEtatSpecial([...esInvestissement, ...esFonctionnement]);
  const bpInvest = agg.lines.filter(
    l => l.section === 'Investissement' && l.type_du_vote === 'Budget Primitif' && l.sens === 'Dépenses'
  );
  const byYear = Object.fromEntries(bpInvest.map(l => [l.exercice, l.amount]));
  for (const year of ['2018', '2019', '2020', '2021', '2022', '2023']) {
    assert.equal(byYear[year], 161405, `investissement ${year}`);
  }
  assert.equal(agg.exercice_max, '2023', 'the dataset ends at 2023 and the output says so');
  assert.equal(agg.exercice_min, '2018');
});

test('aggregateEtatSpecial keeps sections and vote types apart', () => {
  const agg = aggregateEtatSpecial([...esInvestissement, ...esFonctionnement]);
  const sections = new Set(agg.lines.map(l => l.section));
  assert.ok(sections.has('Investissement') && sections.has('Fonctionnement'));
  const voteTypes = new Set(agg.lines.map(l => l.type_du_vote));
  assert.ok(voteTypes.has('Budget Primitif'));
  assert.ok(voteTypes.has('Budget Suppl.'));
});

// ---------------------------------------------------------------------------
// Travaux
// ---------------------------------------------------------------------------

test('filterTravaux keeps only code_postal 75007', () => {
  const kept = filterTravaux([...travaux7e, ...travauxOther], '75007');
  assert.equal(kept.length, 7);
  assert.ok(kept.every(r => r.code_postal === '75007'));
});

test('aggregateTravaux parses all three budget forms and totals them', () => {
  const agg = aggregateTravaux(filterTravaux([...travaux7e, ...travauxOther], '75007'));
  assert.equal(agg.record_count, 7);
  assert.equal(agg.budget_unparseable, 0);
  assert.equal(agg.total_budget, 150000 + 390000 + 350000 + 80000 + 200000 + 935000 + 600000);
  assert.ok(agg.records.every(r => typeof r.budget === 'number'));
});

test('aggregateTravaux surfaces an unparseable budget instead of coercing it to zero', () => {
  const agg = aggregateTravaux([{ code_postal: '75007', equipement: 'X', budget: 'à définir', annee_livraison: '2023' }]);
  assert.equal(agg.records[0].budget, null);
  assert.equal(agg.records[0].budget_raw, 'à définir');
  assert.equal(agg.budget_unparseable, 1);
  assert.equal(agg.total_budget, 0);
});

test('aggregateTravaux marks a sample too small to carry a statistic', () => {
  const agg = aggregateTravaux(filterTravaux([...travaux7e, ...travauxOther], '75007'));
  assert.equal(agg.record_count < SAMPLE_FLOOR * 2, true);
  assert.equal(agg.sample_too_small, true, '7 records do not support a distribution claim');
});

// ---------------------------------------------------------------------------
// Marchés
// ---------------------------------------------------------------------------

test('filterMarches selects on supplier postcode only', () => {
  const kept = filterMarches([...marches7e, ...marchesOther], '75007');
  assert.equal(kept.length, marches7e.length);
  assert.ok(kept.every(r => r.fournisseur_code_postal === '75007'));
});

test('aggregateMarches states that the postcode is the supplier address, not where money was spent', () => {
  const agg = aggregateMarches(filterMarches([...marches7e, ...marchesOther], '75007'), '75007');
  assert.equal(agg.attribution_basis, MARCHES_ATTRIBUTION_BASIS);
  assert.match(agg.attribution_note, /registered/i, 'says the postcode is a registered address');
  assert.match(agg.attribution_note, /not money spent/i, 'denies the spent-here reading outright');
  assert.equal(agg.contract_count, marches7e.length);
  assert.equal(typeof agg.total_montant_max, 'number');
  assert.ok(!('spent_in_7e' in agg));
});

// ---------------------------------------------------------------------------
// Quartiers
// ---------------------------------------------------------------------------

test('filterQuartiers selects nar 7 whether the API typed it as a number or a string', () => {
  assert.equal(filterQuartiers(quartiers, 7).length, 4);
  assert.equal(filterQuartiers(quartiers, '7').length, 4);
  const asNumbers = quartiers.map(q => ({ ...q, nar: Number(q.nar) }));
  assert.equal(filterQuartiers(asNumbers, 7).length, 4);
});

test('quartiersToGeoJSON emits the four conseils de quartier of the 7e', () => {
  const geojson = quartiersToGeoJSON(filterQuartiers(quartiers, 7));
  assert.equal(geojson.type, 'FeatureCollection');
  assert.equal(geojson.features.length, 4);
  const names = geojson.features.map(f => f.properties.nom_quart).sort();
  assert.deepEqual(names, ['ECOLE MILITAIRE', 'GROS CAILLOU', 'INVALIDES', "SAINT - THOMAS D'AQUIN"]);
  assert.ok(geojson.features.every(f => f.geometry && Array.isArray(f.geometry.coordinates)));
});

// ---------------------------------------------------------------------------
// Élus
// ---------------------------------------------------------------------------

test('filterElus keeps the 7e and shapeElus preserves delegation wording verbatim', () => {
  const kept = filterElus(elus7e, 'Mairie du 7ème');
  assert.equal(kept.length, 13);
  const shaped = shapeElus(kept);
  assert.equal(shaped.length, 13);
  const maire = shaped.find(e => e.fonction === 'Maire');
  assert.ok(maire, 'the Maire is present');
  assert.equal(maire.delegation, null, 'the Maire carries no delegation');
  assert.equal(shaped.filter(e => e.delegation !== null).length, 12);
  const olivier = shaped.find(e => e.nom === 'LE QUERE');
  assert.equal(
    olivier.delegation,
    "Sécurité et tranquillité publiques, gestion de l'espace public et correspondant Défense",
    'delegation text is not translated or normalised'
  );
});

test('the élus catalog fixture carries the 2021 upstream modified date the section must display', () => {
  const modified = catalogConseillers.metas.default.modified;
  assert.match(modified, /^2021-12-01/);
});
