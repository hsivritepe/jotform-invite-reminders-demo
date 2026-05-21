# Component Reference

Use root exports from `@jf/design-system`.

## Public Components

- `Badge`: compact labels, status tags, metadata.
- `Button`: primary actions, secondary actions, icon-only commands.
- `Checkbox`: binary selections in forms and settings.
- `ColorInput`: color fields where users provide or inspect color values.
- `DateInput`: date fields.
- `DesignLibrary`: local DS documentation/demo surface.
- `Dialog`: confirmation and message dialogs.
- `DropdownSingle`: one-of-many selection.
- `DropdownMulti`: multiple selection.
- `DropdownLanguage`: language selection.
- `DropdownMenuShell`: custom dropdown menu composition.
- `FieldChip`: compact mapped field token.
- `FieldComposer`: composing text with field tokens.
- `FieldMapper`: mapping source fields to destination fields.
- `FormField`: label, helper, error, and control wrapper.
- `Header`: generic JotForm-style app header.
- `Icon`: DS SVG icon loader.
- `Indicator`: visual status indicator.
- `Input`: plain text input.
- `Link`: text links.
- `Modal`: larger modal surfaces.
- `NumberInput`: numeric fields.
- `RadioButton`: one-of-many form controls.
- `SearchInput`: search fields.
- `Segmented`: compact mode switching.
- `Tabs`: section navigation.
- `TextArea`: multiline input.
- `Toggle`: boolean settings.
- `UrlInput`: URL fields.

## Component Choice

- Use `FormField` around inputs when labels, descriptions, errors, or helper text are needed.
- Use `Segmented` for two to five tightly related modes.
- Use `Tabs` for page or section switching.
- Use `DropdownSingle` instead of custom select controls.
- Use `Modal` for workflows with forms or multi-step content.
- Use `Dialog` for short confirmations and alerts.
- Use `Badge` or `Indicator` for status rather than custom pills.
- Use icon-only `Button` for compact toolbar commands and pair it with accessible labels.

## Icon Usage

```tsx
import { Icon } from '@jf/design-system'

<Icon name="plus" category="general" size={16} />
```

Use existing icon categories under `src/assets/icons/`. Common categories include:

- `general`
- `arrows`
- `editor`
- `forms-files`
- `media`
- `products`
- `brands`
- `security`
- `time-date`
- `users`

If an icon name does not render, inspect `src/assets/icons/<category>/` and use the exact file name without `.svg`.

