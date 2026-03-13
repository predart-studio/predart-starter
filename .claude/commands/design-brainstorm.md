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
5. Check if `docs/references/` exists and contains files → pre-loaded inspiration

## Pre-loaded References Detection

Before starting the conversation, scan `docs/references/` for existing files:
```bash
ls docs/references/ 2>/dev/null
```

If the folder contains files (screenshots, images, PDFs, text files, JSON signals from prior `collect-reference.js` runs):
1. Read and visually analyze every image file (png, jpg, jpeg, webp, gif)
2. Read any text/markdown/JSON files for context
3. Build an initial summary of what the references suggest across the 9 brief areas
4. Open Phase 1 by presenting what you found:
   > "I found [N] references already in `docs/references/`. Here's what I'm picking up from them:
   > [summary organized by brief areas]
   >
   > Does this match your direction? Share anything else you've got — more screenshots, URLs, descriptions — or tell me if this captures it and we'll move to filling gaps."

If the folder is empty or doesn't exist, proceed with the standard Phase 1 opening.

## Phase 1 — The Dump

If no pre-loaded references were found, start with:
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
