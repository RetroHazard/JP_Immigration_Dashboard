// Thin wrapper over the shadcn/Radix Tooltip, which handles keyboard focus.
'use client';

import type React from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IconTooltipProps {
  label: string;
  children: React.ReactNode;
}

export const IconTooltip: React.FC<IconTooltipProps> = ({ label, children }) => (
  <Tooltip delayDuration={300}>
    <TooltipTrigger asChild>
      <span>{children}</span>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);
