const { chromium } = require('playwright');
const path = require('path');

const base = 'http://127.0.0.1:4200';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  console.log('ok:', message);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  page.on('pageerror', (error) => {
    console.error('pageerror', error.message);
  });

  await page.goto(`${base}/plan`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h2');
  assert(page.url().endsWith('/intake'), `locked /plan stays on intake (${page.url()})`);
  assert((await page.locator('h2').innerText()) === 'Intake', 'intake heading');

  await page.getByRole('tab', { name: 'Plan' }).click({ force: true });
  await page.waitForTimeout(300);
  assert(page.url().endsWith('/intake'), 'plan tab click stays on intake');

  await page.getByRole('button', { name: 'Northwind Retail' }).click();
  await page.getByRole('button', { name: '50–200' }).click();
  await page.getByRole('button', { name: 'Cloud cost overrun' }).click();
  await page.getByRole('button', { name: 'Compute' }).click();
  await page.getByRole('button', { name: 'Continue to plan' }).click();
  await page.waitForURL('**/plan');
  assert(
    (await page.locator('mat-card-title').first().innerText()) === '1:1 discovery meeting',
    'plan shows discovery meeting',
  );

  await page.getByRole('button', { name: 'Accept plan' }).click();
  await page.waitForURL('**/collect');
  await page.getByRole('button', { name: 'Submit details' }).click();
  assert(page.url().endsWith('/collect'), 'empty collect form stays put');
  await page.getByText('Industry is required').waitFor({ timeout: 5000 });
  assert((await page.locator('mat-error').count()) >= 1, 'required field errors show');

  await page.locator('mat-select').nth(0).click();
  await page.getByRole('option', { name: 'Retail' }).click();
  await page.locator('mat-select').nth(1).click();
  await page.getByRole('option', { name: 'North America' }).click();
  await page.locator('mat-select').nth(2).click();
  await page.getByRole('option', { name: 'This quarter' }).click();
  await page.locator('mat-select').nth(3).click();
  await page.getByRole('option', { name: '$100k–$500k' }).click();
  await page.getByLabel('Primary contact').fill('Jordan Lee');
  await page.locator('input[type=file]').setInputFiles(path.join(__dirname, 'tmp-upload.txt'));
  assert((await page.locator('.files li').innerText()) === 'tmp-upload.txt', 'file name captured');

  await page.getByRole('button', { name: 'Submit details' }).click();
  await page.waitForURL('**/run');
  assert((await page.getByText('BigQuery').count()) >= 1, 'suggested product shown');
  assert((await page.getByText('Partner commission 8%').count()) === 1, 'commission shown');

  await page.getByRole('button', { name: 'Mark cycle complete' }).click();
  await page.getByText('Cycle complete').waitFor();
  assert((await page.getByText('Cycle complete').count()) === 1, 'cycle complete message');

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForURL('**/intake');
  const bubbles = await page.locator('.bubble').count();
  assert(bubbles === 1, 'reset clears the chat');
  await page.getByRole('tab', { name: 'Run' }).click({ force: true });
  await page.waitForTimeout(300);
  assert(page.url().endsWith('/intake'), 'run tab locked after reset');

  await browser.close();
  console.log('flow passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
