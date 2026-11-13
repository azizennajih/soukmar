import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const out = 'C:/AIProjekte/soukmar/branding/video/shots';
fs.mkdirSync(out, { recursive: true });
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const LANGS = { de: 'DE', en: 'DE', fr: 'MA', ar: 'MA' };
for (const [lang, country] of Object.entries(LANGS)) {
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setCookie(...['soukmar_country=' + country, 'soukmar_lang=' + lang, 'soukmar_cookie_consent=essential'].map(s => { const [name, value] = s.split('='); return { name, value, domain: 'souqmar24.com', path: '/' }; }));
  await p.evaluateOnNewDocument((c, l) => { try { localStorage.soukmar_country = c; localStorage.soukmar_lang = l; localStorage.soukmar_cookie_consent = 'essential'; localStorage.soukmar_country_ip_detected = '1'; } catch {} }, country, lang);
  const hide = () => p.addStyleTag({ content: 'app-sponsor-banner,app-sponsor-rails,app-cookie-consent-banner{display:none!important} *{scroll-behavior:auto!important}' });
  const settle = async () => { await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); }); await new Promise(r => setTimeout(r, 1200)); };
  // Handy
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
  await p.goto(`https://souqmar24.com/${lang}`, { waitUntil: 'networkidle2' }); await hide(); await settle();
  await p.screenshot({ type: 'jpeg', quality: 88, path: `${out}/m-home-${lang}.jpg`, fullPage: true });
  // Desktop
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await p.goto(`https://souqmar24.com/${lang}`, { waitUntil: 'networkidle2' }); await hide(); await settle();
  await p.screenshot({ type: 'jpeg', quality: 88, path: `${out}/d-home-${lang}.jpg`, fullPage: true });
  console.log(lang, 'ok');
  await ctx.close();
}
await b.close();
