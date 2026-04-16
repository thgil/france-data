// scripts/build-index.js
// Reads stories/*/meta.json and writes a static index.html.
// Run: node scripts/build-index.js  (or: npm run build)

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function loadStories(projectRoot) {
  const storiesDir = join(projectRoot, 'stories');
  if (!existsSync(storiesDir)) return [];

  return readdirSync(storiesDir)
    .map((name) => join(storiesDir, name))
    .filter((p) => {
      try { return statSync(p).isDirectory(); } catch { return false; }
    })
    .map((dir) => {
      const metaPath = join(dir, 'meta.json');
      if (!existsSync(metaPath)) return null;   // draft / WIP — skip silently
      const raw = readFileSync(metaPath, 'utf8');
      try {
        return JSON.parse(raw);
      } catch (err) {
        throw new Error(`Invalid JSON in ${metaPath}: ${err.message}`);
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function renderCard(story) {
  return `
    <a class="story-card" href="/stories/${escapeHtml(story.slug)}/">
      <div class="kicker">${escapeHtml(story.topic)}</div>
      <h2>${escapeHtml(story.title)}</h2>
      <p class="dek">${escapeHtml(story.dek)}</p>
      <div class="meta">${escapeHtml(story.date)} · ${escapeHtml(story.readTime)}</div>
    </a>`;
}

function renderIndex(stories) {
  const intro = `
    <section class="index-intro">
      <h1>France, by the numbers.</h1>
      <p>Data stories pulled from the French government's open data platform — demographics, economy, health, and the occasional statistical oddity.</p>
    </section>`;

  const body = stories.length
    ? `<section class="cards-grid">${stories.map(renderCard).join('\n')}</section>`
    : `<section class="cards-grid"><p class="index-empty">No stories yet — check back soon.</p></section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>France, by the numbers</title>
  <link rel="stylesheet" href="/shared/style.css">
</head>
<body>
  <header id="masthead"></header>
  <main class="page">
    ${intro}
    ${body}
  </main>
  <footer class="site-footer">
    <span>Data from <a href="https://www.data.gouv.fr">data.gouv.fr</a></span>
    <span>Built with care, one story at a time.</span>
  </footer>
  <script src="/shared/nav.js" defer></script>
</body>
</html>
`;
}

export function buildIndex(projectRoot) {
  const stories = loadStories(projectRoot);
  const html = renderIndex(stories);
  writeFileSync(join(projectRoot, 'index.html'), html);
  return { count: stories.length, path: join(projectRoot, 'index.html') };
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
  console.log(`Built ${result.path} (${result.count} stories)`);
}
