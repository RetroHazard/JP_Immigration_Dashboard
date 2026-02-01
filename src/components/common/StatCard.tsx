// src/components/common/StatCard.tsx
import { memo } from 'react';

import type React from 'react';
import { FloatingArrow, FloatingPortal } from '@floating-ui/react';
import { Icon } from '@iconify/react';

import { applicationOptions } from '../../constants/applicationOptions';
import { useTooltip } from '../../hooks/useTooltip';

interface StatCardProps {
  title: string;
  shortTitle: string;
  subtitle: string;
  value: string | number;
  color: string;
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
    touch: true,
  });

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="stat-card"
      >
        <div className="group relative">
          {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
          <div className={`${color} dark:${color.replace('500', '600')} stat-badge`}>
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
              className="fill-gray-600 dark:fill-gray-300"
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
