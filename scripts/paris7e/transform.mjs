// scripts/paris7e/transform.mjs
// Pure functions only. No network, no fs, no clock. Records in, shapes out.
// Everything the paris-7e section says about money passes through here, so the
// Unit-of-Analysis Rule is implemented once, in this file, and nowhere else.
//
// The rule, from docs/superpowers/specs/2026-08-16-paris-7e-design.md:
//
//   In budget-participatif_operations-projets-gagnants-realisations each row is
//   an OPERATION. budget_global_projet_gagnant is the budget of the whole
//   PROJECT, repeated on every one of that project's operation rows. Summing
//   that column across operations multiplies the money.
//
//   A citywide project appears as an operation in each arrondissement it
//   touches, carrying its full citywide budget. A 7e operation row can carry
//   8 million euros of Paris-wide money.
//
// Therefore: deduplicate by identifiant_projet_gagnant before summing, and keep
// 7e-local money and citywide money in two separate totals that are never added
// together. No function in this file returns a combined total, by design.

// Minimum sample size before a statistic is stated rather than withheld.
// The 7e has ~97 operations across 8 themes, so many cells are n=1 or n=2.
// Below this floor the output carries insufficient_data instead of a number.
export const SAMPLE_FLOOR = 5;

// Stage dates come in _operation and _projet variants that can disagree.
// Time-in-stage uses _operation, because operations are what physically happen.
export const OPERATION_STAGE_FIELDS = [
  'debut_etudes_operation',
  'lancement_procedure_operation',
  'lancement_travaux_operation',
  'livraison_prev_operation',
  'ouverture_operation',
];

// livraison_prev_operation is a forecast delivery date, not an observed one.
// Any transition touching it is part forecast, and the pages say so.
export const FORECAST_STAGE_FIELDS = ['livraison_prev_operation'];

export const MARCHES_ATTRIBUTION_BASIS = 'fournisseur_code_postal';

export const MARCHES_ATTRIBUTION_NOTE =
  'Selected on the supplier’s registered postcode. These are contracts awarded to suppliers registered in the arrondissement, not money spent in the arrondissement.';

// Euro amounts carry cents, and summing them in binary floating point leaves
// artifacts: 93309122.25999999 for what is really 93309122.26. Every money
// total in this file goes through this, so no page has to round defensively.
// It corrects representation error only; it never changes a real figure.
export function roundMoney(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return value;
  return Math.round(value * 100) / 100;
}

// Exercice and edition fields arrive as a bare year from text-typed columns and
// as a full ISO timestamp from date-typed ones, including inside a group_by
// result. Both reduce to the four-digit year, so downstream joins by year work.
export function normaliseExercice(value) {
  if (value === null || value === undefined) return null;
  const match = String(value).match(/^(\d{4})/);
  return match ? match[1] : String(value);
}

// Digit-group separators observed in Paris open data budget strings:
// ASCII space, U+00A0 no-break space, U+202F narrow no-break space,
// U+2009 thin space.
const GROUP_SEPARATORS = /[ \u00A0\u202F\u2009\u2007\t]/g;

// ---------------------------------------------------------------------------
// parseBudgetString
// budget arrives as a string in three observed forms: "390000", "150 000", and
// "116\u00A0400". Anything else returns null, never 0, so an unparseable value
// is visible downstream instead of silently deflating a total.
// ---------------------------------------------------------------------------
export function parseBudgetString(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== 'string') return null;

  const cleaned = value.replace(/[\u20AC]/g, '').replace(GROUP_SEPARATORS, '');
  if (cleaned === '') return null;
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// dedupeProjects
// Operation rows -> one row per identifiant_projet_gagnant. This is the gate
// every money aggregation goes through.
// ---------------------------------------------------------------------------
export function dedupeProjects(operationRows) {
  const byProject = new Map();

  for (const row of operationRows) {
    const rawId = row.identifiant_projet_gagnant;
    const idMissing = rawId === null || rawId === undefined || rawId === '';
    // A row with no project id cannot be merged with anything. Keying it on its
    // own operation id keeps it visible instead of collapsing unrelated rows.
    const key = idMissing ? `operation:${row.identifiant_operation}` : `project:${rawId}`;

    let project = byProject.get(key);
    if (!project) {
      project = {
        identifiant_projet_gagnant: idMissing ? null : rawId,
        project_id_missing: idMissing,
        titre_projet_gagnant: row.titre_projet_gagnant ?? null,
        edition: normaliseEdition(row.edition),
        thematique: row.thematique ?? null,
        echelle_bp: row.echelle_bp ?? null,
        direction_pilote_projet: row.direction_pilote_projet ?? null,
        arrondissement_projet_gagnant: row.arrondissement_projet_gagnant ?? null,
        adresse_projet_gagnant: row.adresse_projet_gagnant ?? null,
        avancement_projet: row.avancement_projet ?? null,
        budget: parseBudgetString(row.budget_global_projet_gagnant),
        budget_conflict: false,
        budget_values_seen: [],
        operation_count: 0,
        operation_ids: [],
        operation_statuses: [],
      };
      byProject.set(key, project);
    }

    project.operation_count += 1;
    if (row.identifiant_operation !== undefined) project.operation_ids.push(row.identifiant_operation);

    const status = row.avancement_operation;
    if (status !== undefined && status !== null && !project.operation_statuses.includes(status)) {
      project.operation_statuses.push(status);
    }

    const budget = parseBudgetString(row.budget_global_projet_gagnant);
    if (budget !== null && !project.budget_values_seen.includes(budget)) {
      project.budget_values_seen.push(budget);
    }
    // The project budget is repeated on every operation row. If the repeats
    // disagree the data is inconsistent; keep the first value and say so.
    if (project.budget_values_seen.length > 1) project.budget_conflict = true;
    if (project.budget === null && budget !== null) project.budget = budget;
  }

  return [...byProject.values()];
}

const normaliseEdition = normaliseExercice;

// ---------------------------------------------------------------------------
// splitLocalVsCitywide
// A project is local when arrondissement_projet_gagnant equals the local code.
// Everything else is a citywide scheme (typically registered to 75004) whose
// budget is Paris-wide money, reported under its own total and never merged.
// ---------------------------------------------------------------------------
export function splitLocalVsCitywide(projects, localCode) {
  const local = [];
  const citywide = [];

  for (const project of projects) {
    const registered = project.arrondissement_projet_gagnant;
    if (String(registered) === String(localCode)) {
      local.push({ ...project, scope: 'local', budget_is_citywide: false });
    } else {
      citywide.push({
        ...project,
        scope: 'citywide',
        registered_arrondissement: registered ?? null,
        budget_is_citywide: true,
      });
    }
  }

  const localSum = sumProjectBudgets(local);
  const citywideSum = sumProjectBudgets(citywide);

  return {
    local_code: String(localCode),
    local,
    citywide,
    local_count: local.length,
    citywide_count: citywide.length,
    local_total: localSum.total,
    citywide_total: citywideSum.total,
    local_budget_unknown: localSum.unknown,
    citywide_budget_unknown: citywideSum.unknown,
    // Deliberately absent: any key adding these two together. Local money and
    // citywide money answer different questions and must not be summed.
  };
}

// Sums already-deduplicated project budgets. Unparseable budgets are counted,
// not treated as zero.
export function sumProjectBudgets(projects) {
  let total = 0;
  let counted = 0;
  let unknown = 0;
  for (const project of projects) {
    const budget = typeof project.budget === 'number' ? project.budget : parseBudgetString(project.budget);
    if (budget === null) unknown += 1;
    else {
      total += budget;
      counted += 1;
    }
  }
  return { total: roundMoney(total), counted, unknown };
}

// ---------------------------------------------------------------------------
// abandonedFile
// Every ABANDONNÉ operation in the arrondissement, deduplicated to projects and
// split local vs citywide. Two totals, never one.
// ---------------------------------------------------------------------------
export const ABANDONED_STATUS = 'ABANDONNÉ';

export function abandonedFile(operationRows, localCode, status = ABANDONED_STATUS) {
  const rows = operationRows.filter(r => r.avancement_operation === status);
  const split = splitLocalVsCitywide(dedupeProjects(rows), localCode);
  return {
    status,
    operation_count: rows.length,
    local: split.local,
    citywide: split.citywide,
    local_total: split.local_total,
    citywide_total: split.citywide_total,
    local_budget_unknown: split.local_budget_unknown,
    citywide_budget_unknown: split.citywide_budget_unknown,
    // The dataset records that projects were abandoned. It records no reason.
    reason_available: false,
  };
}

export const DELIVERED_STATUS = 'FIN';
export const HANDOVER_STATUS = 'LIVRAISON';

// ---------------------------------------------------------------------------
// deliveredFile
// The counterpart to abandonedFile: projects that reached the end. Same unit of
// analysis, so the two are directly comparable and neither flatters the other.
// Selection is on avancement_projet, the project's own status, because a
// project is delivered when the project is finished, not when one of its
// operations is. Operations are still carried for the count.
// ---------------------------------------------------------------------------
export function deliveredFile(operationRows, localCode, status = DELIVERED_STATUS) {
  const projects = dedupeProjects(operationRows).filter(p => p.avancement_projet === status);
  const split = splitLocalVsCitywide(projects, localCode);
  return {
    status,
    operation_count: operationRows.filter(r => r.avancement_operation === status).length,
    project_count: split.local_count + split.citywide_count,
    local: split.local,
    citywide: split.citywide,
    local_total: split.local_total,
    citywide_total: split.citywide_total,
    local_budget_unknown: split.local_budget_unknown,
    citywide_budget_unknown: split.citywide_budget_unknown,
  };
}

// ---------------------------------------------------------------------------
// statusFunnel
// Operation counts and deduplicated project money at each avancement_operation.
// The status list is open: an unrecognised value renders as itself.
// ---------------------------------------------------------------------------
export function statusFunnel(operationRows, localCode) {
  const byStatus = new Map();

  for (const row of operationRows) {
    const status = row.avancement_operation ?? '(sans statut)';
    if (!byStatus.has(status)) byStatus.set(status, []);
    byStatus.get(status).push(row);
  }

  const statuses = [...byStatus.entries()].map(([status, rows]) => {
    const split = splitLocalVsCitywide(dedupeProjects(rows), localCode);
    return {
      status,
      operation_count: rows.length,
      project_count: split.local_count + split.citywide_count,
      local_project_count: split.local_count,
      citywide_project_count: split.citywide_count,
      local_project_total: split.local_total,
      citywide_project_total: split.citywide_total,
    };
  });

  statuses.sort((a, b) => b.operation_count - a.operation_count);

  return {
    statuses,
    operation_count: operationRows.length,
    // A project whose operations sit at different stages is counted under each
    // of those stages, so these subtotals do not add up to an edition total.
    projects_may_appear_under_several_statuses: true,
  };
}

// ---------------------------------------------------------------------------
// timeInStage
// Median months between consecutive _operation stage dates. Below the sample
// floor the transition reports insufficient_data instead of a median.
//
// n counts the operations that carry both dates. n_entered counts those that
// carry the earlier date at all, and the two differ by exactly the operations
// that entered the stage and never left it: stalled, abandoned, still running.
// Dropping them silently would make every median a median of completed
// transitions presented as a median of all of them, so both are reported.
// ---------------------------------------------------------------------------
export function timeInStage(operationRows, { floor = SAMPLE_FLOOR } = {}) {
  const transitions = [];

  for (let i = 0; i < OPERATION_STAGE_FIELDS.length - 1; i++) {
    const from = OPERATION_STAGE_FIELDS[i];
    const to = OPERATION_STAGE_FIELDS[i + 1];
    const gaps = [];
    let excludedNegative = 0;
    let entered = 0;

    for (const row of operationRows) {
      const start = parseMonth(row[from]);
      const end = parseMonth(row[to]);
      if (start !== null) entered += 1;
      if (start === null || end === null) continue;
      const months = end - start;
      if (months < 0) {
        excludedNegative += 1;
        continue;
      }
      gaps.push(months);
    }

    const enough = gaps.length >= floor;
    transitions.push({
      from,
      to,
      n: gaps.length,
      n_entered: entered,
      excluded_negative: excludedNegative,
      sample_floor: floor,
      insufficient_data: !enough,
      median_months: enough ? median(gaps) : null,
      from_is_forecast: FORECAST_STAGE_FIELDS.includes(from),
      to_is_forecast: FORECAST_STAGE_FIELDS.includes(to),
    });
  }

  return {
    fields_used: 'operation',
    sample_floor: floor,
    transitions,
  };
}

// 'YYYY-MM' or a full ISO timestamp -> months since year 0. Anything else null.
export function parseMonth(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return year * 12 + (month - 1);
}

export function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const raw = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(raw * 10) / 10;
}

// ---------------------------------------------------------------------------
// directionByTheme
// Which Direction has historically piloted each thematique in this
// arrondissement. Not published anywhere; inferred from what the city has done,
// and labelled as inference. Below the sample floor no Direction is named.
// ---------------------------------------------------------------------------
export function directionByTheme(operationRows, { floor = SAMPLE_FLOOR } = {}) {
  const byTheme = new Map();

  for (const row of operationRows) {
    const theme = row.thematique ?? '(sans thématique)';
    if (!byTheme.has(theme)) byTheme.set(theme, new Map());
    const directions = byTheme.get(theme);
    const direction = row.direction_pilote_operation ?? '(sans direction)';
    directions.set(direction, (directions.get(direction) || 0) + 1);
  }

  const themes = [...byTheme.entries()].map(([thematique, directionCounts]) => {
    const directions = [...directionCounts.entries()]
      .map(([direction, n]) => ({ direction, n }))
      .sort((a, b) => b.n - a.n || a.direction.localeCompare(b.direction));
    const n = directions.reduce((sum, d) => sum + d.n, 0);
    const enough = n >= floor;
    const top = directions[0];
    return {
      thematique,
      n,
      sample_floor: floor,
      insufficient_data: !enough,
      direction: enough ? top.direction : null,
      direction_n: enough ? top.n : null,
      direction_share: enough ? Math.round((top.n / n) * 100) / 100 : null,
      directions,
      basis: 'inferred_from_operations',
    };
  });

  themes.sort((a, b) => b.n - a.n || a.thematique.localeCompare(b.thematique));
  return themes;
}

// ---------------------------------------------------------------------------
// État spécial d'arrondissement
// ---------------------------------------------------------------------------
export function filterEtatSpecial(rows, arrondissementLabel) {
  return rows.filter(r => r.arrondissement === arrondissementLabel);
}

export function aggregateEtatSpecial(rows) {
  const byLine = new Map();
  const exercices = new Set();

  for (const row of rows) {
    const exercice = normaliseEdition(row.exercice_comptable);
    exercices.add(exercice);
    const line = {
      exercice,
      section: row.section_budgetaire_i_f ?? null,
      sens: row.sens_depense_recette ?? null,
      type_du_vote: row.type_du_vote ?? null,
      chapitre: row.chapitre_niveau_vote_cle_non_composee ?? null,
      chapitre_texte: row.chapitre_niveau_vote_texte ?? null,
      nature: row.nature_reglementaire_cle_non_composee ?? null,
      nature_texte: row.nature_reglementaire_texte ?? null,
    };
    const key = [line.exercice, line.section, line.sens, line.type_du_vote, line.chapitre, line.nature].join('|');
    const amount = parseBudgetString(row.budgets_votes_pmt);

    let entry = byLine.get(key);
    if (!entry) {
      entry = { ...line, amount: 0, row_count: 0, amount_unknown: 0 };
      byLine.set(key, entry);
    }
    entry.row_count += 1;
    if (amount === null) entry.amount_unknown += 1;
    else entry.amount += amount;
  }

  for (const entry of byLine.values()) entry.amount = roundMoney(entry.amount);

  const sortedExercices = [...exercices].filter(Boolean).sort();
  const lines = [...byLine.values()].sort(
    (a, b) =>
      String(a.exercice).localeCompare(String(b.exercice)) ||
      String(a.section).localeCompare(String(b.section)) ||
      String(a.type_du_vote).localeCompare(String(b.type_du_vote)) ||
      String(a.chapitre).localeCompare(String(b.chapitre)) ||
      String(a.nature).localeCompare(String(b.nature))
  );

  return {
    lines,
    row_count: rows.length,
    exercice_min: sortedExercices[0] ?? null,
    // The dataset stops here. The section claims nothing about later years.
    exercice_max: sortedExercices[sortedExercices.length - 1] ?? null,
    exercices: sortedExercices,
  };
}

// ---------------------------------------------------------------------------
// Travaux (public equipment works actually delivered)
// ---------------------------------------------------------------------------
export function filterTravaux(rows, codePostal) {
  return rows.filter(r => String(r.code_postal) === String(codePostal));
}

export function aggregateTravaux(rows) {
  let total = 0;
  let unparseable = 0;

  const records = rows.map(row => {
    const budget = parseBudgetString(row.budget);
    if (budget === null) unparseable += 1;
    else total += budget;
    return {
      adresse: row.adresse ?? null,
      code_postal: row.code_postal ?? null,
      equipement: row.equipement ?? null,
      type_equipement: row.type_equipement ?? null,
      type_construction: row.type_construction ?? null,
      secteur: row.secteur ?? null,
      annee_livraison: row.annee_livraison ?? null,
      description: row.description ?? null,
      budget,
      budget_raw: row.budget ?? null,
    };
  });

  return {
    records,
    record_count: records.length,
    total_budget: roundMoney(total),
    budget_unparseable: unparseable,
    // Seven records is a paragraph, not a distribution. Flagged so the page
    // lists them rather than computing averages over them.
    sample_too_small: records.length < SAMPLE_FLOOR * 2,
    sample_floor: SAMPLE_FLOOR,
  };
}

// ---------------------------------------------------------------------------
// Marchés (procurement)
// Selection is on the supplier's registered postcode. That is not a statement
// about where money was spent, and the output says so on every consumer's path.
// ---------------------------------------------------------------------------
export function filterMarches(rows, codePostal) {
  return rows.filter(r => String(r.fournisseur_code_postal) === String(codePostal));
}

export function aggregateMarches(rows, codePostal) {
  let totalMax = 0;
  let totalMin = 0;

  const contracts = rows.map(row => {
    const max = parseBudgetString(row.montant_max);
    const min = parseBudgetString(row.montant_min);
    if (max !== null) totalMax += max;
    if (min !== null) totalMin += min;
    return {
      num_marche: row.num_marche ?? null,
      objet_du_marche: row.objet_du_marche ?? null,
      nature_du_marche: row.nature_du_marche ?? null,
      fournisseur_nom: row.fournisseur_nom ?? null,
      fournisseur_code_postal: row.fournisseur_code_postal ?? null,
      annee_de_notification: normaliseEdition(row.annee_de_notification),
      date_de_notification: row.date_de_notification ?? null,
      montant_min: min,
      montant_max: max,
      categorie: row.categorie_d_achat_texte ?? null,
    };
  });

  return {
    contracts,
    contract_count: contracts.length,
    supplier_postcode: String(codePostal),
    total_montant_max: roundMoney(totalMax),
    total_montant_min: roundMoney(totalMin),
    attribution_basis: MARCHES_ATTRIBUTION_BASIS,
    attribution_note: MARCHES_ATTRIBUTION_NOTE,
  };
}

// ---------------------------------------------------------------------------
// Conseils de quartier
// nar comes back as a number from the aggregation endpoint and as a string from
// the records endpoint, so compare loosely.
// ---------------------------------------------------------------------------
export function filterQuartiers(rows, nar) {
  return rows.filter(r => String(r.nar) === String(nar));
}

export function quartiersToGeoJSON(rows) {
  return {
    type: 'FeatureCollection',
    features: rows.map(row => {
      // The API returns geom as a GeoJSON Feature already.
      const geometry = row.geom?.geometry ?? row.geom ?? null;
      return {
        type: 'Feature',
        geometry,
        properties: {
          no_consqrt: row.no_consqrt ?? null,
          nom_quart: row.nom_quart ?? null,
          nar: row.nar ?? null,
          surface: row.surface ?? null,
          centroid: row.geom_x_y ?? null,
        },
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Élus
// Delegation wording is source text and is never translated or normalised.
// ---------------------------------------------------------------------------
export function filterElus(rows, arrondissementLabel) {
  return rows.filter(r => r.arrondissement === arrondissementLabel);
}

export function shapeElus(rows) {
  return rows.map(row => ({
    civilite: row.civilite ?? null,
    nom: row.nom ?? null,
    prenom: row.prenom ?? null,
    fonction: row.fonction_dans_l_executif ?? null,
    // Verbatim. The Maire's delegation is null in the source and stays null.
    delegation: row.delegation ?? null,
    arrondissement: row.arrondissement ?? null,
  }));
}

export function shapeConseillersDeParis(rows) {
  return rows.map(row => ({
    civilite: row.civilite ?? null,
    nom: row.nom ?? null,
    prenom: row.prenom ?? null,
    arrondissement: row.arrondissement ?? null,
    groupe: row.groupe ?? null,
    fonction: row.fonction_dans_l_executif ?? null,
  }));
}

// ---------------------------------------------------------------------------
// siteContext
// What is already built in a study area, so a proposal can narrow its ask.
// Pure: takes raw records, returns counts and the bike proxy. Never combines
// the bike figure with anything, because it counts bicycles and nothing else.
// ---------------------------------------------------------------------------
export function siteContext(fontaineRows, sanisetteRows, veloAggregates, sources = {}) {
  const available = fontaineRows.filter(r => String(r.dispo).toUpperCase() === 'OUI');

  const byStreet = new Map();
  for (const r of fontaineRows) {
    const street = r.voie || '(sans voie)';
    byStreet.set(street, (byStreet.get(street) || 0) + 1);
  }

  const totalMovements = veloAggregates.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  const hours = veloAggregates.reduce((max, r) => Math.max(max, Number(r.hours) || 0), 0);
  const dailyMean = hours > 0 ? Math.round(totalMovements / (hours / 24)) : null;

  return {
    water: {
      source: sources.fontainesSource ?? null,
      count: fontaineRows.length,
      available: available.length,
      by_street: [...byStreet.entries()]
        .map(([street, n]) => ({ street, n }))
        .sort((a, b) => b.n - a.n || a.street.localeCompare(b.street)),
      // The dataset records current availability. It does not record whether a
      // park fountain runs through winter, so this file must not imply it does.
      winter_operation_recorded: false,
    },
    toilets: {
      source: sources.sanisettesSource ?? null,
      count: sanisetteRows.length,
      wheelchair_accessible: sanisetteRows.filter(r => String(r.acces_pmr).toLowerCase() === 'oui').length,
      by_hours: [...sanisetteRows.reduce((map, r) => {
        const h = r.horaire || '(non renseigné)';
        map.set(h, (map.get(h) || 0) + 1);
        return map;
      }, new Map())].map(([hours_label, n]) => ({ hours_label, n })).sort((a, b) => b.n - a.n),
    },
    active_mobility_proxy: {
      source: sources.veloSource ?? null,
      counters: veloAggregates.map(r => ({
        id: r.id_compteur,
        name: r.nom_compteur,
        movements: Number(r.total) || 0,
        daily_mean: r.hours ? Math.round(Number(r.total) / (Number(r.hours) / 24)) : null,
      })),
      movements: totalMovements,
      daily_mean: dailyMean,
      first_seen: veloAggregates.map(r => r.first_seen).sort()[0] ?? null,
      last_seen: veloAggregates.map(r => r.last_seen).sort().at(-1) ?? null,
      counts: 'bicycles',
      is_runner_count: false,
      note: 'An active-mobility proxy. It counts bicycles at Pont des Invalides and is never presented as a runner count.',
    },
  };
}
