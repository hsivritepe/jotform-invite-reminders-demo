# JotForm Design System

React + TypeScript tabanli JotForm Design System paketi. Bu paket, yeni projelerde ortak UI componentleri, ikon sistemi, Circular fontu ve design tokenlarini kullanmak icin tasarlanmistir.

## Gereksinimler

- React
- React DOM
- Vite veya SCSS importlarini isleyebilen modern bir bundler
- TypeScript onerilir

## Baska Bir Projede Kullanma

Bu klasoru hedef projenin icine koyabilirsiniz:

```text
my-project/
  packages/
    design-system/
```

Monorepo kullaniyorsaniz hedef app'in `package.json` dosyasina ekleyin:

```json
{
  "dependencies": {
    "@jf/design-system": "workspace:*"
  }
}
```

Monorepo kullanmiyorsaniz lokal path ile ekleyin:

```bash
pnpm add file:./packages/design-system
```

veya design-system klasoru disaridaysa:

```bash
pnpm add file:/absolute/path/to/design-system
```

## Global Stil Importu

App entry dosyanizda DS stillerini bir kez import edin:

```ts
import '@jf/design-system/styles'
```

Bu import sunlari getirir:

- Circular font-face tanimlari
- primitive tokenlar
- semantic tokenlar
- DS reset ve base stilleri
- component stilleri

## Component Kullanimi

```tsx
import { Button, Icon, Input, DropdownSingle } from '@jf/design-system'

export function Example() {
  return (
    <div>
      <Input placeholder="App name" />
      <Button
        variant="filled"
        colorScheme="primary"
        leftIcon={<Icon name="plus" category="general" size={16} />}
      >
        Create app
      </Button>
    </div>
  )
}
```

## Public Exportlar

Root export uzerinden kullanilabilen componentler:

- `Badge`
- `Button`
- `Checkbox`
- `ColorInput`
- `DateInput`
- `DesignLibrary`
- `Dialog`
- `DropdownLanguage`
- `DropdownMenuShell`
- `DropdownMulti`
- `DropdownSingle`
- `FieldChip`
- `FieldComposer`
- `FieldMapper`
- `FormField`
- `Header`
- `Icon`
- `Indicator`
- `Input`
- `Link`
- `Modal`
- `NumberInput`
- `RadioButton`
- `SearchInput`
- `Segmented`
- `Tabs`
- `TextArea`
- `Toggle`
- `UrlInput`

Type exportlari da root export uzerinden kullanilabilir.

## Tokenlar

Componentler hardcoded stil yerine DS tokenlarini kullanir. Temel token aileleri:

- `--font-family-circular`
- `--spacing-*`
- `--radius-*`
- `--text-*`
- `--background-*`
- `--border-*`
- `--accent-*`
- `--success-*`
- `--error-*`
- `--shadow-*`

Builder UI gibi `--ds-*` alias tokenlari gereken bir projede, alias tokenlarini hedef app seviyesinde tanimlayin.

## Gelistirme

```bash
pnpm install
pnpm dev
```

Build kontrolu:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

## Notlar

- Bu paket kaynak kod uzerinden tuketilecek sekilde ayarlidir.
- `node_modules` ve `dist` dagitim zip'ine dahil edilmemelidir.
- Component stillerini hedef app'te override etmek yerine, gerekli degisiklikleri design-system kaynaklarinda yapin.

## AI Skill

Bu paketin kullanim kurallari, repo kokunde paylasilan bir skill icinde tutulur
(hem Claude Code hem Codex bunu kullanir):

```text
.claude/skills/jf-design-system/SKILL.md
```

Skill; house rules ve CSS gotcha'lari, component secimi, token kullanimi,
Figma workflow'u ve starter layout kaliplarini tarif eder. Repo kokundeki
`AGENTS.md` / `CLAUDE.md` agent'lari buraya yonlendirir.

## Figma MCP HTML-to-Design Capture

Figma MCP ile browser'daki DS tabanli arayuzleri Figma'ya capture etmek icin
yardimci dokuman ve snippet'ler repo kokunde:

```text
tools/figma-html-to-design-capture/
```

Bu klasorde `capture.js` script tag'i ve capture URL sablonu bulunur.
