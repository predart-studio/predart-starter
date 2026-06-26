const fs = require('fs');
const path = require('path');

const tokensPath = path.join(__dirname, '..', 'tokens.json');
const outputPath = path.join(__dirname, '..', 'app', 'globals.css');
const motionOutputPath = path.join(__dirname, '..', 'lib', 'motion.generated.ts');

/**
 * Build the globals.css content from a tokens object.
 * Exported so tests can call it without side effects.
 * @param {object} tokens
 * @returns {string}
 */
function buildCss(tokens) {
  // Generate @theme inline color mappings from all keys in tokens.light
  const themeColorLines = Object.keys(tokens.light)
    .map(key => `  --color-${key}: var(--${key});`)
    .join('\n');

  // Generate :root variables from tokens.light
  const rootLines = Object.keys(tokens.light)
    .map(key => `  --${key}: ${tokens.light[key]};`)
    .join('\n');

  // Generate .dark variables from tokens.dark
  const darkLines = Object.keys(tokens.dark)
    .map(key => `  --${key}: ${tokens.dark[key]};`)
    .join('\n');

  // --- Type scale (back-compat guarded) ---
  let typeLines = '';
  if (tokens.type && typeof tokens.type === 'object') {
    typeLines = '\n  /* Type scale */\n';
    for (const [name, val] of Object.entries(tokens.type)) {
      typeLines += `  --text-${name}: ${val.size};\n`;
      typeLines += `  --text-${name}--line-height: ${val.leading};\n`;
      typeLines += `  --text-${name}--letter-spacing: ${val.tracking};\n`;
      typeLines += `  --text-${name}--font-weight: ${val.weight};\n`;
    }
  }

  // --- Spacing (back-compat guarded) ---
  let spacingLines = '';
  if (tokens.space && typeof tokens.space === 'object') {
    spacingLines = '\n  /* Spacing */\n';
    for (const [key, val] of Object.entries(tokens.space)) {
      if (key === 'content-max') {
        spacingLines += `  --container-content: ${val};\n`;
      } else {
        spacingLines += `  --spacing-${key}: ${val};\n`;
      }
    }
  }

  // --- Grid (back-compat guarded) ---
  let gridLines = '';
  if (tokens.grid && typeof tokens.grid === 'object') {
    gridLines = '\n  /* Grid */\n';
    for (const [key, val] of Object.entries(tokens.grid)) {
      gridLines += `  --grid-${key}: ${val};\n`;
    }
  }

  // --- Motion (back-compat guarded) ---
  let motionLines = '';
  if (tokens.motion && typeof tokens.motion === 'object') {
    motionLines = '\n  /* Motion */\n';
    for (const [key, val] of Object.entries(tokens.motion)) {
      if (key === 'ease-house') {
        motionLines += `  --ease-house: ${val};\n`;
      } else if (key.startsWith('duration-')) {
        motionLines += `  --${key}: ${val};\n`;
      }
    }
  }

  return `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
${themeColorLines}
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);${typeLines}${spacingLines}${gridLines}${motionLines}}

:root {
${rootLines}
  --radius: ${tokens.radius};
}

.dark {
${darkLines}
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
`;
}

/**
 * Build the lib/motion.generated.ts content from a tokens object.
 * Exported so tests can call it without side effects.
 * @param {object} tokens
 * @returns {string}
 */
function buildMotionTs(tokens) {
  const motion = (tokens.motion && typeof tokens.motion === 'object') ? tokens.motion : {};

  // Parse ease-house cubic-bezier values
  const easeHouseStr = motion['ease-house'] || 'cubic-bezier(0.22, 1, 0.36, 1)';
  const easeMatch = easeHouseStr.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
  const easeValues = easeMatch
    ? [parseFloat(easeMatch[1]), parseFloat(easeMatch[2]), parseFloat(easeMatch[3]), parseFloat(easeMatch[4])]
    : [0.22, 1, 0.36, 1];

  // Parse duration values (strip trailing 's')
  const parseDuration = (key) => {
    const raw = motion[key] || '0s';
    return parseFloat(raw);
  };

  const fast = parseDuration('duration-fast');
  const base = parseDuration('duration-base');
  const slow = parseDuration('duration-slow');

  return `// GENERATED — do not edit. Run \`pnpm tokens\` to regenerate.
// Source: tokens.json > motion

/** House easing — cubic-bezier control points as [x1, y1, x2, y2]. */
export const EASE_HOUSE = [${easeValues.join(', ')}] as const;

/** CSS cubic-bezier string for GSAP / Framer Motion ease prop. */
export const EASE_HOUSE_CSS = "${easeHouseStr}" as const;

/** Duration constants in seconds. */
export const DURATION = {
  fast: ${fast},
  base: ${base},
  slow: ${slow},
} as const;
`;
}

/**
 * Main: read tokens, write globals.css and lib/motion.generated.ts.
 */
function main() {
  let tokens;
  try {
    const raw = fs.readFileSync(tokensPath, 'utf8');
    tokens = JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Error: tokens.json not found at project root.');
      process.exit(1);
    }
    console.error('Error: tokens.json contains malformed JSON.\n' + err.message);
    process.exit(1);
  }

  if (!tokens.light || typeof tokens.light !== 'object') {
    console.error('Error: tokens.json is missing the "light" section.');
    process.exit(1);
  }

  if (!tokens.dark || typeof tokens.dark !== 'object') {
    console.error('Error: tokens.json is missing the "dark" section.');
    process.exit(1);
  }

  if (!tokens.radius) {
    console.error('Error: tokens.json is missing the "radius" value.');
    process.exit(1);
  }

  const css = buildCss(tokens);
  fs.writeFileSync(outputPath, css, 'utf8');
  console.log('Tokens synced to globals.css');

  const ts = buildMotionTs(tokens);
  // Ensure lib/ directory exists
  const libDir = path.dirname(motionOutputPath);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  fs.writeFileSync(motionOutputPath, ts, 'utf8');
  console.log('Motion constants written to lib/motion.generated.ts');
}

module.exports = { buildCss, buildMotionTs };

// Run main only when executed directly (not required as a module)
if (require.main === module) {
  main();
}
