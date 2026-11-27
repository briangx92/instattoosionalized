/* Prerender: builds the static, crawlable shell of the site from the one
   content source (the portal-published JSON), so facts live in one place.
   Run at deploy time: node scripts/prerender.mjs
   It generates the artist slot pages (artistN/index.html), fills the
   homepage schema and artist nav links, and regenerates sitemap.xml,
   llms.txt, and scripts/slots.js. Output is deterministic: running it
   twice in a row changes nothing. The pages it writes still load the
   site's runtime scripts, so portal publishes keep refreshing the
   content on top of these shells. */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://instattoosionalized.net';
const CONTENT_URL = 'https://api.instattoosionalized.net/content';
const SHOP_SUFFIX = ' | Instattoosionalized Tattoos and Piercings';

function readText(rel) { return readFileSync(join(REPO, rel), 'utf8'); }
function writeText(rel, text) {
  const p = join(REPO, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
}
function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return escHtml(s).replace(/"/g, '&quot;'); }

/* ---------- slots registry ---------- */
function loadSlots() {
  const rows = JSON.parse(readText('slots.json'));
  if (!Array.isArray(rows)) throw new Error('slots.json is not an array');
  return rows.slice().sort((a, b) => a.slot.localeCompare(b.slot, undefined, { numeric: true }));
}

/* ---------- built-in roster (fallback + page copy), parsed out of artist.js ---------- */
function extractLiteral(source, marker, open, close) {
  const at = source.indexOf(marker);
  if (at < 0) throw new Error('marker not found: ' + marker);
  const start = source.indexOf(open, at);
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('unterminated literal after: ' + marker);
}
function loadBakedRoster() {
  return JSON.parse(extractLiteral(readText('scripts/artist.js'), 'var ROSTER = ', '{', '}'));
}

/* ---------- shop facts, read out of the SITE block in home.js ---------- */
function loadSiteFacts() {
  const src = readText('scripts/home.js');
  const field = (k) => {
    const m = new RegExp(k + ': "([^"]+)"').exec(src);
    if (!m) throw new Error('SITE field not found: ' + k);
    return m[1];
  };
  const hours = JSON.parse(extractLiteral(src, 'hours:', '[', ']'));
  return {
    name: field('name'), phoneDisplay: field('phoneDisplay'), phoneE164: field('phoneE164'),
    street: field('street'), town: field('town'), region: field('region'),
    zip: field('zip'), facebook: field('facebook'), hours,
  };
}
function time24(t) {
  const m = /(\d+):(\d+)\s*(AM|PM)/.exec(t);
  let h = parseInt(m[1], 10) % 12;
  if (m[3] === 'PM') h += 12;
  return String(h).padStart(2, '0') + ':' + m[2];
}
function buildSchema(facts) {
  const spec = [];
  facts.hours.forEach(([day, val]) => {
    if (!val) return;
    const parts = val.split(/\s*[-\u2013]\s*/);
    spec.push({
      '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/' + day,
      opens: time24(parts[0]), closes: time24(parts[1]),
    });
  });
  return {
    '@context': 'https://schema.org', '@type': 'TattooParlor', name: facts.name,
    telephone: facts.phoneE164,
    address: {
      '@type': 'PostalAddress', streetAddress: facts.street, addressLocality: facts.town,
      addressRegion: facts.region, postalCode: facts.zip, addressCountry: 'US',
    },
    openingHoursSpecification: spec, sameAs: [facts.facebook],
  };
}

/* ---------- published content (the one source), with the built-in fallback ---------- */
async function fetchContent() {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 15000);
    const res = await fetch(CONTENT_URL, { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data || !Array.isArray(data.artists)) throw new Error('unexpected shape');
    return data;
  } catch (e) {
    console.warn('prerender: published content unavailable (' + e.message + '); using the built-in roster');
    return null;
  }
}
function contentDate(content) {
  if (content && typeof content.at === 'number') return new Date(content.at).toISOString().slice(0, 10);
  const prev = existsSync(join(REPO, 'sitemap.xml')) ? /<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/.exec(readText('sitemap.xml')) : null;
  return prev ? prev[1] : null;
}

/* ---------- per-artist view: published words over the built-in page copy ---------- */
function nickOf(name) {
  const qn = /["\u201c]([^"\u201d]+)["\u201d]/.exec(name || '');
  return (qn ? qn[1].trim() : String(name || '').replace(/["\u201c\u201d]/g, '').split(/\s+/)[0]) || '';
}
function fixImg(p) {
  if (typeof p !== 'string') return p;
  const m = /^(?:\.\.\/)?([a-z0-9-]+)-((?:portrait|work-\d+)\.jpg)$/.exec(p);
  return m ? 'portfolio/' + m[1] + '/images/' + m[1] + '-' + m[2] : p;
}
function artistView(content, baked, key) {
  const rec = content ? content.artists.find((a) => a && a.key === key) : null;
  const b = baked[key] || null;
  const name = (rec && rec.name) || (b && b.name) || key;
  const nick = (rec && rec.nick) || nickOf(name);
  const desc = b && b.name === name
    ? b.desc
    : nick + ' is an artist at Instattoosionalized in Northampton, PA. See their work and send a request.';
  const portrait = fixImg((rec && rec.photo) || (b && b.portrait) || '');
  return { key, name, nick, desc, portrait };
}

/* ---------- slot page generation ---------- */
function setMeta(html, attr, value) {
  const re = new RegExp('(<meta ' + attr + ' content=")[^"]*(")');
  if (!re.test(html)) throw new Error('meta not found: ' + attr);
  return html.replace(re, '$1' + escAttr(value) + '$2');
}
function renderSlotPage(template, slots, entry, view) {
  const slotUrl = ORIGIN + '/' + entry.slot + '/';
  const title = view.name + SHOP_SUFFIX;
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, '<title>' + escHtml(title) + '</title>');
  html = setMeta(html, 'name="description"', view.desc);
  html = setMeta(html, 'property="og:title"', title);
  html = setMeta(html, 'property="og:description"', view.desc);
  html = setMeta(html, 'property="og:url"', slotUrl);
  html = setMeta(html, 'name="twitter:title"', title);
  html = setMeta(html, 'name="twitter:description"', view.desc);
  const ogImg = view.portrait ? ORIGIN + '/' + view.portrait : ORIGIN + '/assets/instattoosionalized-logo.jpg';
  html = setMeta(html, 'property="og:image"', ogImg);
  html = setMeta(html, 'name="twitter:image"', ogImg);
  html = html.replace('<link rel="canonical" href="https://instattoosionalized.net/view/pages/artist">',
    '<link rel="canonical" href="' + slotUrl + '">');
  /* The slot page sits one level shallower than view/pages/. */
  html = html.split('../../').join('../');
  /* Roster cards point at the slot addresses. */
  slots.filter((s) => s.status === 'active').forEach((s) => {
    html = html.split('href="artist.html?artist=' + s.key + '"').join('href="../' + s.slot + '/"');
  });
  /* Static shell shows this artist; the roster starts hidden. */
  html = html.replace('<div data-block="roster">', '<div data-block="roster" hidden>');
  html = html.replace('<section data-block="' + entry.key + '" hidden>', '<section data-block="' + entry.key + '">');
  /* The marker tells artist.js which artist this page is, and its depth. */
  const marker = '<script>window.ARTIST_SLOT = ' + JSON.stringify({ slot: entry.slot, key: entry.key, root: '../' }) + ';</script>';
  html = html.replace('<script src="../scripts/artist.js"></script>',
    marker + '\n<script src="../scripts/artist.js"></script>');
  return html;
}

/* ---------- homepage: schema, nav links, slot map ---------- */
function renderIndex(indexHtml, slots, schema) {
  let html = indexHtml;
  const json = JSON.stringify(schema);
  const tag = /(<script type="application\/ld\+json" id="schema-ld" data-module="schema">)[\s\S]*?(<\/script>)/;
  if (!tag.test(html)) throw new Error('schema-ld tag not found in index.html');
  html = html.replace(tag, '$1' + json + '$2');
  slots.filter((s) => s.status === 'active').forEach((s) => {
    html = html.split('href="view/pages/artist.html?artist=' + s.key + '"').join('href="' + s.slot + '/"');
  });
  if (!html.includes('scripts/slots.js')) {
    html = html.replace('<script src="scripts/home.js"></script>',
      '<script src="scripts/slots.js"></script>\n<script src="scripts/home.js"></script>');
  }
  return html;
}
function renderSlotsJs(slots) {
  const map = {};
  slots.filter((s) => s.status === 'active').forEach((s) => { map[s.key] = s.slot + '/'; });
  return 'window.SLOT_URLS = ' + JSON.stringify(map) + ';\n';
}

/* ---------- sitemap + llms.txt ---------- */
function renderSitemap(slots, lastmod) {
  const urls = [
    { loc: ORIGIN + '/', priority: '1.0' },
    ...slots.filter((s) => s.status === 'active').map((s) => ({ loc: ORIGIN + '/' + s.slot + '/', priority: '0.8' })),
    { loc: ORIGIN + '/view/pages/gallery', priority: '0.7' },
    { loc: ORIGIN + '/view/pages/policies', priority: '0.5' },
  ];
  const body = urls.map((u) =>
    '  <url>\n    <loc>' + u.loc + '</loc>\n' +
    (lastmod ? '    <lastmod>' + lastmod + '</lastmod>\n' : '') +
    '    <priority>' + u.priority + '</priority>\n  </url>').join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '\n</urlset>\n';
}
const COUNT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function renderLlms(views, facts) {
  const n = views.length;
  const count = COUNT_WORDS[n] || String(n);
  const names = views.map((v) => v.nick);
  const list = names.length > 1 ? names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1] : (names[0] || '');
  const lines = [
    '# Instattoosionalized Tattoos and Piercings',
    '',
    '> Tattoo studio and body piercing shop at ' + facts.street + ', ' + facts.town + ', ' + facts.region + '. Call ' + facts.phoneDisplay + '.',
    '',
    '## About',
    '',
    'Instattoosionalized Tattoos and Piercings is a tattoo and body piercing studio on Main Street in Northampton, Pennsylvania. ' +
      count.charAt(0).toUpperCase() + count.slice(1) + ' artists work at the shop: ' + list + '. ' +
      'Booking starts with a request sent through the website; the shop confirms each appointment itself. ' +
      "The shop's deposit is $40 and holds your spot.",
    '',
    '## Contact',
    '',
    '- Phone: ' + facts.phoneDisplay,
    '- Address: ' + facts.street + ', ' + facts.town + ', ' + facts.region,
    '- Website: ' + ORIGIN + '/',
    '',
    '## Pages',
    '',
    '- [Home](' + ORIGIN + '/): the shop, its artists, and the request form.',
    ...views.map((v) => '- [' + v.nick + '](' + ORIGIN + '/' + v.slot + '/): artist page with portfolio and request form.'),
    '- [Gallery](' + ORIGIN + '/view/pages/gallery): work from all ' + count + ' artists.',
    '- [Policies](' + ORIGIN + '/view/pages/policies): deposit, age and ID rules, and aftercare.',
    '',
  ];
  return lines.join('\n');
}

/* ---------- main ---------- */
async function main() {
  const slots = loadSlots();
  const baked = loadBakedRoster();
  const facts = loadSiteFacts();
  const content = await fetchContent();
  const lastmod = contentDate(content);
  const template = readText('view/pages/artist.html');

  const views = [];
  for (const entry of slots) {
    if (entry.status === 'retired') {
      const dir = join(REPO, entry.slot);
      if (existsSync(dir)) { rmSync(dir, { recursive: true }); console.log('prerender: removed retired slot page ' + entry.slot); }
      continue;
    }
    if (entry.status !== 'active') continue;
    const view = artistView(content, baked, entry.key);
    view.slot = entry.slot;
    views.push(view);
    writeText(entry.slot + '/index.html', renderSlotPage(template, slots, entry, view));
    console.log('prerender: ' + entry.slot + '/index.html <- ' + entry.key + ' (' + view.name + ')');
  }

  writeText('scripts/slots.js', renderSlotsJs(slots));
  writeText('index.html', renderIndex(readText('index.html'), slots, buildSchema(facts)));
  writeText('sitemap.xml', renderSitemap(slots, lastmod));
  writeText('llms.txt', renderLlms(views, facts));
  console.log('prerender: index.html schema + nav, scripts/slots.js, sitemap.xml (lastmod ' + lastmod + '), llms.txt');
}

main().catch((e) => { console.error('prerender failed: ' + e.message); process.exit(1); });
