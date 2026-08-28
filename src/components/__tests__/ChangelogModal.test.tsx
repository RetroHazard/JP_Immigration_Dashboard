// src/components/__tests__/ChangelogModal.test.tsx
// The changelog is the one asset fetched at runtime from a stable URL, so it
// is also the one asset a deploy does not invalidate on its own. These pin the
// cache-busting that makes a new release actually show its own release notes,
// and the month disclosure that keeps a long history readable.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import buildInfo from '../../buildInfo';
import { en } from '../../i18n/locales/en';
import { fireEvent, renderWithProviders, screen, waitFor } from '../../test-utils';
import { ChangelogModal } from '../ChangelogModal';

const MARKDOWN = `# Changelog

## 2026-07

### Added

- **v1.2.0**: Localization foundation — every string is translatable
`;

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, text: () => Promise.resolve(MARKDOWN) });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChangelogModal', () => {
  it('requests the changelog keyed to the build version', async () => {
    renderWithProviders(<ChangelogModal isOpen onClose={() => undefined} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url.startsWith('/CHANGELOG.md?')).toBe(true);
    // Without the version the browser serves the previous release's notes.
    expect(new URL(url, 'https://example.test').searchParams.get('v')).toBe(buildInfo.buildVersion);
  });

  it('renders the fetched release notes', async () => {
    renderWithProviders(<ChangelogModal isOpen onClose={() => undefined} />);

    expect(await screen.findByText(/Localization foundation/)).toBeTruthy();
  });

  it('does not fetch until it is opened', () => {
    renderWithProviders(<ChangelogModal isOpen={false} onClose={() => undefined} />);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('surfaces a message rather than an empty dialog when the fetch fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    renderWithProviders(<ChangelogModal isOpen onClose={() => undefined} />);

    // Not a loose /changelog/i match — that also hits the dialog title.
    await waitFor(() => expect(screen.getByText(en['errors.changelogUnavailable'])).toBeTruthy());
  });
});

// Nine months of releases outrun the dialog's 80vh; the newest one alone is
// half the file. These pin the disclosure that keeps a reader on the release
// they opened the dialog for.
const TWO_MONTHS = `# Changelog

## 2026-08

### Added

- **v1.7.0**: Collapsible month sections in the changelog

## 2026-07

### Fixed

- **v1.6.1**: Markers read their own month
`;

const NEWEST = /Collapsible month sections/;
const OLDEST = /Markers read their own month/;

describe('ChangelogModal month sections', () => {
  beforeEach(() => {
    fetchMock.mockResolvedValue({ ok: true, text: () => Promise.resolve(TWO_MONTHS) });
  });

  it('opens on the newest month and leaves older ones collapsed', async () => {
    renderWithProviders(<ChangelogModal isOpen onClose={() => undefined} />);

    expect(await screen.findByText(NEWEST)).toBeTruthy();
    expect(screen.queryByText(OLDEST)).toBeNull();
    // Collapsed months are still an index — the header stays.
    expect(screen.getByRole('button', { name: /2026-07/ })).toBeTruthy();
  });

  it('reveals a month when its header is clicked, and hides it again', async () => {
    renderWithProviders(<ChangelogModal isOpen onClose={() => undefined} />);

    const older = await screen.findByRole('button', { name: /2026-07/ });
    fireEvent.click(older);
    expect(await screen.findByText(OLDEST)).toBeTruthy();

    fireEvent.click(older);
    await waitFor(() => expect(screen.queryByText(OLDEST)).toBeNull());
  });

  it('expands every month at once, then collapses every month at once', async () => {
    renderWithProviders(<ChangelogModal isOpen onClose={() => undefined} />);

    fireEvent.click(await screen.findByText(en['changelog.expandAll']));
    expect(await screen.findByText(OLDEST)).toBeTruthy();
    expect(screen.getByText(NEWEST)).toBeTruthy();

    // Collapse all takes the newest month with it, or it isn't "all".
    fireEvent.click(screen.getByText(en['changelog.collapseAll']));
    await waitFor(() => expect(screen.queryByText(NEWEST)).toBeNull());
    expect(screen.queryByText(OLDEST)).toBeNull();
  });

  it('does not offer the bulk toggle when there is only one month', async () => {
    fetchMock.mockResolvedValue({ ok: true, text: () => Promise.resolve(MARKDOWN) });
    renderWithProviders(<ChangelogModal isOpen onClose={() => undefined} />);

    await screen.findByText(/Localization foundation/);
    expect(screen.queryByText(en['changelog.expandAll'])).toBeNull();
  });

  it('starts each visit on the newest month rather than where the last one ended', async () => {
    const { rerender } = renderWithProviders(<ChangelogModal isOpen onClose={() => undefined} />);

    fireEvent.click(await screen.findByText(en['changelog.expandAll']));
    expect(await screen.findByText(OLDEST)).toBeTruthy();

    rerender(<ChangelogModal isOpen={false} onClose={() => undefined} />);
    rerender(<ChangelogModal isOpen onClose={() => undefined} />);

    expect(await screen.findByText(NEWEST)).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(OLDEST)).toBeNull());
  });
});
