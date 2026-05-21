import { useState } from 'react';
import { Dialog } from '../../Dialog';
import type { DialogStyle } from '../../Dialog';
import { Button } from '../../Button';
import { DropdownSingle } from '../../Dropdown';

type ActionSet = 'single' | 'two' | 'three';

export interface DialogPanelState {
  style: DialogStyle;
  actions: ActionSet;
  showDescription: boolean;
  showExtras: boolean;
  showFooterLink: boolean;
  darkPreview: boolean;
}

export const defaultDialogState: DialogPanelState = {
  style: 'informative',
  actions: 'two',
  showDescription: true,
  showExtras: false,
  showFooterLink: false,
  darkPreview: false,
};

const INTENT_BY_STYLE: Record<DialogStyle, 'primary' | 'constructive' | 'destructive'> = {
  informative: 'primary',
  constructive: 'constructive',
  warning: 'destructive',
  destructive: 'destructive',
};

const TITLE_BY_STYLE: Record<DialogStyle, string> = {
  informative: 'This is a title',
  constructive: 'All set — you are good to go',
  warning: 'You may lose unsaved changes',
  destructive: 'Delete this item?',
};

const PRIMARY_LABEL_BY_STYLE: Record<DialogStyle, string> = {
  informative: 'Continue',
  constructive: 'OK, got it',
  warning: 'Leave anyway',
  destructive: 'Delete',
};

export function DialogSection({ state }: { state: DialogPanelState }) {
  const [open, setOpen] = useState(false);
  const intent = INTENT_BY_STYLE[state.style];

  const primary = (
    <Button colorScheme={intent} onClick={() => setOpen(false)}>
      {PRIMARY_LABEL_BY_STYLE[state.style]}
    </Button>
  );
  const cancel = (
    <Button variant="ghost" colorScheme="secondary" onClick={() => setOpen(false)}>
      Cancel
    </Button>
  );
  const secondary = (
    <Button variant="filled" colorScheme="secondary" onClick={() => setOpen(false)}>
      Save as draft
    </Button>
  );

  let actions: React.ReactNode = null;
  if (state.actions === 'single') actions = primary;
  else if (state.actions === 'two') actions = <>{cancel}{primary}</>;
  else actions = <>{cancel}{secondary}{primary}</>;

  return (
    <div>
      <h1 className="dl-section__title">Dialog</h1>
      <p className="dl-section__description">
        Centered confirmation dialog with a thumbnail icon tinted by intent (informative, constructive, warning, destructive), title, description, optional extras row, 1–3 actions, and optional footer link bar.
      </p>

      <div
        className="dl-playground__preview"
        data-theme={state.darkPreview ? 'dark' : undefined}
        style={state.darkPreview ? { background: 'var(--secondary-background-medium)' } : undefined}
      >
        <Button colorScheme={intent} onClick={() => setOpen(true)}>
          Open dialog
        </Button>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          style={state.style}
          title={TITLE_BY_STYLE[state.style]}
          description={
            state.showDescription
              ? 'Short description for context. Use this area for extra detail users need before acting.'
              : undefined
          }
          actions={actions}
          extras={
            state.showExtras ? (
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: 'var(--text-medium)' }}>
                <input type="checkbox" />
                <span>Delete all elements on this page</span>
              </label>
            ) : undefined
          }
          footerLink={
            state.showFooterLink
              ? { label: 'Learn more', onClick: () => {}, suffix: 'about this action.' }
              : undefined
          }
        />
      </div>

      <div className="dl-stories">
        <p className="dl-stories__heading">Stories</p>
        <div className="dl-stories__list">
          <DialogStory style="informative" />
          <DialogStory style="constructive" />
          <DialogStory style="warning" />
          <DialogStory style="destructive" />
        </div>
      </div>
    </div>
  );
}

function DialogStory({ style }: { style: DialogStyle }) {
  const [open, setOpen] = useState(false);
  const intent = INTENT_BY_STYLE[style];
  return (
    <div>
      <h3 className="dl-stories__item-title">{style[0].toUpperCase() + style.slice(1)}</h3>
      <div className="dl-stories__item-preview">
        <Button colorScheme={intent} onClick={() => setOpen(true)}>
          Open {style}
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          style={style}
          title={TITLE_BY_STYLE[style]}
          description="Short description for context."
          actions={
            <>
              <Button variant="ghost" colorScheme="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme={intent} onClick={() => setOpen(false)}>
                {PRIMARY_LABEL_BY_STYLE[style]}
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}

export function DialogPanel({
  state,
  onChange,
}: {
  state: DialogPanelState;
  onChange: (state: DialogPanelState) => void;
}) {
  const update = (partial: Partial<DialogPanelState>) => onChange({ ...state, ...partial });

  return (
    <>
      <div className="dl-playground__field">
        <label className="dl-playground__label">Style</label>
        <DropdownSingle
          size="sm"
          showLeadingIcon={false}
          value={state.style}
          onChange={(v) => update({ style: v as DialogStyle })}
          options={[
            { value: 'informative', label: 'Informative' },
            { value: 'constructive', label: 'Constructive' },
            { value: 'warning', label: 'Warning' },
            { value: 'destructive', label: 'Destructive' },
          ]}
        />
      </div>

      <div className="dl-playground__field">
        <label className="dl-playground__label">Actions</label>
        <div className="dl-playground__segmented">
          {([
            ['single', '1'],
            ['two', '2'],
            ['three', '3'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              className={`dl-playground__seg-btn ${state.actions === key ? 'dl-playground__seg-btn--active' : ''}`}
              onClick={() => update({ actions: key as ActionSet })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="dl-playground__divider" />

      <ToggleField label="Description" value={state.showDescription} onChange={(v) => update({ showDescription: v })} />
      <ToggleField label="Extras" value={state.showExtras} onChange={(v) => update({ showExtras: v })} />
      <ToggleField label="Footer link" value={state.showFooterLink} onChange={(v) => update({ showFooterLink: v })} />
      <ToggleField label="Dark Preview" value={state.darkPreview} onChange={(v) => update({ darkPreview: v })} />
    </>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="dl-playground__field dl-playground__field--row">
      <label className="dl-playground__label">{label}</label>
      <button
        className={`dl-playground__toggle ${value ? 'dl-playground__toggle--on' : ''}`}
        onClick={() => onChange(!value)}
      >
        <span className="dl-playground__toggle-thumb" />
      </button>
    </div>
  );
}
