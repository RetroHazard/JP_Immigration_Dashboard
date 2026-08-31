// src/components/ChangelogModal.tsx
// shadcn/Radix Dialog gives focus trapping, Escape handling, focus restore,
// and scroll locking for free — the previous hand-rolled overlay had none.
'use client';

import { useEffect, useMemo, useState } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';
import type React from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import buildInfo from '../buildInfo';
import { useLocale } from '../i18n/LocaleContext';
import type { DictionaryKey } from '../i18n/types';
import { logger } from '../utils/logger';
import { ChangelogContent, parseChangelog } from '../utils/renderChangelog';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocale();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<DictionaryKey | null>(null);
  // null means untouched, which resolves to "newest month only" below. Keeping
  // the default derived rather than seeded means it survives the markdown
  // arriving after the dialog opens, and resetting is a single assignment.
  const [openOverride, setOpenOverride] = useState<readonly string[] | null>(null);

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

  // The fetched markdown is cached for the session; where the reader had got to
  // is not. Every open starts on the newest release rather than wherever they
  // left off eight months back.
  useEffect(() => {
    if (!isOpen) setOpenOverride(null);
  }, [isOpen]);

  // CHANGELOG.md is written newest-first and the parser preserves document
  // order, so months[0] is the current month.
  const months = useMemo(() => (markdown === null ? [] : parseChangelog(markdown)), [markdown]);
  const openMonths = openOverride ?? months.slice(0, 1).map((month) => month.heading);
  const allOpen = months.length > 0 && openMonths.length === months.length;

  const toggleMonth = (heading: string) =>
    setOpenOverride(
      openMonths.includes(heading) ? openMonths.filter((open) => open !== heading) : [...openMonths, heading]
    );

  const toggleAll = () => setOpenOverride(allOpen ? [] : months.map((month) => month.heading));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('changelog.title')}</DialogTitle>
        </DialogHeader>
        {/* Outside the scroll container so it stays reachable from the bottom
            of a long release. Collapsed months are unmounted, so this is also
            the only way to get the whole document in front of a page search. */}
        {!error && months.length > 1 && (
          <div className="-mt-2 flex justify-end border-b border-border pb-2">
            <button
              onClick={toggleAll}
              aria-expanded={allOpen}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80"
            >
              {allOpen ? (
                <ChevronUp className="size-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-3.5" aria-hidden="true" />
              )}
              {t(allOpen ? 'changelog.collapseAll' : 'changelog.expandAll')}
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {error && <p className="text-sm text-destructive">{t(error)}</p>}
          {!error && markdown === null && <p className="text-sm text-muted-foreground">{t('changelog.loading')}</p>}
          {!error && markdown !== null && (
            <ChangelogContent months={months} openMonths={openMonths} onToggleMonth={toggleMonth} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
