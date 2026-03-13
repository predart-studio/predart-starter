# Design Brainstorm Skill Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/design-brainstorm` slash command — 4 Node.js scripts + 1 skill prompt file — that runs a visual design brainstorming session and outputs a structured design brief.

**Architecture:** A Claude Code slash command (`.claude/commands/design-brainstorm.md`) orchestrates the conversation and calls 4 scripts in `scripts/design/`: `match-playbook.js` (business type → component stack), `collect-reference.js` (URL → viewport screenshots + CSS extraction), `scaffold-brief.js` (JSON → design brief markdown), and `validate-brief.js` (completeness + consistency check).

**Tech Stack:** Node.js (CommonJS), Playwright (on-demand for collect-reference), Claude Code slash commands (markdown prompt)

---

## Chunk 1: Foundation Scripts

### Task 1: match-playbook.js

**Files:**
- Create: `scripts/design/match-playbook.js`

- [ ] **Step 1: Write the test script**

Create a simple test runner at `scripts/design/__tests__/match-playbook.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/design/__tests__/match-playbook.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `scripts/design/match-playbook.js`:

```js
'use strict';

const fs = require('fs');
const path = require('path');

const KEYWORD_MAP = {
  'real estate':    'Real Estate',
  'property':       'Real Estate',
  'realtor':        'Real Estate',
  'housing':        'Real Estate',
  'architecture':   'Architecture / Construction',
  'construction':   'Architecture / Construction',
  'building':       'Architecture / Construction',
  'contractor':     'Architecture / Construction',
  'auto':           'Auto Dealership',
  'dealership':     'Auto Dealership',
  'car':            'Auto Dealership',
  'vehicle':        'Auto Dealership',
  'automotive':     'Auto Dealership',
  'production':     'Production / Creative',
  'creative':       'Production / Creative',
  'agency':         'Production / Creative',
  'studio':         'Production / Creative',
  'film':           'Production / Creative',
  'photography':    'Production / Creative',
  'saas':           'SaaS / Tech',
  'tech':           'SaaS / Tech',
  'software':       'SaaS / Tech',
  'startup':        'SaaS / Tech',
  'app':            'SaaS / Tech',
};

// Playbook stacks — sourced from docs/component-libraries.md Section 5
const PLAYBOOKS = {
  'Real Estate': {
    stack: ['Embla', 'yet-another-react-lightbox', 'React Leaflet', 'Magic UI', 'Motion Primitives'],
    reasoning: 'Property galleries (lightbox), location maps, property counters (stats), subtle animations, carousel for property details',
    install_commands: [
      'pnpm add yet-another-react-lightbox',
      'pnpm add react-leaflet leaflet',
      'npx motion-primitives@latest add [name]',
    ],
  },
  'Architecture / Construction': {
    stack: ['Embla', 'yet-another-react-lightbox', 'react-photo-album', 'Smooth UI'],
    reasoning: 'Scroll-pinned project showcases, image galleries, portfolio timelines, subtle polish on hover',
    install_commands: [
      'pnpm add yet-another-react-lightbox',
      'pnpm add react-photo-album',
      'pnpm dlx shadcn@latest add @smoothui/[name]',
    ],
  },
  'Auto Dealership': {
    stack: ['Swiper', 'yet-another-react-lightbox', 'React Leaflet', 'Magic UI'],
    reasoning: '3D car carousels (Swiper), dealer location maps, inventory galleries, background animations for promo sections',
    install_commands: [
      'pnpm add swiper',
      'pnpm add yet-another-react-lightbox',
      'pnpm add react-leaflet leaflet',
    ],
  },
  'Production / Creative': {
    stack: ['Aceternity UI', 'react-photo-album', 'React Player', 'Motion Primitives'],
    reasoning: 'Dramatic hero, showreel/case study videos, portfolio photo grids with scroll choreography, animated text reveals',
    install_commands: [
      'pnpm add react-photo-album',
      'pnpm add react-player',
      'npx motion-primitives@latest add [name]',
    ],
  },
  'SaaS / Tech': {
    stack: ['Aceternity UI', 'Magic UI', 'Motion Primitives', 'Animate UI', 'Smooth UI'],
    reasoning: 'Spotlight heroes, stat counters, animated feature lists, micro-interactions on dashboard preview, fluent transitions',
    install_commands: [
      'npx motion-primitives@latest add [name]',
      'pnpm dlx shadcn@latest add @animate-ui/[name]',
      'pnpm dlx shadcn@latest add @smoothui/[name]',
    ],
  },
};

// Component → Library quick reference (fallback for unmatched types)
const COMPONENT_REFERENCE = {
  'Hero (dramatic)': 'Aceternity UI',
  'Hero (corporate)': 'Tailwind + Framer Motion',
  'Backgrounds (animated)': 'Magic UI',
  'Text reveal': 'Motion Primitives',
  'Counters/stats': 'Magic UI',
  'Scroll animations': 'GSAP + ScrollTrigger',
  'Micro-interactions': 'Animate UI or Framer Motion',
  'Card hover (dramatic)': 'Aceternity UI',
  'Carousels': 'Embla (via shadcn)',
  'Touch carousels': 'Swiper',
  'Galleries': 'yet-another-react-lightbox',
  'Photo grids': 'react-photo-album',
  'Maps': 'React Leaflet or react-map-gl',
  'Forms': 'shadcn + React Hook Form + Zod',
  'Video': 'React Player or Mux Player',
};

function matchPlaybook(input) {
  const normalized = input.toLowerCase().trim();
  const matched = KEYWORD_MAP[normalized] || null;

  if (matched && PLAYBOOKS[matched]) {
    return {
      matched_playbook: matched,
      confidence: 'exact',
      ...PLAYBOOKS[matched],
    };
  }

  return {
    matched_playbook: null,
    confidence: 'none',
    stack: [],
    reasoning: 'No matching playbook found. Use the component reference to pick libraries manually.',
    install_commands: [],
    component_reference: COMPONENT_REFERENCE,
  };
}

// CLI mode
if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node match-playbook.js "<business type>"');
    process.exit(1);
  }
  console.log(JSON.stringify(matchPlaybook(input), null, 2));
}

module.exports = { matchPlaybook, KEYWORD_MAP, PLAYBOOKS, COMPONENT_REFERENCE };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/design/__tests__/match-playbook.test.js`
Expected: all tests pass

- [ ] **Step 5: Run the script in CLI mode to verify JSON output**

Run: `node scripts/design/match-playbook.js "real estate"`
Expected: JSON with matched_playbook "Real Estate" and stack

Run: `node scripts/design/match-playbook.js "bakery"`
Expected: JSON with matched_playbook null and component_reference

- [ ] **Step 6: Commit**

```bash
git add scripts/design/match-playbook.js scripts/design/__tests__/match-playbook.test.js
git commit -m "feat: add match-playbook script for design brainstorm"
```

---

### Task 2: scaffold-brief.js

**Files:**
- Create: `scripts/design/scaffold-brief.js`

- [ ] **Step 1: Write the test**

Create `scripts/design/__tests__/scaffold-brief.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/design/__tests__/scaffold-brief.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `scripts/design/scaffold-brief.js`:

```js
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const BRIEF_PATH = path.join(ROOT, 'docs', 'design-brief.md');
const REFS_DIR = path.join(ROOT, 'docs', 'references');

const P = '[TO BE DECIDED]';

function val(v) {
  return v && v.length !== 0 ? v : P;
}

function listOrPlaceholder(arr) {
  if (!arr || arr.length === 0) return `- ${P}`;
  return arr.map(item => `- ${item}`).join('\n');
}

function renderBrief(data) {
  const name = data.project_name || 'Untitled Project';
  const bc = data.business_context || {};
  const vm = data.visual_mood || {};
  const cd = data.color_direction || {};
  const ty = data.typography || {};
  const lp = data.layout_patterns || {};
  const as = data.animation_style || {};
  const sp = data.section_plan || [];
  const cs = data.component_stack || {};
  const refs = data.references || [];

  // Section plan table
  let sectionTable = '| Page | Section | Approach | Notes |\n|------|---------|----------|-------|\n';
  if (sp.length > 0) {
    sectionTable += sp.map(r => `| ${r.page || ''} | ${r.section || ''} | ${r.approach || ''} | ${r.notes || ''} |`).join('\n');
  } else {
    sectionTable += `| ${P} | ${P} | ${P} | ${P} |`;
  }

  // References table
  let refsTable = '| Source | Type | What to take from it |\n|--------|------|---------------------|\n';
  if (refs.length > 0) {
    refsTable += refs.map(r => `| ${r.source || ''} | ${r.type || ''} | ${r.takeaway || ''} |`).join('\n');
  } else {
    refsTable += `| ${P} | ${P} | ${P} |`;
  }

  // Brand colors
  let brandColorLines = `- ${P}`;
  if (cd.brand_colors && cd.brand_colors.length > 0) {
    brandColorLines = cd.brand_colors.map(c => `- ${c.name || 'unnamed'}: ${c.hex || ''} ${c.oklch ? `(${c.oklch})` : ''}`).join('\n');
  }

  return `# Design Brief: ${name}

## 1. Business Context
- **Industry**: ${val(bc.industry)}
- **Client**: ${val(bc.client)}
- **Target audience**: ${val(bc.target_audience)}
- **Site goal**: ${val(bc.site_goal)}
- **Competitive positioning**: ${val(bc.competitive_positioning)}

## 2. Visual Mood
- **Direction**: ${val(vm.direction)}
- **Keywords**: ${vm.keywords && vm.keywords.length ? vm.keywords.join(', ') : P}
- **Anti-references**: ${vm.anti_references && vm.anti_references.length ? vm.anti_references.join(', ') : P}

## 3. Color Direction
- **Palette mood**: ${val(cd.palette_mood)}
- **Primary intent**: ${val(cd.primary_intent)}
- **Brand colors**:
${brandColorLines}
- **Status**: ${val(cd.status)}

## 4. Typography
- **Feel**: ${val(ty.feel)}
- **Heading style**: ${val(ty.heading_style)}
- **Body style**: ${val(ty.body_style)}
- **Font candidates**: ${ty.font_candidates && ty.font_candidates.length ? ty.font_candidates.join(', ') : P}
- **Status**: ${val(ty.status)}

## 5. Layout Patterns
- **Container**: ${val(lp.container)}
- **Grid style**: ${val(lp.grid_style)}
- **Section rhythm**: ${val(lp.section_rhythm)}
- **Whitespace**: ${val(lp.whitespace)}
- **Mobile strategy**: ${val(lp.mobile_strategy)}

## 6. Animation Style
- **Intensity**: ${val(as.intensity)}
- **Primary driver**: ${val(as.primary_driver)}
- **Enter animations**: ${as.enter_animations && as.enter_animations.length ? as.enter_animations.join(', ') : P}
- **Scroll behavior**: ${as.scroll_behavior && as.scroll_behavior.length ? as.scroll_behavior.join(', ') : P}
- **Easing**: ${val(as.easing)}
- **Reduced motion**: ${val(as.reduced_motion)}

## 7. Section Plan
${sectionTable}

## 8. Component Stack
- **Base**: shadcn/ui
- **Animated libraries**: ${cs.animated_libraries && cs.animated_libraries.length ? cs.animated_libraries.join(', ') : P}
- **Utility libraries**: ${cs.utility_libraries && cs.utility_libraries.length ? cs.utility_libraries.join(', ') : P}
- **Matched playbook**: ${val(cs.matched_playbook)}
- **Custom additions**: ${cs.custom_additions && cs.custom_additions.length ? cs.custom_additions.join(', ') : P}

## 9. References
${refsTable}
`;
}

// CLI mode: reads JSON from stdin
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  let inputJson = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { inputJson += chunk; });
  process.stdin.on('end', () => {
    let data;
    try {
      data = JSON.parse(inputJson);
    } catch (err) {
      console.error('Error: invalid JSON input.');
      process.exit(1);
    }

    const output = renderBrief(data);

    if (dryRun) {
      process.stdout.write(output);
      return;
    }

    // Ensure docs/references/ exists
    if (!fs.existsSync(REFS_DIR)) {
      fs.mkdirSync(REFS_DIR, { recursive: true });
    }

    fs.writeFileSync(BRIEF_PATH, output, 'utf8');
    console.log(`Design brief written to ${BRIEF_PATH}`);
  });
}

module.exports = { renderBrief };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/design/__tests__/scaffold-brief.test.js`
Expected: all tests pass

- [ ] **Step 5: Test CLI mode with dry-run**

Run: `echo '{"project_name":"Test","business_context":{"industry":"SaaS"}}' | node scripts/design/scaffold-brief.js --dry-run`
Expected: markdown output to stdout with "SaaS" filled in

- [ ] **Step 6: Commit**

```bash
git add scripts/design/scaffold-brief.js scripts/design/__tests__/scaffold-brief.test.js
git commit -m "feat: add scaffold-brief script for design brainstorm"
```

---

### Task 3: validate-brief.js

**Files:**
- Create: `scripts/design/validate-brief.js`

- [ ] **Step 1: Write the test**

Create `scripts/design/__tests__/validate-brief.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/design/__tests__/validate-brief.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `scripts/design/validate-brief.js`:

```js
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const BRIEF_PATH = path.join(ROOT, 'docs', 'design-brief.md');
const COMPONENT_LIBS_PATH = path.join(ROOT, 'docs', 'component-libraries.md');
const TOKENS_PATH = path.join(ROOT, 'tokens.json');

const PLACEHOLDER = '[TO BE DECIDED]';

const SECTION_HEADERS = [
  { key: 'business_context', header: '## 1. Business Context' },
  { key: 'visual_mood', header: '## 2. Visual Mood' },
  { key: 'color_direction', header: '## 3. Color Direction' },
  { key: 'typography', header: '## 4. Typography' },
  { key: 'layout_patterns', header: '## 5. Layout Patterns' },
  { key: 'animation_style', header: '## 6. Animation Style' },
  { key: 'section_plan', header: '## 7. Section Plan' },
  { key: 'component_stack', header: '## 8. Component Stack' },
  { key: 'references', header: '## 9. References' },
];

function extractSection(content, header, nextHeader) {
  const start = content.indexOf(header);
  if (start === -1) return '';
  const end = nextHeader ? content.indexOf(nextHeader, start) : content.length;
  return content.substring(start + header.length, end === -1 ? content.length : end).trim();
}

function classifySection(sectionContent) {
  if (!sectionContent) return 'empty';
  const lines = sectionContent.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return 'empty';

  const contentLines = lines.filter(l => !l.startsWith('|---') && !l.startsWith('| Page') && !l.startsWith('| Source'));
  const placeholderCount = contentLines.filter(l => l.includes(PLACEHOLDER)).length;
  const totalContent = contentLines.length;

  if (placeholderCount === 0) return 'complete';
  if (placeholderCount < totalContent) return 'partial';
  return 'empty';
}

function getKnownLibraries() {
  try {
    const content = fs.readFileSync(COMPONENT_LIBS_PATH, 'utf8');
    const libs = [];
    // Extract library names from markdown tables and headers
    const patterns = [
      /\*\*([^*]+)\*\*/g,  // bold names in tables
    ];
    for (const p of patterns) {
      let m;
      while ((m = p.exec(content)) !== null) {
        libs.push(m[1].trim());
      }
    }
    // Also add always-available libs
    libs.push('shadcn/ui', 'Framer Motion', 'GSAP', 'ScrollTrigger', 'Lenis', 'Phosphor Icons', 'Embla Carousel', 'React Hook Form', 'Zod', 'next-themes');
    return [...new Set(libs)];
  } catch {
    return [];
  }
}

function validateBrief(briefContent) {
  const sections = {};
  for (let i = 0; i < SECTION_HEADERS.length; i++) {
    const nextHeader = i + 1 < SECTION_HEADERS.length ? SECTION_HEADERS[i + 1].header : null;
    const sectionContent = extractSection(briefContent, SECTION_HEADERS[i].header, nextHeader);
    sections[SECTION_HEADERS[i].key] = classifySection(sectionContent);
  }

  const warnings = [];

  // Extract animation intensity
  const intensityMatch = briefContent.match(/\*\*Intensity\*\*:\s*(\w+)/);
  const intensity = intensityMatch ? intensityMatch[1].toLowerCase() : null;

  // Extract component stack animated libraries line
  const animLibsMatch = briefContent.match(/\*\*Animated libraries\*\*:\s*(.+)/);
  const animLibs = animLibsMatch ? animLibsMatch[1] : '';

  // Extract primary driver
  const driverMatch = briefContent.match(/\*\*Primary driver\*\*:\s*(.+)/);
  const driver = driverMatch ? driverMatch[1].toLowerCase() : '';

  // Extract scroll behavior
  const scrollMatch = briefContent.match(/\*\*Scroll behavior\*\*:\s*(.+)/);
  const scrollBehavior = scrollMatch ? scrollMatch[1] : '';

  // Consistency checks
  if (intensity === 'subtle' && animLibs.includes('Aceternity UI')) {
    warnings.push('Animation intensity is "subtle" but component stack includes Aceternity UI (typically dramatic)');
  }
  if (intensity === 'subtle' && driver.includes('scroll')) {
    warnings.push('Animation intensity is "subtle" but primary driver is scroll-driven GSAP (typically dramatic)');
  }
  if (intensity === 'dramatic' && !animLibs.includes(PLACEHOLDER) && animLibs === '') {
    warnings.push('Animation intensity is "dramatic" but no animated libraries are specified');
  }
  if (scrollBehavior && !scrollBehavior.includes(PLACEHOLDER) && scrollBehavior.trim() !== '' && !animLibs.includes('GSAP') && !briefContent.includes('GSAP')) {
    warnings.push('Scroll behavior is specified but GSAP is not in the component stack');
  }
  // Framer + scroll driver inconsistency
  const enterAnims = briefContent.match(/\*\*Enter animations\*\*:\s*(.+)/);
  const hasFramerAnims = enterAnims && (enterAnims[1].includes('layout') || enterAnims[1].includes('gesture') || enterAnims[1].includes('drag'));
  if (hasFramerAnims && driver === 'scroll') {
    warnings.push('Framer-specific animations specified but primary driver is "scroll" — consider "mixed"');
  }

  // Check tokens.json vs brief status
  try {
    const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
    const isCustomized = tokens.light && tokens.light.primary && !tokens.light.primary.includes('0.546');
    const colorStatus = briefContent.match(/\*\*Status\*\*:\s*(needs.new.client|configured)/i);
    if (isCustomized && colorStatus && colorStatus[1].includes('needs')) {
      warnings.push('Color status is "needs new-client" but tokens.json appears already customized');
    }
  } catch { /* tokens.json not found or unreadable — skip */ }

  // Check for unknown libraries
  const knownLibs = getKnownLibraries();
  if (knownLibs.length > 0 && animLibs && !animLibs.includes(PLACEHOLDER)) {
    const mentioned = animLibs.split(',').map(s => s.trim()).filter(Boolean);
    for (const lib of mentioned) {
      if (!knownLibs.some(k => k.toLowerCase() === lib.toLowerCase())) {
        warnings.push(`Component "${lib}" not found in component-libraries.md`);
      }
    }
  }

  const hasEmpty = Object.values(sections).some(s => s === 'empty');

  return {
    status: hasEmpty ? 'fail' : 'pass',
    sections,
    warnings,
  };
}

// CLI mode
if (require.main === module) {
  const briefPath = process.argv[2] || BRIEF_PATH;

  let content;
  try {
    content = fs.readFileSync(briefPath, 'utf8');
  } catch (err) {
    console.error(`Error: cannot read ${briefPath}`);
    process.exit(1);
  }

  const result = validateBrief(content);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'pass' ? 0 : 1);
}

module.exports = { validateBrief };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/design/__tests__/validate-brief.test.js`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add scripts/design/validate-brief.js scripts/design/__tests__/validate-brief.test.js
git commit -m "feat: add validate-brief script for design brainstorm"
```

---

## Chunk 2: Reference Collection + Skill Prompt

### Task 4: collect-reference.js

**Files:**
- Create: `scripts/design/collect-reference.js`

- [ ] **Step 1: Write the implementation**

Note: This script requires Playwright which is an on-demand dependency. Tests are manual (run against a real URL). The script is designed to fail gracefully if Playwright isn't installed.

Create `scripts/design/collect-reference.js`:

```js
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const REFS_DIR = path.join(ROOT, 'docs', 'references');

const MAX_SCREENSHOTS = 8;
const NAV_TIMEOUT = 15000;
const DESKTOP_VP = { width: 1440, height: 900 };
const MOBILE_VP = { width: 390, height: 844 };

// Selectors for CSS extraction (semantic elements, capped at 200 nodes)
const CSS_SELECTORS = 'h1, h2, h3, h4, h5, h6, p, a, button, section, header, footer, nav, main, [class]';
const MAX_NODES = 200;
const CSS_PROPS = ['color', 'background-color', 'font-family', 'font-size', 'font-weight', 'border-radius', 'padding', 'margin', 'gap'];

// Map raw CSS property names to spec-defined friendly keys
const PROP_REMAP = {
  'color': 'colors',
  'background-color': 'colors',  // merged with color
  'font-family': 'fonts',
  'font-size': 'font_sizes',
  'font-weight': 'font_weights',
  'border-radius': 'border_radius',
  'padding': 'spacing_common',
  'margin': 'spacing_common',
  'gap': 'spacing_common',
};
const DEFAULT_FILTERS = {
  'color': ['rgb(0, 0, 0)', 'rgba(0, 0, 0, 0)', 'rgb(0, 0, 0, 0)'],
  'background-color': ['rgba(0, 0, 0, 0)', 'rgb(0, 0, 0, 0)', 'transparent'],
  'font-family': ['Times New Roman', 'serif'],
  'font-size': [],
  'font-weight': [],
  'border-radius': ['0px'],
};

function urlToSlug(urlStr) {
  const url = new URL(urlStr);
  // Use domain name without TLD: "example.com" → "example", "sub.example.co.uk" → "sub-example"
  const parts = url.hostname.replace(/^www\./, '').split('.');
  const domain = parts.length > 2 ? parts.slice(0, -2).join('-') : parts[0];
  const pathSlug = url.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  return pathSlug ? `${domain}-${pathSlug}` : domain;
}

async function dismissOverlays(page) {
  const patterns = ['accept', 'dismiss', 'close', 'got it', 'agree', 'ok', 'i agree'];
  try {
    const buttons = await page.$$('button, [role="button"], a');
    for (const btn of buttons.slice(0, 20)) {
      const text = await btn.textContent().catch(() => '');
      if (text && patterns.some(p => text.toLowerCase().includes(p))) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(500);
        break;
      }
    }
  } catch {
    // Overlay dismissal is best-effort
  }
}

async function extractCSS(page) {
  const raw = await page.evaluate(({ selectors, maxNodes, props, filters }) => {
    const elements = Array.from(document.querySelectorAll(selectors)).slice(0, maxNodes);
    const result = {};
    for (const prop of props) {
      const freq = {};
      for (const el of elements) {
        const val = getComputedStyle(el)[prop];
        if (!val) continue;
        const cleaned = val.replace(/"/g, '').trim();
        if (filters[prop] && filters[prop].includes(cleaned)) continue;
        freq[cleaned] = (freq[cleaned] || 0) + 1;
      }
      result[prop] = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([value, frequency]) => ({ value, frequency }));
    }
    return result;
  }, { selectors: CSS_SELECTORS, maxNodes: MAX_NODES, props: CSS_PROPS, filters: DEFAULT_FILTERS });

  // Remap to spec-friendly keys, merging related properties
  const remapped = {};
  for (const [prop, entries] of Object.entries(raw)) {
    const key = PROP_REMAP[prop] || prop;
    if (!remapped[key]) remapped[key] = [];
    remapped[key].push(...entries);
  }
  // Deduplicate and re-sort each key
  for (const key of Object.keys(remapped)) {
    const freq = {};
    for (const { value, frequency } of remapped[key]) {
      freq[value] = (freq[value] || 0) + frequency;
    }
    remapped[key] = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, frequency]) => ({ value, frequency }));
  }
  return remapped;
}

async function captureViewports(page, slug, prefix, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(1000);

  const screenshots = [];
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const vpHeight = viewport.height;
  const maxScrolls = Math.min(MAX_SCREENSHOTS, Math.ceil(scrollHeight / vpHeight));

  for (let i = 0; i < maxScrolls; i++) {
    const y = i * vpHeight;
    await page.evaluate(scrollY => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(300);

    const filename = `${slug}-${prefix}-${i + 1}.png`;
    const filepath = path.join(REFS_DIR, filename);
    await page.screenshot({ path: filepath, type: 'png' });
    screenshots.push(`docs/references/${filename}`);
  }

  // Scroll back to top for CSS extraction
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const cssSignals = await extractCSS(page);

  return { viewport_count: screenshots.length, screenshots, css_signals: cssSignals };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node collect-reference.js <url>');
    process.exit(1);
  }

  // Check Playwright availability
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error(JSON.stringify({
      error: 'playwright_not_found',
      message: 'Playwright not found. Run: pnpm add -D playwright && npx playwright install chromium',
    }));
    process.exit(1);
  }

  // Ensure refs directory exists
  if (!fs.existsSync(REFS_DIR)) {
    fs.mkdirSync(REFS_DIR, { recursive: true });
  }

  const slug = urlToSlug(url);
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
    } catch (navErr) {
      // Timeout or network error — try with just domcontentloaded
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      } catch {
        console.log(JSON.stringify({ error: 'timeout', url, message: navErr.message }));
        await browser.close();
        process.exit(1);
      }
    }

    // Check for redirect
    const finalUrl = page.url();
    const redirected = new URL(finalUrl).hostname !== new URL(url).hostname;

    // Dismiss overlays
    await dismissOverlays(page);

    // Capture desktop
    const desktop = await captureViewports(page, slug, 'desktop', DESKTOP_VP);

    // Capture mobile
    const mobile = await captureViewports(page, slug, 'mobile', MOBILE_VP);

    // Save signals
    const signalsPath = path.join(REFS_DIR, `${slug}-signals.json`);
    fs.writeFileSync(signalsPath, JSON.stringify({ desktop: desktop.css_signals, mobile: mobile.css_signals }, null, 2));

    const result = {
      url,
      final_url: redirected ? finalUrl : undefined,
      domain: new URL(url).hostname,
      slug,
      desktop: { viewport_count: desktop.viewport_count, screenshots: desktop.screenshots, css_signals: desktop.css_signals },
      mobile: { viewport_count: mobile.viewport_count, screenshots: mobile.screenshots, css_signals: mobile.css_signals },
    };
    if (redirected) {
      result.warning = `Redirected from ${url} to ${finalUrl}`;
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(JSON.stringify({ error: 'unexpected', url, message: err.message }));
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
```

- [ ] **Step 2: Test with a real URL (manual)**

Run: `node scripts/design/collect-reference.js "https://example.com"`
Expected: JSON output with screenshot paths and CSS signals. Screenshots saved to `docs/references/`.

If Playwright not installed, expected: JSON error with install instructions.

- [ ] **Step 3: Commit**

```bash
git add scripts/design/collect-reference.js
git commit -m "feat: add collect-reference script for design brainstorm"
```

---

### Task 5: The Slash Command Skill File

**Files:**
- Create: `.claude/commands/design-brainstorm.md`

- [ ] **Step 1: Create the .claude/commands directory**

Run: `mkdir -p .claude/commands`

- [ ] **Step 2: Write the skill prompt file**

Create `.claude/commands/design-brainstorm.md`:

```markdown
---
description: Run a visual design brainstorming session before implementation. Collects inspiration, converges on visual direction, outputs a design brief.
---

# Design Brainstorm

You are running an interactive design brainstorming session. Your goal is to help the user converge on a visual design direction and produce a structured design brief at `docs/design-brief.md`.

## Context Detection (Do this first, silently)

1. Check if `tokens.json` and `docs/component-libraries.md` exist → Predart project
2. Check if tokens.json has been customized (not default Inter/blue) → `new-client` already run
3. Check if `docs/design-brief.md` exists → resume previous brainstorm
4. If resuming, read the existing brief and tell the user what's already decided

## Phase 1 — The Dump

Start with:
> "Let's design this thing. Show me everything you've got — business type, reference sites, screenshots, Figma links, descriptions of the vibe you want, components you like, or anything that captures what you're going for. I'll organize it all. Drop as much or as little as you have."

Accept multiple rounds of input. For each URL the user shares, run:
```bash
node scripts/design/collect-reference.js "<url>"
```
Then read the saved screenshots from `docs/references/` to analyze them visually.

For screenshots/images the user pastes directly, analyze them with your multimodal capabilities.

For Figma links, use the Figma MCP tools (`get_design_context`, `get_screenshot`) if available. If not, ask the user to paste screenshots.

After each round of input, reflect back a summary organized by the 9 brief areas:
1. Business Context
2. Visual Mood
3. Color Direction
4. Typography
5. Layout Patterns
6. Animation Style
7. Section Plan
8. Component Stack
9. References

When the user says they're done sharing, move to Phase 2.

## Phase 2 — Gap Analysis

Run the playbook matcher if business type was mentioned:
```bash
node scripts/design/match-playbook.js "<business type>"
```

Show the user a clear breakdown:
- **Covered**: areas with enough input to make decisions
- **Missing**: areas that need more input
- **Playbook recommendation**: if a matching playbook was found

## Phase 3 — Targeted Follow-ups

For each missing area, ask ONE question at a time. Rules:
- Multiple choice preferred
- Use the visual companion browser for visual questions (layout comparisons, animation style demos, color mood boards)
- Use terminal for conceptual questions (business goals, content strategy)
- Never ask about something the user already covered in the dump

## Phase 4 — Generate the Brief

Once all areas are at least partially covered:

1. Preview with dry-run:
```bash
echo '<brief JSON>' | node scripts/design/scaffold-brief.js --dry-run
```

2. Show the preview to the user and ask for approval

3. On approval, write the file:
```bash
echo '<brief JSON>' | node scripts/design/scaffold-brief.js
```

4. Validate:
```bash
node scripts/design/validate-brief.js
```

5. If validation warnings exist, show them and ask if adjustments are needed

## Phase 5 — Handoff

1. If color/font decisions were made and `new-client` hasn't been run, suggest exact values:
   > "Your brief specifies [font] and [color]. Run `pnpm new-client` and use these values to set up the project."

2. Add to CLAUDE.md (only if `## Design Brief` section doesn't already exist):
   ```
   ## Design Brief
   Read `docs/design-brief.md` before implementing any UI components. Follow the visual direction, animation style, and component stack specified in the brief.
   ```

3. Commit the brief:
   ```bash
   git add docs/design-brief.md docs/references/
   git commit -m "docs: add design brief from brainstorming session"
   ```

4. Tell the user:
   > "Design brief saved and committed. When you're ready, use the `writing-plans` skill to create the implementation plan from this brief."

## Important Rules

- **ONE question at a time** during follow-ups
- **Never skip the dump phase** — always let the user share freely first
- **Never start coding** — this skill only produces the design brief
- **Reflect back often** — summarize what you're hearing so the user can correct course
- **Use the playbooks** — when a business type matches, lead with the playbook recommendation
- **Accept "I don't know"** — if the user is unsure about an area, make a recommendation based on the business type and references, and let them approve or adjust
```

- [ ] **Step 3: Verify the slash command is accessible**

Run: `ls -la .claude/commands/design-brainstorm.md`
Expected: file exists

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/design-brainstorm.md
git commit -m "feat: add /design-brainstorm slash command skill"
```

---

### Task 6: Integration — CLAUDE.md and .gitignore updates

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.gitignore`

- [ ] **Step 1: Add design brainstorm section to CLAUDE.md**

Add after the `## Scripts` section in `CLAUDE.md`:

```markdown
## Design Brainstorm
Run `/design-brainstorm` before implementing any new frontend project. This runs an interactive session that produces `docs/design-brief.md` — the visual direction guide for implementation. The brief covers: business context, visual mood, color, typography, layout, animation style, section plan, component stack, and references.

Scripts in `scripts/design/`:
- `collect-reference.js <url>` — captures viewport screenshots + CSS signals (requires Playwright)
- `match-playbook.js "<type>"` — matches business type to component stack playbook
- `scaffold-brief.js` — generates design-brief.md from JSON (stdin)
- `validate-brief.js` — validates brief completeness and consistency
```

- [ ] **Step 2: Add .superpowers/ to .gitignore**

Check if `.superpowers/` is already in `.gitignore`. If not, add it. (The visual companion brainstorming server saves session files to `.superpowers/brainstorm/`.)

- [ ] **Step 3: Add docs/references/ patterns to .gitignore**

Add `docs/references/*.json` to `.gitignore` (keep screenshots tracked, exclude extracted signal data).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md .gitignore
git commit -m "docs: add design brainstorm workflow to CLAUDE.md and update .gitignore"
```

---

### Task 7: Run all tests and verify end-to-end

- [ ] **Step 1: Run all test files**

```bash
node scripts/design/__tests__/match-playbook.test.js
node scripts/design/__tests__/scaffold-brief.test.js
node scripts/design/__tests__/validate-brief.test.js
```

Expected: all pass

- [ ] **Step 2: End-to-end smoke test**

```bash
# Match a playbook
node scripts/design/match-playbook.js "saas"

# Scaffold a brief with dry-run
echo '{"project_name":"Smoke Test","business_context":{"industry":"SaaS","client":"Test Corp"}}' | node scripts/design/scaffold-brief.js --dry-run

# Write it for real
echo '{"project_name":"Smoke Test","business_context":{"industry":"SaaS","client":"Test Corp"}}' | node scripts/design/scaffold-brief.js

# Validate it (should fail — most sections empty)
node scripts/design/validate-brief.js || echo "Expected: validation failed (incomplete brief)"

# Clean up
rm docs/design-brief.md
```

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues from end-to-end testing"
```
