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
