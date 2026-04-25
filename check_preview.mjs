import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], { stdio: 'inherit' });

await new Promise(r => setTimeout(r, 3000));

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
try {
  await page.goto('http://localhost:4173', { waitUntil: 'load', timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cartBtn = buttons.find(b => b.innerHTML.includes('lucide-shopping-cart'));
    if (cartBtn) {
      console.log('Clicking cart btn now...');
      cartBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 1000));
} catch (e) {
  console.log('Error:', e.message);
}
await browser.close();
previewProcess.kill();
process.exit(0);
