# Figma MCP HTML-to-Design Capture

Use this helper when a React/Vite app built with JotForm Design System needs to be captured into Figma through Figma MCP's `html-to-design` flow.

This tool does not vendor the remote MCP script. It documents the script tag and URL contract that should be added to the consuming app.

## 1. Add the Capture Script

Add this before the closing `</body>` tag in the consuming app's `index.html`:

```html
<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
```

The same snippet is available in `capture-script-snippet.html`.

## 2. Capture URL Shape

Open the target app with Figma MCP capture parameters:

```text
http://localhost:5173/#figmacapture=<capture-id>&figmaendpoint=<endpoint>&figmadelay=2500&figmaselector=<css-selector>
```

Recommended defaults:

- `figmadelay=2500` gives React, fonts, icons, and remote images time to render.
- `figmaselector=` should point to the smallest stable wrapper that contains the UI you want in Figma.
- Use a dedicated capture route or capture mode when the full app shell contains panels, hidden pages, or off-screen content.

## 3. Suggested Capture Wrapper

Wrap the part of the page that should be sent to Figma:

```tsx
export function App() {
  return (
    <main data-figma-capture="page">
      {/* DS-based UI goes here */}
    </main>
  )
}
```

Then capture with:

```text
figmaselector=[data-figma-capture="page"]
```

## 4. DS Rules During Capture

- Import `@jf/design-system/styles` before rendering capture targets.
- Use public exports from `@jf/design-system`.
- Use DS tokens for surfaces, text, borders, spacing, radius, and shadows.
- Avoid temporary CSS overrides that only exist for capture.
- Keep the capture DOM minimal; hidden sibling screens and large off-screen images can produce oversized payloads.

## 5. Common Issues

Payload too large:

- Constrain `figmaselector` to the actual capture target.
- Hide or do not render off-screen pages during capture.
- Avoid uncompressed large uploaded images.

Wrong frame captured:

- Verify the selector exists after the app renders.
- Increase `figmadelay` when data, fonts, or images load late.

Capture stays pending:

- Keep the browser tab open until the Figma MCP capture finishes.

## 6. App Builder Preset Capture Reference

The original JotForm App Builder flow uses:

```text
http://localhost:5173/?preset=<presetId>&page=<N>&fullscreen=phone#figmacapture=<id>&figmaendpoint=<endpoint>&figmadelay=2500&figmaselector=.live-preview__phone
```

Notes:

- `page=` is a 1-based page index.
- `fullscreen=phone` renders only the live-preview phone shell.
- `.live-preview__phone` keeps the capture target small and avoids hidden builder canvas content.
