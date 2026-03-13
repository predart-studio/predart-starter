# Design Brainstorm Skill — Specification

## Overview

A Claude Code skill invoked via `/design-brainstorm` that runs an interactive visual design brainstorming session before any implementation begins. It accepts multi-modal inspiration input (screenshots, URLs, Figma links, text descriptions, component references), guides the user through converging on a visual direction, and outputs a structured `docs/design-brief.md` that governs all subsequent implementation.

## Problem

When starting a new frontend project, Claude Code jumps straight to coding without understanding the visual direction. This produces "AI-coded" output that lacks personality, coherence, and the design quality expected from Framer/Webflow-level sites. The brainstorming conversation that would normally happen between a designer and developer is skipped entirely.

## Goals

1. Force a design conversation before implementation starts
2. Accept rich inspiration input: screenshots, live URLs, Figma files, text descriptions, component references from UI kits
3. Produce a durable design brief that survives context window resets
4. Leverage the Predart Starter's component library playbooks for deterministic recommendations
5. Design for future extraction into a standalone skill that works on any project

## Non-Goals

- Replacing Figma or design tools for detailed mockups
- Auto-generating code from the brief (that's the implementation phase)
- Video playback (screen recordings are translated to screenshots/descriptions by the user)

---

## Architecture

### Entry Point

Slash command: `/design-brainstorm`

Skill file location: `.claude/commands/design-brainstorm.md` (Claude Code markdown prompt file)

### Components

```
.claude/commands/design-brainstorm.md   — skill prompt file (slash command)

scripts/design/
  ├── collect-reference.js    — URL → viewport screenshots + CSS extraction
  ├── match-playbook.js       — business type → component stack recommendation
  ├── scaffold-brief.js       — JSON → docs/design-brief.md
  └── validate-brief.js       — completeness + consistency check

docs/
  ├── design-brief.md         — output artifact
  └── references/             — saved screenshots and extraction data
```

### Predart Detection

The skill checks for template-specific files (`tokens.json`, `docs/component-libraries.md`) to determine if it's running in a Predart project. If yes, it uses playbook matching and `new-client` integration. If no, it falls back to generic recommendations.

---

## Conversation Flow

### Phase 1 — Context Detection

- Check for Predart project markers
- Check if `new-client` has already run (customized tokens)
- Check if `docs/design-brief.md` exists (resume vs fresh)
- Detect client brand state: has guidelines vs starting from scratch

### Phase 2 — The Dump ("Show me what you've got")

The user shares everything they have in any order:
- Business type and client info
- URLs to reference sites
- Screenshots and images (dragged in or pasted)
- Figma links
- Text descriptions of desired mood/feel
- Component references from UI kits
- Anti-references (what it should NOT look like)

For each URL shared, run `collect-reference.js` to capture viewport screenshots and CSS signals. Accept multiple rounds of input. Organize into a running summary and reflect back.

### Phase 3 — Gap Analysis

- Map collected input against the 9 brief areas (see Brief Structure below)
- Run `match-playbook.js` with the business type
- Show "covered / missing" breakdown to the user
- Use the superpowers visual companion (browser-based HTML mockup server) for layout and style comparisons when a visual question would be better understood by seeing it than reading it. Use terminal for conceptual questions.

### Phase 4 — Targeted Follow-ups

- Ask about missing areas only, one at a time
- Visual companion (browser) for visual questions: animation style comparisons, layout options, color mood boards
- Terminal for conceptual questions: business goals, content strategy, audience
- Multiple choice preferred, open-ended when needed

### Phase 5 — Brief Generation

- Run `scaffold-brief.js` to create the structured file
- Present the draft for user review
- Run `validate-brief.js` to confirm completeness and consistency
- Iterate if needed
- Save to `docs/design-brief.md`

### Phase 6 — Handoff

- If `new-client` hasn't run and brief includes color/font decisions, suggest running it with specific values
- Add reference to design brief in CLAUDE.md (idempotent: check if section already exists before adding, skip if present): "Read docs/design-brief.md before implementing any UI components"
- Transition to implementation planning via the superpowers `writing-plans` skill (a globally-installed Claude Code skill, not project-local)

---

## Design Brief Structure

The output file `docs/design-brief.md` contains 9 sections:

### 1. Business Context
- Industry (Real Estate, SaaS, Law Firm, Construction, etc.)
- Client name and description
- Target audience
- Site goal (lead gen, portfolio showcase, product sales, etc.)
- Competitive positioning (premium/accessible, traditional/modern)

### 2. Visual Mood
- Direction (dark/light, editorial/playful, minimal/rich, corporate/creative)
- 3-5 keyword descriptors
- Anti-references (what to avoid)

### 3. Color Direction
- Palette mood (warm/cool/neutral, muted/vibrant)
- Primary intent with reasoning
- Brand colors if provided (hex/oklch)
- Status: needs `new-client` / already configured

### 4. Typography
- Feel (geometric/humanist/serif/mono)
- Heading style
- Body style and size preference
- Font candidates
- Status: needs `new-client` / already configured

### 5. Layout Patterns
- Container approach (full-bleed / max-width / mixed)
- Grid style (asymmetric / centered / sidebar)
- Section rhythm (consistent / varied)
- Whitespace density
- Mobile reflow priorities

### 6. Animation Style
- Intensity (subtle / moderate / dramatic)
- Primary driver (scroll-driven GSAP / interaction-driven Framer / mixed)
- Enter animations (fade / slide / reveal / scale)
- Scroll behavior (parallax / pin / progressive reveal)
- Easing preference (smooth / snappy / bouncy)
- Reduced motion fallback strategy

### 7. Section Plan
Table of planned page sections with approach and notes. Minimum 3 sections for a landing page, more for multi-page sites. Covers both single-page and multi-page structures:
| Page | Section | Approach | Notes |
|------|---------|----------|-------|

### 8. Component Stack
- Base: shadcn/ui (always)
- Animated libraries (from component-libraries.md)
- Utility libraries (as needed)
- Matched playbook base
- Custom additions beyond playbooks

### 9. References
Table of all inspiration collected during brainstorming:
| Source | Type | What to take from it |
|--------|------|---------------------|

---

## Script Specifications

All scripts are plain `.js` files (consistent with existing `scripts/sync-tokens.js` and `scripts/new-client.js` pattern in the template).

### `collect-reference.js`

**Input:** URL (string), passed as CLI argument
**Output:** JSON to stdout with screenshot paths and CSS signals
**Dependency:** Playwright — installed on-demand, NOT a template dev dependency. The script checks for Playwright on first run and prompts: `"Playwright not found. Run: pnpm add -D playwright && npx playwright install chromium"`. This keeps the starter template lightweight for projects that don't use this feature.

**Filename collision handling:** URLs from the same domain use a slug derived from the pathname: `[domain]-[path-slug]-desktop-1.png`. Example: `example.com/about` → `example-about-desktop-1.png`. If no path, just `[domain]-desktop-1.png`.

**Error handling:**
- Navigation timeout: 15 seconds max, then skip with `{ "error": "timeout", "url": "..." }`
- Cookie consent / overlays: dismiss common patterns (click buttons matching `accept`, `dismiss`, `close` text) before screenshotting. If overlay persists, screenshot anyway.
- Login walls / redirects: if final URL differs from input URL significantly, warn in output but continue
- Network errors: exit gracefully with error JSON, don't crash

**Behavior:**
1. Check Playwright is available, exit with helpful message if not
2. Launch headless Chromium at 1440x900 viewport (desktop)
3. Navigate to URL, wait for network idle (15s timeout)
4. Dismiss cookie/consent overlays if detected
5. Take screenshot of first viewport → `docs/references/[slug]-desktop-1.png`
6. Scroll down one viewport height, screenshot → `[slug]-desktop-2.png`
7. Repeat until page bottom, **max 8 screenshots** (prevents runaway on long pages)
8. CSS extraction — sample visible elements only (not `querySelectorAll('*')`):
   - Query semantic selectors: `h1-h6`, `p`, `a`, `button`, `section`, `header`, `footer`, `nav`, `main`, `[class]` (top-level class elements up to 200 nodes max)
   - Collect `getComputedStyle()` for: `color`, `background-color`, `font-family`, `font-size`, `font-weight`, `border-radius`
   - Deduplicate and rank by frequency (most-used colors, most-used fonts, etc.)
   - Filter out browser defaults (`rgb(0, 0, 0)`, `rgba(0, 0, 0, 0)`, `16px`, `"Times New Roman"`)
9. Repeat steps 2-8 at 390px wide (mobile), **max 8 screenshots** → `[slug]-mobile-1.png`, etc.
10. Save CSS signals to `docs/references/[slug]-signals.json`
11. Output JSON summary to stdout:
```json
{
  "url": "https://example.com",
  "domain": "example",
  "desktop": {
    "viewport_count": 5,
    "screenshots": ["docs/references/example-desktop-1.png", "..."],
    "css_signals": {
      "colors": [{ "value": "rgb(15, 23, 42)", "frequency": 47 }, "..."],
      "fonts": [{ "value": "Inter", "frequency": 82 }, "..."],
      "font_sizes": ["16px", "14px", "24px", "36px", "48px"],
      "border_radius": ["8px", "12px", "9999px"],
      "spacing_common": ["16px", "24px", "32px", "48px", "64px"]
    }
  },
  "mobile": {
    "viewport_count": 6,
    "screenshots": ["docs/references/example-mobile-1.png", "..."],
    "css_signals": { "..." }
  }
}
```

### `match-playbook.js`

**Input:** Business type string (e.g., "real estate", "saas", "lawyer")
**Output:** JSON with recommended component stack
**Behavior:**
1. Read `docs/component-libraries.md`
2. Parse the Client Type Playbooks section
3. Match input against a keyword synonym map (not fuzzy — deterministic):
```
"real estate" | "property" | "realtor" | "housing" → Real Estate
"architecture" | "construction" | "building" | "contractor" → Architecture / Construction
"auto" | "dealership" | "car" | "vehicle" | "automotive" → Auto Dealership
"production" | "creative" | "agency" | "studio" | "film" | "photography" → Production / Creative
"saas" | "tech" | "software" | "startup" | "app" → SaaS / Tech
```
4. If match found: return playbook stack with install commands and reasoning
5. If no match: return `"matched_playbook": null` + full component → library quick reference table so the user/skill can pick manually
```json
{
  "matched_playbook": "Real Estate",
  "confidence": "exact",
  "stack": ["Embla", "yet-another-react-lightbox", "React Leaflet", "Magic UI", "Motion Primitives"],
  "reasoning": "Property galleries, location maps, stats counters, subtle animations",
  "install_commands": ["pnpm add yet-another-react-lightbox", "..."]
}
```

### `scaffold-brief.js`

**Input:** JSON object via stdin with brief sections (partial OK)
**Output:** Creates/updates `docs/design-brief.md`

**Input JSON schema:**
```json
{
  "project_name": "string",
  "business_context": {
    "industry": "string",
    "client": "string",
    "target_audience": "string",
    "site_goal": "string",
    "competitive_positioning": "string"
  },
  "visual_mood": {
    "direction": "string",
    "keywords": ["string"],
    "anti_references": ["string"]
  },
  "color_direction": {
    "palette_mood": "string",
    "primary_intent": "string",
    "brand_colors": [{ "name": "string", "hex": "string", "oklch": "string" }],
    "status": "needs_new_client | configured"
  },
  "typography": {
    "feel": "string",
    "heading_style": "string",
    "body_style": "string",
    "font_candidates": ["string"],
    "status": "needs_new_client | configured"
  },
  "layout_patterns": {
    "container": "string",
    "grid_style": "string",
    "section_rhythm": "string",
    "whitespace": "string",
    "mobile_strategy": "string"
  },
  "animation_style": {
    "intensity": "subtle | moderate | dramatic",
    "primary_driver": "scroll | interaction | mixed",
    "enter_animations": ["string"],
    "scroll_behavior": ["string"],
    "easing": "string",
    "reduced_motion": "string"
  },
  "section_plan": [
    { "page": "string", "section": "string", "approach": "string", "notes": "string" }
  ],
  "component_stack": {
    "animated_libraries": ["string"],
    "utility_libraries": ["string"],
    "matched_playbook": "string | null",
    "custom_additions": ["string"]
  },
  "references": [
    { "source": "string", "type": "screenshot | url | figma | description", "takeaway": "string" }
  ]
}
```
All fields are optional. Omitted fields are marked `[TO BE DECIDED]` in the output.

**Behavior:**
1. Read template structure (the 9 sections defined above)
2. Fill in provided sections from input JSON
3. Mark empty sections as `[TO BE DECIDED]`
4. Create `docs/references/` directory if missing
5. If file exists, merge strategy: update sections where input JSON provides data, preserve existing content in sections where input JSON has no data. If user has manually edited a section AND input JSON provides new data for that section, the JSON data wins (the skill should confirm overwrites with the user before calling the script)
6. Write the file
7. `--dry-run` flag: output markdown to stdout instead of writing, for preview

### `validate-brief.js`

**Input:** Path to design brief (defaults to `docs/design-brief.md`)
**Output:** Validation report JSON to stdout + exit code
**Behavior:**
1. Read and parse the brief
2. Check each of the 9 sections: complete / partial / empty
   - **Complete**: all bullet points under the section have non-placeholder content
   - **Partial**: at least one bullet point has content, others may be `[TO BE DECIDED]`
   - **Empty**: section header exists but all content is `[TO BE DECIDED]` or missing
3. Warn if component stack references libraries not in `component-libraries.md`
4. Consistency checks (animation ↔ component alignment):
   - "subtle" intensity + Aceternity UI → warn (Aceternity is dramatic by nature)
   - "subtle" intensity + GSAP as primary driver → warn (GSAP is typically for dramatic scroll)
   - "dramatic" intensity + no animated libraries beyond shadcn → warn (missing tools for dramatic)
   - Scroll behavior specified but no GSAP in component stack → warn
   - Framer-specific animations specified but "scroll" as primary driver → warn (should be "mixed")
5. Warn if color/font status is "needs new-client" but tokens.json appears already customized
6. Warn if component stack contains libraries not defined in any section of `component-libraries.md` (catches typos and phantom deps like "Tailwind Plus")
7. Exit code 0 if all sections are at least partial, exit code 1 if any are empty
```json
{
  "status": "pass",
  "sections": {
    "business_context": "complete",
    "visual_mood": "complete",
    "color_direction": "partial"
  },
  "warnings": [
    "Animation style is 'subtle' but component stack includes Aceternity UI (typically dramatic)"
  ]
}
```

---

## Integration Points

### With CLAUDE.md
After brief generation, idempotently add to CLAUDE.md (check if `## Design Brief` section already exists — if yes, skip):
```
## Design Brief
Read `docs/design-brief.md` before implementing any UI components. Follow the visual direction, animation style, and component stack specified in the brief.
```

### With `new-client`
If the brief includes color/font/radius decisions and `new-client` hasn't been run:
- Suggest exact values to use in the wizard
- Future enhancement: `--preset` flag on `new-client` that reads from the design brief directly (not in scope for v1)

### With Implementation Planning
The design brief feeds directly into the superpowers `writing-plans` skill (globally installed, not project-local). The implementation plan references the brief for:
- Which component libraries to install
- Section-by-section build order
- Animation approach per section

---

## Extraction Path (Future: Standalone Skill)

The skill is designed to split into:

**Universal core (extracts to standalone):**
- Brainstorming conversation protocol
- Reference collection script
- Design brief structure and validation
- Business context gathering
- Visual mood / layout / animation questioning flow

**Template adapter (stays in predart-starter):**
- Playbook matching against `component-libraries.md`
- `new-client` integration
- Tailwind/shadcn/GSAP-specific animation suggestions

The skill checks for project-specific markers and adapts. Standalone version falls back to generic component recommendations when no template adapter is present.

---

## Supported Input Types

| Input | How it's processed |
|-------|-------------------|
| Screenshots/images | Claude analyzes directly (multimodal) |
| URLs to live sites | `collect-reference.js` fetches viewport screenshots + CSS signals |
| Text descriptions | Absorbed into brainstorming context directly |
| Figma links | Via Figma MCP: `get_design_context` for component code + screenshot, `get_screenshot` for visual reference, `get_metadata` for design tokens. Fallback if Figma MCP not connected: ask user to paste screenshots or export assets manually |
| Screen recordings | User captures key screenshots or describes interactions; Claude cannot watch video |
| Component references | Matched against `component-libraries.md` or analyzed from provided code/docs |
| UI kit components | Claude reads provided component code/docs and adapts to project needs |

---

## File Outputs

| File | Purpose |
|------|---------|
| `docs/design-brief.md` | The design brief — primary output |
| `docs/references/*-desktop-N.png` | Desktop viewport screenshots from collected URLs |
| `docs/references/*-mobile-N.png` | Mobile viewport screenshots from collected URLs |
| `docs/references/*-signals.json` | CSS signal extraction data per URL |

---

## Known Issues in Template (Out of Scope)

- `component-libraries.md` playbooks reference "Tailwind Plus" which is not defined in the library tables. This should be resolved separately in the template docs.
