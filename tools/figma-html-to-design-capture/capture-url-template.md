# Capture URL Template

Generic capture URL:

```text
http://localhost:<port>/#figmacapture=<capture-id>&figmaendpoint=<endpoint>&figmadelay=2500&figmaselector=<css-selector>
```

Recommended selector pattern:

```text
figmaselector=[data-figma-capture="page"]
```

JotForm App Builder phone preset capture:

```text
http://localhost:5173/?preset=<presetId>&page=<page-number>&fullscreen=phone#figmacapture=<capture-id>&figmaendpoint=<endpoint>&figmadelay=2500&figmaselector=.live-preview__phone
```
