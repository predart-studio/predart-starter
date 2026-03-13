'use strict';

const { renderBrief } = require('../scaffold-brief.js');

const tests = [];

// Test 1: Empty input → all sections show [TO BE DECIDED]
tests.push({
  name: 'empty input produces placeholder brief',
  input: {},
  check: (output) => {
    if (!output.includes('[TO BE DECIDED]')) return 'Missing [TO BE DECIDED] placeholders';
    if (!output.includes('## 1. Business Context')) return 'Missing Business Context section';
    if (!output.includes('## 9. References')) return 'Missing References section';
    return null;
  },
});

// Test 2: Partial input fills correctly
tests.push({
  name: 'partial input fills provided sections',
  input: {
    project_name: 'Test Project',
    business_context: { industry: 'SaaS', client: 'Acme Corp' },
  },
  check: (output) => {
    if (!output.includes('# Design Brief: Test Project')) return 'Missing project name in title';
    if (!output.includes('SaaS')) return 'Missing industry';
    if (!output.includes('Acme Corp')) return 'Missing client';
    if (!output.includes('[TO BE DECIDED]')) return 'Missing placeholders for empty sections';
    return null;
  },
});

// Test 3: Full section plan renders as table
tests.push({
  name: 'section plan renders as markdown table',
  input: {
    section_plan: [
      { page: 'Home', section: 'Hero', approach: 'Full-bleed video', notes: 'Autoplay' },
    ],
  },
  check: (output) => {
    if (!output.includes('| Home | Hero | Full-bleed video | Autoplay |')) return 'Table row not rendered';
    return null;
  },
});

let passed = 0;
let failed = 0;

for (const t of tests) {
  const output = renderBrief(t.input);
  const err = t.check(output);
  if (err) {
    failed++;
    console.error(`FAIL: ${t.name} — ${err}`);
  } else {
    passed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
