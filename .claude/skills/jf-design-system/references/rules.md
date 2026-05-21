# House Rules & CSS Gotchas

These rules come from real corrections made while building the JotForm Design
System. They are not style preferences — each one fixed an actual bug or
review comment. Follow them when creating or extending UI in this repo.

## 1. No hardcoded visual values

Never hardcode spacing, color, radius, or font-size when a token exists.

- Spacing → `var(--spacing-*)`
- Color → semantic color tokens (`--text-*`, `--background-*`, `--border-*`,
  `--accent-*`, …), never raw `#hex` / `rgba()`
- Radius → `var(--radius-*)` (but see rule 5 for UI chrome)
- Font-size → `var(--font-size-*)` scale, never raw `px`
- Icons → the `Icon` component, never inline SVG or emoji

**Why:** When a token changes, every component must update with it. A hardcoded
value silently breaks design-system consistency and theming.

For opacity / overlays, do **not** reach for a raw `rgba()`. Use
`color-mix(in srgb, var(--token) 20%, transparent)`.

## 2. Fix at the source — never override

Do not override design-system component internals from the app, and never use
`!important` to win against DS styles.

If a DS component is visually wrong, fix it in `packages/design-system/src` —
the source ships in this repo. App-level CSS should only contain app-specific
layout (page shell, panels, grids), never reach into `.jf-*` internals.

**Why:** Overrides are brittle and cause surprise side effects. Fixing the
source fixes every consumer at once.

## 3. Dogfood DS components

When building or extending a DS component, reuse existing DS primitives
(`Button`, `Link`, `Icon`, `DropdownSingle`, …) instead of hand-rolling raw
DOM. Example: a modal's close button is a `<Button iconOnly>`, not a custom
`.jf-modal__close`. This keeps tokens, dark mode, and future updates consistent.

Before writing new styled markup for a button / link / trigger inside a DS
component, check whether the DS already exports a primitive that fits.

## 4. Verify with a real build before handoff

Run `pnpm build` from the repo root before declaring work done. Local Vite dev
tolerates problems a real build rejects.

The `design-system` package compiles with `tsc -b` and has `noUnusedLocals` /
`noUnusedParameters` on — unused imports and locals are **hard build errors**
there (TS6133), not warnings. (The `app` package relaxes these for hackweek
velocity, but the DS package does not.)

## 5. UI chrome uses fixed radii, not radius tokens

UI chrome — toolbars, dropdowns, tooltips, popovers, menus — should use
**hardcoded** `border-radius` (e.g. `8px`, `12px`), not `var(--radius-*)`.

**Why:** Theme/corner-style presets override `--radius-*` tokens. Chrome is
theme-agnostic — a toolbar button should not inherit an app content corner
preset. Use radius tokens only inside actual content (cards, inputs, buttons
in the page body). `--shadow-*` tokens are still fine on chrome (theme-aware
shadows are desirable).

The same applies to a selected-state outline: use a fixed `4px` radius so it is
unaffected by radius-mode presets.

## 6. CSS gotchas that have cost real debugging time

### Borders and selected states

- Use `box-shadow: inset 0 0 0 1px <color>` instead of `border` for slider
  tracks and similar — avoids `background-clip` issues with gradients.
- Use `outline` + `outline-offset` for selected states — it does not affect
  layout the way a border does.
- For a gradient (conic) ring, use `::before` with `padding` + mask, **not**
  `::after` with a border-box mask. Add `-webkit-mask-composite: xor` for Safari.

### Variant rules under a media / container query

`.x { padding: A }` + `.x--variant { padding: B }`, then later
`@container (max-width: N) { .x { padding: C } }` — inside the query the base
`.x` rule wins over `.x--variant` because both have equal specificity and the
query block comes later in source order. Variant `B` silently never applies in
the narrow case.

**Fix:** re-declare the variant override *inside* every query block the base
class is overridden in, or raise variant specificity (`.x.x--variant`).

### Flex items do not margin-collapse

Margin collapsing only happens between adjacent **block** siblings. Flex items
do not collapse margins — a divider's `margin-bottom: 16` and the next item's
`margin-top: 16` stack to `32`, not `16`.

**Fix:** use the flex container's `gap`, or drop one side conditionally with
`:has()` on the previous sibling:

```scss
.parent > .prev-wrapper:has(> .divider) + .next-sibling { margin-top: 0; }
```

### `overflow-y: auto` eats bottom padding at the scroll end

In Chromium and Firefox, `padding-bottom` on a scroll container is not part of
the scrollable area — the last child sits flush against the edge when scrolled
to the bottom.

**Fix:** drop `padding-bottom`, add an `::after` block-level spacer:

```scss
.scroll-container {
  overflow-y: auto;
  padding: var(--spacing-md) var(--spacing-md) 0; // no bottom padding
  &::after { content: ''; display: block; height: var(--spacing-md); }
}
```

For a popover/modal/drawer with internal scroll, also use
`display: flex; flex-direction: column` + `max-height` on the parent and
`flex: 1 1 auto; min-height: 0; overflow-y: auto` on the scroll child. Plain
`max-height: inherit` does not propagate reliably.

## 7. Extending the design system

- New icon categories under `packages/design-system/src/assets/icons/` need no
  code change — the `Icon` component registers them via `import.meta.glob`.
  Do **not** introduce `new URL(\`...${var}...\`, import.meta.url)` for dynamic
  asset paths; Vite only statically analyzes fully-literal `new URL` paths and
  the asset will silently fail to load.
- Dark mode ships via a `[data-theme='dark']` ancestor selector. Portal-mounted
  components (Dropdown sheet, Modal, Dialog) must carry `data-theme` onto the
  portal root so dark mode survives the portal boundary.
