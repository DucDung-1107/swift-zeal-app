const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const base = 'http://127.0.0.1:4173';

  try {
    console.log('Starting web flow test...');

    await page.goto(base, { waitUntil: 'networkidle' });
    console.log('Home page loaded:', page.url());

    const titleText = await page.locator('h2:text-matches("BỘ SƯU TẬP MỚI|Nhiều hơn|.*", "i")').first().textContent();
    console.log('Found homepage section title:', titleText?.trim());

    const productNav = page.locator('text=SẢN PHẨM').first();
    if (await productNav.count() > 0) {
      await productNav.click();
      await page.waitForLoadState('networkidle');
      console.log('Navigated to product collection:', page.url());
    }

    const firstProduct = page.locator('a:has-text("Xem mô tả")').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      console.log('Opened first product detail:', page.url());
      const productTitle = await page.locator('h1, h2, h3').first().textContent();
      console.log('Product title:', productTitle?.trim());
    } else {
      console.log('No product card found to open.');
    }

    const blogNav = page.locator('text=BLOG').first();
    if (await blogNav.count() > 0) {
      await blogNav.click();
      await page.waitForLoadState('networkidle');
      console.log('Navigated to blog:', page.url());
    }

    const adminLink = page.locator('text=Management, text=admin, text=Đăng nhập, text=Login').first();
    await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
    console.log('Admin page URL:', page.url());
    const adminTitle = await page.locator('text=Đăng nhập, text=Login, text=Management, text=ĐĂNG NHẬP').first().textContent();
    console.log('Admin / login page content sample:', adminTitle ? adminTitle.trim() : 'none');

    await page.goto(base, { waitUntil: 'networkidle' });
    console.log('Returned to home page');

    console.log('Web flow test completed successfully.');
  } catch (error) {
    console.error('Web flow test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();