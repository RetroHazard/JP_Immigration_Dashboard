// src/components/ChangelogModal.tsx
// shadcn/Radix Dialog gives focus trapping, Escape handling, focus restore,
// and scroll locking for free — the previous hand-rolled overlay had none.
'use client';

import { useEffect, useState } from 'react';

import type React from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { logger } from '../utils/logger';
import { ChangelogContent } from '../utils/renderChangelog';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || markdown !== null) return;

    fetch('/CHANGELOG.md')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(setMarkdown)
      .catch((fetchError: unknown) => {
        logger.error('Error loading changelog:', fetchError);
        setError('Unable to load the changelog.');
      });
  }, [isOpen, markdown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!error && markdown === null && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!error && markdown !== null && <ChangelogContent markdown={markdown} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
