#!/usr/bin/env node
/*
  Mark a specification status in BMAD specification frontmatter with
  acceptance criteria guard.

  Usage:
    node scripts/mark-spec.js --id 05-vendor-management-system --status in_progress
    node scripts/mark-spec.js --id 05-vendor-management-system --status completed [--force]
*/

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SPEC_DIR = path.join('docs', 'specifications');
const INDEX_FILE = path.join(SPEC_DIR, '00-system-overview.md');

function parseArgs(argv) {
  const args = { id: null, status: null, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--id') args.id = argv[++i];
    else if (a === '--status') args.status = argv[++i];
    else if (a === '--force') args.force = true;
    else if (a === '-h' || a === '--help') {
      console.log('Usage: node scripts/mark-spec.js --id <spec-id> --status <completed|in_progress|not_started> [--force]');
      process.exit(0);
    }
  }
  return args;
}

function splitFrontmatter(markdown) {
  const m = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  return {
    frontmatter: m[1],
    body: markdown.slice(m[0].length),
    matched: m[0],
  };
}

function setFrontmatterValue(frontmatter, key, value) {
  const lines = frontmatter.split(/\r?\n/);
  const re = new RegExp(`^${key}:\\s*.*$`, 'i');
  let found = false;
  const out = lines.map(line => {
    if (re.test(line)) {
      found = true;
      return `${key}: ${value}`;
    }
    return line;
  });
  if (!found) out.push(`${key}: ${value}`);
  return out.join('\n');
}

function updateMarkdownFrontmatter(filePath, mutator) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = splitFrontmatter(raw);
  if (!parsed) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }
  const nextFrontmatter = mutator(parsed.frontmatter);
  const next = `---\n${nextFrontmatter}\n---\n${parsed.body}`;
  fs.writeFileSync(filePath, next, 'utf8');
}

function listSpecIds() {
  return fs
    .readdirSync(SPEC_DIR)
    .filter(name => /^\d{2}-.+\.md$/.test(name) && !/^00-/.test(name))
    .map(name => name.replace(/\.md$/, ''));
}

function updateIndexDocument(id, status) {
  let raw = fs.readFileSync(INDEX_FILE, 'utf8');

  const parsed = splitFrontmatter(raw);
  if (!parsed) {
    throw new Error(`Missing frontmatter in ${INDEX_FILE}`);
  }

  const nextFrontmatter = setFrontmatterValue(parsed.frontmatter, 'currentSpecification', id);
  raw = `---\n${nextFrontmatter}\n---\n${parsed.body}`;

  raw = raw.replace(/^-\s+Current active specification:\s+.*$/m, `- Current active specification: ${id}`);

  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rowPattern = new RegExp(`^(\\|\\s*${escapedId}\\s*\\|\\s*)([^|]+?)(\\s*\\|.*)$`, 'm');
  raw = raw.replace(rowPattern, (_, prefix, _oldStatus, suffix) => `${prefix}${status}${suffix}`);

  fs.writeFileSync(INDEX_FILE, raw, 'utf8');
}

(function main() {
  try {
    const args = parseArgs(process.argv);
    const { id, status, force } = args;
    if (!id || !status) {
      console.error('ERROR: --id and --status are required');
      process.exit(1);
    }
    if (!['completed', 'in_progress', 'not_started'].includes(status)) {
      console.error('ERROR: --status must be one of completed|in_progress|not_started');
      process.exit(1);
    }

    // Guard: if marking completed, verify all acceptance criteria implemented unless --force
    if (status === 'completed' && !force) {
      const check = spawnSync(process.execPath, ['scripts/check-acceptance-criteria.js', '--id', id], { encoding: 'utf8' });
      if (check.status === 2) {
        console.error('ERROR: Acceptance criteria incomplete. Refusing to mark as completed.');
        process.stdout.write(check.stdout || '');
        process.stderr.write(check.stderr || '');
        process.exit(2);
      } else if (check.status !== 0) {
        console.error('ERROR: Could not verify acceptance criteria. Use --force to override.');
        process.stdout.write(check.stdout || '');
        process.stderr.write(check.stderr || '');
        process.exit(1);
      }
    }

    const specIds = listSpecIds();
    if (!specIds.includes(id)) {
      console.error(`ERROR: Spec id not found in docs/specifications: ${id}`);
      process.exit(1);
    }

    for (const specId of specIds) {
      const specFile = path.join(SPEC_DIR, `${specId}.md`);
      updateMarkdownFrontmatter(specFile, frontmatter => {
        let next = setFrontmatterValue(frontmatter, 'currentSpecification', specId === id ? 'true' : 'false');
        if (specId === id) {
          next = setFrontmatterValue(next, 'status', status);
        }
        return next;
      });
    }

    updateIndexDocument(id, status);

    console.log(`Updated ${id} -> ${status}`);
  } catch (err) {
    console.error('ERROR:', err?.message || err);
    process.exit(1);
  }
})();


