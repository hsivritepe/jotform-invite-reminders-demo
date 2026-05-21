# Figma Workflow

Two directions, both go through the Figma MCP server:

1. **Figma → code** — implement a Figma design as DS-based React.
2. **Code → Figma** — capture the running app into Figma via html-to-design.

## Figma → code (implementing a design)

When the user shares a `figma.com/design/...` URL or references a Figma file:

1. Call `get_design_context` with the `fileKey` and `nodeId` from the URL.
   This returns structured data — exact layout, colors, typography, spacing,
   and token names.
2. For large or unfamiliar files, call `get_metadata` first to find the right
   node, then `get_design_context` on it.
3. **Do not use `get_screenshot` to understand a design.** A screenshot is a
   visual approximation — it gives you no exact hex values, font sizes, spacing,
   or token names, so you cannot implement pixel-perfectly from it. Use
   `get_design_context` for the real values. (A screenshot is only ever a
   last-resort sanity check, never the source of truth.)
4. Translate the structured output into DS components and tokens — it is a
   *reference*, not final code. Map every Figma value to the matching DS token:
   - Figma `foreground/fg-primary` → the corresponding `--text-*` token
   - Figma `background/fill/*` → the corresponding `--background-*` token
   - Figma spacing → `--spacing-*`, radii → `--radius-*`, type → `--font-size-*`
   If the design uses raw hex or absolute positioning, it is loosely structured —
   still rebuild it with DS components and tokens, not hardcoded values.

### URL parsing

- `figma.com/design/:fileKey/:fileName?node-id=:nodeId` — convert `-` to `:` in
  the `nodeId` (e.g. `1-23` → `1:23`).
- `figma.com/design/:fileKey/branch/:branchKey/...` — use `branchKey` as the
  `fileKey`.

### JotForm brand assets reference

The JotForm brand chrome (AI logomark, "View on mobile" QR badge, etc.) lives in
the **Element-Colors** Figma file:

- fileKey: `JElwuNDLQwOcCwMVg8PIAf`
- `7378:6532` — JotForm AI logomark (wordmark + AI badge)
- `7378:7021` — "View on mobile" QR badge

Pull these with `get_design_context` if a task needs JotForm brand chrome.

## Code → Figma (html-to-design capture)

Capture the running starter app into Figma so designers can iterate in Figma on
what was built in code.

The `app/index.html` in this repo already includes the capture `<script>`. Full
setup, the capture URL contract, and troubleshooting are in:

```
tools/figma-html-to-design-capture/README.md
tools/figma-html-to-design-capture/capture-url-template.md
```

Key points:

- Keep your screen inside the `[data-figma-capture="page"]` wrapper in
  `app/src/App.tsx` and capture with `figmaselector=[data-figma-capture="page"]`.
- Point `figmaselector` at the **smallest stable wrapper** that contains the UI
  you want — capturing the whole shell with hidden/off-screen content produces
  oversized payloads.
- `figmadelay=2500` gives React, fonts, icons, and remote images time to render.
- Verify `@jf/design-system/styles` is imported before the capture target
  renders, and that the capture DOM uses DS tokens — no temporary
  capture-only CSS overrides.
