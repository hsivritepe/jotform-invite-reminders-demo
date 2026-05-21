import { type InputHTMLAttributes, type MouseEvent, forwardRef, useState } from 'react';
import './ColorInput.scss';

export interface ColorInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'error' | 'success' | 'warning' | 'readonly';
  color?: string;
  onColorChange?: (color: string) => void;
  /** Called when the swatch is clicked. When omitted, the swatch is non-interactive. */
  onSwatchClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      size = 'md',
      status = 'default',
      color,
      onColorChange,
      onSwatchClick,
      disabled,
      readOnly,
      className,
      ...rest
    },
    ref
  ) => {
    const resolvedStatus = readOnly ? 'readonly' : status;
    const [internalColor, setInternalColor] = useState('#0A1551');

    const currentColor = color !== undefined ? color : internalColor;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (onColorChange) {
        onColorChange(val);
      } else {
        setInternalColor(val);
      }
    };

    const rootClass = [
      'jf-color-input',
      `jf-color-input--${size}`,
      `jf-color-input--${resolvedStatus}`,
      disabled && 'jf-color-input--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const swatchInteractive = !!onSwatchClick && !disabled && resolvedStatus !== 'readonly';

    return (
      <div className={rootClass}>
        <input
          ref={ref}
          type="text"
          className="jf-color-input__field"
          value={currentColor}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly || resolvedStatus === 'readonly'}
          {...rest}
        />
        <button
          type="button"
          className="jf-color-input__swatch-wrapper"
          style={swatchInteractive ? undefined : { cursor: 'default' }}
          onClick={swatchInteractive ? onSwatchClick : undefined}
          tabIndex={swatchInteractive ? 0 : -1}
          aria-label="Open color picker"
          disabled={disabled || resolvedStatus === 'readonly'}
        >
          <span
            className="jf-color-input__swatch"
            style={{ backgroundColor: currentColor }}
          />
        </button>
      </div>
    );
  }
);

ColorInput.displayName = 'ColorInput';
