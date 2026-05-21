import { useEffect, useState } from 'react';

export interface IconProps {
  name: string;
  category?: string;
  size?: number;
  className?: string;
}

const cache = new Map<string, string>();
const iconModules = import.meta.glob('../../assets/icons/**/*.svg', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

export function Icon({
  name,
  category = 'general',
  size = 24,
  className,
}: IconProps) {
  const key = `${category}/${name}`;
  const [svg, setSvg] = useState(() => cache.get(key) || '');

  useEffect(() => {
    if (cache.has(key)) {
      setSvg(cache.get(key)!);
      return;
    }

    const path = `../../assets/icons/${category}/${name}.svg`;
    const loader = iconModules[path];
    if (!loader) return;

    loader().then((text) => {
      cache.set(key, text);
      setSvg(text);
    });
  }, [key, category, name]);

  return (
    <span
      className={`jf-icon ${className || ''}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
