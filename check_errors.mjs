import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
try {
  await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));
} catch (e) {
  console.log('Error:', e.message);
}
await browser.close();
