# JF Design System Starter — Claude Code

This repo is a hackweek base project for designers vibe-coding with AI. The
goal: build screens fast that stay 1:1 consistent with the JotForm Design
System, and round-trip them with Figma.

## The skill

Claude Code auto-discovers the **`jf-design-system`** skill in
`.claude/skills/`. Use it whenever you create, extend, or review UI in this
repo. It is the source of truth for:

- house rules + CSS gotchas (`references/rules.md`)
- component selection (`references/components.md`)
- token families + usage rules (`references/tokens.md`)
- the Figma → code and code → Figma workflow (`references/figma-workflow.md`)
- starter layout patterns (`references/starter-patterns.md`)

## Workspace layout

```
jf-ds-starter/
├── app/                     ← the runnable starter app — BUILD SCREENS HERE
│   └── src/App.tsx          ← your blank canvas, inside [data-figma-capture="page"]
├── packages/design-system/  ← @jf/design-system source — fix DS issues HERE
├── .claude/skills/          ← the jf-design-system skill
└── tools/figma-html-to-design-capture/  ← Figma capture setup
```

- `pnpm dev` runs the starter app. `pnpm dev:ds` runs the design-system docs.
- The app consumes `@jf/design-system` straight from source via a Vite alias.

## Core rules (full version in the skill)

- Compose `@jf/design-system` components first; custom UI only when none fits.
- Style with DS tokens — never hardcode colors, spacing, radii, or font sizes.
- Use the `Icon` component for icons.
- Never override DS internals from `app/`. Fix DS issues in
  `packages/design-system/src` — the source is in this repo.
- Keep your screen inside the `[data-figma-capture="page"]` wrapper.
- For Figma designs, use Figma MCP `get_design_context`, never `get_screenshot`
  for values.
- Run `pnpm build` before declaring work done.

The Figma MCP server is configured in `.mcp.json` — approve it on first use.
`AGENTS.md` carries the same instructions for Codex users.
