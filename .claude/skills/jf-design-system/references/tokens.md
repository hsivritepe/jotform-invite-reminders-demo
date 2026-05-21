# Token Reference

Import tokens through the global stylesheet:

```ts
import '@jf/design-system/styles'
```

## Token Families

Typography:

- `--font-family-circular` (Circular Std — Book 400, Medium 500, Bold 700)
- `--font-weight-book`
- `--font-weight-medium`
- `--font-weight-bold`
- `--font-size-2xs` through `--font-size-5xl`
- `--line-height-2xs` through `--line-height-4xl`
- `--letter-spacing-*`

Every `font-size` must come from the `--font-size-*` scale — pick the closest
step, never write a raw `px` value.

Spacing:

- `--spacing-3xs`
- `--spacing-2xs`
- `--spacing-xs`
- `--spacing-sm`
- `--spacing-md`
- `--spacing-lg`
- `--spacing-xl`
- `--spacing-2xl`
- `--spacing-3xl`
- `--spacing-4xl`

Radius:

- `--radius-none`
- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`
- `--radius-xxl`
- `--radius-rounded`

Semantic color:

- `--text-*`
- `--background-*`
- `--border-*`
- `--accent-*`
- `--success-*`
- `--error-*`
- `--secondary-text-*`
- `--secondary-background-*`
- `--secondary-border-*`
- `--product-*`

Shadows:

- `--shadow-xs`
- `--shadow-sm`
- `--shadow-md`
- `--shadow-lg`
- `--shadow-xl`

## CSS Pattern

```scss
.page {
  min-height: 100vh;
  background: var(--background-lightest);
  color: var(--text-darkest);
  font-family: var(--font-family-circular);
}

.section {
  padding: var(--spacing-xl);
}

.surface {
  background: var(--background-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}
```

## Token Usage Rules

- **Opacity / overlays:** never write a raw `rgba()`. Use
  `color-mix(in srgb, var(--token) 20%, transparent)`.
- **Shadows:** always `var(--shadow-*)` — these are theme-aware and have
  separate light/dark values under `[data-theme='dark']`.
- **Dark mode:** components ship dark styles via a `[data-theme='dark']`
  ancestor selector. Do not build a parallel dark palette.
- **UI chrome radius:** toolbars, dropdowns, tooltips, popovers, and menus use
  *hardcoded* `border-radius`, not `--radius-*` — radius tokens get overridden
  by theme/corner presets and chrome must stay theme-agnostic. Radius tokens
  belong on page content (cards, inputs, body buttons). See `rules.md` §5.
- **Status colors:** Warning/Info do not have `--warning-default` tokens — use
  the yellow primitives and `--accent-default` (blue) respectively. Badge and
  Dialog tints are `color-mix(... --{status}-{dark|default} 20–50%, transparent)`.

## Avoid

- Raw hex or `rgba()` values for DS surfaces, text, borders, and accents.
- Hardcoded pixel spacing when a spacing token exists.
- Hardcoded `px` font-size — use the `--font-size-*` scale.
- Hardcoded radius on page content when a radius token exists.
- App-level CSS that reaches into `.jf-*` internals to change DS component styling.
- One-off pills, buttons, inputs, selects, or status badges when DS components exist.

## Builder-Style Alias Tokens

If a consuming app wants `--ds-*` aliases, define them at app level instead of modifying component internals:

```scss
:root {
  --ds-bg-page: var(--background-lightest);
  --ds-bg-surface: var(--background-white);
  --ds-text-dark: var(--secondary-text-darkest);
  --ds-text-medium: var(--secondary-text-medium);
  --ds-accent: var(--product-default);
  --ds-accent-hover: var(--product-dark);
  --ds-border: var(--border-light);
  --ds-font-family: var(--font-family-circular);
  --ds-space-xs: var(--spacing-xs);
  --ds-space-sm: var(--spacing-sm);
  --ds-space-md: var(--spacing-md);
  --ds-radius-sm: var(--radius-sm);
  --ds-radius-md: var(--radius-md);
}
```

