// src/components/common/SeriesLegend.tsx
// Small shared legend row for the Bklit-based charts. Identity is carried by
// the color chip; the text stays in ink tokens. When `onToggle` is provided,
// entries become show/hide buttons for their series (dimmed = hidden).
import type React from 'react';

export interface LegendItem {
  label: string;
  color: string;
  shape?: 'square' | 'line';
  /** Only meaningful with `onToggle`: renders the entry dimmed */
  hidden?: boolean;
}

const Chip: React.FC<{ item: LegendItem }> = ({ item }) => (
  <span
    aria-hidden="true"
    className={item.shape === 'line' ? 'h-0.5 w-3.5 rounded-full' : 'size-2.5 rounded-[3px]'}
    style={{ backgroundColor: item.color }}
  />
);

export const SeriesLegend: React.FC<{
  items: LegendItem[];
  className?: string;
  /** Makes entries clickable series toggles */
  onToggle?: (label: string) => void;
}> = ({ items, className, onToggle }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-foreground ${className ?? ''}`}>
    {items.map((item) =>
      onToggle ? (
        <button
          key={item.label}
          type="button"
          onClick={() => onToggle(item.label)}
          aria-pressed={!item.hidden}
          title={item.hidden ? `Show ${item.label}` : `Hide ${item.label}`}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            item.hidden ? 'opacity-35 hover:opacity-60' : 'hover:opacity-75'
          }`}
        >
          <Chip item={item} />
          {item.label}
        </button>
      ) : (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <Chip item={item} />
          {item.label}
        </span>
      )
    )}
  </div>
);
