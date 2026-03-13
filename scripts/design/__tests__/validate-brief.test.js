'use strict';

const { validateBrief } = require('../validate-brief.js');
const { renderBrief } = require('../scaffold-brief.js');

const tests = [];

// Test 1: Empty brief → all empty, exit code 1
tests.push({
  name: 'empty brief reports all sections empty',
  brief: renderBrief({}),
  check: (result) => {
    if (result.status !== 'fail') return `Expected fail, got ${result.status}`;
    const empties = Object.values(result.sections).filter(s => s === 'empty');
    if (empties.length < 5) return `Expected most sections empty, got ${empties.length}`;
    return null;
  },
});

// Test 2: Complete brief → pass
tests.push({
  name: 'complete brief passes',
  brief: renderBrief({
    project_name: 'Test',
    business_context: { industry: 'SaaS', client: 'Acme', target_audience: 'Devs', site_goal: 'Signups', competitive_positioning: 'Premium' },
    visual_mood: { direction: 'Dark, minimal', keywords: ['clean', 'modern'], anti_references: ['cluttered'] },
    color_direction: { palette_mood: 'cool', primary_intent: 'trust', brand_colors: [{ name: 'blue', hex: '#1a56db' }], status: 'configured' },
    typography: { feel: 'geometric', heading_style: 'bold', body_style: 'readable', font_candidates: ['Inter'], status: 'configured' },
    layout_patterns: { container: 'max-width', grid_style: 'centered', section_rhythm: 'consistent', whitespace: 'generous', mobile_strategy: 'stack' },
    animation_style: { intensity: 'moderate', primary_driver: 'mixed', enter_animations: ['fade'], scroll_behavior: ['parallax'], easing: 'smooth', reduced_motion: 'disable animations' },
    section_plan: [{ page: 'Home', section: 'Hero', approach: 'Video', notes: '' }],
    component_stack: { animated_libraries: ['Magic UI'], utility_libraries: [], matched_playbook: 'SaaS / Tech', custom_additions: [] },
    references: [{ source: 'example.com', type: 'url', takeaway: 'hero style' }],
  }),
  check: (result) => {
    if (result.status !== 'pass') return `Expected pass, got ${result.status}`;
    return null;
  },
});

// Test 3: Subtle + Aceternity → warning
tests.push({
  name: 'subtle intensity with Aceternity triggers warning',
  brief: renderBrief({
    project_name: 'Test',
    business_context: { industry: 'SaaS', client: 'Acme', target_audience: 'Devs', site_goal: 'Signups', competitive_positioning: 'Premium' },
    visual_mood: { direction: 'Light', keywords: ['clean'], anti_references: [] },
    color_direction: { palette_mood: 'cool', primary_intent: 'trust', status: 'configured' },
    typography: { feel: 'geometric', heading_style: 'bold', body_style: 'readable', font_candidates: ['Inter'], status: 'configured' },
    layout_patterns: { container: 'max-width', grid_style: 'centered', section_rhythm: 'consistent', whitespace: 'generous', mobile_strategy: 'stack' },
    animation_style: { intensity: 'subtle', primary_driver: 'interaction', enter_animations: ['fade'], scroll_behavior: [], easing: 'smooth', reduced_motion: 'disable' },
    section_plan: [{ page: 'Home', section: 'Hero', approach: 'Simple', notes: '' }],
    component_stack: { animated_libraries: ['Aceternity UI'], utility_libraries: [], matched_playbook: null, custom_additions: [] },
    references: [{ source: 'test', type: 'description', takeaway: 'test' }],
  }),
  check: (result) => {
    const hasWarning = result.warnings.some(w => w.includes('subtle') && w.includes('Aceternity'));
    if (!hasWarning) return 'Expected warning about subtle + Aceternity';
    return null;
  },
});

let passed = 0;
let failed = 0;

for (const t of tests) {
  const result = validateBrief(t.brief);
  const err = t.check(result);
  if (err) {
    failed++;
    console.error(`FAIL: ${t.name} — ${err}`);
  } else {
    passed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
