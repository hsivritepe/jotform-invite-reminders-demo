import { type ReactNode, type KeyboardEvent, type Ref, type CSSProperties, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownMenuShellProps {
  placement: 'top' | 'bottom';
  isSheet: boolean;
  title?: string;
  menuRef: Ref<HTMLDivElement>;
  triggerRef?: { readonly current: HTMLElement | null };
  onClose: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
  multiselectable?: boolean;
  className?: string;
  /** Render desktop menu in a portal anchored to the trigger. Use when the trigger lives inside an `overflow: hidden` ancestor. */
  usePortal?: boolean;
  /** Horizontal alignment relative to the trigger when usePortal is true. */
  portalAlign?: 'start' | 'center' | 'end';
  children: ReactNode;
}

function useTriggerAnchor(
  triggerRef: { readonly current: HTMLElement | null } | undefined,
  enabled: boolean,
  placement: 'top' | 'bottom',
  align: 'start' | 'center' | 'end',
): CSSProperties | null {
  const [style, setStyle] = useState<CSSProperties | null>(null);
  useLayoutEffect(() => {
    if (!enabled) return;
    const el = triggerRef?.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const top = placement === 'bottom' ? r.bottom + 4 : undefined;
      const bottom = placement === 'top' ? window.innerHeight - r.top + 4 : undefined;
      const next: CSSProperties = { position: 'fixed', top, bottom };
      if (align === 'start') next.left = r.left;
      else if (align === 'end') next.right = window.innerWidth - r.right;
      else { next.left = r.left + r.width / 2; next.transform = 'translateX(-50%)'; }
      setStyle(next);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [enabled, placement, align, triggerRef]);
  return style;
}

function inheritThemeFrom(el: HTMLElement | null): string | undefined {
  let node: HTMLElement | null = el;
  while (node) {
    const theme = node.dataset?.theme;
    if (theme) return theme;
    node = node.parentElement;
  }
  return undefined;
}

export function DropdownMenuShell({
  placement,
  isSheet,
  title,
  menuRef,
  triggerRef,
  onClose,
  onKeyDown,
  onMouseLeave,
  multiselectable,
  className,
  usePortal,
  portalAlign = 'center',
  children,
}: DropdownMenuShellProps) {
  const portalStyle = useTriggerAnchor(triggerRef, !!usePortal && !isSheet, placement, portalAlign);
  if (isSheet) {
    const theme = inheritThemeFrom(triggerRef?.current ?? null);
    const sheet = (
      <div className="jf-dropdown__sheet-root" data-theme={theme}>
        <div className="jf-dropdown__sheet-backdrop" onClick={onClose} />
        <div
          ref={menuRef}
          className="jf-dropdown__menu jf-dropdown__menu--sheet"
          role="listbox"
          aria-multiselectable={multiselectable || undefined}
          tabIndex={-1}
          onKeyDown={onKeyDown}
        >
          <div className="jf-dropdown__sheet-handle" aria-hidden />
          {title && <div className="jf-dropdown__sheet-title">{title}</div>}
          <div className="jf-dropdown__sheet-list">{children}</div>
        </div>
      </div>
    );
    return createPortal(sheet, document.body);
  }

  const menuClass = [
    'jf-dropdown__menu',
    `jf-dropdown__menu--${placement}`,
    usePortal && 'jf-dropdown__menu--portal',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const menu = (
    <div
      ref={menuRef}
      className={menuClass}
      role="listbox"
      aria-multiselectable={multiselectable || undefined}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onMouseLeave={onMouseLeave}
      style={usePortal ? portalStyle ?? { visibility: 'hidden' } : undefined}
    >
      {children}
    </div>
  );
  if (usePortal) return createPortal(menu, document.body);
  return menu;
}
