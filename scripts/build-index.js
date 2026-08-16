// scripts/build-index.js
// Reads meta.json files and writes a static index.html.
// Two kinds of entry:
//   stories/<slug>/meta.json   -> a story, rendered in the card grid
//   <slug>/meta.json           -> kind:"section", a standing resource rendered above the grid
// Run: node scripts/build-index.js  (or: npm run build)

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Top-level directories that hold no publishable entry. Anything else at the
// root is scanned for a meta.json so a new section needs no code change.
const NOT_ENTRY_DIRS = new Set(['stories', 'shared', 'scripts', 'docs', 'research', 'node_modules']);

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '');

function subdirectories(parent) {
  if (!existsSync(parent)) return [];
  return readdirSync(parent)
    .map((name) => ({ name, path: join(parent, name) }))
    .filter(({ path }) => {
      try { return statSync(path).isDirectory(); } catch { return false; }
    });
}

// Returns the parsed meta.json, or null when the folder has none (draft / WIP).
function readMeta(dir) {
  const metaPath = join(dir, 'meta.json');
  if (!existsSync(metaPath)) return null;
  const raw = readFileSync(metaPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${metaPath}: ${err.message}`);
  }
}

function loadEntries(projectRoot) {
  const entries = [];

  for (const { path } of subdirectories(join(projectRoot, 'stories'))) {
    const meta = readMeta(path);
    if (meta) entries.push({ ...meta, href: `stories/${meta.slug}/` });
  }

  for (const { name, path } of subdirectories(projectRoot)) {
    if (name.startsWith('.') || NOT_ENTRY_DIRS.has(name)) continue;
    const meta = readMeta(path);
    if (meta) entries.push({ ...meta, href: `${meta.slug}/` });
  }

  return entries;
}

function splitEntries(entries) {
  return {
    sections: entries.filter((e) => e.kind === 'section').sort(byDateDesc),
    stories: entries.filter((e) => e.kind !== 'section').sort(byDateDesc),
  };
}

function renderCard(story) {
  return `
    <a class="story-card" href="${escapeHtml(story.href)}">
      <div class="kicker">${escapeHtml(story.topic)}</div>
      <h2>${escapeHtml(story.title)}</h2>
      <p class="dek">${escapeHtml(story.dek)}</p>
      <div class="meta">${escapeHtml(story.date)} · ${escapeHtml(story.readTime)}</div>
    </a>`;
}

// A section is an ongoing resource, not a dated story, so it gets its own card
// above the grid rather than competing for a slot inside it.
function renderSectionCard(section) {
  return `
    <a class="story-card section-card" href="${escapeHtml(section.href)}">
      <div class="kicker">Section · ${escapeHtml(section.topic)}</div>
      <h2>${escapeHtml(section.title)}</h2>
      <p class="dek">${escapeHtml(section.dek)}</p>
      <div class="meta">${escapeHtml(section.date)} · ${escapeHtml(section.readTime)}</div>
    </a>`;
}

function renderIndex(sections, stories) {
  const intro = `
    <section class="index-intro">
      <h1>France, by the numbers.</h1>
      <p>Data stories pulled from the French government's open data platform — demographics, economy, health, and the occasional statistical oddity.</p>
    </section>`;

  const rail = sections.length
    ? `<section class="section-rail">${sections.map(renderSectionCard).join('\n')}</section>`
    : '';

  const body = stories.length
    ? `<section class="cards-grid">${stories.map(renderCard).join('\n')}</section>`
    : `<section class="cards-grid"><p class="index-empty">No stories yet — check back soon.</p></section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>France, by the numbers</title>
  <link rel="stylesheet" href="shared/style.css">
</head>
<body>
  <header id="masthead"></header>
  <main class="page">
    ${intro}
    ${rail}
    ${body}
  </main>
  <footer class="site-footer">
    <span>Data from <a href="https://www.data.gouv.fr">data.gouv.fr</a></span>
    <span>Built with care, one story at a time.</span>
  </footer>
  <script src="shared/nav.js" defer></script>
</body>
</html>
`;
}

export function buildIndex(projectRoot) {
  const { sections, stories } = splitEntries(loadEntries(projectRoot));
  const html = renderIndex(sections, stories);
  writeFileSync(join(projectRoot, 'index.html'), html);
  return { count: stories.length, sectionCount: sections.length, path: join(projectRoot, 'index.html') };
}

// Entry point when run as a script. The realpathSync/pathToFileURL round-trip
// handles paths with spaces, non-ASCII characters, and symlinks (common under
// `npm run` which can resolve through a binary symlink).
const invokedAsScript =
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;

if (invokedAsScript) {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, '..');
  const result = buildIndex(root);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  console.log(
    `Built ${result.path} (${plural(result.count, 'story', 'stories')}, ${plural(result.sectionCount, 'section', 'sections')})`
  );
}
