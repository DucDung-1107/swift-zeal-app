const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = process.argv[2] || 'http://127.0.0.1:4174';
  const results = [];
  try {
    await page.goto(base, { waitUntil: 'networkidle' });
    results.push('Home page loaded');

    const heroText = await page.locator('h1, h2, h3').first().textContent();
    results.push(`Hero/title present: ${heroText?.trim().slice(0, 40)}`);

    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    results.push('Login page loaded');
    const loginPrompt = await page.locator('text=Đăng nhập').first().isVisible();
    results.push(`Login prompt visible: ${loginPrompt}`);

    await page.goto(`${base}/signup`, { waitUntil: 'networkidle' });
    results.push('Signup page loaded');
    const signupPrompt = await page.locator('text=Đăng Ký').first().isVisible();
    results.push(`Signup prompt visible: ${signupPrompt}`);

    await page.goto(`${base}/forgot-password`, { waitUntil: 'networkidle' });
    results.push('Forgot password page loaded');
    const forgotPrompt = await page.locator('text=Quên mật khẩu').first().isVisible();
    results.push(`Forgot prompt visible: ${forgotPrompt}`);

    await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' });
    results.push('Checkout page loaded');
    const emptyCart = await page.locator('text=Giỏ hàng trống').first().isVisible();
    results.push(`Checkout empty cart prompt: ${emptyCart}`);

    await page.goto(`${base}/blog`, { waitUntil: 'networkidle' });
    results.push('Blog list page loaded');
    const firstPost = page.locator('a[href^="/blog/"]', { hasText: 'Xem thêm' }).first();
    if (await firstPost.count() > 0) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');
      results.push('Blog post detail loaded');
    } else {
      const altPost = page.locator('a[href^="/blog/"]').first();
      if (await altPost.count() > 0) {
        await altPost.click();
        await page.waitForLoadState('networkidle');
        results.push('Blog post detail loaded via href');
      } else {
        results.push('No blog post link found');
      }
    }

    console.log('=== SITE FLOW RESULTS ===');
    results.forEach((line) => console.log(line));
  } catch (error) {
    console.error('SITE_FLOW_FAILED', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();