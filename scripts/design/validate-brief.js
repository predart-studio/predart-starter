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
    const patterns = [
      /\*\*([^*]+)\*\*/g,
    ];
    for (const p of patterns) {
      let m;
      while ((m = p.exec(content)) !== null) {
        libs.push(m[1].trim());
      }
    }
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

  const intensityMatch = briefContent.match(/\*\*Intensity\*\*:\s*(\w+)/);
  const intensity = intensityMatch ? intensityMatch[1].toLowerCase() : null;

  const animLibsMatch = briefContent.match(/\*\*Animated libraries\*\*:\s*(.+)/);
  const animLibs = animLibsMatch ? animLibsMatch[1] : '';

  const driverMatch = briefContent.match(/\*\*Primary driver\*\*:\s*(.+)/);
  const driver = driverMatch ? driverMatch[1].toLowerCase() : '';

  const scrollMatch = briefContent.match(/\*\*Scroll behavior\*\*:\s*(.+)/);
  const scrollBehavior = scrollMatch ? scrollMatch[1] : '';

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

  const enterAnims = briefContent.match(/\*\*Enter animations\*\*:\s*(.+)/);
  const hasFramerAnims = enterAnims && (enterAnims[1].includes('layout') || enterAnims[1].includes('gesture') || enterAnims[1].includes('drag'));
  if (hasFramerAnims && driver === 'scroll') {
    warnings.push('Framer-specific animations specified but primary driver is "scroll" — consider "mixed"');
  }

  try {
    const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
    const isCustomized = tokens.light && tokens.light.primary && !tokens.light.primary.includes('0.546');
    const colorStatus = briefContent.match(/\*\*Status\*\*:\s*(needs.new.client|configured)/i);
    if (isCustomized && colorStatus && colorStatus[1].includes('needs')) {
      warnings.push('Color status is "needs new-client" but tokens.json appears already customized');
    }
  } catch { /* tokens.json not found or unreadable — skip */ }

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
