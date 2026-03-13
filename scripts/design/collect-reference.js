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
  'background-color': 'colors',
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
