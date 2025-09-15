#!/usr/bin/env node
/*
  Check acceptance criteria completion inside a specification markdown file.

  Usage:
    node scripts/check-acceptance-criteria.js --id 04-vendor-management-system [--next-story]
    node scripts/check-acceptance-criteria.js --file docs/specifications/04-vendor-management-system.md [--next-story]

  Exit codes:
    0 = all acceptance criteria implemented
    2 = one or more acceptance criteria incomplete
    1 = usage or unexpected error
*/

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { id: null, file: null, nextStory: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--id') args.id = argv[++i];
    else if (a === '--file') args.file = argv[++i];
    else if (a === '--next-story') args.nextStory = true;
    else if (a === '-h' || a === '--help') {
      console.log('Usage: node scripts/check-acceptance-criteria.js --id <spec-id> | --file <file> [--next-story]');
      process.exit(0);
    }
  }
  return args;
}

function resolveSpecFile({ id, file }) {
  if (file) return file;
  if (!id) return null;
  return path.join('docs', 'specifications', `${id}.md`);
}

function parseSpec(markdown) {
  const lines = markdown.split(/\r?\n/);
  const results = []; // entries: { epic, story, line, text, status }

  let currentEpic = null;
  let currentStory = null;
  let inCriteria = false;

  const statusRegex = /[\[(]\s*(IMPLEMENTED|COMPLETED|IN\s*PROGRESS|IN_PROGRESS|PARTIAL|NOT\s*BUILT|NOT\s*STARTED|NOT_STARTED|TODO)\s*[\])]/i;

  const mapStatus = (raw) => {
    const t = raw.toUpperCase().replace(/\s+/g, '_');
    if (t === 'IMPLEMENTED' || t === 'COMPLETED') return 'completed';
    if (t === 'IN_PROGRESS' || t === 'PARTIAL') return 'in_progress';
    if (t === 'NOT_BUILT' || t === 'NOT_STARTED' || t === 'TODO') return 'not_started';
    return 'unknown';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Headings
    if (/^###\s+Epic\s+/i.test(line)) {
      currentEpic = line.replace(/^###\s+/, '').trim();
      currentStory = null;
      inCriteria = false;
      continue;
    }
    if (/^####\s+User Story\s+/i.test(line)) {
      currentStory = line.replace(/^####\s+/, '').trim();
      inCriteria = false;
      continue;
    }
    // Enter/exit acceptance criteria blocks
    if (/^\*\*?Acceptance Criteria:?\*\*/i.test(line) || /Acceptance Criteria:?/i.test(line)) {
      inCriteria = true;
      continue;
    }
    if (/^#{3,4}\s+/.test(line)) {
      // new heading closes criteria block
      inCriteria = false;
    }

    if (inCriteria) {
      // bullet or numbered list items
      if (/^\s*[-*+]|^\s*\d+\./.test(line)) {
        const m = line.match(statusRegex);
        if (!m) {
          // Ignore sub-bullets without explicit status tag
          continue;
        }
        const rawStatus = m[1];
        const status = mapStatus(rawStatus);
        results.push({ epic: currentEpic, story: currentStory, line: i + 1, text: line.trim(), status });
      }
    }
  }

  // Group by story
  const byStory = new Map();
  for (const r of results) {
    const key = `${r.epic || 'Unknown Epic'} :: ${r.story || 'Unknown Story'}`;
    if (!byStory.has(key)) byStory.set(key, []);
    byStory.get(key).push(r);
  }

  return { items: results, byStory };
}

(function main() {
  try {
    const args = parseArgs(process.argv);
    const specFile = resolveSpecFile(args);
    if (!specFile || !fs.existsSync(specFile)) {
      console.error(`ERROR: Spec file not found. Use --id or --file. Got: ${specFile || '(none)'}`);
      process.exit(1);
    }

    const md = fs.readFileSync(specFile, 'utf8');
    const parsed = parseSpec(md);

    const totals = { completed: 0, in_progress: 0, not_started: 0, unknown: 0 };
    for (const i of parsed.items) totals[i.status] = (totals[i.status] || 0) + 1;

    if (args.nextStory) {
      // Find first story with any incomplete (in_progress or not_started or unknown)
      for (const [storyKey, items] of parsed.byStory.entries()) {
        const incomplete = items.some(i => i.status !== 'completed');
        if (incomplete) {
          console.log(storyKey);
          process.exit(0);
        }
      }
      console.log('ALL_STORIES_COMPLETED');
      process.exit(0);
    }

    // Summary output
    console.log(`File: ${specFile}`);
    console.log(`Totals: completed=${totals.completed||0} in_progress=${totals.in_progress||0} not_started=${totals.not_started||0} unknown=${totals.unknown||0}`);

    if ((totals.in_progress || 0) > 0 || (totals.not_started || 0) > 0 || (totals.unknown || 0) > 0) {
      console.log('\nIncomplete items:');
      for (const [storyKey, items] of parsed.byStory.entries()) {
        const incomplete = items.filter(i => i.status !== 'completed');
        if (incomplete.length) {
          console.log(`- ${storyKey}`);
          for (const it of incomplete) {
            console.log(`  • L${it.line}: ${it.text}`);
          }
        }
      }
      process.exit(2);
    }

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err?.message || err);
    process.exit(1);
  }
})();
