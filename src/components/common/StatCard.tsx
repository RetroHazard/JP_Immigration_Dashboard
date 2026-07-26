// src/components/common/StatCard.tsx
import { memo } from 'react';

import type React from 'react';
import { FloatingArrow, FloatingPortal } from '@floating-ui/react';
import { Icon } from '@iconify/react';

import { applicationOptions } from '../../constants/applicationOptions';
import { useTooltip } from '../../hooks/useTooltip';

type StatBadgeColor = 'blue' | 'yellow' | 'green' | 'red' | 'gray';

// Tailwind needs complete class names at build time, so badge colors are a
// static map onto the chart/status tokens (the old runtime `dark:${color}`
// interpolation never generated its dark classes at all).
const BADGE_CLASSES: Record<StatBadgeColor, string> = {
  blue: 'bg-chart-1',
  yellow: 'bg-chart-4',
  green: 'bg-chart-3',
  red: 'bg-destructive',
  gray: 'bg-muted-foreground',
};

interface StatCardProps {
  title: string;
  shortTitle: string;
  subtitle: string;
  value: string | number;
  color: StatBadgeColor;
  icon: string;
  filterType?: string;
}

const StatCardComponent: React.FC<StatCardProps> = ({ title, shortTitle, subtitle, value, color, icon, filterType }) => {
  const getApplicationTypeLabel = (type: string) => {
    const appType = applicationOptions.find((option) => option.value === type);
    return appType ? appType.short : '';
  };

  const appTypeLabel = filterType && filterType !== 'all' ? getApplicationTypeLabel(filterType) : '';
  const combinedSubtitle = appTypeLabel ? `${subtitle} (${appTypeLabel})` : subtitle;

  // FloatingUI tooltip configuration
  const {
    isOpen,
    arrowRef,
    refs,
    floatingStyles,
    context,
    getReferenceProps,
    getFloatingProps,
  } = useTooltip({
    placement: 'top',
    showDelay: 300,
    hideDelay: 0,
    showArrow: true,
  });

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="stat-card"
      >
        <div className="group relative">
          <div className={`${BADGE_CLASSES[color]} stat-badge`}>
            <div className="stat-icon-text">
              <Icon icon={icon} />
            </div>
          </div>
        </div>
        <div className="stat-details">
          <div className="stat-title">{title}</div>
          <div className="stat-short-title">{shortTitle}</div>
          <div className="stat-subtitle">{combinedSubtitle}</div>
          <div className="stat-value">{value}</div>
        </div>
      </div>

      {/* Tooltip - only visible on mobile with touch */}
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="floating-tooltip sm:pointer-events-none sm:hidden"
            data-status={isOpen ? 'open' : 'closed'}
          >
            <div className="flex flex-col gap-1 text-center">
              <div className="font-semibold">{title}</div>
              <div className="font-light">{combinedSubtitle}</div>
              <div className="mt-1 font-bold">{value}</div>
            </div>
            <FloatingArrow
              ref={arrowRef}
              context={context}
              className="fill-foreground"
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export const StatCard = memo(StatCardComponent);

StatCard.displayName = 'StatCard';
