import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://tinder.com', { waitUntil: 'networkidle2' });

  console.log("請手動登入 Tinder...");
  await page.waitForTimeout(30000);

  console.log("登入成功！");
})();
