const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = process.argv[2] || 'http://127.0.0.1:4173';
  const errors = [];
  const findings = [];

  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error') errors.push(`console:${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror:${err.message}`));

  try {
    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    const loginForm = page.locator('form').first();
    await loginForm.getByPlaceholder('Email').fill('admin@toantam.vn');
    await loginForm.getByPlaceholder('Mật khẩu').fill('toantam@2026');
    await loginForm.getByRole('button', { name: 'Đăng Nhập' }).click();
    await page.waitForURL(/\/admin$/, { timeout: 20000 });
    findings.push('Login admin: OK');

    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    const productPanel = page.locator('div.bg-card.border.rounded-lg.p-6.mb-6').first();
    await productPanel.waitFor({ state: 'visible', timeout: 10000 });
    await productPanel.locator('input').nth(1).fill('SP test automation');
    await productPanel.locator('input[type="number"]').first().fill('123456');
    await page.getByPlaceholder('Dán URL ảnh hoặc upload ảnh mới').fill('/assets/products/solar-streetlight-1-CM8sXVa-.png');
    await page.getByRole('button', { name: 'Lưu' }).first().click();
    await page.waitForTimeout(1200);
    findings.push('Add product button + save click: OK (no crash)');

    await page.getByRole('button', { name: 'Cấu hình' }).first().click();
    await page.waitForTimeout(600);

    const footerLabel = page.getByText('Dòng cuối footer').first();
    const footerRow = footerLabel.locator('xpath=..');
    const footerInput = footerRow.locator('input').first();
    const newFooter = `Auto test ${Date.now()}`;
    await footerInput.fill(newFooter);
    await footerRow.getByRole('button').click();
    await page.waitForTimeout(800);
    findings.push('Site config save button: clicked');

    await page.getByRole('button', { name: 'Dịch vụ' }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Thêm dịch vụ' }).click();
    const servicePanel = page.locator('div.bg-card.border.rounded-lg.p-6.mb-6').first();
    await servicePanel.waitFor({ state: 'visible', timeout: 10000 });
    await servicePanel.locator('input').first().fill('Dịch vụ test');
    await page.getByRole('button', { name: /^Lưu$/ }).first().click();
    await page.waitForTimeout(900);
    findings.push('Service add/save button: clicked');

    console.log('=== FINDINGS ===');
    findings.forEach((f) => console.log(f));
    console.log('=== ERRORS ===');
    if (errors.length === 0) console.log('none');
    else errors.forEach((e) => console.log(e));
  } catch (e) {
    console.error('FLOW_FAILED', e.message);
    console.log('=== FINDINGS ===');
    findings.forEach((f) => console.log(f));
    console.log('=== ERRORS ===');
    if (errors.length === 0) console.log('none');
    else errors.forEach((er) => console.log(er));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
