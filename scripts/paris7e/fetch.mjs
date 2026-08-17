// scripts/paris7e/fetch.mjs
// The only module in the paris-7e pipeline allowed to touch the network.
// Wraps the Opendatasoft Explore v2.1 API at opendata.paris.fr.
//
// What it handles so no caller has to re-learn it:
//   - pagination: /records caps limit at 100 and offset + limit at 10000
//   - large pulls: /exports/json returns the whole selection in one array
//   - gzip: undici negotiates and decodes it, provided we do not set
//     accept-encoding ourselves (setting it by hand disables auto-decoding)
//   - rate limits: X-RateLimit-Remaining / -Limit / -Reset are read on every
//     response and the last values are exported for the build log
//   - typing gotchas: date-typed fields need date'2025', not "2025"
//
// Every function throws on failure. Nothing here catches and continues, because
// the build's failure policy is to abort and write nothing.

export const API_BASE = 'https://opendata.paris.fr/api/explore/v2.1/';

// /records hard limits, from InvalidRESTParameterError responses.
export const MAX_PAGE_LIMIT = 100;
export const MAX_OFFSET_PLUS_LIMIT = 10000;

// Above this many records a paged pull is both slow and eventually blocked by
// the offset ceiling, so fetchAllRecords switches to /exports/json.
export const EXPORT_THRESHOLD = 1000;

// Pause when the remaining quota gets this low, to leave headroom for retries.
const RATE_LIMIT_FLOOR = 20;

export const rateLimit = {
  remaining: null,
  limit: null,
  reset: null,
};

// ---------------------------------------------------------------------------
// Typing helpers.
//
// edition and exercice_comptable are date-typed. edition="2025" raises
// IncompatibleTypesInComparisonFilter; the correct form is edition=date'2025'.
// Text fields take double quotes. Numeric fields take bare values.
// ---------------------------------------------------------------------------

// A date literal for an ODSQL where clause: dateLiteral('2025') -> date'2025'
export function dateLiteral(value) {
  const text = String(value);
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(text)) {
    throw new Error(`dateLiteral expects YYYY, YYYY-MM or YYYY-MM-DD, got ${JSON.stringify(value)}`);
  }
  return `date'${text}'`;
}

// where clause for a date-typed field. Use this for edition and
// exercice_comptable. Using whereText on them returns a 400.
export function whereDateEquals(field, value) {
  return `${field}=${dateLiteral(value)}`;
}

// where clause for a text-typed field.
export function whereTextEquals(field, value) {
  return `${field}="${String(value).replace(/"/g, '\\"')}"`;
}

// where clause for a numeric field.
export function whereNumberEquals(field, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`whereNumberEquals expects a number, got ${JSON.stringify(value)}`);
  return `${field}=${n}`;
}

export function whereAll(...clauses) {
  return clauses.filter(Boolean).join(' AND ');
}

export function datasetUrl(datasetId) {
  return `${API_BASE}catalog/datasets/${encodeURIComponent(datasetId)}`;
}

export function recordsUrl(datasetId) {
  return `${datasetUrl(datasetId)}/records`;
}

export function exportsUrl(datasetId, format = 'json') {
  return `${datasetUrl(datasetId)}/exports/${format}`;
}

// ---------------------------------------------------------------------------
// Low-level request
// ---------------------------------------------------------------------------

function readRateLimit(response) {
  const remaining = response.headers.get('x-ratelimit-remaining');
  const limit = response.headers.get('x-ratelimit-limit');
  const reset = response.headers.get('x-ratelimit-reset');
  if (remaining !== null) rateLimit.remaining = Number(remaining);
  if (limit !== null) rateLimit.limit = Number(limit);
  if (reset !== null) rateLimit.reset = reset;
}

async function throttle() {
  if (rateLimit.remaining === null) return;
  if (rateLimit.remaining > RATE_LIMIT_FLOOR) return;
  // The quota resets at a wall-clock time, typically midnight UTC. Waiting for
  // it is not something a build should do silently, so fail loudly instead.
  throw new Error(
    `Rate limit nearly exhausted: ${rateLimit.remaining} of ${rateLimit.limit} left, resets ${rateLimit.reset}. Aborting.`
  );
}

// Fetches JSON and throws on any non-2xx, surfacing the API's own error_code.
// No accept-encoding header is set here on purpose: undici adds one and decodes
// the gzip response for us. Setting it by hand would hand back raw bytes.
export async function fetchJson(url, { retries = 2 } = {}) {
  await throttle();

  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    let response;
    try {
      response = await fetch(url, { headers: { accept: 'application/json' } });
    } catch (cause) {
      lastError = new Error(`Network error for ${url}: ${cause.message}`, { cause });
      await sleep(500 * (attempt + 1));
      continue;
    }

    readRateLimit(response);

    if (response.ok) return response.json();

    const body = await response.text();
    const detail = extractApiError(body);

    // 429 and 5xx are worth one more try. 4xx is a bug in the query.
    if (response.status === 429 || response.status >= 500) {
      lastError = new Error(`HTTP ${response.status} for ${url}: ${detail}`);
      await sleep(1000 * (attempt + 1));
      continue;
    }
    throw new Error(`HTTP ${response.status} for ${url}: ${detail}`);
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

function extractApiError(body) {
  try {
    const parsed = JSON.parse(body);
    if (parsed.error_code) return `${parsed.error_code}: ${parsed.message}`;
    return body.slice(0, 300);
  } catch {
    return body.slice(0, 300);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildQuery({ where, select, orderBy, groupBy, limit, offset, refine, lang } = {}) {
  const params = new URLSearchParams();
  if (where) params.set('where', where);
  if (select) params.set('select', select);
  if (groupBy) params.set('group_by', groupBy);
  if (orderBy) params.set('order_by', orderBy);
  if (limit !== undefined) params.set('limit', String(limit));
  if (offset !== undefined) params.set('offset', String(offset));
  if (refine) params.set('refine', refine);
  if (lang) params.set('lang', lang);
  return params;
}

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

// One page. limit is clamped to the API's maximum of 100.
export async function fetchPage(datasetId, options = {}) {
  const limit = Math.min(options.limit ?? MAX_PAGE_LIMIT, MAX_PAGE_LIMIT);
  const offset = options.offset ?? 0;
  if (offset + limit > MAX_OFFSET_PLUS_LIMIT) {
    throw new Error(
      `offset + limit is ${offset + limit}; the API allows at most ${MAX_OFFSET_PLUS_LIMIT}. Use exportRecords for this pull.`
    );
  }
  const query = buildQuery({ ...options, limit, offset });
  const payload = await fetchJson(`${recordsUrl(datasetId)}?${query}`);
  return { total_count: payload.total_count, results: payload.results ?? [] };
}

// Pages through /records with offset. Only safe below the offset ceiling.
export async function fetchRecords(datasetId, options = {}) {
  const pageSize = Math.min(options.pageSize ?? MAX_PAGE_LIMIT, MAX_PAGE_LIMIT);
  const results = [];
  let offset = 0;
  let total = null;

  while (total === null || offset < total) {
    if (offset + pageSize > MAX_OFFSET_PLUS_LIMIT) {
      throw new Error(
        `${datasetId} has ${total} matching records, past the ${MAX_OFFSET_PLUS_LIMIT} offset ceiling. Use exportRecords.`
      );
    }
    const page = await fetchPage(datasetId, { ...options, limit: pageSize, offset });
    total = page.total_count;
    results.push(...page.results);
    if (page.results.length === 0) break;
    offset += page.results.length;
  }

  return { total_count: total ?? 0, results };
}

// /exports/json returns the whole selection as one array, with no offset limit.
// Preferred for anything large.
export async function exportRecords(datasetId, options = {}) {
  const query = buildQuery({ where: options.where, select: options.select, orderBy: options.orderBy, lang: options.lang });
  const results = await fetchJson(`${exportsUrl(datasetId, 'json')}?${query}`);
  if (!Array.isArray(results)) {
    throw new Error(`${datasetId}: exports/json returned ${typeof results}, expected an array`);
  }
  return { total_count: results.length, results };
}

// Counts first, then picks the cheaper endpoint. This is what build-data uses.
export async function fetchAllRecords(datasetId, options = {}) {
  const probe = await fetchPage(datasetId, { ...options, limit: 1, offset: 0 });
  if (probe.total_count > EXPORT_THRESHOLD) {
    return { ...(await exportRecords(datasetId, options)), via: 'exports' };
  }
  return { ...(await fetchRecords(datasetId, options)), via: 'records' };
}

// Server-side aggregation. group_by plus an aggregate in select, e.g.
// select: 'exercice_comptable,sum(budget_vote_pmt) as total'.
//
// Two gotchas encoded here:
//   - a date field in a group_by comes back as a full ISO timestamp
//   - total_count is 1 on an aggregation, not the number of groups, so the only
//     way to know the result is complete is to page until a short page arrives
export async function fetchAggregate(datasetId, { select, groupBy, where, orderBy } = {}) {
  const pageSize = MAX_PAGE_LIMIT;
  const results = [];
  let offset = 0;

  for (;;) {
    if (offset + pageSize > MAX_OFFSET_PLUS_LIMIT) {
      throw new Error(
        `${datasetId}: aggregation exceeds the ${MAX_OFFSET_PLUS_LIMIT} offset ceiling. Group by fewer fields.`
      );
    }
    const page = await fetchPage(datasetId, { select, groupBy, where, orderBy, limit: pageSize, offset });
    results.push(...page.results);
    if (page.results.length < pageSize) return results;
    offset += page.results.length;
  }
}

// ---------------------------------------------------------------------------
// Catalog metadata
//
// modified is the upstream freshness date. The section renders this, never the
// fetch date, so a dataset last touched in 2021 cannot be dressed up as current.
// ---------------------------------------------------------------------------
export async function fetchDatasetMeta(datasetId) {
  const payload = await fetchJson(datasetUrl(datasetId));
  const meta = payload?.metas?.default ?? {};
  if (!meta.modified) {
    throw new Error(`${datasetId}: metas.default.modified is missing; freshness cannot be rendered honestly`);
  }
  return {
    dataset_id: payload.dataset_id ?? datasetId,
    title: meta.title ?? null,
    modified: meta.modified,
    records_count: meta.records_count ?? null,
    url: portalUrl(datasetId),
    api_url: datasetUrl(datasetId),
  };
}

export function portalUrl(datasetId) {
  return `https://opendata.paris.fr/explore/dataset/${encodeURIComponent(datasetId)}/information/`;
}

// ---------------------------------------------------------------------------
// Repertoire National des Elus, on data.gouv.fr
//
// The Paris open data elus files describe the 2020-2026 mandature and were last
// touched in 2021 and 2023. The March 2026 municipales replaced that council,
// so those files are not merely stale, they name people who no longer hold
// office. The RNE is the national register, is refreshed continuously, and is
// the only machine-readable source for the current roster.
//
// It carries names and functions. It does NOT carry delegations or political
// groups, which have no post-2026 open-data source at all.
// ---------------------------------------------------------------------------

export const RNE_DATASET = '5c34c4d1634f4173183a64f1';

// Resolves the current CSV through the data.gouv.fr API rather than pinning a
// dated URL, so a refresh picks up the newest file without a code change.
export async function fetchRneArrondissementElus(secteurLabel) {
  const meta = await fetchJson(`https://www.data.gouv.fr/api/1/datasets/${RNE_DATASET}/`);
  const resource = (meta.resources || []).find(
    r => /conseiller.?s?-?d.?arrondissement/i.test(r.url || '') && /\.csv$/i.test(r.url || ''),
  );
  if (!resource) {
    throw new Error('RNE: no conseillers d\'arrondissement CSV found in the dataset resources.');
  }

  const res = await fetch(resource.url, { headers: { 'accept-encoding': 'gzip' } });
  if (!res.ok) throw new Error(`RNE: HTTP ${res.status} fetching ${resource.url}`);
  const text = await res.text();

  const rows = parseSemicolonCsv(text);
  const matched = rows.filter(r => (r['Libellé du secteur'] || '').trim() === secteurLabel);
  if (matched.length === 0) {
    throw new Error(`RNE: zero rows for secteur "${secteurLabel}". Refusing to write an empty roster.`);
  }

  return {
    rows: matched,
    source_url: resource.url,
    modified: resource.last_modified || null,
    dataset_page: `https://www.data.gouv.fr/fr/datasets/${RNE_DATASET}/`,
  };
}

// The RNE files are semicolon-delimited with a UTF-8 BOM and no quoted fields
// carrying delimiters. A full CSV parser would be overkill; this asserts the
// shape instead of assuming it.
function parseSemicolonCsv(text) {
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) throw new Error('RNE: CSV has no data rows.');
  const header = lines[0].split(';');
  return lines.slice(1).map(line => {
    const cells = line.split(';');
    const row = {};
    header.forEach((key, i) => { row[key] = (cells[i] ?? '').trim(); });
    return row;
  });
}
