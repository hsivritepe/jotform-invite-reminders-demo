import { type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './FieldChip.scss';

export interface FieldChipProps {
  /** Display label, typically the bound field name. */
  label: ReactNode;
  /** Leading icon by name (DS Icon registry). Use `iconNode` for a custom node. */
  icon?: string;
  iconCategory?: string;
  /** Custom node to use as the leading icon — overrides `icon`. */
  iconNode?: ReactNode;
  /** Callback fired when the chip is clicked. When provided the chip becomes a button. */
  onClick?: () => void;
  className?: string;
}

export function FieldChip({ label, icon, iconCategory, iconNode, onClick, className }: FieldChipProps) {
  const cls = ['jf-field-chip', className].filter(Boolean).join(' ');
  const inner = (
    <>
      <span className="jf-field-chip__icon">
        {iconNode ?? (icon ? <Icon name={icon} category={iconCategory} size={18} /> : null)}
      </span>
      <span className="jf-field-chip__label">{label}</span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {inner}
      </button>
    );
  }
  return <span className={cls}>{inner}</span>;
}
