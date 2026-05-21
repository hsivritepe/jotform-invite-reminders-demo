import { type ReactNode, useRef, useState, useEffect, useLayoutEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon';
import { FieldChip, type FieldChipProps } from '../FieldChip/FieldChip';
import './FieldMapper.scss';

export interface FieldMapperOption {
  value: string;
  label: string;
  icon?: string;
  iconCategory?: string;
}

export interface FieldMapperProps {
  /** Bound field rendered as a FieldChip. Pass null/undefined when nothing is mapped yet. */
  field?: FieldChipProps | null;
  /** Custom chip node — overrides `field` when provided. */
  chip?: ReactNode;
  /** When provided, the chip becomes a dropdown trigger and the menu lists these options. */
  options?: FieldMapperOption[];
  /** Currently selected option value (matches one of options[].value). */
  value?: string;
  onChange?: (value: string) => void;
  /** When provided, a "+ Create field" entry appears at the bottom of the menu (after a divider). */
  onCreate?: () => void;
  /** Label for the create entry. Default: "Create field". */
  createLabel?: string;
  /** Click handler for the trailing add button. */
  onAdd?: () => void;
  /** Click handler for the chip itself (only used when no `options` are provided). */
  onChipClick?: () => void;
  /** Hide the trailing add button. */
  hideAdd?: boolean;
  className?: string;
}

export function FieldMapper({
  field,
  chip,
  options,
  value,
  onChange,
  onCreate,
  createLabel = 'Create field',
  onAdd,
  onChipClick,
  hideAdd,
  className,
}: FieldMapperProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMenu = !!options;

  // Position the menu under the trigger, matched width.
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

  const cls = ['jf-field-mapper', className].filter(Boolean).join(' ');

  const handleChipClick = () => {
    if (hasMenu) {
      setOpen((o) => !o);
    } else if (onChipClick) {
      onChipClick();
    } else if (field?.onClick) {
      field.onClick();
    }
  };

  return (
    <div className={cls} ref={triggerRef}>
      <div className="jf-field-mapper__chip-slot">
        {chip ?? (
          field
            ? (
                <FieldChip
                  {...field}
                  onClick={hasMenu || onChipClick || field.onClick ? handleChipClick : undefined}
                />
              )
            : null
        )}
      </div>
      {!hideAdd && (
        <div className="jf-field-mapper__trailing">
          <span className="jf-field-mapper__divider" aria-hidden />
          <button
            type="button"
            className="jf-field-mapper__add"
            onClick={onAdd}
            aria-label="Add field"
          >
            <Icon name="plus-circle" category="general" size={20} />
          </button>
        </div>
      )}
      {hasMenu && open && createPortal(
        <div ref={menuRef} className="jf-field-mapper__menu" data-theme="dark" style={menuStyle} role="listbox">
          {options!.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`jf-field-mapper__menu-item${isSelected ? ' jf-field-mapper__menu-item--selected' : ''}`}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
              >
                {opt.icon && (
                  <span className="jf-field-mapper__menu-leading">
                    <Icon name={opt.icon} category={opt.iconCategory} size={20} />
                  </span>
                )}
                <span className="jf-field-mapper__menu-label">{opt.label}</span>
                {isSelected && (
                  <span className="jf-field-mapper__menu-trailing">
                    <Icon name="check" category="general" size={20} />
                  </span>
                )}
              </button>
            );
          })}
          {onCreate && (
            <>
              <div className="jf-field-mapper__menu-divider" role="separator" />
              <button
                type="button"
                className="jf-field-mapper__menu-item"
                onClick={() => {
                  onCreate();
                  setOpen(false);
                }}
              >
                <span className="jf-field-mapper__menu-leading">
                  <Icon name="plus-circle" category="general" size={20} />
                </span>
                <span className="jf-field-mapper__menu-label">{createLabel}</span>
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
