// paris-7e/section.js
// Shared behaviour for the five pages of the Paris 7e section.
//
// Everything here resolves its own URLs from import.meta.url, so the section
// works at / locally and at /france-data/ on GitHub Pages without any page
// knowing where it is.
//
// Two rules from the spec are enforced in this file rather than left to each
// page. Freshness is the dataset's upstream `modified` date, never the fetch
// date, and any dataset older than the staleness threshold renders a banner
// naming that date. Source terms (avancement values, delegations, Direction
// names, budget lines) are printed verbatim in French in both renderings.

// Section root: the directory this module lives in.
export const SECTION_ROOT = new URL('.', import.meta.url);

export const LANGS = ['en', 'fr'];
export const DEFAULT_LANG = 'en';
const LANG_STORAGE_KEY = 'paris7e.lang';
const DEFAULT_STALE_AFTER_MONTHS = 18;

// The seven avancement values observed in the Budget Participatif data. The
// list is open: an unrecognised value renders as itself, never dropped.
export const STATUS_ORDER = [
  '(non démarré)',
  'ETUDES',
  'PROCEDURES',
  'TRAVAUX',
  'LIVRAISON',
  'FIN',
  'ABANDONNÉ',
];

const STATUS_CLASS = {
  '(non démarré)': 'non-demarre',
  'ETUDES': 'etudes',
  'PROCEDURES': 'procedures',
  'TRAVAUX': 'travaux',
  'LIVRAISON': 'livraison',
  'FIN': 'fin',
  'ABANDONNÉ': 'abandonne',
};

const PAGES = [
  { key: 'overview', href: '' },
  { key: 'power', href: 'power/' },
  { key: 'pipeline', href: 'pipeline/' },
  { key: 'money', href: 'money/' },
  { key: 'proposals', href: 'proposals/' },
];

const state = {
  lang: DEFAULT_LANG,
  strings: {},
  listeners: new Set(),
};

const dataCache = new Map();
const stringsCache = new Map();

/* ── Data loading ──────────────────────────────────────────────────── */

// loadData('pipeline') -> paris-7e/data/pipeline.json
// Extensions are optional; loadData('quartiers.geojson') also works.
export async function loadData(name) {
  const file = /\.(json|geojson)$/.test(name) ? name : `${name}.json`;
  if (dataCache.has(file)) return dataCache.get(file);
  const promise = fetchJson(new URL(`data/${file}`, SECTION_ROOT));
  dataCache.set(file, promise);
  return promise;
}

// loadContent('proposals/running-hub') -> paris-7e/content/proposals/running-hub.json
export async function loadContent(name) {
  const file = name.endsWith('.json') ? name : `${name}.json`;
  const key = `content/${file}`;
  if (dataCache.has(key)) return dataCache.get(key);
  const promise = fetchJson(new URL(key, SECTION_ROOT));
  dataCache.set(key, promise);
  return promise;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url.pathname}: ${res.status}`);
  return res.json();
}

/* ── i18n ──────────────────────────────────────────────────────────── */

export function getLang() {
  return state.lang;
}

function readStoredLang() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return LANGS.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredLang(lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage unavailable (private mode). The choice just does not persist.
  }
}

async function loadStrings(lang) {
  if (stringsCache.has(lang)) return stringsCache.get(lang);
  const promise = fetchJson(new URL(`content/strings.${lang}.json`, SECTION_ROOT))
    .catch(() => ({}));
  stringsCache.set(lang, promise);
  return promise;
}

// t('table.search') with dotted keys. Missing keys return the key itself so a
// gap is visible on the page instead of rendering as empty chrome.
export function t(key, vars) {
  const value = key.split('.').reduce(
    (acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined),
    state.strings,
  );
  let out = typeof value === 'string' ? value : key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      out = out.split(`{${name}}`).join(String(replacement));
    }
  }
  return out;
}

export function onLangChange(fn) {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

export async function setLang(lang, options = {}) {
  const next = LANGS.includes(lang) ? lang : DEFAULT_LANG;
  state.lang = next;
  state.strings = await loadStrings(next);
  if (options.persist !== false) writeStoredLang(next);
  applyLang(document);
  for (const fn of state.listeners) fn(next);
  return next;
}

// Applies the active language to a subtree.
//   [data-i18n="key"]        sets textContent from the strings file
//   [data-i18n-attr="attr:key"] sets an attribute (comma separated for several)
//   [data-lang="fr"]         long-form prose blocks, shown only in that language
export function applyLang(root = document) {
  const scope = root === document ? document.documentElement : root;
  if (root === document) {
    document.documentElement.setAttribute('data-lang', state.lang);
    document.documentElement.setAttribute('lang', state.lang);
  }
  for (const el of scope.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of scope.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(',')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
  for (const el of scope.querySelectorAll('[data-lang]')) {
    el.hidden = el.dataset.lang !== state.lang;
  }
}

// The toggle. English is the default; the choice persists in localStorage.
export function renderLangToggle(mount) {
  const host = resolveMount(mount);
  if (!host) return null;
  host.className = 'lang-toggle';
  host.innerHTML = '';

  const label = document.createElement('span');
  label.className = 'lang-label';
  label.dataset.i18n = 'lang.label';
  host.append(label);

  const buttons = LANGS.map((lang) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = lang.toUpperCase();
    btn.setAttribute('lang', lang);
    btn.dataset.i18nAttr = `title:lang.switch_${lang}, aria-label:lang.switch_${lang}`;
    btn.addEventListener('click', () => { setLang(lang); });
    host.append(btn);
    return [lang, btn];
  });

  const paint = () => {
    for (const [lang, btn] of buttons) {
      btn.setAttribute('aria-pressed', String(lang === state.lang));
    }
  };
  paint();
  onLangChange(paint);
  applyLang(host);
  return host;
}

/* ── Sub-nav ───────────────────────────────────────────────────────── */

// renderSubnav('pipeline') fills #subnav. Hrefs are resolved against the
// section root, so they are correct from any depth including
// proposals/running-hub/.
export function renderSubnav(current, mount) {
  const host = resolveMount(mount || '#subnav');
  if (!host) return null;
  host.className = 'section-nav';
  host.innerHTML = '';

  const list = document.createElement('ul');
  for (const page of PAGES) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = new URL(page.href, SECTION_ROOT).href;
    a.dataset.i18n = `nav.${page.key}`;
    if (page.key === current) a.setAttribute('aria-current', 'page');
    li.append(a);
    list.append(li);
  }
  host.append(list);

  const toggleMount = document.createElement('div');
  host.append(toggleMount);
  renderLangToggle(toggleMount);

  applyLang(host);
  onLangChange(() => applyLang(host));
  return host;
}

/* ── Page bootstrap ────────────────────────────────────────────────── */

// Call once per page, before rendering anything else.
export async function initSection({ page } = {}) {
  await setLang(readStoredLang() || DEFAULT_LANG, { persist: false });
  if (page) renderSubnav(page);
  applyLang(document);
  onLangChange(() => applyLang(document));
  return state.lang;
}

/* ── Formatting ────────────────────────────────────────────────────── */

function locale() {
  return state.lang === 'fr' ? 'fr-FR' : 'en-GB';
}

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return t('value.unknown');
  return new Intl.NumberFormat(locale()).format(value);
}

export function formatMoney(value, options = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return t('value.unknown');
  return new Intl.NumberFormat(locale(), {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: options.cents ? 2 : 0,
  }).format(value);
}

// Dates are printed from the ISO string, at the precision the source gives.
// Budget Participatif stage dates are month precision (2017-09) and are never
// printed as a day, because the source does not know the day. No timezone
// shifting either: an upstream modified date of 2021-12-01 must read as 2021
// everywhere on earth.
export function formatDate(value, options = {}) {
  if (!value) return t('value.unknown');
  const raw = String(value);
  const match = raw.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!match) return raw;
  const [, y, m, d] = match;
  if (options.style === 'iso') return [y, m, d].filter(Boolean).join('-');
  if (!m) return y;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d || 1)));
  return new Intl.DateTimeFormat(locale(), {
    year: 'numeric',
    month: 'short',
    ...(d ? { day: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(date);
}

export function monthsSince(value, now = new Date()) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  const [, y, m] = match;
  return (now.getUTCFullYear() - Number(y)) * 12 + (now.getUTCMonth() + 1 - Number(m));
}

export function statusClass(status) {
  return STATUS_CLASS[String(status).trim()] || 'unknown';
}

// Status pill. The raw French value is the label, always.
export function statusPill(status) {
  const span = document.createElement('span');
  const raw = status === null || status === undefined || status === ''
    ? t('value.unknown')
    : String(status);
  span.className = `pill pill--${statusClass(raw)}`;
  span.setAttribute('lang', 'fr');
  span.textContent = raw;
  return span;
}

export function statusLegend(statuses = STATUS_ORDER) {
  const wrap = document.createElement('div');
  wrap.className = 'pill-legend';
  for (const status of statuses) wrap.append(statusPill(status));
  return wrap;
}

/* ── Table ─────────────────────────────────────────────────────────── */

// renderTable(mount, config) -> { element, setRows, refresh }
//
// config.columns: [{
//   key, label | labelKey, type: 'text'|'number'|'money'|'date'|'status',
//   format(value, row), href(row), sortValue(row), sortable, filter,
//   className, filterLabelKey
// }]
// config.rows, config.sort {key, dir}, config.search {keys}, config.captionKey
export function renderTable(mount, config) {
  const host = resolveMount(mount);
  if (!host) return null;

  const columns = config.columns;
  let rows = config.rows || [];
  let sort = config.sort ? { ...config.sort } : null;
  const filters = new Map();
  let query = '';

  host.innerHTML = '';

  const controls = document.createElement('div');
  controls.className = 'table-controls';

  const searchKeys = config.search
    ? (config.search.keys || columns.filter((c) => !c.type || c.type === 'text').map((c) => c.key))
    : null;

  if (searchKeys) {
    const control = document.createElement('div');
    control.className = 'control';
    const id = uid('search');
    const label = document.createElement('label');
    label.htmlFor = id;
    label.dataset.i18n = config.search.labelKey || 'table.search';
    const input = document.createElement('input');
    input.type = 'search';
    input.id = id;
    input.dataset.i18nAttr = 'placeholder:table.search_placeholder';
    input.addEventListener('input', () => { query = input.value.trim().toLowerCase(); paint(); });
    control.append(label, input);
    controls.append(control);
  }

  for (const column of columns.filter((c) => c.filter)) {
    const control = document.createElement('div');
    control.className = 'control';
    const id = uid('filter');
    const label = document.createElement('label');
    label.htmlFor = id;
    if (column.filterLabelKey || column.labelKey) {
      label.dataset.i18n = column.filterLabelKey || column.labelKey;
    } else {
      label.textContent = column.label || column.key;
    }
    const select = document.createElement('select');
    select.id = id;
    select.addEventListener('change', () => {
      if (select.value === '') filters.delete(column.key);
      else filters.set(column.key, select.value);
      paint();
    });
    control.append(label, select);
    controls.append(control);
    column._select = select;
  }

  const count = document.createElement('div');
  count.className = 'table-count';
  controls.append(count);

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  const table = document.createElement('table');
  table.className = 'data-table';
  const caption = document.createElement('caption');
  if (config.captionKey) caption.dataset.i18n = config.captionKey;
  else if (config.caption) caption.textContent = config.caption;
  if (config.captionKey || config.caption) table.append(caption);
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);
  scroll.append(table);

  if (controls.childElementCount > 1 || searchKeys) host.append(controls);
  host.append(scroll);

  function buildHead() {
    thead.innerHTML = '';
    const tr = document.createElement('tr');
    for (const column of columns) {
      const th = document.createElement('th');
      th.scope = 'col';
      if (column.type === 'number' || column.type === 'money') th.classList.add('num');
      const text = column.labelKey ? t(column.labelKey) : (column.label || column.key);
      if (column.sortable === false) {
        const inner = document.createElement('span');
        inner.className = 'th-inner';
        inner.textContent = text;
        th.append(inner);
      } else {
        th.setAttribute(
          'aria-sort',
          sort && sort.key === column.key
            ? (sort.dir === 'asc' ? 'ascending' : 'descending')
            : 'none',
        );
        const btn = document.createElement('button');
        btn.type = 'button';
        const labelSpan = document.createElement('span');
        labelSpan.textContent = text;
        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.setAttribute('aria-hidden', 'true');
        btn.append(labelSpan, arrow);
        btn.addEventListener('click', () => {
          if (sort && sort.key === column.key) {
            sort = { key: column.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' };
          } else {
            sort = { key: column.key, dir: column.type === 'text' || !column.type ? 'asc' : 'desc' };
          }
          paint();
        });
        th.append(btn);
      }
      tr.append(th);
    }
    thead.append(tr);
  }

  function buildFilterOptions() {
    for (const column of columns.filter((c) => c.filter)) {
      const select = column._select;
      const previous = select.value;
      const values = [...new Set(rows.map((r) => valueOf(r, column)).filter(
        (v) => v !== null && v !== undefined && v !== '',
      ))].map(String);
      values.sort((a, b) => a.localeCompare(b, 'fr'));
      select.innerHTML = '';
      const all = document.createElement('option');
      all.value = '';
      all.textContent = t('table.filter_all');
      select.append(all);
      for (const value of values) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        option.setAttribute('lang', 'fr');
        select.append(option);
      }
      // A filter column whose values are translated changes its whole option
      // set on a language switch. Dropping the stored filter with the option
      // keeps the Map and the <select> in agreement; leaving it set would show
      // "All" over a table filtered on a value that no longer exists.
      if (values.includes(previous)) {
        select.value = previous;
      } else {
        select.value = '';
        filters.delete(column.key);
      }
    }
  }

  function visibleRows() {
    let out = rows;
    for (const [key, value] of filters) {
      const column = columns.find((c) => c.key === key);
      out = out.filter((row) => String(valueOf(row, column) ?? '') === value);
    }
    if (query && searchKeys) {
      out = out.filter((row) => searchKeys.some(
        (key) => String(row[key] ?? '').toLowerCase().includes(query),
      ));
    }
    if (sort) {
      const column = columns.find((c) => c.key === sort.key);
      if (column) {
        const dir = sort.dir === 'asc' ? 1 : -1;
        out = [...out].sort((a, b) => dir * compare(sortKeyOf(a, column), sortKeyOf(b, column), column));
      }
    }
    return out;
  }

  function paint() {
    buildHead();
    buildFilterOptions();
    const shown = visibleRows();
    tbody.innerHTML = '';

    if (!shown.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = columns.length;
      td.className = 'table-empty';
      td.textContent = t(config.emptyKey || 'table.empty');
      tr.append(td);
      tbody.append(tr);
    }

    for (const row of shown) {
      const tr = document.createElement('tr');
      for (const column of columns) {
        const td = document.createElement('td');
        if (column.className) td.className = column.className;
        if (column.type === 'number' || column.type === 'money') td.classList.add('num');
        const value = valueOf(row, column);

        if (column.type === 'status') {
          td.classList.add('nowrap');
          td.append(statusPill(value));
        } else {
          const text = column.format
            ? column.format(value, row)
            : defaultFormat(value, column);
          if (column.href) {
            const a = document.createElement('a');
            a.href = column.href(row);
            a.textContent = text;
            a.rel = 'noopener';
            a.target = '_blank';
            td.append(a);
          } else {
            td.textContent = text;
          }
          if (column.sourceTerm) td.setAttribute('lang', 'fr');
          if (value === null || value === undefined || value === '') td.classList.add('muted');
        }
        tr.append(td);
      }
      tbody.append(tr);
    }

    count.textContent = shown.length === rows.length
      ? t('table.count', { n: formatNumber(rows.length) })
      : t('table.count_filtered', { n: formatNumber(shown.length), total: formatNumber(rows.length) });
    applyLang(host);
  }

  paint();
  onLangChange(paint);

  return {
    element: host,
    setRows(next) { rows = next || []; paint(); },
    refresh: paint,
  };
}

function valueOf(row, column) {
  return column.value ? column.value(row) : row[column.key];
}

function sortKeyOf(row, column) {
  return column.sortValue ? column.sortValue(row) : valueOf(row, column);
}

function defaultFormat(value, column) {
  if (value === null || value === undefined || value === '') return t('value.unknown');
  switch (column.type) {
    case 'money': return formatMoney(value);
    case 'number': return formatNumber(value);
    case 'date': return formatDate(value);
    default: return String(value);
  }
}

// Nulls always sort last, in both directions, so an empty cell never looks
// like a low value.
function compare(a, b, column) {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (column.type === 'number' || column.type === 'money') return Number(a) - Number(b);
  if (column.type === 'status') {
    const ai = STATUS_ORDER.indexOf(String(a));
    const bi = STATUS_ORDER.indexOf(String(b));
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  }
  return String(a).localeCompare(String(b), 'fr', { numeric: true });
}

/* ── Provenance and staleness ──────────────────────────────────────── */

// Accepts the sources.json object or its `datasets` array.
export function pickSources(sources, ids) {
  const list = Array.isArray(sources) ? sources : (sources.datasets || []);
  if (!ids) return list;
  return ids
    .map((id) => list.find((entry) => entry.dataset_id === id))
    .filter(Boolean);
}

// renderProvenance(entries, { mount, bannerMount, staleAfterMonths })
// Renders the upstream `modified` date for each dataset a page uses, plus a
// staleness banner for any dataset past the threshold. The fetch date is shown
// as provenance and labelled as such: it is never presented as freshness.
export function renderProvenance(sourcesEntries, options = {}) {
  const entries = Array.isArray(sourcesEntries)
    ? sourcesEntries
    : (sourcesEntries.datasets || []);
  const staleAfter = options.staleAfterMonths
    || (sourcesEntries && sourcesEntries.stale_after_months)
    || DEFAULT_STALE_AFTER_MONTHS;

  renderStaleness(entries, { mount: options.bannerMount || '#staleness', staleAfterMonths: staleAfter });

  const host = resolveMount(options.mount || '#provenance');
  if (!host) return null;

  const paint = () => {
    host.className = 'provenance';
    host.innerHTML = '';

    const heading = document.createElement('h2');
    heading.textContent = t('provenance.title');
    host.append(heading);

    const note = document.createElement('p');
    note.className = 'provenance-note';
    note.textContent = t('provenance.note');
    host.append(note);

    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    const table = document.createElement('table');
    table.className = 'data-table';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const key of ['dataset', 'modified', 'records', 'fetched']) {
      const th = document.createElement('th');
      th.scope = 'col';
      const inner = document.createElement('span');
      inner.className = 'th-inner';
      inner.textContent = t(`provenance.col_${key}`);
      th.append(inner);
      if (key === 'records') th.classList.add('num');
      headRow.append(th);
    }
    thead.append(headRow);

    const tbody = document.createElement('tbody');
    for (const entry of entries) {
      const tr = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.className = 'dataset-id wrap';
      if (entry.url) {
        const a = document.createElement('a');
        a.href = entry.url;
        a.textContent = entry.dataset_id;
        a.rel = 'noopener';
        a.target = '_blank';
        idCell.append(a);
      } else {
        idCell.textContent = entry.dataset_id;
      }
      tr.append(idCell);

      const modifiedCell = document.createElement('td');
      modifiedCell.className = 'nowrap';
      const time = document.createElement('time');
      time.dateTime = String(entry.modified || '').slice(0, 10);
      time.textContent = formatDate(entry.modified);
      modifiedCell.append(time);
      const age = ageMonths(entry);
      // Strictly greater, matching STALE_AFTER_MONTHS in build-data.mjs, so the
      // stale flag in sources.json and the flag on the page are one predicate.
      if (age !== null && age > staleAfter) {
        const flag = document.createElement('span');
        flag.className = 'too-few';
        flag.textContent = ` ${t('staleness.tag', { months: formatNumber(age) })}`;
        modifiedCell.append(flag);
      }
      tr.append(modifiedCell);

      const recordsCell = document.createElement('td');
      recordsCell.className = 'num';
      recordsCell.textContent = entry.record_count === null || entry.record_count === undefined
        ? t('value.unknown')
        : formatNumber(entry.record_count);
      tr.append(recordsCell);

      const fetchedCell = document.createElement('td');
      fetchedCell.className = 'fetched nowrap';
      fetchedCell.textContent = formatDate(entry.fetched_at);
      tr.append(fetchedCell);

      tbody.append(tr);
    }

    table.append(thead, tbody);
    scroll.append(table);
    host.append(scroll);
  };

  paint();
  onLangChange(paint);
  return host;
}

export function renderStaleness(entries, options = {}) {
  const host = resolveMount(options.mount || '#staleness');
  if (!host) return null;
  const staleAfter = options.staleAfterMonths || DEFAULT_STALE_AFTER_MONTHS;
  const list = Array.isArray(entries) ? entries : (entries.datasets || []);

  const paint = () => {
    host.className = 'staleness-banners';
    host.innerHTML = '';
    for (const entry of list) {
      const age = ageMonths(entry);
      const stale = entry.stale === true || (age !== null && age > staleAfter);
      if (!stale) continue;

      const banner = document.createElement('div');
      banner.className = 'staleness';
      banner.setAttribute('role', 'note');

      const flag = document.createElement('span');
      flag.className = 'staleness-flag';
      flag.textContent = t('staleness.flag');

      const body = document.createElement('span');
      body.textContent = t('staleness.banner', {
        dataset: entry.title || entry.dataset_id,
        date: formatDate(entry.modified),
        months: age === null ? t('value.unknown') : formatNumber(age),
      });

      banner.append(flag, body);
      host.append(banner);
    }
  };

  paint();
  onLangChange(paint);
  return host;
}

// Age is computed at render time from the upstream modified date. The age
// baked into sources.json at build time is only a fallback for an entry with
// no modified date: a page that reported the age of its last build would keep
// calling a source fresh for as long as nobody rebuilt it.
function ageMonths(entry) {
  const live = monthsSince(entry.modified);
  if (live !== null) return live;
  return typeof entry.modified_age_months === 'number' ? entry.modified_age_months : null;
}

/* ── Small helpers ─────────────────────────────────────────────────── */

function resolveMount(mount) {
  if (!mount) return null;
  return typeof mount === 'string' ? document.querySelector(mount) : mount;
}

let uidCounter = 0;
function uid(prefix) {
  uidCounter += 1;
  return `${prefix}-${uidCounter}`;
}

// A statistic below the sample floor prints this instead of a number.
export function tooFew(n, floor) {
  const span = document.createElement('span');
  span.className = 'too-few';
  span.textContent = t('stats.too_few', { n: formatNumber(n), floor: formatNumber(floor) });
  return span;
}
