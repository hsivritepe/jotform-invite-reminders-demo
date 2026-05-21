# Jotform Invite Reminder Demo

Hackweek prototype for submission-aware reminder emails in **Publish → Assign Form → Invite by Email**.

The demo explores a flow where reminder schedules can target all invitees, selected invitees, or individual invitees, and reminders stop per recipient once the invited user submits the form through their personal invitation link.

## Demo Deployment

This repo is ready for GitHub Pages.

1. Publish this folder as a public GitHub repo.
2. In GitHub, open **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Push to `main`.

The workflow in `.github/workflows/deploy-github-pages.yml` builds `app/` and deploys `app/dist`.

## Original Starter Notes

# JF Design System Starter

A hackweek base project for **designers vibe-coding with AI**. Clone it, open
Codex or Claude Code, and start describing the screen you want — the agent
already knows the JotForm Design System rules, components, tokens, and the
Figma workflow.

What you get:

- A runnable starter app (`app/`) that already consumes `@jf/design-system`.
- The full design-system source (`packages/design-system/`) — components, the
  Circular font, icons, design tokens.
- An AI skill + `AGENTS.md` / `CLAUDE.md` so Codex **and** Claude Code build UI
  that stays 1:1 consistent with the design system.
- Figma MCP wired up — pull designs into code, push code into Figma.

## Prerequisites

- Node.js 20+
- `pnpm` — install with `npm install -g pnpm`

## Quick start

```bash
pnpm install
pnpm dev          # starter app  → http://localhost:5173
pnpm dev:ds       # DS component docs (optional reference)
```

Then open the repo in your AI tool of choice and start prompting (see below).

## Repo layout

```
jf-ds-starter/
├── app/                     ← the starter app — BUILD YOUR SCREENS HERE
│   ├── index.html           ← Figma capture <script> already wired
│   └── src/App.tsx          ← your blank canvas
├── packages/design-system/  ← @jf/design-system source — fix DS issues here
├── .claude/skills/          ← the jf-design-system skill (rules + references)
├── .mcp.json                ← Figma MCP server config
├── AGENTS.md / CLAUDE.md    ← agent entry points
└── tools/figma-html-to-design-capture/
```

You build screens in **`app/src/App.tsx`**. Everything inside the
`[data-figma-capture="page"]` wrapper is what Figma captures.

## Working with AI

### Claude Code

```bash
claude
```

Claude Code auto-loads `CLAUDE.md` and the `jf-design-system` skill from
`.claude/skills/`. The Figma MCP server from `.mcp.json` will ask for approval
on first use — approve it, then authenticate with Figma when prompted.

### Codex app

Open the **Codex app** and point it at this project folder (`jf-ds-starter`).
You don't need the terminal — just open the folder and start chatting in the
Codex app.

Codex reads `AGENTS.md` at the repo root (and the nested ones in `app/` and
`packages/design-system/`), so it already knows the design-system rules.

To enable the Figma MCP server in Codex, add it once in the Codex app's MCP
settings:

```
name: figma
url:  https://mcp.figma.com/mcp
```

### What to prompt

Just describe the screen. The agent knows the rules. Examples:

- "Build a settings page with a profile form and a save button."
- "Implement this Figma design: <figma.com/design/...> — use the design system."
- "Add a data table with a search input and a status filter dropdown."

The agent will compose `@jf/design-system` components, style with tokens, and
keep everything inside the capture wrapper.

## The rules (so you know what the agent is following)

- Compose design-system components first; custom UI only when nothing fits.
- Style with DS tokens — never hardcode colors, spacing, radii, or font sizes.
- Don't override DS components from `app/` — fix them in
  `packages/design-system/src` (the source is right here in the repo).
- Use `get_design_context` for Figma designs, not screenshots.

Full version: `.claude/skills/jf-design-system/SKILL.md` and its `references/`.

## Figma round-trip

**Figma → code:** share a Figma URL with the agent. It uses the Figma MCP
`get_design_context` to read exact values and rebuilds the design with DS
components and tokens.

**Code → Figma:** the capture `<script>` is already in `app/index.html`. Open
the app with Figma MCP capture parameters and `figmaselector` pointed at
`[data-figma-capture="page"]`. Full instructions:
`tools/figma-html-to-design-capture/README.md`.

## Verify before you share work

```bash
pnpm build
```

Local dev tolerates issues a real build rejects — run this before handing off.

## Troubleshooting

- **`@jf/design-system` not found** → run `pnpm install` from the repo root;
  it's a workspace package.
- **Styles look unstyled** → `@jf/design-system/styles` must be imported once;
  it already is, in `app/src/main.tsx`.
- **Figma MCP not connecting** → re-approve the server; for Codex check
  `~/.codex/config.toml`.
