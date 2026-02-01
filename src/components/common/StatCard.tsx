// src/components/common/StatCard.tsx
import { memo } from 'react';

import type React from 'react';
import { Icon } from '@iconify/react';
import Tippy from '@tippyjs/react';

import { applicationOptions } from '../../constants/applicationOptions';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';

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

  return (
    <Tippy
      className="sm:pointer-events-none sm:hidden"
      content={
        <div className="flex flex-col gap-1 text-center">
          <div className="font-semibold">{title}</div>
          <div className="font-light">{combinedSubtitle}</div>
          <div className="mt-1 font-bold">{value}</div>
        </div>
      }
      animation="shift-away"
      placement="top"
      arrow={true}
      theme="stat-tooltip"
      delay={[300, 0]}
      touch={true}
    >
      <div className="stat-card">
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
    </Tippy>
  );
};

// Memoize to prevent unnecessary re-renders
export const StatCard = memo(StatCardComponent);

StatCard.displayName = 'StatCard';
