import { Tabs } from '../../Tabs';
import type { TabItem, TabsSize } from '../../Tabs';

export type TabsStyle = 'text' | 'icon-text' | 'icon';

export interface TabsPanelState {
  style: TabsStyle;
  size: TabsSize;
  count: number;
  value: string;
  disableSecond: boolean;
  darkPreview: boolean;
}

export const defaultTabsState: TabsPanelState = {
  style: 'icon-text',
  size: 'md',
  count: 3,
  value: 'tab-1',
  disableSecond: false,
  darkPreview: false,
};

const DEFAULT_ICONS = [
  'house-filled',
  'magnifying-glass',
  'bell-concierge-filled',
  'heart',
  'star',
  'gear-filled',
  'bookmark-filled',
];

function buildItems(
  count: number,
  style: TabsStyle,
  disableSecond = false
): TabItem[] {
  return Array.from({ length: count }, (_, i) => {
    const value = `tab-${i + 1}`;
    const item: TabItem = { value };
    if (style !== 'icon') item.label = `Tab ${i + 1}`;
    if (style !== 'text') {
      item.icon = DEFAULT_ICONS[i % DEFAULT_ICONS.length];
      item.iconCategory = 'general';
    }
    if (disableSecond && i === 1) item.disabled = true;
    return item;
  });
}

export function TabsSection({
  state,
  onChange,
}: {
  state: TabsPanelState;
  onChange: (state: TabsPanelState) => void;
}) {
  const items = buildItems(state.count, state.style, state.disableSecond);
  const activeValue = items.some((i) => i.value === state.value && !i.disabled)
    ? state.value
    : items.find((i) => !i.disabled)?.value ?? items[0].value;

  return (
    <div>
      <h1 className="dl-section__title">Tabs</h1>
      <p className="dl-section__description">
        Horizontal tab row. Each tab can have an icon, a label, or both. Active tab gets a 4px accent underline and darker text color. Supports hover, keyboard focus, disabled per-item, and sm/md sizes.
      </p>

      <div
        className="dl-playground__preview"
        data-theme={state.darkPreview ? 'dark' : undefined}
        style={state.darkPreview ? { background: 'var(--secondary-background-medium)' } : undefined}
      >
        <div style={{ width: '100%', maxWidth: 768 }}>
          <Tabs
            items={items}
            value={activeValue}
            size={state.size}
            onChange={(value) => onChange({ ...state, value })}
          />
        </div>
      </div>

      <div className="dl-stories">
        <p className="dl-stories__heading">Stories</p>
        <div className="dl-stories__list">
          <div>
            <h3 className="dl-stories__item-title">Default (md)</h3>
            <div className="dl-stories__item-preview">
              <div style={{ width: '100%', maxWidth: 640 }}>
                <Tabs
                  items={buildItems(4, 'icon-text')}
                  value="tab-1"
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="dl-stories__item-title">Small (sm)</h3>
            <div className="dl-stories__item-preview">
              <div style={{ width: '100%', maxWidth: 500 }}>
                <Tabs
                  items={buildItems(4, 'icon-text')}
                  value="tab-1"
                  size="sm"
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="dl-stories__item-title">With a disabled tab</h3>
            <div className="dl-stories__item-preview">
              <div style={{ width: '100%', maxWidth: 640 }}>
                <Tabs
                  items={buildItems(4, 'icon-text', true)}
                  value="tab-1"
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="dl-stories__item-title">Text only</h3>
            <div className="dl-stories__item-preview">
              <div style={{ width: '100%', maxWidth: 640 }}>
                <Tabs
                  items={buildItems(3, 'text')}
                  value="tab-1"
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="dl-stories__item-title">Icon only</h3>
            <div className="dl-stories__item-preview">
              <div style={{ width: '100%', maxWidth: 640 }}>
                <Tabs
                  items={buildItems(5, 'icon')}
                  value="tab-1"
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabsPanel({
  state,
  onChange,
}: {
  state: TabsPanelState;
  onChange: (state: TabsPanelState) => void;
}) {
  const update = (partial: Partial<TabsPanelState>) => onChange({ ...state, ...partial });

  return (
    <>
      <div className="dl-playground__field">
        <label className="dl-playground__label">Size</label>
        <div className="dl-playground__segmented">
          {(['sm', 'md'] as const).map((s) => (
            <button
              key={s}
              className={`dl-playground__seg-btn ${state.size === s ? 'dl-playground__seg-btn--active' : ''}`}
              onClick={() => update({ size: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="dl-playground__field">
        <label className="dl-playground__label">Style</label>
        <div className="dl-playground__segmented">
          {([
            ['text', 'Text'],
            ['icon-text', 'Icon + Text'],
            ['icon', 'Icon'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              className={`dl-playground__seg-btn ${state.style === key ? 'dl-playground__seg-btn--active' : ''}`}
              onClick={() => update({ style: key })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="dl-playground__field">
        <label className="dl-playground__label">Tab count</label>
        <div className="dl-playground__segmented">
          {[2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              className={`dl-playground__seg-btn ${state.count === n ? 'dl-playground__seg-btn--active' : ''}`}
              onClick={() => update({ count: n })}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="dl-playground__divider" />

      <div className="dl-playground__field dl-playground__field--row">
        <label className="dl-playground__label">Disable tab 2</label>
        <button
          className={`dl-playground__toggle ${state.disableSecond ? 'dl-playground__toggle--on' : ''}`}
          onClick={() => update({ disableSecond: !state.disableSecond })}
        >
          <span className="dl-playground__toggle-thumb" />
        </button>
      </div>

      <div className="dl-playground__field dl-playground__field--row">
        <label className="dl-playground__label">Dark preview</label>
        <button
          className={`dl-playground__toggle ${state.darkPreview ? 'dl-playground__toggle--on' : ''}`}
          onClick={() => update({ darkPreview: !state.darkPreview })}
        >
          <span className="dl-playground__toggle-thumb" />
        </button>
      </div>
    </>
  );
}
