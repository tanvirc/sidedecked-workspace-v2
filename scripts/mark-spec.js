#!/usr/bin/env node
/*
  Mark an epic status in module-status.json with acceptance criteria guard.

  Usage:
    node scripts/mark-spec.js --id epic-04-vendor-management --status in_progress
    node scripts/mark-spec.js --id epic-04-vendor-management --status completed [--force]
*/

const fs = require('fs');
const { spawnSync } = require('child_process');

function parseArgs(argv) {
  const args = { id: null, status: null, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--id') args.id = argv[++i];
    else if (a === '--status') args.status = argv[++i];
    else if (a === '--force') args.force = true;
    else if (a === '-h' || a === '--help') {
      console.log('Usage: node scripts/mark-spec.js --id <epic-id> --status <completed|in_progress|not_started> [--force]');
      process.exit(0);
    }
  }
  return args;
}

function loadStatus() {
  const raw = fs.readFileSync('module-status.json', 'utf8');
  return JSON.parse(raw);
}

function saveStatus(json) {
  fs.writeFileSync('module-status.json', JSON.stringify(json, null, 2) + '\n');
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

    const data = loadStatus();
    if (!data.specifications || !(id in data.specifications)) {
      console.error(`ERROR: Spec id not found in module-status.json: ${id}`);
      process.exit(1);
    }

    data.specifications[id] = status;
    data.current_specification = id;
    data.last_updated = new Date().toISOString();
    // recompute completed_count
    data.completed_count = Object.values(data.specifications).filter(v => v === 'completed').length;
    data.total_count = Object.keys(data.specifications).length;

    saveStatus(data);
    console.log(`Updated ${id} -> ${status}`);
  } catch (err) {
    console.error('ERROR:', err?.message || err);
    process.exit(1);
  }
})();

