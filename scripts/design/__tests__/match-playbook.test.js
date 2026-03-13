'use strict';

const { matchPlaybook } = require('../match-playbook.js');

const tests = [
  // Exact keyword matches
  { input: 'real estate', expected: 'Real Estate' },
  { input: 'property', expected: 'Real Estate' },
  { input: 'saas', expected: 'SaaS / Tech' },
  { input: 'tech', expected: 'SaaS / Tech' },
  { input: 'construction', expected: 'Architecture / Construction' },
  { input: 'creative', expected: 'Production / Creative' },
  { input: 'dealership', expected: 'Auto Dealership' },
  // Case insensitive
  { input: 'Real Estate', expected: 'Real Estate' },
  { input: 'SAAS', expected: 'SaaS / Tech' },
  // No match
  { input: 'bakery', expected: null },
  { input: 'restaurant', expected: null },
];

let passed = 0;
let failed = 0;

for (const t of tests) {
  const result = matchPlaybook(t.input);
  const actual = result.matched_playbook;
  if (actual === t.expected) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: matchPlaybook("${t.input}") → "${actual}", expected "${t.expected}"`);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
