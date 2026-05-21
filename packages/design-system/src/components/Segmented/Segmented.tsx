import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './Segmented.scss';

export type SegmentedSize = 'sm' | 'md';
export type SegmentedAccent = 'default' | 'apps';
export type SegmentedVariant = 'icon' | 'text' | 'iconText';

export interface SegmentedItem {
  value: string;
  label?: ReactNode;
  /** DS Icon name. Ignored when `iconContent` is provided. */
  icon?: string;
  iconCategory?: string;
  /** Custom node rendered in the icon slot — use for parametric SVGs that don't fit the DS icon set. */
  iconContent?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface SegmentedProps {
  items: SegmentedItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: SegmentedVariant;
  size?: SegmentedSize;
  accent?: SegmentedAccent;
  className?: string;
  fullWidth?: boolean;
}

export function Segmented({
  items,
  value,
  onChange,
  variant = 'text',
  size = 'md',
  accent = 'apps',
  className,
  fullWidth = true,
}: SegmentedProps) {
  const rootClass = [
    'jf-segmented',
    `jf-segmented--${size}`,
    `jf-segmented--${variant}`,
    `jf-segmented--accent-${accent}`,
    fullWidth && 'jf-segmented--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const iconSize = variant === 'icon'
    ? (size === 'sm' ? 20 : 24)
    : (size === 'sm' ? 14 : 16);

  return (
    <div className={rootClass} role="radiogroup">
      {items.map((item) => {
        const isActive = item.value === value;
        const btnClass = [
          'jf-segmented__btn',
          isActive && 'jf-segmented__btn--active',
          item.disabled && 'jf-segmented__btn--disabled',
        ]
          .filter(Boolean)
          .join(' ');
        const showIcon = (variant === 'icon' || variant === 'iconText') && (item.icon || item.iconContent);
        const showLabel = (variant === 'text' || variant === 'iconText') && item.label != null;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={item.ariaLabel}
            disabled={item.disabled}
            className={btnClass}
            onClick={() => onChange(item.value)}
          >
            {showIcon && (
              <span className="jf-segmented__icon">
                {item.iconContent ?? (
                  <Icon name={item.icon!} category={item.iconCategory} size={iconSize} />
                )}
              </span>
            )}
            {showLabel && <span className="jf-segmented__label">{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
