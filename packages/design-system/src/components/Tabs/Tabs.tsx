import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './Tabs.scss';

export type TabsSize = 'sm' | 'md';
export type TabsAccent = 'default' | 'apps';

export interface TabItem {
  value: string;
  label?: ReactNode;
  icon?: string;
  iconCategory?: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  size?: TabsSize;
  accent?: TabsAccent;
  className?: string;
}

export function Tabs({
  items,
  value,
  onChange,
  size = 'md',
  accent = 'default',
  className,
}: TabsProps) {
  const rootClass = [
    'jf-tabs',
    `jf-tabs--${size}`,
    `jf-tabs--accent-${accent}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <div className={rootClass} role="tablist">
      {items.map((item) => {
        const isActive = item.value === value;
        const itemClass = [
          'jf-tabs__item',
          isActive && 'jf-tabs__item--active',
          item.disabled && 'jf-tabs__item--disabled',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            className={itemClass}
            onClick={() => onChange(item.value)}
          >
            {item.icon && (
              <Icon
                name={item.icon}
                category={item.iconCategory}
                size={iconSize}
                className="jf-tabs__icon"
              />
            )}
            {item.label && <span className="jf-tabs__label">{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
