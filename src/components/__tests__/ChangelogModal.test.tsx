// src/components/__tests__/ChangelogModal.test.tsx
// The changelog is the one asset fetched at runtime from a stable URL, so it
// is also the one asset a deploy does not invalidate on its own. These pin the
// cache-busting that makes a new release actually show its own release notes.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import buildInfo from '../../buildInfo';
import { en } from '../../i18n/locales/en';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
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
