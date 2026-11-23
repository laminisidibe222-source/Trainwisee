import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
const EMAIL = readFileSync('./_e.txt', 'utf8').trim();
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)); });
await page.setViewport({ width: 1440, height: 1000 });
await page.goto('https://trainwisee.vercel.app/', { waitUntil: 'networkidle2' });
await page.evaluate(async (email) => {
  await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'i18npass1' }) });
}, EMAIL);
await page.evaluate(() => localStorage.setItem('trainwise.lang', 'fr'));
const t0 = Date.now();
await page.reload({ waitUntil: 'networkidle2' });
await page.waitForFunction(() => document.body.innerText.includes('Le split de la semaine'), { timeout: 30000 });
const ms = Date.now() - t0;
const fr = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.innerText.replace(/\s+/g, ' ').trim(),
  dial: document.body.innerText.includes('sur 12 semaines'),
  next: document.body.innerText.includes('Prochaine séance'),
  nav: [...document.querySelectorAll('nav button')].map((b) => b.textContent.trim()).slice(0, 4),
  overflow: document.documentElement.scrollWidth - window.innerWidth,
  lang: document.documentElement.lang,
}));
await page.screenshot({ path: '_p_fr.png', fullPage: true });
// back to English
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'en').click());
await new Promise((r) => setTimeout(r, 400));
const en = await page.evaluate(() => document.querySelector('h1')?.innerText.replace(/\s+/g, ' ').trim());
console.log(JSON.stringify({ loadMs: ms, fr, en, errs }, null, 2));
await browser.close();
