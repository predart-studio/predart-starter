---
description: Run a visual design brainstorming session before implementation. Best used as a fallback or refinement flow when a full external project context pack does not already exist.
---

# Design Brainstorm

You are running an interactive design brainstorming session inside the repo. Your goal is to help the user converge on a visual design direction and produce a structured design brief at `docs/design-brief.md`.

## Positioning

This command is **not** the primary serious-project workflow anymore.

Use it when:
- the project is lightweight
- there is no full external project context pack yet
- the user wants a repo-local brainstorm or refinement pass

If `docs/project-context/` already exists and contains meaningful files, treat those as the upstream source of truth and use this command to refine gaps rather than reinvent the direction.

## Context Detection (Do this first, silently)

1. Check if `docs/project-context/` exists and contains files
2. If it does, read the core files first:
   - `01-project-context.md`
   - `02-design-direction.md`
   - `03-motion-direction.md`
   - `04-implementation-direction.md`
   - `06-template-usage-rules.md`
3. Then check if `tokens.json` and `docs/component-libraries.md` exist → Predart project
4. Check if tokens.json has been customized (not default Inter/blue) → `new-client` already run
5. Check if `docs/design-brief.md` exists → resume previous brainstorm
6. If resuming, read the existing brief and tell the user what's already decided
7. Check if `docs/references/` exists and contains files → pre-loaded inspiration

## Pre-loaded References Detection

Before starting the conversation, scan `docs/references/` for existing files:
```bash
ls docs/references/ 2>/dev/null
```

If the folder contains files (screenshots, images, PDFs, text files, JSON signals from prior `collect-reference.js` runs):
1. Read and visually analyze every image file (png, jpg, jpeg, webp, gif)
2. Read any text/markdown/JSON files for context
3. Build an initial summary of what the references suggest across the 9 brief areas
4. Open Phase 1 by presenting what you found

## Phase 1 — The Dump

If no pre-loaded references were found, start with:
> "Let's design this thing. Show me everything you've got — business type, reference sites, screenshots, Figma links, descriptions of the vibe you want, components you like, or anything that captures what you're going for. I'll organize it all. Drop as much or as little as you have."

Accept multiple rounds of input. For each URL the user shares, run:
```bash
node scripts/design/collect-reference.js "<url>"
```
Then read the saved screenshots from `docs/references/` to analyze them visually.

For screenshots/images the user pastes directly, analyze them with your multimodal capabilities.

For Figma links, use the Figma MCP tools if available. If not, ask the user to paste screenshots.

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

For each missing area, ask ONE question at a time.
- Multiple choice preferred
- Never ask about something the user already covered
- If `docs/project-context/` exists, do not override it casually — refine only what is unresolved or explicitly being reconsidered

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

## Phase 5 — Handoff

1. If color/font decisions were made and `new-client` hasn't been run, suggest exact values
2. If a full `docs/project-context/` pack exists, remind the user that this brief is a local refinement artifact, not the upstream design-source replacement
3. Tell the user to run:
```bash
pnpm init-project
```

## Important Rules

- **ONE question at a time** during follow-ups
- **Never start coding** — this command only produces/refines design direction artifacts
- **Reflect back often**
- **Use the playbooks** when a business type matches
- **Respect existing project-context files** when present
