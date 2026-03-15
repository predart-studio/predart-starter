# Template Usage Rules

This file defines how coding agents must behave inside the starter repo.

## Token Discipline
- `tokens.json` is the source of truth for brand tokens
- Run the token sync workflow when token values change
- Do not hardcode colors, radius values, or typography tokens in project components unless explicitly temporary
- Do not create a parallel token system

## Component Discipline
- Reuse `components/ui/` as the primitive layer
- Do not modify `components/ui/` unless explicitly required
- Put custom storytelling/building blocks in `components/sections/`
- Put persistent structural UI in `components/layout/`

## Animation Discipline
- Framer Motion is the default for component-scoped animation unless the project says otherwise
- GSAP + ScrollTrigger should only be used for explicitly approved scroll choreography
- Never animate the same property on the same element from both libraries

## Scope Discipline
- Do not use a library just because it exists in the starter
- Follow the project-specific allowed / optional / out-of-scope decisions in `04-implementation-direction.md`
- If the starter contains extra capabilities that the project does not need, ignore or remove them deliberately — do not let them leak into the implementation
