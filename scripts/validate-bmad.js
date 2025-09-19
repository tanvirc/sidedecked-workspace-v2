#!/usr/bin/env node
/**
 * Validate BMAD documentation consistency.
 * - Every epic must have at least one story file.
 * - Every epic must have a QA gate document.
 * - Story files must include a Status section.
 */

const fs = require('fs');
const path = require('path');

function listFiles(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

function fail(message) {
  console.error(`❌ BMAD validation failed: ${message}`);
  process.exitCode = 1;
}

const epicDir = path.join('docs', 'epics');
const storyDir = path.join('docs', 'stories');
const qaDir = path.join('docs', 'qa');

const epicFiles = listFiles(epicDir).filter(f => f.startsWith('epic-') && f.endsWith('.md'));

if (!epicFiles.length) {
  fail('No epic files found under docs/epics/.');
  process.exit(process.exitCode || 1);
}

for (const epicFile of epicFiles) {
  const epicPath = path.join(epicDir, epicFile);
  const epicNumber = epicFile.split('-')[1];
  const storyPrefix = `${epicNumber}.`;

  const storyFiles = listFiles(storyDir).filter(f => f.startsWith(storyPrefix));
  if (!storyFiles.length) {
    fail(`Missing story shards for epic ${epicNumber} (${epicFile}).`);
  }

  const qaFileMatch = listFiles(qaDir).find(f => f.includes(epicNumber));
  if (!qaFileMatch) {
    fail(`Missing QA gate document for epic ${epicNumber}.`);
  }

  for (const storyFile of storyFiles) {
    const storyPath = path.join(storyDir, storyFile);
    const content = fs.readFileSync(storyPath, 'utf8');
    if (!content.includes('## Status')) {
      fail(`Story file ${storyFile} is missing a Status section.`);
    }
  }
}

if (process.exitCode) {
  console.error('\nRun `node scripts/validate-bmad.js` after updating epics, stories, or QA gates.');
  process.exit(1);
}

console.log('✅ BMAD validation passed.');
