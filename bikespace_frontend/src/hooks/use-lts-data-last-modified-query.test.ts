import {fetchLtsDataLastModified} from './use-lts-data-last-modified-query';

// Test the fetchLtsDataLastModified function to ensure it reads the Last-Modified header of the LTS pmtiles file and formats it as a local date.
// Run this command to test: TZ='America/Toronto' npx jest --runInBand --coverage=false src/hooks/use-lts-data-last-modified-query.test.ts

const ltsUrl = 'https://example.com/lts.pmtiles';

function mockFetchWithLastModified(lastModified: string | null) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'last-modified' ? lastModified : null,
    },
  });
}

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

it('returns the Last-Modified date and requests a single byte', async () => {
  mockFetchWithLastModified('Sat, 31 Oct 2026 18:25:28 GMT');
  await expect(fetchLtsDataLastModified(ltsUrl)).resolves.toBe('2026-10-31');
  expect(global.fetch).toHaveBeenCalledWith(
    ltsUrl,
    expect.objectContaining({headers: {Range: 'bytes=0-0'}})
  );
});

it('uses the local timezone rather than UTC', async () => {
  mockFetchWithLastModified('Sun, 01 Nov 2026 02:00:00 GMT');
  await expect(fetchLtsDataLastModified(ltsUrl)).resolves.toBe('2026-10-31');
});

it.each([null, 'not a date'])(
  'returns null for Last-Modified header %j',
  async lastModified => {
    mockFetchWithLastModified(lastModified);
    await expect(fetchLtsDataLastModified(ltsUrl)).resolves.toBeNull();
  }
);

it('reports HTTP failures', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: false, status: 404});
  await expect(fetchLtsDataLastModified(ltsUrl)).rejects.toThrow('404');
});

it('reports a missing URL', async () => {
  await expect(fetchLtsDataLastModified(undefined)).rejects.toThrow(
    'not configured'
  );
});
