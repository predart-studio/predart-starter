const fs = require('fs');
const path = require('path');

const tokensPath = path.join(__dirname, '..', 'tokens.json');
const outputPath = path.join(__dirname, '..', 'app', 'globals.css');

// Read and parse tokens.json
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

const css = `@import "tailwindcss";
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
  --radius-4xl: calc(var(--radius) * 2.6);
}

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

fs.writeFileSync(outputPath, css, 'utf8');
console.log('Tokens synced to globals.css');
