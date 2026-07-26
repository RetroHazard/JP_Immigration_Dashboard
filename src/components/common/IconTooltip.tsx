// src/components/common/IconTooltip.tsx
// Thin wrapper over the shadcn/Radix Tooltip (replaces a bespoke Floating UI
// implementation; keyboard focus support comes for free).
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
