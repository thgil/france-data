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
  assert.match(html, /href="\/stories\/pharmacies-vs-bakeries\/"/);
  assert.match(html, /Economy/);
  assert.match(html, /5 min read/);
  assert.match(html, /<link rel="stylesheet" href="\/shared\/style.css">/);

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
