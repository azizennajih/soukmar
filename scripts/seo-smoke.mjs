// SEO smoke test for a running SouqMar24 (local SSR server or the live site):
//   node scripts/seo-smoke.mjs http://localhost:4300
//   node scripts/seo-smoke.mjs https://souqmar24.com
// Checks HTTP status, canonical, robots meta, hreflang and the sitemap for representative URLs.
// Exit code 1 if any check fails. Read-only: it only fetches pages.

const base = (process.argv[2] ?? 'http://localhost:4300').replace(/\/$/, '');
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
let failed = 0;

const get = async (path, headers = {}) => {
  const res = await fetch(base + path, { redirect: 'manual', headers: { 'User-Agent': UA, ...headers } });
  return { status: res.status, location: res.headers.get('location'), body: res.status < 300 || res.status >= 400 ? await res.text() : '' };
};
const tag = (html, re) => (html.match(re) ?? [])[1] ?? null;
const ok = (cond, label, detail = '') => {
  console.log(`${cond ? '  ok  ' : ' FAIL '} ${label}${cond ? '' : ' ' + detail}`);
  if (!cond) failed++;
};

const SITE = 'https://souqmar24.com';
const page = async (path, expect) => {
  console.log(`\n${path}`);
  const r = await get(path, { 'Accept-Language': 'de' });
  ok(r.status === expect.status, `status ${expect.status}`, `got ${r.status}`);
  if (expect.status !== 200 && expect.status !== 404) return;
  const canonical = tag(r.body, /<link rel="canonical" href="([^"]*)"/);
  const robots = tag(r.body, /<meta name="robots" content="([^"]*)"/);
  const hreflang = (r.body.match(/<link rel="alternate" hreflang="[^"]*"/g) ?? []).length;
  if (expect.canonical !== undefined) ok(canonical === (expect.canonical && SITE + expect.canonical), `canonical ${expect.canonical}`, `got ${canonical}`);
  if (expect.robots) ok(!!robots && robots.startsWith(expect.robots), `robots ${expect.robots}`, `got ${robots}`);
  if (expect.hreflang !== undefined) ok(hreflang === expect.hreflang, `hreflang links = ${expect.hreflang}`, `got ${hreflang}`);
  if (expect.status === 200) {
    ok(/<title>[^<]{10,}/.test(r.body), 'has a title');
    ok(/<h1[ >]/.test(r.body) || expect.robots?.startsWith('noindex'), 'has an h1 (or is noindex)');
  }
};

const root = await get('/', { 'Accept-Language': 'de' });
console.log('\n/ (language redirect)');
ok(root.status === 302 && /^(https?:\/\/[^/]+)?\/[a-z]{2}$/.test(root.location ?? ''), 'redirects temporarily to a language home', `got ${root.status} ${root.location}`);

await page('/de', { status: 200, canonical: '/de', robots: 'index', hreflang: 7 });
await page('/de/annonces', { status: 200, canonical: '/de/annonces', robots: 'index', hreflang: 7 });
await page('/de/annonces?categorie=VEHICLES', { status: 200, canonical: '/de/annonces?categorie=VEHICLES', robots: 'index', hreflang: 7 });
await page('/de/annonces?categorie=VEHICLES&tri=prix', { status: 200, canonical: '/de/annonces?categorie=VEHICLES', robots: 'noindex', hreflang: 0 });
await page('/de/a-propos', { status: 200, canonical: '/de/a-propos', robots: 'index', hreflang: 7 });
await page('/de/a-propos?utm_source=test', { status: 200, canonical: '/de/a-propos', robots: 'index' });
await page('/ur/a-propos', { status: 200, canonical: '/ur/a-propos', robots: 'noindex', hreflang: 0 });
await page('/de/auth/login', { status: 200, robots: 'noindex, nofollow', hreflang: 0 });
await page('/de/does-not-exist', { status: 404, robots: 'noindex', hreflang: 0 });
await page('/de/annonces/this-listing-does-not-exist', { status: 404, robots: 'noindex' });

console.log('\n/robots.txt');
const robots = await get('/robots.txt');
ok(robots.status === 200 && /Sitemap: https?:\/\//.test(robots.body), 'robots.txt lists the sitemap');
ok(!/^Disallow: \/\s*$/m.test(robots.body), 'robots.txt does not block the whole site');

console.log('\n/sitemap.xml');
const sm = await get('/sitemap.xml');
ok(sm.status === 200 && sm.body.includes('<urlset'), 'sitemap is served as XML');
const locs = [...sm.body.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
ok(locs.length > 0, `sitemap has URLs (${locs.length})`);
ok(locs.every(l => /^https?:\/\/[^/]+\/(fr|en|ar|de|es|it)(\/|$|\?)/.test(l)), 'every sitemap URL is on an indexable language');
ok(new Set(locs).size === locs.length, 'no duplicate URLs in the sitemap');
ok(!sm.body.includes('hreflang="pt"') && !sm.body.includes('hreflang="ur"'), 'unreviewed languages are not in the hreflang cluster');

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
