'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTEXT_DIR = path.join(ROOT, 'docs', 'project-context');

const FILES = [
  '01-project-context.md',
  '02-design-direction.md',
  '03-motion-direction.md',
  '04-implementation-direction.md',
  '05-build-init-prompt.md',
  '06-template-usage-rules.md',
  '07-reference-notes.md',
];

function readHeadings(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .filter(line => /^#/.test(line.trim()))
    .slice(0, 12)
    .map(line => line.trim());
}

function summarize() {
  const exists = fs.existsSync(CONTEXT_DIR);
  const result = {
    contextDir: CONTEXT_DIR,
    exists,
    present: [],
    missing: [],
    referencesDir: path.join(CONTEXT_DIR, 'references'),
  };

  if (!exists) {
    return result;
  }

  for (const file of FILES) {
    const full = path.join(CONTEXT_DIR, file);
    if (fs.existsSync(full)) {
      result.present.push({ file, headings: readHeadings(full) });
    } else {
      result.missing.push(file);
    }
  }

  return result;
}

if (require.main === module) {
  const summary = summarize();
  console.log('\n── Predart Starter — Project Context Pack Check ──\n');
  console.log(`Context dir: ${summary.contextDir}`);
  console.log(`Exists: ${summary.exists ? 'yes' : 'no'}`);

  if (!summary.exists) {
    console.log('\nNo docs/project-context/ folder found.');
    console.log('Use the templates in docs/project-context/ or add a generated context pack before building serious client projects.');
    process.exit(0);
  }

  console.log('\nPresent files:');
  for (const item of summary.present) {
    console.log(`- ${item.file}`);
    for (const heading of item.headings) console.log(`  ${heading}`);
  }

  if (summary.missing.length) {
    console.log('\nMissing files:');
    for (const file of summary.missing) console.log(`- ${file}`);
  }

  console.log(`\nReferences folder: ${summary.referencesDir}`);
  console.log('\nThis helper is intentionally lightweight. It inspects the context pack and tells you what is present before implementation starts.');
}

module.exports = { summarize };
