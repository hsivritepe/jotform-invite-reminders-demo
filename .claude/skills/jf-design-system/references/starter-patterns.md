# Starter Patterns

Use these patterns when creating a new app with the DS package.

## Install As Local Package

Monorepo:

```json
{
  "dependencies": {
    "@jf/design-system": "workspace:*"
  }
}
```

Single app with copied package:

```bash
pnpm add file:./packages/design-system
```

Then import styles once:

```ts
import '@jf/design-system/styles'
```

## Basic App Shell

```tsx
import {
  Badge,
  Button,
  DropdownSingle,
  FormField,
  Icon,
  Input,
  Tabs,
} from '@jf/design-system'

export function StarterApp() {
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div>
          <strong>Project</strong>
          <Badge size="sm">Draft</Badge>
        </div>
        <Button leftIcon={<Icon name="plus" category="general" size={16} />}>
          New
        </Button>
      </header>

      <div className="app-layout">
        <aside className="app-sidebar">
          <Button variant="transparent" colorScheme="secondary">Dashboard</Button>
          <Button variant="transparent" colorScheme="secondary">Forms</Button>
          <Button variant="transparent" colorScheme="secondary">Settings</Button>
        </aside>

        <main className="app-main">
          <Tabs
            items={[
              { value: 'overview', label: 'Overview' },
              { value: 'activity', label: 'Activity' },
            ]}
            value="overview"
            onChange={() => {}}
          />
          <section className="surface section">
            <FormField title="App name" showDescription={false} showHelpText={false}>
              <Input placeholder="Untitled app" />
            </FormField>
          </section>
        </main>

        <aside className="app-properties">
          <FormField title="Status" showDescription={false} showHelpText={false}>
            <DropdownSingle
              value="draft"
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
              ]}
              onChange={() => {}}
            />
          </FormField>
        </aside>
      </div>
    </div>
  )
}
```

## Layout CSS

```scss
.app-shell {
  min-height: 100vh;
  background: var(--background-lightest);
  color: var(--text-darkest);
  font-family: var(--font-family-circular);
}

.app-topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-xl);
  background: var(--background-white);
  border-bottom: 1px solid var(--border-light);
}

.app-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 320px;
  min-height: calc(100vh - 64px);
}

.app-sidebar,
.app-properties {
  padding: var(--spacing-md);
  background: var(--background-white);
  border-color: var(--border-light);
}

.app-sidebar {
  border-right: 1px solid var(--border-light);
}

.app-properties {
  border-left: 1px solid var(--border-light);
}

.app-main {
  min-width: 0;
  padding: var(--spacing-xl);
}

.section {
  margin-top: var(--spacing-md);
  padding: var(--spacing-xl);
}

.surface {
  background: var(--background-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

@media (max-width: 900px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .app-sidebar,
  .app-properties {
    border: 0;
    border-bottom: 1px solid var(--border-light);
  }
}
```

## Builder-Style Mockups

For builder-like screens, keep this distinction:

- DS core: buttons, inputs, tabs, dropdowns, modals, tokens, icons.
- Starter app: topbar, sidebar, canvas placeholder, properties panel layout.
- Builder runtime: drag/drop, registry, selection, inline editing, canvas components.

Do not move runtime builder logic into the DS package unless the user explicitly asks for a separate builder starter.
