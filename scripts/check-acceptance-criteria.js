#!/usr/bin/env node
/*
  Check acceptance criteria completion for a BMAD epic or story.

  When given an epic ID, reads all matching story files from docs/stories/.
  When given a file, reads that single file.

  Usage:
    node scripts/check-acceptance-criteria.js --id epic-04-vendor-management [--next-story]
    node scripts/check-acceptance-criteria.js --file docs/stories/story-04-1-1-vendor-dashboard.md [--next-story]

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
      console.log('Usage: node scripts/check-acceptance-criteria.js --id <epic-id> | --file <file> [--next-story]');
      process.exit(0);
    }
  }
  return args;
}

function resolveFiles({ id, file }) {
  if (file) return [file];
  if (!id) return [];

  // Support legacy spec IDs (e.g. 04-vendor-management-system) by mapping to epic IDs
  const legacyMap = {
    '01-authentication-user-management-system': 'epic-01-authentication-user-management',
    '02-commerce-marketplace-system': 'epic-02-commerce-marketplace',
    '03-tcg-catalog-card-database-system': 'epic-03-tcg-catalog',
    '04-vendor-management-system': 'epic-04-vendor-management',
    '05-deck-building-system': 'epic-05-deck-building',
    '06-community-social-system': 'epic-06-community-social',
    '07-pricing-intelligence-system': 'epic-07-pricing-intelligence',
    '08-search-discovery-system': 'epic-08-search-discovery',
    '09-inventory-management-system': 'epic-09-inventory-management',
    '10-payment-processing-system': 'epic-10-payment-processing',
  };
  const epicId = legacyMap[id] || id;

  // Derive epic number prefix from ID (e.g. "epic-04-..." → "story-04-")
  const epicNumMatch = epicId.match(/^epic-(\d+)/);
  if (!epicNumMatch) return [];
  const epicNum = epicNumMatch[1];

  const storiesDir = path.join('docs', 'stories');
  if (!fs.existsSync(storiesDir)) return [];

  const files = fs.readdirSync(storiesDir)
    .filter(f => f.startsWith(`story-${epicNum}-`) && f.endsWith('.md'))
    .sort()
    .map(f => path.join(storiesDir, f));

  return files;
}

function parseMarkdown(markdown, filePath) {
  const lines = markdown.split(/\r?\n/);
  const results = [];

  let currentStory = filePath ? path.basename(filePath, '.md') : 'Unknown Story';
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

    // Story title heading
    if (/^#\s+Story\s+/i.test(line)) {
      currentStory = line.replace(/^#\s+/, '').trim();
      inCriteria = false;
      continue;
    }

    // Enter acceptance criteria section
    if (/^##\s+Acceptance Criteria/i.test(line) || /^\*\*?Acceptance Criteria:?\*\*/i.test(line)) {
      inCriteria = true;
      continue;
    }

    // Exit criteria on next ## heading
    if (/^##\s+/.test(line) && !/Acceptance Criteria/i.test(line)) {
      inCriteria = false;
    }

    if (inCriteria) {
      if (/^\s*[-*+]|^\s*\d+\./.test(line)) {
        const m = line.match(statusRegex);
        if (!m) continue;
        const status = mapStatus(m[1]);
        results.push({ story: currentStory, file: filePath, line: i + 1, text: line.trim(), status });
      }
    }
  }

  return results;
}

(function main() {
  try {
    const args = parseArgs(process.argv);
    const files = resolveFiles(args);

    if (files.length === 0) {
      console.error(`ERROR: No story files found. Use --id <epic-id> or --file <path>. Got id: ${args.id || '(none)'}`);
      process.exit(1);
    }

    const missing = files.filter(f => !fs.existsSync(f));
    if (missing.length > 0) {
      console.error(`ERROR: Files not found: ${missing.join(', ')}`);
      process.exit(1);
    }

    // Parse all files and collect results grouped by story
    const byStory = new Map();
    for (const f of files) {
      const md = fs.readFileSync(f, 'utf8');
      const items = parseMarkdown(md, f);
      for (const item of items) {
        const key = `${item.story}`;
        if (!byStory.has(key)) byStory.set(key, { file: f, items: [] });
        byStory.get(key).items.push(item);
      }
    }

    if (args.nextStory) {
      for (const [storyKey, { items }] of byStory.entries()) {
        if (items.some(i => i.status !== 'completed')) {
          console.log(storyKey);
          process.exit(0);
        }
      }
      console.log('ALL_STORIES_COMPLETED');
      process.exit(0);
    }

    // Aggregate totals
    const totals = { completed: 0, in_progress: 0, not_started: 0, unknown: 0 };
    for (const { items } of byStory.values()) {
      for (const i of items) totals[i.status] = (totals[i.status] || 0) + 1;
    }

    console.log(`Files: ${files.length} story file(s)`);
    console.log(`Totals: completed=${totals.completed || 0} in_progress=${totals.in_progress || 0} not_started=${totals.not_started || 0} unknown=${totals.unknown || 0}`);

    if ((totals.in_progress || 0) > 0 || (totals.not_started || 0) > 0 || (totals.unknown || 0) > 0) {
      console.log('\nIncomplete items:');
      for (const [storyKey, { items }] of byStory.entries()) {
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
