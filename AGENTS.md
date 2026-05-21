# JF Design System Starter — Agent Instructions

This repo is a hackweek base project for designers vibe-coding with AI. The
goal: build screens fast that stay 1:1 consistent with the JotForm Design
System, and round-trip them with Figma.

## Read this first

Before building or changing any UI, read the design-system skill — it is the
source of truth for rules, components, tokens, and the Figma workflow:

- `.claude/skills/jf-design-system/SKILL.md` — start here
- `.claude/skills/jf-design-system/references/rules.md` — house rules + CSS gotchas
- `.claude/skills/jf-design-system/references/components.md` — what to use when
- `.claude/skills/jf-design-system/references/tokens.md` — token families + usage rules
- `.claude/skills/jf-design-system/references/figma-workflow.md` — Figma → code and code → Figma
- `.claude/skills/jf-design-system/references/starter-patterns.md` — layout patterns

## Workspace layout

```
jf-ds-starter/
├── app/                     ← the runnable starter app — BUILD SCREENS HERE
│   └── src/App.tsx          ← your blank canvas, inside [data-figma-capture="page"]
├── packages/design-system/  ← @jf/design-system source — fix DS issues HERE
├── .claude/skills/          ← the jf-design-system skill (rules + references)
└── tools/figma-html-to-design-capture/  ← Figma capture setup
```

- `pnpm dev` runs the starter app. `pnpm dev:ds` runs the design-system docs.
- The app consumes `@jf/design-system` straight from source via a Vite alias.

## Core rules (full version in the skill)

- Compose `@jf/design-system` components first. Write custom UI only when no DS
  component fits.
- Style with DS tokens — `var(--spacing-*)`, `var(--text-*)`, `var(--radius-*)`,
  `var(--font-size-*)`, `var(--shadow-*)`. Never hardcode colors, spacing, radii,
  or font sizes.
- Use the `Icon` component for icons.
- Never override DS component internals from `app/`. If a DS component is wrong,
  fix it in `packages/design-system/src` — the source is in this repo.
- Keep your screen inside the `[data-figma-capture="page"]` wrapper.
- For Figma designs, use the Figma MCP `get_design_context` — never rely on
  `get_screenshot` for values.
- Run `pnpm build` before declaring work done.

## Notes

- This repo is self-contained. There are no external memory files to read —
  everything an agent needs is in `.claude/skills/` and these `AGENTS.md` files.
- `CLAUDE.md` carries the same instructions for Claude Code users.
