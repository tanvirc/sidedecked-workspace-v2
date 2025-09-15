#!/usr/bin/env node
/*
  Determine which specification to work on next.

  Rule:
    - If module-status.json.current_specification exists and its status != completed, continue with it.
    - Otherwise, pick the lowest-numbered spec with status in_progress; if none, the lowest-numbered not_started.

  Usage:
    node scripts/next-spec.js
*/

const fs = require('fs');

function loadStatus() {
  const raw = fs.readFileSync('module-status.json', 'utf8');
  return JSON.parse(raw);
}

function ordinal(name) {
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

(function main() {
  try {
    const s = loadStatus();
    const cur = s.current_specification;
    if (cur && s.specifications[cur] && s.specifications[cur] !== 'completed') {
      console.log(cur);
      process.exit(0);
    }
    const entries = Object.entries(s.specifications).map(([k, v]) => ({ name: k, status: v, ord: ordinal(k) }))
      .sort((a, b) => a.ord - b.ord);

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

