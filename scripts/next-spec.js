#!/usr/bin/env node
/*
  Determine which specification to work on next from BMAD spec documents.

  Rule:
    - If docs/specifications/00-system-overview.md frontmatter currentSpecification
      exists and its status != completed, continue with it.
    - Otherwise, pick the lowest-numbered spec with status in_progress;
      if none, the lowest-numbered not_started.

  Usage:
    node scripts/next-spec.js
*/

const fs = require('fs');
const path = require('path');

const SPEC_DIR = path.join('docs', 'specifications');
const INDEX_FILE = path.join(SPEC_DIR, '00-system-overview.md');

function splitFrontmatter(markdown) {
  const m = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  return m[1];
}

function getFrontmatterValue(frontmatter, key) {
  if (!frontmatter) return null;
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'mi');
  const m = frontmatter.match(re);
  return m ? m[1].trim() : null;
}

function listSpecIds() {
  return fs
    .readdirSync(SPEC_DIR)
    .filter(name => /^\d{2}-.+\.md$/.test(name) && !/^00-/.test(name))
    .map(name => name.replace(/\.md$/, ''));
}

function loadSpecStatus(specId) {
  const file = path.join(SPEC_DIR, `${specId}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const frontmatter = splitFrontmatter(raw);
  return getFrontmatterValue(frontmatter, 'status') || 'not_started';
}

function ordinal(name) {
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

(function main() {
  try {
    const indexRaw = fs.readFileSync(INDEX_FILE, 'utf8');
    const indexFrontmatter = splitFrontmatter(indexRaw);
    const cur = getFrontmatterValue(indexFrontmatter, 'currentSpecification');

    const entries = listSpecIds()
      .map(name => ({ name, status: loadSpecStatus(name), ord: ordinal(name) }))
      .sort((a, b) => a.ord - b.ord);

    const currentEntry = entries.find(e => e.name === cur);
    if (currentEntry && currentEntry.status !== 'completed') {
      console.log(cur);
      process.exit(0);
    }

    const inProg = entries.find(e => e.status === 'in_progress');
    if (inProg) {
      console.log(inProg.name);
      process.exit(0);
    }
    const next = entries.find(e => e.status === 'not_started');
    if (next) {
      console.log(next.name);
      process.exit(0);
    }
    console.log('ALL_SPECS_COMPLETED');
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err?.message || err);
    process.exit(1);
  }
})();

