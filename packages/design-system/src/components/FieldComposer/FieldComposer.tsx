import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon';
import './FieldComposer.scss';

// Inline SVGs for chip icons. The chip lives inside a contenteditable, so the
// icon must be embedded as raw markup — an async <Icon /> would jitter on every edit.
const ICON_SVGS: Record<string, string> = {
  'editor/type-square-filled': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V5C22 3.34315 20.6569 2 19 2H5ZM17 8C17.5523 8 18 7.55228 18 7C18 6.44772 17.5523 6 17 6H12H7C6.44771 6 6 6.44772 6 7C6 7.55228 6.44771 8 7 8H11V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V8H17Z" fill="currentColor"/></svg>`,
  'forms-files/paperclip-diagonal': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 6L9.20711 13.2929C8.81658 13.6834 8.81658 14.3166 9.20711 14.7071C9.59763 15.0976 10.2308 15.0976 10.6213 14.7071L17.9142 7.41421C18.6953 6.63316 18.6953 5.36684 17.9142 4.58579C17.1332 3.80474 15.8668 3.80474 15.0858 4.58579L7.79289 11.8787C6.23079 13.4408 6.23079 15.9734 7.79289 17.5355C9.355 19.0976 11.8876 19.0976 13.4497 17.5355L20.7426 10.2426" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
};

const iconKey = (name?: string, category?: string) =>
  name && category ? `${category}/${name}` : '';

export type FieldToken =
  | { type: 'field'; value: string; label: string; icon?: string; iconCategory?: string }
  | { type: 'text'; value: string };

export interface FieldComposerOption {
  value: string;
  label: string;
  icon?: string;
  iconCategory?: string;
}

export interface FieldComposerProps {
  value: FieldToken[];
  onChange?: (tokens: FieldToken[]) => void;
  options?: FieldComposerOption[];
  onCreate?: () => void;
  createLabel?: string;
  placeholder?: string;
  className?: string;
}

// Zero-width space — placed around chips so the caret can land before/after a
// contenteditable="false" element even when no real text neighbours it.
const ZWSP = '\u200B';

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function chipHtml(t: Extract<FieldToken, { type: 'field' }>): string {
  const iconHtml = ICON_SVGS[iconKey(t.icon, t.iconCategory)] ?? '';
  return (
    `<span class="jf-field-chip jf-field-chip--inline" contenteditable="false"` +
    ` data-token-type="field"` +
    ` data-token-value="${escapeHtml(t.value)}"` +
    ` data-token-label="${escapeHtml(t.label)}"` +
    ` data-token-icon="${escapeHtml(t.icon ?? '')}"` +
    ` data-token-icon-category="${escapeHtml(t.iconCategory ?? '')}"` +
    `>` +
    (iconHtml ? `<span class="jf-field-chip__icon">${iconHtml}</span>` : '') +
    `<span class="jf-field-chip__label">${escapeHtml(t.label)}</span>` +
    `</span>`
  );
}

function tokensToHtml(tokens: FieldToken[]): string {
  if (tokens.length === 0) return ZWSP;
  const parts: string[] = [];
  // Lead with a ZWSP if the first token is a chip so the caret can land before it.
  if (tokens[0].type === 'field') parts.push(ZWSP);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'text') {
      parts.push(escapeHtml(t.value));
    } else {
      parts.push(chipHtml(t));
      // Always trail every chip with a ZWSP so the caret can land after it.
      parts.push(ZWSP);
    }
  }
  return parts.join('');
}

function parseTokens(root: HTMLElement): FieldToken[] {
  const out: FieldToken[] = [];
  const pushText = (raw: string) => {
    // Strip the cosmetic zero-width spaces we sprinkle around chips for caret support.
    const value = raw.replace(/\u200B/g, '');
    if (!value) return;
    const last = out[out.length - 1];
    if (last && last.type === 'text') last.value += value;
    else out.push({ type: 'text', value });
  };
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.textContent ?? '');
      return;
    }
    if (node instanceof HTMLElement) {
      if (node.dataset.tokenType === 'field') {
        out.push({
          type: 'field',
          value: node.dataset.tokenValue || '',
          label: node.dataset.tokenLabel || '',
          icon: node.dataset.tokenIcon || undefined,
          iconCategory: node.dataset.tokenIconCategory || undefined,
        });
        return;
      }
      // Generic element (e.g. <br>, <div> from line breaks): walk children, treat <br> as space.
      if (node.tagName === 'BR') {
        pushText(' ');
        return;
      }
      node.childNodes.forEach(walk);
    }
  };
  root.childNodes.forEach(walk);
  return out;
}

function buildChipElement(option: FieldComposerOption): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'jf-field-chip jf-field-chip--inline';
  span.setAttribute('contenteditable', 'false');
  span.dataset.tokenType = 'field';
  span.dataset.tokenValue = option.value;
  span.dataset.tokenLabel = option.label;
  if (option.icon) span.dataset.tokenIcon = option.icon;
  if (option.iconCategory) span.dataset.tokenIconCategory = option.iconCategory;
  const iconHtml = ICON_SVGS[iconKey(option.icon, option.iconCategory)];
  span.innerHTML =
    (iconHtml ? `<span class="jf-field-chip__icon">${iconHtml}</span>` : '') +
    `<span class="jf-field-chip__label">${escapeHtml(option.label)}</span>`;
  return span;
}

export function FieldComposer({
  value,
  onChange,
  options,
  onCreate,
  createLabel = 'Create field',
  placeholder = 'Type or insert a field…',
  className,
}: FieldComposerProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<string>('');
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  // Sync editor HTML when external value changes (skip when the change came from us).
  useEffect(() => {
    if (!editorRef.current) return;
    const serialized = JSON.stringify(value);
    if (lastEmittedRef.current === serialized) return;
    editorRef.current.innerHTML = tokensToHtml(value);
    lastEmittedRef.current = serialized;
  }, [value]);

  const emit = (tokens: FieldToken[]) => {
    lastEmittedRef.current = JSON.stringify(tokens);
    onChange?.(tokens);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    emit(parseTokens(editorRef.current));
  };

  const insertChip = (option: FieldComposerOption) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    const chip = buildChipElement(option);
    let range: Range;
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0);
      range.deleteContents();
    } else {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    range.insertNode(chip);
    // Wrap the chip with zero-width spaces so the caret can land on either side.
    const before = document.createTextNode(ZWSP);
    const after = document.createTextNode(ZWSP);
    chip.before(before);
    chip.after(after);
    range.setStartAfter(after);
    range.setEndAfter(after);
    sel?.removeAllRanges();
    sel?.addRange(range);
    handleInput();
  };

  const clearChipSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll('.jf-field-chip--selected').forEach((el) => {
      el.classList.remove('jf-field-chip--selected');
    });
  };

  const findChipBeforeCaret = (): HTMLElement | null => {
    const editor = editorRef.current;
    if (!editor) return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.startContainer)) return null;
    // Walk backward from the caret position, skipping zero-width-space text nodes.
    let node: Node | null = range.startContainer;
    let offset = range.startOffset;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      // Anything other than ZWSP/empty before the caret means we're inside real text.
      const before = text.slice(0, offset).replace(/\u200B/g, '');
      if (before.length > 0) return null;
      // We're at the start (after only ZWSPs) — fall through to look at the previous sibling.
    } else {
      // Element container with offset between children — back up to the previous child.
      const children = node.childNodes;
      if (offset === 0) {
        node = node.parentNode;
      } else {
        node = children[offset - 1];
        offset = (node?.nodeType === Node.TEXT_NODE ? (node.textContent?.length ?? 0) : 1);
      }
    }

    // Climb to find the previous sibling that's a chip.
    while (node && node !== editor) {
      const prev = node.previousSibling;
      if (!prev) {
        node = node.parentNode;
        continue;
      }
      if (prev.nodeType === Node.TEXT_NODE) {
        const cleaned = (prev.textContent ?? '').replace(/\u200B/g, '');
        if (cleaned.length > 0) return null;
        node = prev;
        continue;
      }
      if (prev instanceof HTMLElement && prev.dataset.tokenType === 'field') {
        return prev;
      }
      return null;
    }
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Backspace') {
      // Any other key clears the pending selection.
      if (e.key.length === 1 || e.key === 'Delete' || e.key === 'Enter' || e.key === ' ') {
        clearChipSelection();
      }
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (!sel) return;

    // If a chip is currently selected, the next Backspace removes it (and its caret-helper ZWSPs).
    const alreadySelected = editor.querySelector<HTMLElement>('.jf-field-chip--selected');
    if (alreadySelected) {
      e.preventDefault();
      const before = alreadySelected.previousSibling;
      const after = alreadySelected.nextSibling;
      const range = document.createRange();
      // Place the caret where the chip was, then drop the surrounding ZWSPs together with the chip.
      const placeAt = before instanceof Text ? before : after instanceof Text ? after : null;
      alreadySelected.remove();
      if (before instanceof Text && /^\u200B*$/.test(before.textContent ?? '')) before.remove();
      if (after instanceof Text && /^\u200B*$/.test(after.textContent ?? '')) after.remove();
      if (placeAt && placeAt.parentNode) {
        range.setStart(placeAt, placeAt.textContent?.length ?? 0);
        range.collapse(true);
      } else {
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      sel.removeAllRanges();
      sel.addRange(range);
      handleInput();
      return;
    }

    // Otherwise, if the caret sits right after a chip, mark that chip as selected.
    const chipBefore = findChipBeforeCaret();
    if (chipBefore) {
      e.preventDefault();
      chipBefore.classList.add('jf-field-chip--selected');
    }
  };

  const handleClickOrSelect = () => {
    clearChipSelection();
  };

  // Position the menu under the trigger.
  useLayoutEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;
    const place = () => {
      const r = el.getBoundingClientRect();
      setMenuStyle({ position: 'fixed', top: r.bottom + 4, left: r.left, width: r.width, zIndex: 1000 });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const cls = ['jf-field-composer', className].filter(Boolean).join(' ');

  return (
    <div className={cls} ref={triggerRef}>
      <div
        ref={editorRef}
        className="jf-field-composer__editor"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={() => { clearChipSelection(); handleInput(); }}
        onKeyDown={handleKeyDown}
        onMouseDown={handleClickOrSelect}
      />
      {options && options.length > 0 && (
        <div className="jf-field-composer__trailing">
          <span className="jf-field-composer__divider" aria-hidden />
          <button
            type="button"
            className="jf-field-composer__add"
            aria-label="Insert field"
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name="plus-circle" category="general" size={20} />
          </button>
        </div>
      )}
      {open && options && createPortal(
        <div ref={menuRef} className="jf-field-composer__menu" data-theme="dark" style={menuStyle} role="listbox">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              className="jf-field-composer__menu-item"
              onClick={() => {
                insertChip(opt);
                setOpen(false);
              }}
            >
              {opt.icon && (
                <span className="jf-field-composer__menu-leading">
                  <Icon name={opt.icon} category={opt.iconCategory} size={20} />
                </span>
              )}
              <span className="jf-field-composer__menu-label">{opt.label}</span>
            </button>
          ))}
          {onCreate && (
            <>
              <div className="jf-field-composer__menu-divider" role="separator" />
              <button
                type="button"
                className="jf-field-composer__menu-item"
                onClick={() => {
                  onCreate();
                  setOpen(false);
                }}
              >
                <span className="jf-field-composer__menu-leading">
                  <Icon name="plus-circle" category="general" size={20} />
                </span>
                <span className="jf-field-composer__menu-label">{createLabel}</span>
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
