'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTEXT_DIR = path.join(ROOT, 'docs', 'project-context');
const REFERENCES_DIR = path.join(CONTEXT_DIR, 'references');
const PROFILE_PATH = path.join(CONTEXT_DIR, 'project-profile.json');
const NOTES_PATH = path.join(CONTEXT_DIR, 'bootstrap-notes.md');

const FILES = [
  '01-project-context.md',
  '02-design-direction.md',
  '03-motion-direction.md',
  '04-implementation-direction.md',
  '05-build-init-prompt.md',
  '06-template-usage-rules.md',
  '07-reference-notes.md',
];

function exists(p) {
  return fs.existsSync(p);
}

function read(file) {
  return fs.readFileSync(path.join(CONTEXT_DIR, file), 'utf8');
}

function readIfExists(file) {
  const p = path.join(CONTEXT_DIR, file);
  return exists(p) ? fs.readFileSync(p, 'utf8') : '';
}

function readHeadings(content) {
  return content
    .split(/\r?\n/)
    .filter(line => /^#/.test(line.trim()))
    .slice(0, 12)
    .map(line => line.trim());
}

function bulletListAfterHeading(content, heading) {
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex(line => line.trim().toLowerCase() === heading.trim().toLowerCase());
  if (idx === -1) return [];
  const out = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (out.length) break;
      continue;
    }
    if (/^#/.test(line) || /^##/.test(line)) break;
    if (/^-\s+/.test(line)) out.push(line.replace(/^-\s+/, '').trim());
    else if (out.length) break;
  }
  return out;
}

function cleanInlineMarkdown(value) {
  return String(value || '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();
}

function extractLabeledValue(content, label) {
  const re = new RegExp(`(?:\\*\\*)?${label}(?:\\*\\*)?:\\s*(.+)`, 'i');
  const m = content.match(re);
  return m ? cleanInlineMarkdown(m[1]) : null;
}

function inferProjectType(all) {
  const lower = all.toLowerCase();
  if (lower.includes('presentation site') || lower.includes('presentation website')) return 'presentation-site';
  if (lower.includes('saas')) return 'saas';
  if (lower.includes('portfolio')) return 'portfolio';
  if (lower.includes('studio site')) return 'studio-site';
  if (lower.includes('marketing site')) return 'marketing-site';
  return 'website';
}

function inferMotionMode(motionContent) {
  const lower = motionContent.toLowerCase();
  if (lower.includes('restrained')) return 'restrained';
  if (lower.includes('dramatic')) return 'dramatic';
  return 'moderate';
}

function inferVisualMode(designContent) {
  const lower = designContent.toLowerCase();
  const parts = [];
  for (const token of ['architectural', 'editorial', 'premium', 'metropolitan', 'minimal']) {
    if (lower.includes(token)) parts.push(token);
  }
  return parts.length ? parts.join('-') : 'custom';
}

function inferLibraries(implContent, motionContent, usageContent) {
  const all = [implContent, motionContent, usageContent].join('\n').toLowerCase();
  const approved = [];
  const optional = [];
  const outOfScope = [];

  if (all.includes('framer motion')) approved.push('framer-motion');
  if (all.includes('shadcn/ui')) approved.push('shadcn/ui');

  if (all.includes('gsap') || all.includes('scrolltrigger')) optional.push('gsap');
  if (all.includes('lenis')) optional.push('lenis');
  if (all.includes('gallery')) optional.push('embla-carousel-react');
  if (all.includes('map')) optional.push('map-tooling');

  for (const lib of ['aceternity ui', 'magic ui', 'cult ui']) {
    if (all.includes(lib)) outOfScope.push(lib.replace(/\s+/g, '-'));
  }

  return {
    approved: [...new Set(approved)],
    optional: [...new Set(optional)],
    outOfScope: [...new Set(outOfScope)],
  };
}

function countFiles(dir, exts = []) {
  if (!exists(dir)) return 0;
  const files = fs.readdirSync(dir);
  if (!exts.length) return files.length;
  return files.filter(file => exts.some(ext => file.toLowerCase().endsWith(ext))).length;
}

function summarize() {
  const result = {
    contextDir: CONTEXT_DIR,
    exists: exists(CONTEXT_DIR),
    present: [],
    missing: [],
    referencesDir: REFERENCES_DIR,
    profilePath: PROFILE_PATH,
    notesPath: NOTES_PATH,
  };

  if (!result.exists) return result;

  for (const file of FILES) {
    const full = path.join(CONTEXT_DIR, file);
    if (exists(full)) {
      const content = fs.readFileSync(full, 'utf8');
      result.present.push({ file, headings: readHeadings(content) });
    } else {
      result.missing.push(file);
    }
  }

  return result;
}

function buildProfile() {
  const project = readIfExists('01-project-context.md');
  const design = readIfExists('02-design-direction.md');
  const motion = readIfExists('03-motion-direction.md');
  const impl = readIfExists('04-implementation-direction.md');
  const build = readIfExists('05-build-init-prompt.md');
  const usage = readIfExists('06-template-usage-rules.md');
  const refs = readIfExists('07-reference-notes.md');
  const all = [project, design, motion, impl, build, usage, refs].join('\n');

  const libraries = inferLibraries(impl, motion, usage);

  const profile = {
    generatedAt: new Date().toISOString(),
    projectType: inferProjectType(all),
    client: extractLabeledValue(project, 'Client') || null,
    projectName: extractLabeledValue(project, 'Project name') || extractLabeledValue(project, 'Project') || null,
    primaryGoal: extractLabeledValue(project, 'Primary goal') || null,
    primaryCTA: extractLabeledValue(project, 'Primary CTA') || null,
    visualMode: inferVisualMode(design),
    motionMode: inferMotionMode(motion),
    animation: {
      primary: libraries.approved.includes('framer-motion') ? 'framer-motion' : null,
      secondary: libraries.optional.includes('gsap') ? 'gsap-optional' : null,
      lenis: libraries.optional.includes('lenis') ? 'optional' : 'off-by-default',
    },
    starterUsage: {
      usePrimitives: /primitive/i.test(impl + usage),
      customSections: /custom sections?|custom hero|custom image/i.test(impl),
      hardcodeTokens: false,
    },
    libraries,
    references: {
      visualCount: countFiles(path.join(REFERENCES_DIR, 'visual'), ['.png', '.jpg', '.jpeg', '.webp']),
      motionCount: countFiles(path.join(REFERENCES_DIR, 'motion'), ['.png', '.jpg', '.jpeg', '.webp']),
      pdfCount: countFiles(path.join(REFERENCES_DIR, 'pdf'), ['.png', '.jpg', '.jpeg', '.webp']),
    },
    packStatus: {
      requiredPresent: FILES.slice(0, 6).every(file => exists(path.join(CONTEXT_DIR, file))),
      missing: FILES.filter(file => !exists(path.join(CONTEXT_DIR, file))),
    },
  };

  return profile;
}

function writeOutputs(profile) {
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2) + '\n');

  const lines = [
    '# Bootstrap Notes',
    '',
    `- **Project type:** ${profile.projectType}`,
    `- **Client:** ${profile.client || 'unknown'}`,
    `- **Primary goal:** ${profile.primaryGoal || 'unknown'}`,
    `- **Primary CTA:** ${profile.primaryCTA || 'unknown'}`,
    `- **Visual mode:** ${profile.visualMode}`,
    `- **Motion mode:** ${profile.motionMode}`,
    '',
    '## Starter Fit',
    `- **Approved libraries:** ${profile.libraries.approved.join(', ') || 'none detected'}`,
    `- **Optional libraries:** ${profile.libraries.optional.join(', ') || 'none detected'}`,
    `- **Out of scope:** ${profile.libraries.outOfScope.join(', ') || 'none detected'}`,
    '',
    '## Reference Coverage',
    `- Visual refs: ${profile.references.visualCount}`,
    `- Motion refs: ${profile.references.motionCount}`,
    `- PDF refs: ${profile.references.pdfCount}`,
    '',
    '## Guidance',
    '- Respect tokens.json and the token workflow',
    '- Prefer starter primitives only where they serve the project',
    '- Build custom sections for the core storytelling experience',
    '- Keep the stack aligned with the project, not the full starter surface area',
    '',
  ];

  fs.writeFileSync(NOTES_PATH, lines.join('\n'));
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
  }

  if (summary.missing.length) {
    console.log('\nMissing files:');
    for (const file of summary.missing) console.log(`- ${file}`);
  }

  const profile = buildProfile();
  writeOutputs(profile);

  console.log('\nInferred project profile:');
  console.log(`- Project type: ${profile.projectType}`);
  console.log(`- Visual mode: ${profile.visualMode}`);
  console.log(`- Motion mode: ${profile.motionMode}`);
  console.log(`- Approved libraries: ${profile.libraries.approved.join(', ') || 'none detected'}`);
  console.log(`- Optional libraries: ${profile.libraries.optional.join(', ') || 'none detected'}`);
  console.log(`- Out of scope: ${profile.libraries.outOfScope.join(', ') || 'none detected'}`);
  console.log(`- Reference coverage: visual ${profile.references.visualCount}, motion ${profile.references.motionCount}, pdf ${profile.references.pdfCount}`);
  console.log(`\nWrote: ${PROFILE_PATH}`);
  console.log(`Wrote: ${NOTES_PATH}`);
  console.log('\nThis helper is intentionally lightweight. It interprets the pack, writes a machine-readable project profile, and generates bootstrap notes before implementation starts.');
}

module.exports = { summarize, buildProfile, writeOutputs };
