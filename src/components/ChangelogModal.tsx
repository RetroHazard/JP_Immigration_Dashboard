// src/components/ChangelogModal.tsx
import { useEffect, useState } from 'react';

import type React from 'react';
import { Icon } from '@iconify/react';

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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-soft-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Changelog"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="section-title">Changelog</h2>
          <button onClick={onClose} aria-label="Close changelog" className="theme-toggle-icon">
            <Icon icon="ph:x-bold" className="size-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        <div className="card-content overflow-y-auto p-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!error && markdown === null && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {!error && markdown !== null && <ChangelogContent markdown={markdown} />}
        </div>
      </div>
    </div>
  );
};
