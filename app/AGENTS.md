# @jf/starter-app — Agent Instructions

This is the runnable starter app. **Build hackweek screens here.**

Before building UI, read `.claude/skills/jf-design-system/SKILL.md` at the repo
root (Claude Code loads it automatically; Codex should open it).

Rules specific to this package:

- `src/App.tsx` is the blank canvas. Keep the screen inside the
  `[data-figma-capture="page"]` wrapper so Figma MCP can capture it.
- Import UI from `@jf/design-system`. Style with DS tokens in `.scss` files.
  No hardcoded colors, spacing, radii, or font sizes.
- Import `@jf/design-system/styles` exactly once — it is already imported in
  `src/main.tsx`. Do not import it again.
- Never override DS component internals from here. If a DS component needs a
  fix, make it in `packages/design-system/src`.
- `noUnusedLocals` / `noUnusedParameters` are relaxed in this package for fast
  iteration — but still run `pnpm build` from the repo root before handoff, the
  design-system package keeps them on.
- The Figma capture `<script>` is already wired in `index.html`. Capture setup:
  `tools/figma-html-to-design-capture/README.md`.
