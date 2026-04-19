import { test, expect, _electron } from '@playwright/test';

test.describe('JobPilot Desktop', () => {
  test('should launch Electron and display dashboard', async () => {
    const electron = await _electron.launch({ args: ['.'] });
    const window = await electron.firstWindow();

    await window.waitForLoadState('networkidle');

    const title = await window.title();
    console.log('Window title:', title);

    const bodyText = await window.textContent('body');
    const hasContent = bodyText && bodyText.length > 0;
    expect(hasContent).toBe(true);

    await electron.close();
  });

  test('should have valid window dimensions', async () => {
    const electron = await _electron.launch({ args: ['.'] });
    const window = await electron.firstWindow();

    const bounds = await window.bounds();
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.height).toBeGreaterThan(0);

    await electron.close();
  });
});