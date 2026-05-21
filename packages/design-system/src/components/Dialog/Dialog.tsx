import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon';
import { Link } from '../Link/Link';
import { Button } from '../Button/Button';
import './Dialog.scss';

export type DialogStyle =
  | 'informative'
  | 'constructive'
  | 'warning'
  | 'destructive';

export interface DialogFooterLink {
  label: string;
  onClick?: () => void;
  href?: string;
  suffix?: string;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  style?: DialogStyle;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  extras?: ReactNode;
  footerLink?: DialogFooterLink;
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  children?: ReactNode;
  className?: string;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DEFAULT_ICON: Record<DialogStyle, { name: string; category: string }> = {
  informative: { name: 'info-circle-filled', category: 'general' },
  constructive: { name: 'check-circle-filled', category: 'general' },
  warning: { name: 'exclamation-triangle-filled', category: 'general' },
  destructive: { name: 'exclamation-circle-filled', category: 'general' },
};

export function Dialog({
  open,
  onClose,
  style = 'informative',
  title,
  description,
  icon,
  actions,
  extras,
  footerLink,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  children,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (dismissOnEscape && e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        );
        if (focusables.length === 0) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose, dismissOnEscape]);

  if (!open) return null;

  const rootClass = ['jf-dialog', `jf-dialog--${style}`, className]
    .filter(Boolean)
    .join(' ');

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dismissOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const iconNode = icon ?? (
    <Icon
      name={DEFAULT_ICON[style].name}
      category={DEFAULT_ICON[style].category}
      size={40}
    />
  );

  return createPortal(
    <div className="jf-dialog__overlay" onMouseDown={handleBackdrop}>
      <div
        ref={dialogRef}
        className={rootClass}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="jf-dialog-title"
      >
        <div className="jf-dialog__close">
          <Button
            variant="filled"
            colorScheme="secondary"
            shape="rounded"
            iconOnly
            aria-label="Close"
            onClick={onClose}
            leftIcon={<Icon name="xmark" category="general" size={16} />}
          />
        </div>
        <div className="jf-dialog__layout">
          <div className="jf-dialog__thumbnail">
            <span className="jf-dialog__thumbnail-icon">{iconNode}</span>
          </div>
          <div className="jf-dialog__content">
            <h2 id="jf-dialog-title" className="jf-dialog__title">
              {title}
            </h2>
            {description && <p className="jf-dialog__description">{description}</p>}
            {extras && <div className="jf-dialog__extras">{extras}</div>}
          </div>
          {children && <div className="jf-dialog__body">{children}</div>}
          {actions && <div className="jf-dialog__actions">{actions}</div>}
        </div>
        {footerLink && (
          <div className="jf-dialog__footer">
            <Link
              size="lg"
              onClick={footerLink.onClick}
              href={footerLink.href}
            >
              {footerLink.label}
            </Link>
            {footerLink.suffix && (
              <span className="jf-dialog__footer-suffix">{footerLink.suffix}</span>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
