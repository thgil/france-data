import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildIndex } from './build-index.js';

function makeTempProject() {
  const root = mkdtempSync(join(tmpdir(), 'france-data-'));
  mkdirSync(join(root, 'stories'));
  mkdirSync(join(root, 'shared'));
  writeFileSync(join(root, 'shared', 'style.css'), '/* test */');
  return root;
}

function addStory(root, meta) {
  const dir = join(root, 'stories', meta.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta));
  writeFileSync(join(dir, 'index.html'), '<p>story</p>');
}

// Sections live at the project root, not under stories/.
function addSection(root, meta) {
  const dir = join(root, meta.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'meta.json'), JSON.stringify({ kind: 'section', ...meta }));
  writeFileSync(join(dir, 'index.html'), '<p>section</p>');
}

const parisSeptieme = {
  slug: 'paris-7e',
  title: 'The 7th, in public',
  dek: 'Who decides, what it costs, and what actually gets built.',
  topic: 'Civic',
  date: '2026-08-16',
  readTime: 'ongoing'
};

test('buildIndex writes an index.html that lists every story card', () => {
  const root = makeTempProject();
  addStory(root, {
    slug: 'pharmacies-vs-bakeries',
    title: 'More pharmacies than bakeries. Really.',
    dek: 'French pharmacies outnumber the bakeries per capita.',
    topic: 'Economy',
    date: '2026-04-20',
    readTime: '5 min read'
  });

  buildIndex(root);

  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /More pharmacies than bakeries/);
  assert.match(html, /href="stories\/pharmacies-vs-bakeries\/"/);
  assert.match(html, /Economy/);
  assert.match(html, /5 min read/);
  assert.match(html, /<link rel="stylesheet" href="shared\/style.css">/);

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex sorts stories newest-first by date', () => {
  const root = makeTempProject();
  addStory(root, { slug: 'older', title: 'Older story', dek: '-', topic: 'X', date: '2026-01-01', readTime: '1 min' });
  addStory(root, { slug: 'newer', title: 'Newer story', dek: '-', topic: 'X', date: '2026-05-01', readTime: '1 min' });

  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');

  const newerIdx = html.indexOf('Newer story');
  const olderIdx = html.indexOf('Older story');
  assert.ok(newerIdx > -1 && olderIdx > -1, 'both stories present');
  assert.ok(newerIdx < olderIdx, 'newer story appears before older story');

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex renders an empty-state when no stories exist', () => {
  const root = makeTempProject();
  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /No stories yet/);
  rmSync(root, { recursive: true, force: true });
});

test('buildIndex ignores folders without a meta.json (e.g. drafts)', () => {
  const root = makeTempProject();
  mkdirSync(join(root, 'stories', 'draft-story'), { recursive: true });
  writeFileSync(join(root, 'stories', 'draft-story', 'index.html'), '<p>wip</p>');
  // No meta.json — should be skipped.

  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /draft-story/);

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex renders a section card linking to the section root', () => {
  const root = makeTempProject();
  addSection(root, parisSeptieme);

  const result = buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');

  assert.match(html, /class="story-card section-card" href="paris-7e\/"/);
  assert.match(html, /The 7th, in public/);
  assert.match(html, /Civic/);
  assert.match(html, /ongoing/);
  assert.equal(result.sectionCount, 1);
  assert.equal(result.count, 0);

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex puts sections above the story grid and keeps them out of it', () => {
  const root = makeTempProject();
  addStory(root, { slug: 'newest', title: 'Newest story', dek: '-', topic: 'X', date: '2026-12-01', readTime: '1 min' });
  addSection(root, parisSeptieme);

  const result = buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');

  const railIdx = html.indexOf('class="section-rail"');
  const gridIdx = html.indexOf('class="cards-grid"');
  const sectionIdx = html.indexOf('The 7th, in public');
  const storyIdx = html.indexOf('Newest story');

  assert.ok(railIdx > -1, 'section rail rendered');
  assert.ok(railIdx < gridIdx, 'rail comes before the story grid');
  assert.ok(sectionIdx < gridIdx, 'section card sits above the grid');
  assert.ok(storyIdx > gridIdx, 'story card sits inside the grid');
  // A section is not a story: it must not be linked as one, and must not be counted as one.
  assert.doesNotMatch(html, /href="stories\/paris-7e\//);
  assert.equal(result.count, 1);
  assert.equal(result.sectionCount, 1);

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex renders no section rail when there are no sections', () => {
  const root = makeTempProject();
  addStory(root, { slug: 'only', title: 'Only story', dek: '-', topic: 'X', date: '2026-02-02', readTime: '1 min' });

  const result = buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');

  assert.doesNotMatch(html, /section-rail/);
  assert.equal(result.sectionCount, 0);

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex shows the story empty-state even when a section exists', () => {
  const root = makeTempProject();
  addSection(root, parisSeptieme);

  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');

  assert.match(html, /No stories yet/);
  assert.match(html, /The 7th, in public/);

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex ignores root folders that carry no meta.json', () => {
  const root = makeTempProject();
  mkdirSync(join(root, 'scripts'), { recursive: true });
  writeFileSync(join(root, 'scripts', 'thing.js'), '// nothing');
  mkdirSync(join(root, 'wip-section'), { recursive: true });
  writeFileSync(join(root, 'wip-section', 'index.html'), '<p>wip</p>');

  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');

  assert.doesNotMatch(html, /wip-section/);
  assert.doesNotMatch(html, /thing\.js/);

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex sorts multiple sections newest-first', () => {
  const root = makeTempProject();
  addSection(root, { ...parisSeptieme, slug: 'older-section', title: 'Older section', date: '2025-01-01' });
  addSection(root, { ...parisSeptieme, slug: 'newer-section', title: 'Newer section', date: '2026-09-09' });

  buildIndex(root);
  const html = readFileSync(join(root, 'index.html'), 'utf8');

  assert.ok(html.indexOf('Newer section') < html.indexOf('Older section'));

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex throws a clear error when a section meta.json is malformed', () => {
  const root = makeTempProject();
  const dir = join(root, 'broken-section');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'meta.json'), '{ "kind": "section", '); // truncated JSON

  assert.throws(
    () => buildIndex(root),
    /Invalid JSON in .*broken-section.*meta\.json/
  );

  rmSync(root, { recursive: true, force: true });
});

test('buildIndex throws a clear error when a meta.json is malformed', () => {
  const root = makeTempProject();
  const dir = join(root, 'stories', 'broken');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'meta.json'), '{ "slug": "broken", '); // truncated JSON
  writeFileSync(join(dir, 'index.html'), '<p>broken</p>');

  assert.throws(
    () => buildIndex(root),
    /Invalid JSON in .*broken.*meta\.json/
  );

  rmSync(root, { recursive: true, force: true });
});
