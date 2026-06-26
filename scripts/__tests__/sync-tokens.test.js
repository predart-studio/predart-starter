// scripts/__tests__/sync-tokens.test.js
const { buildCss, buildMotionTs } = require('../sync-tokens.js');
const tokens = require('../../tokens.json');
const css = buildCss(tokens);
const ts = buildMotionTs(tokens);
const assert = require('node:assert');

assert.match(css, /--text-display-1:\s*clamp\(2\.75rem/);
assert.match(css, /--text-display-1--line-height:\s*1\.0/);
assert.match(css, /--text-display-1--letter-spacing:\s*-\.?0?\.035em|--text-display-1--letter-spacing:\s*-0\.035em/);
assert.match(css, /--spacing-gutter:\s*clamp/);
assert.match(css, /--grid-cols:\s*12/);
assert.match(css, /--grid-gutter:\s*clamp/);
assert.match(css, /--grid-baseline:\s*0\.5rem/);
assert.match(css, /--ease-house:\s*cubic-bezier\(0\.22/);
assert.match(ts, /EASE_HOUSE\s*=\s*\[0\.22,\s*1,\s*0\.36,\s*1\]/);
console.log('sync-tokens emits type/space/motion: OK');
