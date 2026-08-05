// src/components/ChangelogModal.tsx
// shadcn/Radix Dialog gives focus trapping, Escape handling, focus restore,
// and scroll locking for free — the previous hand-rolled overlay had none.
'use client';

import { useEffect, useState } from 'react';

import type React from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import buildInfo from '../buildInfo';
import { useLocale } from '../i18n/LocaleContext';
import type { DictionaryKey } from '../i18n/types';
import { logger } from '../utils/logger';
import { ChangelogContent } from '../utils/renderChangelog';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocale();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<DictionaryKey | null>(null);

  useEffect(() => {
    if (!isOpen || markdown !== null) return;

    // Cache-busted on the build version. Every other asset the page loads is
    // content-hashed by Next, so a deploy invalidates it automatically; this
    // one is fetched at runtime from a stable URL, so without the query a
    // browser (or any cache in front of Pages) keeps serving the changelog
    // from the previous release even as the rest of the app updates. Keying it
    // to the version rather than disabling caching keeps it cacheable between
    // releases and refetches exactly once per deploy.
    fetch(`/CHANGELOG.md?v=${encodeURIComponent(buildInfo.buildVersion)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(setMarkdown)
      .catch((fetchError: unknown) => {
        logger.error('Error loading changelog:', fetchError);
        setError('errors.changelogUnavailable');
      });
  }, [isOpen, markdown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('changelog.title')}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {error && <p className="text-sm text-destructive">{t(error)}</p>}
          {!error && markdown === null && (
            <p className="text-sm text-muted-foreground">{t('changelog.loading')}</p>
          )}
          {!error && markdown !== null && <ChangelogContent markdown={markdown} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
