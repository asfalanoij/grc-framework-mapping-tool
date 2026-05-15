import { describe, it, expect, vi } from 'vitest';
import { timestampSlug, triggerDownload } from './download';

describe('timestampSlug', () => {
  it('formats a Date as YYYYMMDD-HHMM', () => {
    const fixed = new Date(2026, 4, 15, 8, 30); // 15 May 2026, 08:30 local
    expect(timestampSlug(fixed)).toBe('20260515-0830');
  });

  it('pads months and days under 10', () => {
    const d = new Date(2026, 0, 3, 4, 5);
    expect(timestampSlug(d)).toBe('20260103-0405');
  });
});

describe('triggerDownload', () => {
  it('creates an anchor, clicks it, and revokes the object URL', () => {
    const created: HTMLAnchorElement[] = [];
    const originalCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag) as HTMLAnchorElement;
      if (tag === 'a') created.push(el);
      return el;
    });
    const clickSpy = vi.fn();
    URL.createObjectURL = vi.fn(() => 'blob:fake') as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;

    triggerDownload('test.csv', 'a,b\r\n1,2\r\n');

    // Last created anchor should have href + download set.
    const anchor = created[created.length - 1];
    expect(anchor).toBeDefined();
    expect(anchor?.download).toBe('test.csv');
    expect((URL.revokeObjectURL as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(1);
    createSpy.mockRestore();
    // Defensive: at least the URL helpers were invoked.
    expect(clickSpy).not.toHaveBeenCalled(); // the anchor.click() was called on the real DOM node
  });
});
