// src/components/common/SeriesLegend.tsx
// Small shared legend row for the Bklit-based charts. Identity is carried by
// the color chip; the text stays in ink tokens.
import type React from 'react';

export interface LegendItem {
  label: string;
  color: string;
  shape?: 'square' | 'line';
}

export const SeriesLegend: React.FC<{ items: LegendItem[]; className?: string }> = ({ items, className }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-foreground ${className ?? ''}`}>
    {items.map((item) => (
      <span key={item.label} className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={item.shape === 'line' ? 'h-0.5 w-3.5 rounded-full' : 'size-2.5 rounded-[3px]'}
          style={{ backgroundColor: item.color }}
        />
        {item.label}
      </span>
    ))}
  </div>
);
