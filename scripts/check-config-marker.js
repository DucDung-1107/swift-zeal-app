const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:4174';
const marker = process.argv[3];

if (!marker) {
  console.error('Missing marker argument');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const found = await page.locator(`text=${marker}`).first().isVisible();
    console.log('MARKER_FOUND', found);
    process.exit(found ? 0 : 1);
  } catch (error) {
    console.error('ERROR', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
