# @jf/design-system — Agent Instructions

This is the JotForm Design System package: components, icons, the Circular
font, and design tokens. The starter app consumes it from source.

Before changing anything here, read `.claude/skills/jf-design-system/SKILL.md`
and `.claude/skills/jf-design-system/references/rules.md` at the repo root.

Rules specific to this package:

- This is the **source of truth**. When a component is visually wrong anywhere
  in the repo, fix it here — do not patch it from `app/`.
- Build new component internals by composing existing DS primitives
  (`Button`, `Link`, `Icon`, `DropdownSingle`, …), not raw DOM. See `rules.md` §3.
- Use design tokens for color, spacing, radius, typography, borders, shadows.
  No hardcoded values when a token covers the need.
- This package builds with `tsc -b` and has `noUnusedLocals` /
  `noUnusedParameters` **on** — unused imports and locals are hard build errors
  here. Run `pnpm --filter @jf/design-system build` before handoff.
- Keep public API changes in `src/index.ts`. Do not expose private component
  files unless asked.
- New icon categories under `src/assets/icons/` need no code change — the `Icon`
  component picks them up via `import.meta.glob`.
