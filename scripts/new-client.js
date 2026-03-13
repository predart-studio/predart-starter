'use strict';

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generatePalette } = require('./lib/palette-generator.js');

const ROOT = path.join(__dirname, '..');
const TOKENS_PATH = path.join(ROOT, 'tokens.json');
const LAYOUT_PATH = path.join(ROOT, 'app', 'layout.tsx');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Convert a font name like "DM Sans" to its Next.js import identifier: "DM_Sans" */
function fontToImportName(name) {
  return name.replace(/\s+/g, '_');
}

async function main() {
  console.log('\n── Predart Studio — New Client Wizard ──\n');

  // 1. Slug
  let slug = '';
  while (true) {
    slug = await ask('Client slug (e.g. minerva): ');
    if (/^[a-z0-9-]+$/.test(slug)) break;
    console.log('  ✖ Slug must match /^[a-z0-9-]+$/ — only lowercase letters, digits, hyphens.');
  }

  // 2. Primary color
  let primaryHex = '';
  while (true) {
    primaryHex = await ask('Primary color (hex, e.g. #1a56db): ');
    if (/^#[0-9a-fA-F]{6}$/.test(primaryHex)) break;
    console.log('  ✖ Must be a 6-digit hex color like #1a56db.');
  }

  // 3. Background hex (optional)
  const bgRaw = await ask('Background hex [#ffffff]: ');
  let backgroundHex = bgRaw || '#ffffff';
  if (bgRaw && !/^#[0-9a-fA-F]{6}$/.test(bgRaw)) {
    console.log('  ! Invalid hex — using default #ffffff.');
    backgroundHex = '#ffffff';
  }

  // 4. Font name (optional)
  const fontRaw = await ask('Font name [Inter]: ');
  const fontName = fontRaw || 'Inter';

  // 5. Border radius (optional)
  const radiusRaw = await ask('Border radius [0.5rem]: ');
  const radius = radiusRaw || '0.5rem';

  // Generate palette
  const palette = generatePalette({ primaryHex, backgroundHex, radius, fontName });

  // Preview
  console.log('\n── Light palette preview ──');
  const previewKeys = ['background', 'foreground', 'primary', 'primary-foreground', 'accent', 'muted', 'destructive', 'border'];
  for (const k of previewKeys) {
    console.log(`  ${k.padEnd(22)} ${palette.light[k]}`);
  }
  console.log('\n  Dark palette generated (draft - review and adjust)');

  // Confirm
  const confirm = await ask('\nConfirm? (Y/n): ');
  if (confirm.toLowerCase() === 'n') {
    console.log('\nAborted.\n');
    rl.close();
    return;
  }

  // a. Write tokens.json
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(palette, null, 2) + '\n', 'utf8');
  console.log('\n  ✔ tokens.json written.');

  // b. Run sync-tokens
  console.log('  Running sync-tokens...');
  execSync('node scripts/sync-tokens.js', { stdio: 'inherit', cwd: ROOT });

  // c. Update layout.tsx — font block
  let layout = fs.readFileSync(LAYOUT_PATH, 'utf8');

  const importName = fontToImportName(fontName);
  const fontBlock =
    `// PREDART:FONT_START\n` +
    `import { ${importName} } from 'next/font/google'\n` +
    `const fontSans = ${importName}({ variable: '--font-sans', subsets: ['latin'] })\n` +
    `// PREDART:FONT_END`;

  layout = layout.replace(
    /\/\/ PREDART:FONT_START[\s\S]*?\/\/ PREDART:FONT_END/,
    fontBlock
  );

  // d. Update layout.tsx — metadata block
  const clientName = capitalize(slug);
  const metaBlock =
    `// PREDART:META_START\n` +
    `export const metadata: Metadata = {\n` +
    `  title: '${clientName}',\n` +
    `  description: '${clientName} — by Predart Studio',\n` +
    `}\n` +
    `// PREDART:META_END`;

  layout = layout.replace(
    /\/\/ PREDART:META_START[\s\S]*?\/\/ PREDART:META_END/,
    metaBlock
  );

  fs.writeFileSync(LAYOUT_PATH, layout, 'utf8');
  console.log('  ✔ app/layout.tsx updated (font + metadata).');

  // Success summary
  console.log(`
── Done! ──────────────────────────────────────
  Client slug  : ${slug}
  Primary      : ${palette.light.primary}
  Font         : ${fontName} (${importName})
  Radius       : ${radius}
  tokens.json  → synced to app/globals.css
  layout.tsx   → font & metadata updated
────────────────────────────────────────────────
`);

  rl.close();
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  rl.close();
  process.exit(1);
});
