const { chromium } = require('playwright');
const base = 'http://127.0.0.1:4173';

(async () => {
  const marker = process.argv[2];
  if (!marker) {
    console.error('MISSING_MARKER_ARG');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const found = await page.locator(`text=${marker}`).first().isVisible();
    console.log('CONFIG_MARKER_VISIBLE', found);
  } catch (e) {
    console.error('LIVE_TEST_FAILED', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
