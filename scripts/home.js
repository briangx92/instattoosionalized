const TURNSTILE_SITE_KEY = "0x4AAAAAAGUSsdQqWpUsmajE";
const SITE = {
  slug: "instattoosionalized-tattoos-and-piercings",
  name: "Instattoosionalized Tattoos and Piercings",
  shortName: "Instattoosionalized",
  trade: "Tattoo studio",
  street: "1852 Main St",
  town: "Northampton",
  region: "PA",
  zip: "18067",
  phoneDisplay: "(610) 440-2700",
  phoneE164: "+16104402700",
  facebook: "https://www.facebook.com/751661348261378",
  timeZone: "America/New_York",
  rating: { stars: 4.7, count: 72, source: "Google", asOf: "Nov 2026" },
  hours: [
    ["Monday", null], ["Tuesday", "12:00 PM – 5:00 PM"], ["Wednesday", "12:00 PM – 5:00 PM"],
    ["Thursday", "12:00 PM – 5:00 PM"], ["Friday", "12:00 PM – 5:00 PM"], ["Saturday", "12:00 PM – 5:00 PM"],
    ["Sunday", null]
  ],
  pickGroups: [
    { family: "tattoo", label: "Tattoos", items: [ { id: "tattoo", name: "Tattoos", blurb: "Got an idea, a sketch, or a spot picked out? Put it in a request and talk it over with the shop." } ] },
    { family: "piercing", label: "Piercing", items: [ { id: "piercing", name: "Body piercing", blurb: "Body piercing right here on Main Street. Tell the shop what you have in mind." } ] }
  ],
  familySteps: {
    tattoo: { name: "Tattoo", q: "About the tattoo", sub: "Size is enough to start.", fields: [
      { key: "size", type: "choice", label: "How big?", summary: "Tattoo size", options: ["Small", "Medium", "Large", "Not sure yet"], required: true, error: "Pick a size, or Not sure yet." },
      { key: "place", type: "text", label: "Where on the body? (optional)", summary: "Tattoo placement", placeholder: "A quick line is plenty" },
      { key: "idea", type: "text", label: "The idea (optional)", summary: "Tattoo idea", placeholder: "A few words is fine" }
    ] },
    piercing: { name: "Piercing", q: "About the piercing", sub: "Optional, but it helps the shop plan.", fields: [
      { key: "place", type: "text", label: "Where? (optional)", summary: "Piercing", placeholder: "A quick line is plenty" }
    ] }
  },
  prices: [
    { group: "Tattoos", sample: true, items: [ ["Shop minimum", "$60"], ["Small flash tattoo", "$80"] ] },
    { group: "Piercing", sample: true, items: [ ["Standard body piercing", "$45"] ] }
  ],
  reviews: [],
  artists: [
    {
      slug: "lex", name: "Alexis \"lex\"", first: "lex", role: "Tattoo", families: ["tattoo"],
      ig: "lextattss",
      portrait: "portfolio/lex/images/lex-portrait.jpg",
      portraitAlt: "Portrait of lex, tattoo artist at Instattoosionalized",
      quick: "Horror and whimsical pieces, cartoon characters, spooky, and high contrast.",
      bio: "lex is a freshly new tattoo artist. She loves all things horror and whimsical, and loves tattooing cartoon characters, spooky pieces, and high contrast work.",
      about: ["Hi, I'm lex! I'm a freshly new tattoo artist! i love all things horror and whimsical. I love to tattoo things like cartoon characters, spooky, and high contrast!"],
      does: ["Horror", "Whimsical", "Cartoon characters", "Spooky", "High contrast"],
      featuredCap: "Hello Kitty in a Jason mask. Horror and cartoon characters are exactly what lex says she loves to tattoo.",
      note: ["Send the shop request form with lex picked, or message her on Instagram at @lextattss. Tell her the idea, where it is going, and roughly how big.",
      "The shop's deposit is $40 and holds your spot."],
      work: [
        { src: "portfolio/lex/images/lex-work-01.jpg", alt: "Hello Kitty wearing a Jason mask, holding a knife, tattoo", cap: "Hello Kitty Jason, cartoon horror" },
        { src: "portfolio/lex/images/lex-work-02.jpg", alt: "Snoopy in a pumpkin costume tattoo", cap: "Snoopy pumpkin, cartoon" },
        { src: "portfolio/lex/images/lex-work-03.jpg", alt: "Ghostface knife tattoo on a forearm", cap: "Ghostface knife" },
        { src: "portfolio/lex/images/lex-work-04.jpg", alt: "Sun and moon with florals tattoo on an upper arm", cap: "Sun and moon with florals" },
        { src: "portfolio/lex/images/lex-work-05.jpg", alt: "Rose wreath and infinity heart tattoos on a forearm", cap: "Rose wreath and infinity heart" },
        { src: "portfolio/lex/images/lex-work-06.jpg", alt: "The word secrets tattooed down a finger", cap: "Finger script" },
        { src: "portfolio/lex/images/lex-work-07.jpg", alt: "Small flamingo tattoo on an ankle", cap: "Flamingo, ankle" },
        { src: "portfolio/lex/images/lex-work-08.jpg", alt: "Deathly Hallows symbol tattoo on a forearm", cap: "Deathly Hallows symbol" },
        { src: "portfolio/lex/images/lex-work-09.jpg", alt: "The word Unbothered in script on a forearm", cap: "Script lettering" },
        { src: "portfolio/lex/images/lex-work-10.jpg", alt: "Script tattoo reading be still and know, Psalm 46:10", cap: "Psalm 46:10 script" },
        { src: "portfolio/lex/images/lex-work-11.jpg", alt: "Rose tattoo with the name kaya in script", cap: "Rose with name script" },
        { src: "portfolio/lex/images/lex-work-12.jpg", alt: "Daisy stem tattoo on a leg", cap: "Daisy stem" },
        { src: "portfolio/lex/images/lex-work-13.jpg", alt: "The numbers 666 tattooed on an arm", cap: "666, bold numbers" },
        { src: "portfolio/lex/images/lex-work-14.jpg", alt: "Paw print tattoo with a galaxy fill", cap: "Paw print" }
      ]
    },
    {
      slug: "liv", name: "Olivia \"Liv\"", first: "Liv", role: "Tattoo", families: ["tattoo"],
      ig: "Inked.by_liv",
      portrait: "portfolio/liv/images/liv-portrait.jpg",
      portraitAlt: "Portrait of Liv, tattoo artist at Instattoosionalized",
      quick: "Whimsical, soft, and a little out of the ordinary. Florals, cute characters, and fairytale pieces.",
      bio: "Olivia, Liv to everyone, is a tattoo artist who loves all things whimsical, soft, and a little out of the ordinary. She loves florals, cute little characters, and anything that feels like it belongs in a fairytale, and turns your ideas into a piece of art that's uniquely yours.",
      about: ["Hello! I'm Olivia but everyone calls me Liv! I'm a tattoo artist who loves all things whimsical, soft, and a little out of the ordinary. If you have an idea for a tattoo but aren't sure how to bring it to life, come see me.",
      "I love florals, cute little characters, and anything that feels like it belongs in a fairytale. My goal is to turn your ideas into a piece of art that's uniquely yours. Whether you come in with a fully formed idea or just a bunch of screenshots, I'm always excited to create something together!"],
      does: ["Whimsical", "Soft", "Florals", "Cute characters", "Fairytale pieces"],
      featuredCap: "A bunny with a flower. Cute characters and florals are what Liv says she loves most.",
      note: ["Send the shop request form with Liv picked, or message her on Instagram at @Inked.by_liv. Fully formed idea or just a bunch of screenshots, she is always excited to create something together.",
      "The shop's deposit is $40 and holds your spot."],
      work: [
        { src: "portfolio/liv/images/liv-work-01.jpg", alt: "Bunny with a flower tattoo on an upper arm", cap: "Bunny with a flower" },
        { src: "portfolio/liv/images/liv-work-02.jpg", alt: "Character tattoo on a thigh", cap: "Character piece" },
        { src: "portfolio/liv/images/liv-work-03.jpg", alt: "Lily tattoos with swirls on a forearm", cap: "Lilies with swirls" },
        { src: "portfolio/liv/images/liv-work-04.jpg", alt: "Heart with wings memorial tattoo on a calf", cap: "Heart with wings, memorial piece" },
        { src: "portfolio/liv/images/liv-work-05.jpg", alt: "Three small cat face tattoos on a forearm", cap: "Three cat faces" },
        { src: "portfolio/liv/images/liv-work-06.jpg", alt: "Daisy tattoo with a face on a calf", cap: "Daisy with a face" },
        { src: "portfolio/liv/images/liv-work-07.jpg", alt: "Floral tattoos on a forearm", cap: "Florals" },
        { src: "portfolio/liv/images/liv-work-08.jpg", alt: "Baby footprint tattoos on a forearm", cap: "Baby footprints" },
        { src: "portfolio/liv/images/liv-work-09.jpg", alt: "Eagle tattoo with a sword and scales on a forearm", cap: "Eagle with sword and scales" },
        { src: "portfolio/liv/images/liv-work-10.jpg", alt: "Skull and crossbones tattoo on an arm", cap: "Skull and crossbones" },
        { src: "portfolio/liv/images/liv-work-11.jpg", alt: "Script lettering tattoo on a chest", cap: "Script lettering" },
        { src: "portfolio/liv/images/liv-work-12.jpg", alt: "Small tattoo on an upper back", cap: "Small piece, upper back" }
      ]
    },
    {
      slug: "dawlface", name: "Dawlface", first: "Dawlface", role: "Tattoo", families: ["tattoo"],
      ig: "excommunicated_af",
      portrait: "portfolio/dawlface/images/dawlface-portrait.jpg",
      portraitAlt: "Portrait of Dawlface, tattoo artist at Instattoosionalized",
      quick: "Realism, characters, dark gothic art, and detailed designs. Cover-ups too.",
      bio: "Dawlface enjoys tattooing realism, characters of all sorts, dark gothic art, and detailed designs of all natures. She also loves doing cover-up tattoos.",
      about: ["I enjoy doing tattoos ranging from realism, characters of all sorts, dark gothic art, to detailed designs of all natures. I as well love to tattoo cover up tattoos"],
      does: ["Realism", "Characters", "Dark gothic", "Detailed designs", "Cover-ups"],
      featuredCap: "A French bulldog character piece. Characters and detailed designs are what Dawlface says she enjoys most.",
      note: ["Send the shop request form with Dawlface picked, or message her on Instagram at @excommunicated_af. Tell her the idea, where it is going, and roughly how big.",
      "The shop's deposit is $40 and holds your spot."],
      work: [
        { src: "portfolio/dawlface/images/dawlface-work-01.jpg", alt: "French bulldog character tattoo with Jack the Ripper lettering", cap: "French bulldog character piece" },
        { src: "portfolio/dawlface/images/dawlface-work-02.jpg", alt: "Detailed tattoo covering a hand", cap: "Detailed hand piece" },
        { src: "portfolio/dawlface/images/dawlface-work-03.jpg", alt: "Dark hooded figure tattoo, black and grey", cap: "Dark hooded figure, black and grey" },
        { src: "portfolio/dawlface/images/dawlface-work-04.jpg", alt: "Monarch butterfly tattoo on a forearm", cap: "Monarch butterfly" },
        { src: "portfolio/dawlface/images/dawlface-work-05.jpg", alt: "Stag beetle tattoo on a forearm", cap: "Stag beetle" },
        { src: "portfolio/dawlface/images/dawlface-work-06.jpg", alt: "Blue fish tattoo with script on a forearm", cap: "Blue fish with script" },
        { src: "portfolio/dawlface/images/dawlface-work-07.jpg", alt: "Color tattoo on a forearm", cap: "Color piece, forearm" },
        { src: "portfolio/dawlface/images/dawlface-work-08.jpg", alt: "Phoenix tattoo on a shoulder", cap: "Phoenix, shoulder" },
        { src: "portfolio/dawlface/images/dawlface-work-09.jpg", alt: "Sleeve tattoo in progress on a forearm", cap: "Sleeve in progress" },
        { src: "portfolio/dawlface/images/dawlface-work-10.jpg", alt: "Red and black tattoo design on a forearm", cap: "Red and black design" },
        { src: "portfolio/dawlface/images/dawlface-work-11.jpg", alt: "Woman's face tattoo in an ornate frame on a forearm", cap: "Woman's face in an ornate frame" },
        { src: "portfolio/dawlface/images/dawlface-work-12.jpg", alt: "Lizard tattoo on a forearm", cap: "Lizard" },
        { src: "portfolio/dawlface/images/dawlface-work-13.jpg", alt: "Creature silhouette tattoo on a forearm", cap: "Creature silhouette" },
        { src: "portfolio/dawlface/images/dawlface-work-14.jpg", alt: "Cartoon character tattoo with script on a leg", cap: "Cartoon character with script" },
        { src: "portfolio/dawlface/images/dawlface-work-15.jpg", alt: "Character in a dress tattoo on a side", cap: "Character in a dress" },
        { src: "portfolio/dawlface/images/dawlface-work-16.jpg", alt: "Orange floral tattoo on a forearm", cap: "Orange florals" },
        { src: "portfolio/dawlface/images/dawlface-work-17.jpg", alt: "Hearts and florals tattoo on a forearm", cap: "Hearts and florals" },
        { src: "portfolio/dawlface/images/dawlface-work-18.jpg", alt: "Small daisy tattoo on a forearm", cap: "Small daisies" },
        { src: "portfolio/dawlface/images/dawlface-work-19.jpg", alt: "Cherry tattoo on a leg", cap: "Cherries" },
        { src: "portfolio/dawlface/images/dawlface-work-20.jpg", alt: "Balloon dog tattoo on an ankle", cap: "Balloon dog, ankle" },
        { src: "portfolio/dawlface/images/dawlface-work-21.jpg", alt: "Skull tattoo on a forearm", cap: "Skull design, forearm" },
        { src: "portfolio/dawlface/images/dawlface-work-22.jpg", alt: "Fine line tattoo on a wrist", cap: "Fine line wrist piece" },
        { src: "portfolio/dawlface/images/dawlface-work-23.jpg", alt: "Ornamental script tattoo on a forearm", cap: "Ornamental script" },
        { src: "portfolio/dawlface/images/dawlface-work-24.jpg", alt: "Small script tattoo with a bird on a wrist", cap: "Small script with a bird" }
      ]
    }
  ],
  limits: { minPhoneDigits: 7, bookingDays: 60, slotMinutes: 30 },
  dayParts: [ ["Morning", 0, 720], ["Afternoon", 720, 1020], ["Evening", 1020, 1440] ],
  copy: {
    heroLine: "Tattoos and body piercing on Main Street in Northampton.",
    servicesTitle: "Tattoos and piercing",
    pricesNote: "These are samples for this demo, not the shop's price list. Call the shop for a real quote.",
    workLine: "Flip through the binder, one sheet at a time."
  }
};

(function derive(S){
  S.phoneHref = "tel:" + S.phoneE164;
  S.smsBase = "sms:" + S.phoneE164;
  S.address = S.street + ", " + S.town + ", " + S.region + " " + S.zip;
  S.mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.name + ", " + S.address);
  S.reviewsUrl = "https://www.google.com/search?q=" + encodeURIComponent(S.name + " " + S.town + " " + S.region + " reviews");
  S.copy.heroKicker = S.trade + " · " + S.town + ", " + S.region;
  S.copy.heroSub = "Tattoos and Piercings";
  S.copy.tagTop = S.street;
  S.copy.tagMain = S.town + ", " + S.region;
  S.copy.servicesIntro = "Both under one roof at " + S.street + ". Add what you're after and send the shop a request.";
  S.copy.footerLine = S.name + " · " + S.town + ", " + S.region;
  S.copy.footerInfo = S.address + " · " + S.phoneDisplay;
})(SITE);

/* The recent-work book shows the first three work photos of each artist on the
   roster, in roster order. Sheets are read from SITE.artists once the published
   content has merged in, so what the portal publishes is what the book shows.
   EMBEDDED_SHEETS is the same cut of the built-in lists, taken before any merge
   can touch them, so the book still opens when no published photos arrive. */
function bookSheets(artists){
  const out = [];
  (artists || []).forEach(a => {
    (a.work || []).slice(0, 3).forEach(w => {
      const src = typeof w === "string" ? w : w && w.src;
      if (src) out.push(src);
    });
  });
  return out;
}
const EMBEDDED_SHEETS = bookSheets(SITE.artists);
function baStageEl(w){
  const stage = T.el("div", { class: "ba-stage" });
  const after = T.el("img", { src: w.ba.a, alt: w.ba.acap || w.cap || "" });
  after.draggable = false;
  const before = T.el("img", { class: "ba-before", src: w.ba.b, alt: w.ba.bcap || "" });
  before.draggable = false;
  stage.append(after, before,
    T.el("span", { class: "ba-lab b", text: "Before" }),
    T.el("span", { class: "ba-lab a", text: "After" }),
    T.el("span", { class: "ba-handle" }));
  wireBaStage(stage);
  return stage;
}
function wireBaStage(stage){
  function setSplit(e){ const r = stage.getBoundingClientRect(); let p = (e.clientX - r.left) / r.width * 100; p = Math.max(4, Math.min(96, p)); stage.style.setProperty("--split", p + "%"); }
  stage.addEventListener("pointerdown", e => {
    e.preventDefault();
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    setSplit(e);
    const mv = ev => setSplit(ev);
    const up = () => { stage.removeEventListener("pointermove", mv); stage.removeEventListener("pointerup", up); stage.removeEventListener("pointercancel", up); };
    stage.addEventListener("pointermove", mv);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
  });
}
let _artistOrder = null;
function artistDisplayList(){
  const list = (SITE.artists || []).slice();
  if (!list.length) return list;
  if (!_artistOrder) {
    _artistOrder = list.map(a => a.slug);
    for (let i = _artistOrder.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = _artistOrder[i]; _artistOrder[i] = _artistOrder[j]; _artistOrder[j] = t; }
  }
  const by = {};
  list.forEach(a => { by[a.slug] = a; });
  return _artistOrder.map(x => by[x]);
}
function artistPageHref(a){
  var slots = window.SLOT_URLS || {};
  var slot = slots[a.slug] || slots[a.key];
  if (slot) return slot;
  return "view/pages/artist.html?artist=" + (a.pageVar || a.slug);
}
function igSvgEl(){
  const s = document.createElement("span");
  s.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.3" fill="currentColor"/></svg>';
  return s.firstChild;
}


const T = {
  pathGet(o, p){ return p.split(".").reduce((a, k) => (a == null ? a : a[k]), o); },
  toMin(s){ const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(s); if (!m) return null; let h = +m[1] % 12; if (/pm/i.test(m[3])) h += 12; return h * 60 + +m[2]; },
  span(str){ if (!str) return null; const parts = str.split(/\s*[–-]\s*/); const o = T.toMin(parts[0]), c = T.toMin(parts[1] || ""); return (o == null || c == null) ? null : { open: o, close: c }; },
  timeLabel(m){ const h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + ":" + String(mm).padStart(2, "0") + " " + (h < 12 ? "AM" : "PM"); },
  now(){
    const p = {}; new Intl.DateTimeFormat("en-US", { timeZone: SITE.timeZone, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month, d: +p.day, mins: (+p.hour % 24) * 60 + +p.minute };
  },
  dow(y, m, d){ return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); },
  hoursIndex(dow){ return (dow + 6) % 7; },
  add(y, m, d, n){ const t = new Date(Date.UTC(y, m - 1, d + n)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; },
  key(o){ return o.y * 10000 + o.m * 100 + o.d; },
  fmtDate(o, opts){ return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: "UTC" }, opts)).format(new Date(Date.UTC(o.y, o.m - 1, o.d))); },
  digits(v){ let d = String(v || "").replace(/\D/g, ""); if (d.length > 10 && d[0] === "1") d = d.slice(1); return d.slice(0, 10); },
  fmtPhone(v){ const d = T.digits(v); if (d.length < 4) return d; if (d.length < 7) return "(" + d.slice(0, 3) + ") " + d.slice(3); return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6); },
  el(tag, attrs, kids){
    const n = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => { if (v == null || v === false) return; if (k === "text") n.textContent = v; else if (k === "class") n.className = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? "" : v); });
    (kids || []).forEach(c => c && n.append(c));
    return n;
  },
  reduced(){ return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
};

const MODULES = {
  header(root){
    const navToggle = root.querySelector("#nav-toggle"), siteNav = root.querySelector("#site-nav");
    if (navToggle && siteNav) {
      const mq = window.matchMedia("(max-width: 640px)");
      const applyMq = () => { siteNav.hidden = mq.matches; navToggle.setAttribute("aria-expanded", "false"); };
      applyMq();
      if (mq.addEventListener) mq.addEventListener("change", applyMq);
      navToggle.addEventListener("click", () => { const open = siteNav.hidden; siteNav.hidden = !open; navToggle.setAttribute("aria-expanded", String(open)); });
      siteNav.addEventListener("click", e => { if (e.target.closest("a") && mq.matches) { siteNav.hidden = true; navToggle.setAttribute("aria-expanded", "false"); } });
    }
    const btn = root.querySelector("#artists-btn"), menu = root.querySelector("#artists-menu");
    if (!btn || !menu) return;
    SITE.artists.forEach(a => { const link = menu.querySelector('[data-nav-artist="' + a.slug + '"]'); if (link) { var nm = a.first || a.name || ""; link.textContent = nm.charAt(0).toUpperCase() + nm.slice(1); link.href = artistPageHref(a); } });
    SITE.artists.forEach(a => { if (menu.querySelector('[data-nav-artist="' + a.slug + '"]')) return; const link = document.createElement("a"); link.setAttribute("data-nav-artist", a.slug); var nm = a.first || a.name || ""; link.textContent = nm.charAt(0).toUpperCase() + nm.slice(1); link.href = artistPageHref(a); const all = menu.querySelector('a[href="#artists"]'); menu.insertBefore(link, all || null); });
    const keep = new Set(SITE.artists.map(a => a.slug));
    menu.querySelectorAll("[data-nav-artist]").forEach(link => { if (!keep.has(link.getAttribute("data-nav-artist"))) link.remove(); });
    const set = open => { menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => set(menu.hidden));
    menu.addEventListener("click", e => { if (e.target.closest("a")) set(false); });
    document.addEventListener("click", e => { if (!root.contains(e.target)) set(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  },
  hero(root){
    const r = SITE.rating;
    const line = root.querySelector("#hero-rating");
    if (r) {
      line.append(T.el("span", { class: "c-stars", "aria-hidden": "true", text: "★".repeat(Math.round(r.stars)) }), " " + r.stars.toFixed(1) + " from " + r.count + " " + r.source + " reviews");
    } else line.remove();
    const v = root.querySelector("video");
    if (v && T.reduced()) { v.removeAttribute("autoplay"); try { v.pause(); } catch (e) {} }
  },
  ticker(){
    const names = SITE.pickGroups.flatMap(g => g.items.map(i => i.name));
    const box = document.getElementById("ticker-scroll");
    const half = document.createDocumentFragment();
    for (let r = 0; r < 2; r++) for (let k = 0; k < 6; k++) names.forEach(n => { half.append(n); half.append(T.el("i", { text: "✦" })); });
    box.append(half);
  },
  services(){
    const grid = document.getElementById("service-cards");
    let n = 0;
    SITE.pickGroups.forEach(g => g.items.forEach(item => {
      n++;
      const b = T.el("button", { class: "c-btn c-btn--ghost", type: "button", "data-add": item.id, "aria-pressed": "false", text: "Add" });
      b.addEventListener("click", () => window.__form && window.__form.toggleService(item.id, b));
      grid.append(T.el("article", { class: "c-card" }, [
        T.el("span", { class: "s-services__num", "aria-hidden": "true", text: String(n).padStart(2, "0") }),
        T.el("h3", { text: item.name }),
        T.el("p", { text: item.blurb }),
        b
      ]));
    }));
  },
  prices(){
    const box = document.getElementById("price-groups");
    SITE.prices.forEach(g => {
      const grp = T.el("div", { class: "s-prices__group" }, [T.el("h3", { text: g.group })]);
      g.items.forEach(([label, price]) => {
        grp.append(T.el("div", { class: "s-prices__row" }, [
          T.el("span", { text: label }),
          T.el("span", { class: "s-prices__lead", "aria-hidden": "true" }),
          T.el("span", {}, [T.el("b", { text: price }), g.sample ? T.el("small", { text: "sample" }) : null])
        ]));
      });
      box.append(grp);
    });
  },
  proof(){
    const r = SITE.rating;
    const link = document.getElementById("proof-link");
    link.href = SITE.reviewsUrl;
    if (r) {
      document.getElementById("proof-num").textContent = r.stars.toFixed(1);
      const s = document.getElementById("proof-stars");
      s.textContent = "★".repeat(Math.round(r.stars));
      s.setAttribute("aria-label", r.stars.toFixed(1) + " out of 5 stars");
      document.getElementById("proof-count").textContent = "from " + r.count + " " + r.source + " reviews" + (r.asOf ? ", as of " + r.asOf : "");
    } else document.querySelector(".s-proof__score").remove();
    const box = document.getElementById("proof-quotes");
    if (!box.dataset.pub) SITE.reviews.forEach(rv => box.append(T.el("blockquote", { text: rv.text }, [T.el("footer", { text: rv.name })])));
  },
  work(el){
    const live = bookSheets(SITE.artists);
    /* Fallback rule (Claude review, 2026-11-27): the built-in sheets are a
       fallback only when no published content has arrived. If the portal
       has published and the published roster carries no photos at all,
       hide the book rather than resurrect built-in work, which could show
       a departed artist's photos as current. */
    const publishedArrived = !!(window.SiteContent && SiteContent.read());
    if (!live.length && publishedArrived) {
      if (el) el.style.display = "none";
      return;
    }
    if (el) el.style.display = "";
    const photos = live.length ? live : EMBEDDED_SHEETS;
    const overlay = document.getElementById("book-overlay");
    const openBtn = document.getElementById("open-book");
    const closeBtn = document.getElementById("close-book");
    const book = document.getElementById("book");
    const total = photos.length;
    const pad = n => String(n).padStart(2, "0");
    document.getElementById("work-count").textContent = total + " sheets";
    let i = 0;
    const img = T.el("img", { alt: "", decoding: "async" });
    const label = T.el("b");
    const sheet = T.el("div", { class: "s-book__sheet s-paper" }, [
      T.el("div", { class: "s-paper__holes", "aria-hidden": "true" }, [T.el("i"), T.el("i"), T.el("i")]),
      T.el("div", { class: "s-book__label" }, [label, T.el("span", { text: "of " + pad(total) })]),
      T.el("div", { class: "s-book__photo" }, [img, T.el("span", { class: "s-book__corner s-book__corner--tr" }), T.el("span", { class: "s-book__corner s-book__corner--bl" })])
    ]);
    const count = T.el("span", { class: "s-book__count", "aria-live": "polite" });
    const prev = T.el("button", { class: "c-btn c-btn--ghost", type: "button", text: "Prev", onclick: () => go(i - 1) });
    const next = T.el("button", { class: "c-btn", type: "button", text: "Next", onclick: () => go(i + 1) });
    const dots = T.el("div", { class: "s-book__dots" });
    photos.forEach((_, k) => dots.append(T.el("button", { class: "s-book__dot", type: "button", "aria-label": "Sheet " + (k + 1), onclick: () => go(k) })));
    book.append(sheet, T.el("div", { class: "s-book__nav" }, [prev, count, next]), dots);
    function go(k){
      i = (k + total) % total;
      img.src = photos[i];
      img.alt = "Recent work, sheet " + (i + 1) + " of " + total;
      label.textContent = "Sheet " + pad(i + 1);
      count.textContent = (i + 1) + " / " + total;
      [...dots.children].forEach((d, n) => d.setAttribute("aria-current", n === i ? "true" : "false"));
    }
    let x0 = null;
    sheet.addEventListener("pointerdown", e => { x0 = e.clientX; });
    sheet.addEventListener("pointerup", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); });
    function open(){ go(i); overlay.hidden = false; document.body.style.overflow = "hidden"; closeBtn.focus(); }
    function close(){ overlay.hidden = true; document.body.style.overflow = ""; openBtn.focus(); }
    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      else if (e.key === "Tab") {
        const f = [...overlay.querySelectorAll("button")];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  },
  visit(){
    const table = document.getElementById("hours-table");
    const n = T.now();
    const today = T.hoursIndex(T.dow(n.y, n.m, n.d));
    const tb = T.el("tbody");
    if (SITE.hours.every(([, v]) => v === null)) {
      tb.append(T.el("tr", {}, [T.el("td", { text: "Hours" }), T.el("td", { text: "Call for hours" })]));
    } else {
      SITE.hours.forEach(([day, val], k) => {
        tb.append(T.el("tr", { class: k === today ? "is-today" : null }, [T.el("td", { text: day }), T.el("td", { text: val === null ? "Closed" : val })]));
      });
    }
    table.append(tb);
    document.getElementById("visit-address").textContent = SITE.address;
    document.getElementById("directions-btn").href = SITE.mapsUrl;
  },
  artists(root){
    const list = artistDisplayList();
    if (!list.length) return;
    root.hidden = false;
    const rail = root.querySelector("#artist-rail");
    const overlay = document.getElementById("artist-overlay");
    const title = document.getElementById("aview-title");
    const grid = document.getElementById("aview-grid");
    const profile = document.getElementById("aview-profile");
    const closeBtn = document.getElementById("aview-close");
    const cards = [];
    let savedY = 0, pushed = false, suppressRestore = false, lastFocus = null;

    function setFocus(card){ cards.forEach(c => c.classList.toggle("is-focused", c === card)); }
    function centerCard(card){
      setFocus(card);
      const r = rail.getBoundingClientRect(), c = card.getBoundingClientRect();
      rail.scrollBy({ left: (c.left + c.width / 2) - (r.left + r.width / 2), behavior: T.reduced() ? "auto" : "smooth" });
      if (typeof updateNav === "function") updateNav();
    }

    list.forEach(a => {
      const seeBtn = T.el("button", { class: "c-btn", type: "button", text: "See " + a.first + "'s work" });
      const reqBtn = T.el("button", { class: "c-btn c-btn--ghost", type: "button", text: "Request with " + a.first });
      seeBtn.addEventListener("click", () => { location.href = artistPageHref(a); });
      reqBtn.addEventListener("click", () => requestArtist(a));
      const photoLink = T.el("a", { class: "s-rail__photo", href: artistPageHref(a), "aria-label": a.name + "'s page" }, [
        a.portrait ? T.el("img", { src: a.portrait, alt: a.portraitAlt, loading: "lazy" }) : T.el("span", { class: "s-rail__mono", text: (a.first || a.name || "?").charAt(0).toUpperCase(), "aria-hidden": "true" })
      ]);
      const card = T.el("article", { class: "s-rail__card", "data-slug": a.slug }, [
        photoLink,
        T.el("div", { class: "s-rail__body" }, [
          T.el("p", { class: "s-rail__role" }, [a.role, a.sample ? T.el("span", { class: "s-sample", text: "Sample" }) : null]),
          T.el("h3", { text: a.name }),
          T.el("p", { class: "s-rail__does", text: a.does.slice(0, 3).join(" \u00b7 ") }),
          T.el("div", { class: "s-rail__quick" }, [
            T.el("p", { text: a.quick }),
            !a.ig ? null : (a.sample ? T.el("span", { class: "s-rail__ig" }, [igSvgEl()]) : T.el("a", { class: "s-rail__ig", href: "https://www.instagram.com/" + a.ig, target: "_blank", rel: "noopener" }, [igSvgEl()]))
          ]),
          T.el("div", { class: "s-rail__actions" }, [seeBtn, reqBtn])
        ])
      ]);
      cards.push(card);
      rail.append(card);
    });
    if (cards.length) setFocus(cards[0]);
    function fitRail(){
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      const need = cards.length * 320 + Math.max(0, cards.length - 1) * gap + 32;
      rail.classList.toggle("is-fit", window.innerWidth >= 1024 && need <= rail.clientWidth);
      updateNav();
    }
    const prevBtn = root.querySelector("#artist-prev");
    const nextBtn = root.querySelector("#artist-next");
    function focusedIndex(){ return cards.findIndex(c => c.classList.contains("is-focused")); }
    function updateNav(){
      const canScroll = cards.length > 1;
      const i = focusedIndex();
      if (prevBtn) { prevBtn.hidden = !canScroll; prevBtn.disabled = i <= 0; }
      if (nextBtn) { nextBtn.hidden = !canScroll; nextBtn.disabled = i < 0 || i >= cards.length - 1; }
    }
    function stepArtist(dir){
      const i = focusedIndex();
      const n = Math.min(cards.length - 1, Math.max(0, (i < 0 ? 0 : i) + dir));
      if (cards[n]) centerCard(cards[n]);
    }
    if (prevBtn) prevBtn.addEventListener("click", () => stepArtist(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => stepArtist(1));
    rail.addEventListener("scroll", () => requestAnimationFrame(updateNav), { passive: true });
    let drag = null, dragMoved = false;
    rail.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse" || rail.classList.contains("is-fit")) return;
      drag = { x: e.clientX, sl: rail.scrollLeft }; dragMoved = false;
      try { rail.setPointerCapture(e.pointerId); } catch (err) {}
      rail.classList.add("is-dragging");
    });
    rail.addEventListener("pointermove", e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) dragMoved = true;
      if (dragMoved) rail.scrollLeft = drag.sl - dx;
    });
    function endDrag(){ if (!drag) return; drag = null; rail.classList.remove("is-dragging"); }
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("click", e => { if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; } }, true);
    rail.addEventListener("dragstart", e => e.preventDefault());
    fitRail();
    addEventListener("resize", fitRail);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) setFocus(en.target); });
        updateNav();
      }, { root: rail, rootMargin: "0px -45% 0px -45%", threshold: 0 });
      cards.forEach(c => io.observe(c));
    }

    function openArtist(a, opener){
      lastFocus = opener || null;
      title.textContent = a.first + "'s portfolio";
      overlay.setAttribute("aria-label", "Artist profile: " + a.name);
      grid.replaceChildren(...a.work.slice(0, 3).map(w => T.el("figure", {}, [
        T.el("div", { class: "s-aview__figwrap" }, [
          w.ba ? baStageEl(w) : T.el("img", { src: w.src, alt: w.alt }),
          a.sample ? T.el("span", { class: "s-wm", text: "your photo here" }) : null
        ]),
        T.el("figcaption", { text: w.ba ? ((w.ba.title || w.cap) + (w.ba.story ? " · " + w.ba.story : "")) : w.cap })
      ])));
      /* A work photo that cannot load (a library file removed, a bad
         path) hides its figure instead of leaving a broken frame. */
      grid.querySelectorAll("img").forEach(im => im.addEventListener("error", () => { const f = im.closest("figure"); if (f) f.hidden = true; }));
      profile.replaceChildren(
        T.el("a", { href: artistPageHref(a), "aria-label": "See " + a.name + "'s full page" }, [
          T.el("img", { class: "pf", src: a.portrait, alt: a.portraitAlt })
        ]),
        T.el("div", {}, [
          T.el("div", { class: "s-aview__namerow" }, [
            T.el("div", {}, [
              T.el("h3", { text: a.name }),
              T.el("p", { class: "s-aview__role" }, [a.role, a.sample ? T.el("span", { class: "s-sample", text: "Sample" }) : null])
            ]),
            !a.ig ? null : (a.sample ? T.el("span", { class: "s-aview__ig" }, [igSvgEl()]) : T.el("a", { class: "s-aview__ig", href: "https://www.instagram.com/" + a.ig, target: "_blank", rel: "noopener" }, [igSvgEl()]))
          ]),
          T.el("p", { class: "s-aview__bio", text: a.bio }),
          T.el("div", { class: "s-aview__actions" }, [
            T.el("a", { class: "c-btn", href: artistPageHref(a), text: "See " + a.first + "'s full page" }),
            T.el("button", { class: "c-btn c-btn--ghost", type: "button", text: "Request with " + a.first, onclick: () => requestArtist(a) })
          ])
        ])
      );
      savedY = window.scrollY;
      try { history.scrollRestoration = "manual"; } catch (e) {}
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      overlay.hidden = false;
      overlay.scrollTop = 0;
      try { history.pushState({ aview: a.slug }, ""); pushed = true; } catch (e) { pushed = false; }
      title.focus({ preventScroll: true });
    }
    function closeArtist(restore){
      overlay.hidden = true;
      try { history.scrollRestoration = "auto"; } catch (e) {}
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (restore) window.scrollTo(0, savedY);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }
    function dismiss(){
      if (pushed) { pushed = false; history.back(); }
      else closeArtist(true);
    }
    function requestArtist(a){
      if (!overlay.hidden) {
        const wasPushed = pushed;
        pushed = false;
        closeArtist(false);
        if (wasPushed) history.back();
      }
      if (window.__form && window.__form.requestArtist) window.__form.requestArtist(a.slug);
    }
    closeBtn.addEventListener("click", dismiss);
    overlay.addEventListener("click", e => { if (e.target === overlay) dismiss(); });
    document.addEventListener("keydown", e => {
      if (!overlay.hidden && e.key === "Escape") { e.preventDefault(); dismiss(); }
    });
    window.addEventListener("popstate", () => {
      if (overlay.hidden) return;
      const restore = !suppressRestore;
      suppressRestore = false;
      pushed = false;
      closeArtist(restore);
    });
  },
  ask(){
    const S = SITE, L = S.limits;
    const $ = id => document.getElementById(id);
    const all = S.pickGroups.flatMap(g => g.items.map(i => Object.assign({}, i, { family: g.family })));
    const byId = Object.fromEntries(all.map(i => [i.id, i]));
    /* Published data can replace the services after this form was built (a
       brand-new service added in the portal, for one). Resolve a picked id
       against the CURRENT groups first, so a new service can never crash
       the summary or the submit. */
    function svcName(id){
      for (const g of S.pickGroups) for (const i of g.items) if (i.id === id) return i.name;
      return byId[id] ? byId[id].name : null;
    }
    function pickedNames(){ return [...st.picked].map(svcName).filter(Boolean); }
    const roster = artistDisplayList();
    const artistBySlug = Object.fromEntries(roster.map(a => [a.slug, a]));
    const st = { path: "quick", picked: new Set(), step: 0, lastPath: "quick", calOpen: false, view: null, errCheck: null, artist: null, artistNote: null,
      a: { whenMode: "flex", date: null, part: null, time: null, name: "", phone: "", note: "", fam: {} } };
    Object.keys(S.familySteps).forEach(f => { st.a.fam[f] = {}; });
    try { const up = new URLSearchParams(location.search).get("artist"); if (up) { const hit = roster.find(a => a.pageVar === up) || artistBySlug[up]; if (hit) st.artist = hit.slug; } } catch (e) {}

    const call = $("ask-call");
    call.append("Rather talk it through? Call ", T.el("a", { href: S.phoneHref, text: S.phoneDisplay }));

    const tabs = [$("tab-quick"), $("tab-guided")];
    const panels = { quick: $("panel-quick"), guided: $("panel-guided") };
    const result = $("result");
    const pathsBox = $("paths");
    const tsBox = $("ts-box"), tsNote = $("ts-note");
    let tsToken = "", tsWidget = null, tsRendered = false;

    function selectPath(p, focusTab){
      st.path = p;
      tabs.forEach(t => { const on = t.dataset.path === p; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
      panels.quick.hidden = p !== "quick";
      panels.guided.hidden = p !== "guided";
      if (tsRendered) tsBox.hidden = false;
      result.hidden = true;
      pathsBox.hidden = false;
      if (focusTab) tabs.find(t => t.dataset.path === p).focus();
      if (p === "guided") renderStep(null, false);
    }
    tabs.forEach(t => t.addEventListener("click", () => selectPath(t.dataset.path, false)));
    pathsBox.addEventListener("keydown", e => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      const cur = tabs.findIndex(t => t.dataset.path === st.path);
      let k = cur;
      if (e.key === "ArrowRight") k = (cur + 1) % tabs.length;
      if (e.key === "ArrowLeft") k = (cur - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") k = 0;
      if (e.key === "End") k = tabs.length - 1;
      selectPath(tabs[k].dataset.path, true);
    });

    function bindPhone(input, onChange){
      input.placeholder = "(" + T.digits(S.phoneE164).slice(0, 3) + ") 555-0123";
      input.addEventListener("input", () => { input.value = T.fmtPhone(input.value); onChange(input.value); });
    }

    const qName = $("q-name"), qPhone = $("q-phone"), qNote = $("q-note"), qSend = $("q-send"), qErr = $("q-name-err");
    const qArtist = $("q-artist"), qArtistField = $("q-artist-field");
    if (roster.length) {
      qArtist.append(T.el("option", { value: "", text: "No preference" }));
      roster.forEach(a => qArtist.append(T.el("option", { value: a.slug, text: a.name + (a.sample ? " (sample)" : "") })));
      qArtist.value = st.artist || "";
      qArtist.addEventListener("change", () => { st.artist = qArtist.value || null; st.artistNote = null; renderSummary(); });
    } else if (qArtistField) { qArtistField.hidden = true; }
    function qClear(){ if (qName.value.trim()) { qErr.textContent = ""; qName.removeAttribute("aria-invalid"); } }
    qName.addEventListener("input", qClear);
    bindPhone(qPhone, v => { qSend.disabled = T.digits(v).length < L.minPhoneDigits; });
    qName.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); qPhone.focus(); } });
    qPhone.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (!qSend.disabled) qSend.click(); else qNote.focus(); } });
    qSend.addEventListener("click", () => {
      if (!qName.value.trim()) { qErr.textContent = "Please add your name."; qName.setAttribute("aria-invalid", "true"); qName.focus(); return; }
      if (T.digits(qPhone.value).length < L.minPhoneDigits) return;
      const lines = ["Hi " + S.name + ",", "", "I'd like a call back."];
      if (st.artist) lines.push("Artist: " + artistBySlug[st.artist].name);
      lines.push("Name: " + qName.value.trim(), "Phone: " + T.fmtPhone(qPhone.value));
      if (qNote.value.trim()) lines.push("Note: " + qNote.value.trim().replace(/\s*\n\s*/g, " "));
      finish("quick", lines.join("\n"));
    });
    ["quick-form", "request-form"].forEach(id => $(id).addEventListener("submit", e => e.preventDefault()));

    function families(){ return S.pickGroups.map(g => g.family).filter(f => S.pickGroups.some(g => g.family === f && g.items.some(i => st.picked.has(i.id)))); }
    function steps(){
      const list = [{ id: "service", name: "Service" }];
      if (roster.length) list.push({ id: "who", name: "Artist" });
      families().forEach(f => { if (S.familySteps[f]) list.push({ id: "detail-" + f, family: f, name: S.familySteps[f].name }); });
      list.push({ id: "when", name: "When" }, { id: "contact", name: "Contact" }, { id: "review", name: "Review" });
      return list;
    }

    function slotsFor(o){
      const sp = T.span(S.hours[T.hoursIndex(T.dow(o.y, o.m, o.d))][1]);
      if (!sp) return [];
      const out = [];
      for (let t = sp.open; t + L.slotMinutes <= sp.close; t += L.slotMinutes) out.push(t);
      const n = T.now();
      if (T.key(o) === T.key(n)) return out.filter(t => t > n.mins);
      return out;
    }
    function firstOpen(){
      const a = st.artist ? artistBySlug[st.artist] : null;
      if (!a || !a.bookedOutDays) return null;
      const n = T.now();
      return T.add(n.y, n.m, n.d, a.bookedOutDays);
    }
    function pickable(o){
      const n = T.now();
      const k = T.key(o);
      if (k < T.key(n) || k > T.key(T.add(n.y, n.m, n.d, L.bookingDays))) return false;
      const fo = firstOpen();
      if (fo && k < T.key(fo)) return false;
      const ra = st.artist ? artistBySlug[st.artist] : null;
      if (ra && ra.bookedOutFrom && ra.bookedOutTo && k >= ra.bookedOutFrom.replace(/-/g, '') && k <= ra.bookedOutTo.replace(/-/g, '')) return false;
      return slotsFor(o).length > 0;
    }
    function partsFor(o){
      const s = slotsFor(o);
      return S.dayParts.filter(([, a, b]) => s.some(t => t >= a && t < b));
    }
    function whenText(){
      const a = st.a;
      if (a.whenMode !== "date" || !a.date) return "Flexible";
      return [T.fmtDate(a.date, { weekday: "short", month: "short", day: "numeric" }), a.part, a.time != null ? T.timeLabel(a.time) : null].filter(Boolean).join(", ");
    }

    function renderSummary(){
      const a = st.a;
      const rows = [
        ["Services", st.picked.size ? pickedNames().join(", ") : "none yet"],
        ...(roster.length ? [["Artist", st.artist ? artistBySlug[st.artist].name : "No preference"]] : []),
        ["When", a.whenMode === "date" && !a.date ? "picking a date" : whenText()],
        ["Name", a.name.trim() || "not yet"],
        ["Phone", a.phone || "not yet"]
      ];
      $("form-summary").replaceChildren(...rows.map(([k, v]) => T.el("div", {}, [T.el("b", { text: k + ": " }), v])));
    }

    function syncCards(){
      document.querySelectorAll("[data-add]").forEach(b => {
        const on = st.picked.has(b.dataset.add);
        b.textContent = on ? "Added" : "Add";
        b.setAttribute("aria-pressed", String(on));
      });
    }

    function header(){
      const list = steps();
      const s = list[st.step];
      const lab = $("step-label");
      lab.replaceChildren("Step " + (st.step + 1) + " of " + list.length, T.el("span", { class: "s-form__stepname", text: s.name }));
      $("step-bar").style.width = ((st.step + 1) / list.length * 100) + "%";
      $("btn-back").hidden = st.step === 0;
      $("btn-next").textContent = st.step === list.length - 1 ? "Write it up" : "Next";
      const next = $("btn-next");
      if (s.id === "contact") { next.disabled = T.digits(st.a.phone).length < L.minPhoneDigits; }
      else { next.disabled = false; next.removeAttribute("aria-describedby"); }
    }

    function clearError(){
      $("step-error").textContent = "";
      $("step-body").querySelectorAll("[aria-invalid]").forEach(n => n.removeAttribute("aria-invalid"));
      st.errCheck = null;
    }
    function recheck(){ if (st.errCheck && st.errCheck()) clearError(); }

    function q(text, sub){
      return [T.el("h3", { class: "s-step__q", id: "step-q", tabindex: "-1", text }), sub ? T.el("p", { class: "s-step__sub", text: sub }) : null];
    }
    function textField(id, label, value, onInput, extra){
      const input = T.el("input", Object.assign({ class: "c-input", id, type: "text", "data-key": id, enterkeyhint: "next", autocapitalize: "sentences", value: value || "" }, extra || {}));
      input.addEventListener("input", () => { onInput(input.value); recheck(); renderSummary(); });
      return T.el("div", { class: "c-field" }, [T.el("label", { class: "c-field__label", for: id, text: label }), input]);
    }

    const BUILD = {
      service(body){
        body.append(...q("What are we doing?", "Pick one or more.").filter(Boolean));
        let n = 0;
        S.pickGroups.forEach(g => {
          const grid = T.el("div", { class: "s-tiles" });
          g.items.forEach(item => {
            n++;
            const box = T.el("input", { type: "checkbox", class: "u-sr", value: item.id, "data-key": "svc-" + item.id, "aria-describedby": "step-error" });
            box.checked = st.picked.has(item.id);
            const tile = T.el("label", { class: "c-tile" + (box.checked ? " is-on" : "") }, [
              box,
              T.el("span", { class: "c-tile__num", "aria-hidden": "true", text: String(n).padStart(2, "0") }),
              T.el("span", { class: "c-tile__name", text: item.name }),
              T.el("span", { class: "c-tile__dot", "aria-hidden": "true" })
            ]);
            box.addEventListener("change", () => { setPicked(item.id, box.checked); tile.classList.toggle("is-on", box.checked); header(); recheck(); });
            grid.append(tile);
          });
          body.append(T.el("fieldset", { class: "s-tiles__group" }, [T.el("legend", { class: "s-tiles__legend", text: g.label }), grid]));
        });
      },
      who(body){
        body.append(...q("Who with?", "Pick one artist, or keep No preference.").filter(Boolean));
        if (st.artistNote) body.append(T.el("p", { class: "s-who__note", text: st.artistNote }));
        const grid = T.el("div", { class: "s-tiles" });
        const mkTile = (val, name, sub, art) => {
          const box = T.el("input", { type: "radio", name: "who-artist", class: "u-sr", value: val, "data-key": "who-" + (val || "none") });
          box.checked = (st.artist || "") === val;
          const kids = [box];
          if (art && art.portrait && art.portrait.indexOf("idb:") === 0) kids.push(T.el("img", { "data-idb": art.portrait, alt: "" }));
          else if (art && art.portrait) kids.push(T.el("img", { src: art.portrait, alt: "" }));
          else if (art) kids.push(T.el("span", { class: "s-who__mono", text: (art.first || art.name || "?").charAt(0).toUpperCase(), "aria-hidden": "true" }));
          kids.push(T.el("span", { class: "s-who__meta" }, [
            T.el("span", { class: "s-who__name" }, [name, art && art.sample ? T.el("span", { class: "s-sample", text: "Sample" }) : null]),
            T.el("span", { class: "s-who__sub", text: sub })
          ]));
          kids.push(T.el("span", { class: "c-tile__dot", "aria-hidden": "true" }));
          const tile = T.el("label", { class: "c-tile s-who__tile" + (box.checked ? " is-on" : "") }, kids);
          box.addEventListener("change", () => {
            st.artist = val || null;
            st.artistNote = null;
            grid.querySelectorAll(".c-tile").forEach(t => t.classList.remove("is-on"));
            tile.classList.add("is-on");
            syncQuickArtist();
            renderSummary();
            recheck();
          });
          return tile;
        };
        grid.append(mkTile("", "No preference", "First artist free for the work", null));
        roster.forEach(a => {
          grid.append(mkTile(a.slug, a.name, a.role, a));
        });
        body.append(grid);
        if (window.SiteContent && window.SiteContent.resolveIdbImgs) window.SiteContent.resolveIdbImgs(grid);
      },
      detail(body, s){
        const cfg = S.familySteps[s.family];
        const ans = st.a.fam[s.family];
        body.append(...q(cfg.q, cfg.sub).filter(Boolean));
        cfg.fields.forEach(f => {
          const id = "f-" + s.family + "-" + f.key;
          if (f.type === "choice") {
            const lab = T.el("p", { class: "c-group-label", id: id + "-lab", text: f.label });
            const row = T.el("div", { class: "c-choices", role: "group", "aria-labelledby": id + "-lab", "data-field": id });
            f.options.forEach(opt => {
              const k = id + "-" + opt.replace(/\W+/g, "-").toLowerCase();
              row.append(T.el("button", { type: "button", class: "c-choice", "data-key": k, "aria-pressed": String(ans[f.key] === opt), text: opt,
                onclick: () => { ans[f.key] = opt; renderStep(k, false, true); recheck(); } }));
            });
            body.append(T.el("div", { class: "s-step__block" }, [lab, row]));
          } else {
            const fld = textField(id, f.label, ans[f.key], v => { ans[f.key] = v; }, { placeholder: f.placeholder });
            body.append(T.el("div", { class: "s-step__block" }, [fld]));
          }
        });
      },
      when(body){
        const a = st.a;
        const fo = firstOpen();
        if (fo && a.date && T.key(a.date) < T.key(fo)) { a.date = null; a.part = null; a.time = null; }
        body.append(...q("When works?", "Flexible is fine.").filter(Boolean));
        const rb = st.artist ? artistBySlug[st.artist] : null;
        if (rb && rb.bookedOutFrom && rb.bookedOutTo) { if (a.date && T.key(a.date) >= rb.bookedOutFrom.replace(/-/g, '') && T.key(a.date) <= rb.bookedOutTo.replace(/-/g, '')) { a.date = null; a.part = null; a.time = null; } const pf = rb.bookedOutFrom.split("-"), pt = rb.bookedOutTo.split("-"); body.append(T.el("p", { class: "c-field__hint", text: rb.first + " is booked out from " + T.fmtDate({ y: +pf[0], m: +pf[1], d: +pf[2] }, { weekday: "short", month: "short", day: "numeric" }) + " to " + T.fmtDate({ y: +pt[0], m: +pt[1], d: +pt[2] }, { weekday: "short", month: "short", day: "numeric" }) + ". Those days do not show for " + rb.first + "." })); }
        if (fo) body.append(T.el("p", { class: "c-field__hint", text: artistBySlug[st.artist].first + " is booked out until " + T.fmtDate(fo, { weekday: "short", month: "short", day: "numeric" }) + ". The calendar starts there." }));
        const flex = T.el("button", { type: "button", class: "c-choice c-choice--wide", "data-key": "when-flex", "aria-pressed": String(a.whenMode === "flex"), text: "Flexible",
          onclick: () => { a.whenMode = "flex"; a.date = null; a.part = null; a.time = null; st.calOpen = false; renderStep("when-flex", false, true); recheck(); } });
        const pickLabel = a.date ? T.fmtDate(a.date, { weekday: "short", month: "short", day: "numeric" }) : "Pick a date";
        const pick = T.el("button", { type: "button", class: "c-choice c-choice--wide", "data-key": "when-date", "aria-haspopup": "dialog", "aria-expanded": String(st.calOpen), "aria-controls": "cal",
          "aria-pressed": String(a.whenMode === "date"), "aria-describedby": "step-error", text: pickLabel,
          onclick: () => {
            a.whenMode = "date";
            st.calOpen = !st.calOpen;
            if (st.calOpen) { const fo = firstOpen(); const base = a.date || (fo && T.key(fo) > T.key(T.now()) ? fo : T.now()); st.view = { y: base.y, m: base.m }; }
            renderStep(st.calOpen ? "cal-first" : "when-date", false, true);
          } });
        body.append(T.el("div", { class: "c-choices s-step__block" }, [flex, pick]));
        if (st.calOpen) body.append(calendar());
        if (a.date && !st.calOpen) {
          const parts = partsFor(a.date);
          if (a.part && !parts.some(p => p[0] === a.part)) { a.part = null; a.time = null; }
          if (parts.length === 1 && !a.part) a.part = parts[0][0];
          if (parts.length > 1) {
            const row = T.el("div", { class: "c-choices", role: "group", "aria-labelledby": "part-lab" });
            parts.forEach(([name]) => row.append(T.el("button", { type: "button", class: "c-choice c-choice--wide", "data-key": "part-" + name, "aria-pressed": String(a.part === name), text: name,
              onclick: () => { a.part = name; a.time = null; renderStep("part-" + name, false, true); } })));
            body.append(T.el("div", { class: "s-step__block" }, [T.el("p", { class: "c-group-label", id: "part-lab", text: "Part of the day" }), row]));
          }
          if (a.part) {
            const [, from, to] = S.dayParts.find(p => p[0] === a.part);
            const times = slotsFor(a.date).filter(t => t >= from && t < to);
            const trow = T.el("div", { class: "c-choices", role: "group", "aria-labelledby": "time-lab" });
            times.forEach(t => trow.append(T.el("button", { type: "button", class: "c-choice", "data-key": "time-" + t, "aria-pressed": String(a.time === t), text: T.timeLabel(t),
              onclick: () => { a.time = a.time === t ? null : t; renderStep("time-" + t, false, true); } })));
            body.append(T.el("div", { class: "s-step__block" }, [T.el("p", { class: "c-group-label", id: "time-lab", text: "Exact time (optional)" }), trow]));
          }
        }
      },
      contact(body){
        const a = st.a;
        body.append(...q("How can the shop reach you?", null).filter(Boolean));
        body.append(textField("c-name", "Name", a.name, v => { a.name = v; }, { autocomplete: "name", autocapitalize: "words", "aria-describedby": "step-error" }));
        const phone = T.el("input", { class: "c-input", id: "c-phone", type: "tel", inputmode: "tel", autocomplete: "tel", enterkeyhint: "next", "data-key": "c-phone", "aria-describedby": "step-error", value: a.phone });
        bindPhone(phone, v => { a.phone = v; header(); recheck(); renderSummary(); });
        body.append(T.el("div", { class: "c-field" }, [
          T.el("label", { class: "c-field__label", for: "c-phone", text: "Phone" }), phone
        ]));
        body.append(textField("c-note", "Anything else? (optional)", a.note, v => { a.note = v; }, { placeholder: "A quick line is plenty" }));
      },
      review(body){
        body.append(...q("Look good?", null).filter(Boolean));
        const dl = T.el("dl", { class: "s-review" });
        reviewRows().forEach(r => {
          dl.append(T.el("div", { class: "s-review__row" }, [
            T.el("dt", { text: r.label }), T.el("dd", { text: r.value }),
            T.el("button", { type: "button", "aria-label": "Edit " + r.label, text: "Edit", onclick: () => { st.step = steps().findIndex(s => s.id === r.step); renderStep(null, true); } })
          ]));
        });
        body.append(dl);
      }
    };

    function calendar(){
      const n = T.now();
      const v = st.view;
      const first = { y: v.y, m: v.m, d: 1 };
      const days = new Date(Date.UTC(v.y, v.m, 0)).getUTCDate();
      const lastOk = T.add(n.y, n.m, n.d, L.bookingDays);
      const prevOk = v.y * 12 + v.m > n.y * 12 + n.m;
      const nextOk = v.y * 12 + v.m < lastOk.y * 12 + lastOk.m;
      const shift = d => { const t = new Date(Date.UTC(v.y, v.m - 1 + d, 1)); st.view = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 }; renderStep(d < 0 ? "cal-prev" : "cal-next", false, true); };
      const head = T.el("div", { class: "c-cal__head" }, [
        T.el("button", { type: "button", class: "c-cal__nav", "data-key": "cal-prev", "aria-label": "Previous month", disabled: !prevOk, text: "‹", onclick: () => shift(-1) }),
        T.el("p", { class: "c-cal__title", id: "cal-title", "aria-live": "polite", text: T.fmtDate(first, { month: "long", year: "numeric" }) }),
        T.el("button", { type: "button", class: "c-cal__nav", "data-key": "cal-next", "aria-label": "Next month", disabled: !nextOk, text: "›", onclick: () => shift(1) })
      ]);
      const grid = T.el("div", { class: "c-cal__grid" });
      ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach(d => grid.append(T.el("span", { class: "c-cal__dow", "aria-hidden": "true", text: d })));
      for (let k = 0; k < T.dow(v.y, v.m, 1); k++) grid.append(T.el("span", { "aria-hidden": "true" }));
      let firstKey = null;
      for (let d = 1; d <= days; d++) {
        const o = { y: v.y, m: v.m, d };
        const ok = pickable(o);
        const sel = st.a.date && T.key(st.a.date) === T.key(o);
        if (ok && !firstKey) firstKey = "day-" + T.key(o);
        grid.append(T.el("button", { type: "button", class: "c-cal__day", "data-key": "day-" + T.key(o), disabled: !ok, "aria-pressed": String(!!sel),
          "aria-label": T.fmtDate(o, { weekday: "long", month: "long", day: "numeric" }) + (ok ? "" : ", not available"), text: String(d),
          onclick: () => { st.a.date = o; st.a.part = null; st.a.time = null; st.calOpen = false; renderStep("when-date", false, true); recheck(); } }));
      }
      const box = T.el("div", { class: "c-cal", id: "cal", role: "dialog", "aria-labelledby": "cal-title" }, [head, grid]);
      box.dataset.first = st.a.date && st.a.date.y === v.y && st.a.date.m === v.m ? "day-" + T.key(st.a.date) : (firstKey || "cal-next");
      box.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); st.calOpen = false; renderStep("when-date", false, true); } });
      return box;
    }

    function reviewRows(){
      const a = st.a, rows = [];
      rows.push({ label: "Service", value: pickedNames().join(", "), step: "service" });
      if (roster.length) rows.push({ label: "Artist", value: st.artist ? artistBySlug[st.artist].name : "No preference", step: "who" });
      families().forEach(f => {
        const cfg = S.familySteps[f];
        if (!cfg) return;
        cfg.fields.forEach(fl => { const v = (a.fam[f][fl.key] || "").trim(); if (v) rows.push({ label: fl.summary, value: v, step: "detail-" + f }); });
      });
      rows.push({ label: "When", value: whenText(), step: "when" });
      rows.push({ label: "Name", value: a.name.trim(), step: "contact" });
      rows.push({ label: "Phone", value: a.phone, step: "contact" });
      if (a.note.trim()) rows.push({ label: "Note", value: a.note.trim(), step: "contact" });
      return rows;
    }

    function validate(s){
      const a = st.a;
      if (s.id === "service") return st.picked.size ? null : { msg: "Pick at least one service.", sel: "#step-body input[type=checkbox]" };
      if (s.family) {
        const f = S.familySteps[s.family].fields.find(fl => fl.required && !(a.fam[s.family][fl.key] || "").trim());
        return f ? { msg: f.error, sel: '[data-field="f-' + s.family + "-" + f.key + '"] button' } : null;
      }
      if (s.id === "when") return a.whenMode === "date" && !a.date ? { msg: "Pick a date, or choose Flexible.", sel: '[data-key="when-date"]' } : null;
      if (s.id === "contact") {
        const bad = [];
        if (!a.name.trim()) bad.push("#c-name");
        if (T.digits(a.phone).length < L.minPhoneDigits) bad.push("#c-phone");
        return bad.length ? { msg: "Add your name and at least 7 digits.", sel: bad.join(",") } : null;
      }
      return null;
    }

    function renderStep(focusKey, moved, keepError){
      const list = steps();
      if (st.step >= list.length) st.step = list.length - 1;
      const s = list[st.step];
      if (!keepError) clearError();
      const body = $("step-body");
      body.replaceChildren();
      (s.family ? BUILD.detail : BUILD[s.id])(body, s);
      header();
      renderSummary();
      if (st.errCheck) { const v = validate(s); if (v) body.querySelectorAll(v.sel).forEach(n => n.setAttribute("aria-invalid", "true")); }
      if (focusKey === "cal-first") { const c = body.querySelector("#cal"); focusKey = c ? c.dataset.first : "when-date"; }
      if (focusKey) { const f = body.querySelector('[data-key="' + focusKey + '"]'); if (f && !f.disabled) f.focus(); else { const c = body.querySelector("#cal button:not([disabled])"); if (c) c.focus(); } }
      else if (moved) {
        const h = body.querySelector("#step-q"); if (h) h.focus({ preventScroll: true });
        const card = $("ask").querySelector(".c-card");
        if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: "start", behavior: T.reduced() ? "auto" : "smooth" });
      }
    }

    function next(){
      const list = steps();
      const s = list[st.step];
      const v = validate(s);
      if (v) {
        $("step-error").textContent = v.msg;
        const body = $("step-body");
        body.querySelectorAll(v.sel).forEach(n => n.setAttribute("aria-invalid", "true"));
        st.errCheck = () => !validate(s);
        const f = body.querySelector(v.sel);
        if (f) f.focus();
        return;
      }
      if (st.step === list.length - 1) { finish("guided", compose()); return; }
      st.step++;
      st.calOpen = false;
      renderStep(null, true);
    }
    $("btn-next").addEventListener("click", next);
    $("btn-back").addEventListener("click", () => { if (st.step > 0) { st.step--; st.calOpen = false; renderStep(null, true); } });
    $("step-body").addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      const t = e.target;
      if (t.tagName === "INPUT" && (t.type === "text" || t.type === "tel")) { e.preventDefault(); if (!$("btn-next").disabled) next(); else validateNow(); }
    });
    function validateNow(){ const s = steps()[st.step]; const v = validate(s); if (v) { $("step-error").textContent = v.msg; st.errCheck = () => !validate(s); $("step-body").querySelectorAll(v.sel).forEach(n => n.setAttribute("aria-invalid", "true")); } }

    function compose(){
      const lines = ["Hi " + S.name + ",", ""];
      reviewRows().forEach(r => lines.push(r.label + ": " + r.value));
      return lines.join("\n");
    }

    function setPicked(id, on){
      if (on) st.picked.add(id); else st.picked.delete(id);
      syncCards();
      syncArtistFit();
      renderSummary();
    }
    function syncArtistFit(){
      if (!st.artist) return;
      if (!artistBySlug[st.artist]) { st.artist = null; syncQuickArtist(); }
    }
    function syncQuickArtist(){
      const sel = $("q-artist");
      if (sel) sel.value = st.artist || "";
    }

    function tsShowNote(msg){
      tsBox.hidden = false;
      tsNote.textContent = msg;
      tsNote.hidden = false;
    }
    function tsRender(){
      if (tsRendered || !window.turnstile) return;
      tsRendered = true;
      tsWidget = window.turnstile.render($("ts-widget"), {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: t => { tsToken = t; tsNote.hidden = true; },
        "expired-callback": () => { tsToken = ""; },
        "error-callback": () => { tsToken = ""; }
      });
      tsBox.hidden = false;
    }
    (function tsWait(n){
      if (window.turnstile) { tsRender(); return; }
      if (n > 60) return;
      setTimeout(() => tsWait(n + 1), 250);
    })(0);
    function tsReset(){
      tsToken = "";
      if (tsWidget !== null && window.turnstile) { try { window.turnstile.reset(tsWidget); } catch (e) {} }
    }

    const overlay = $("send-overlay");
    const REQUEST_API = "https://api.instattoosionalized.net/requests";
    let requestId = null;
    function buildPayload(path, text){
      const a = st.a;
      const guided = path === "guided";
      if (!requestId) requestId = "req-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
      return {
        id: requestId,
        path: path,
        artist: st.artist ? artistBySlug[st.artist].name : "",
        services: guided ? pickedNames() : [],
        when: guided && a.whenMode === "date" && a.date ? { date: a.date, part: a.part || "", time: a.time || "" } : null,
        name: guided ? a.name.trim() : qName.value.trim(),
        phone: guided ? a.phone : T.fmtPhone(qPhone.value),
        text: text,
        page: location.href,
        turnstile_token: tsToken
      };
    }
    async function sendRequest(path, text){
      const ctl = new AbortController();
      const killer = setTimeout(() => ctl.abort(), 10000);
      try {
        const r = await fetch(REQUEST_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload(path, text)), signal: ctl.signal });
        if (!r.ok) return false;
        const j = await r.json().catch(() => null);
        return Boolean(j && j.ok);
      } catch (e) { return false; } finally { clearTimeout(killer); }
    }
    function showResult(text, sent){
      overlay.hidden = true;
      overlay.classList.remove("is-run");
      tsBox.hidden = true;
      pathsBox.hidden = true;
      panels.quick.hidden = true;
      panels.guided.hidden = true;
      result.hidden = false;
      $("result-text").textContent = text;
      $("result-sms").href = S.smsBase + "?&body=" + encodeURIComponent(text);
      if (sent) {
        $("result-title").textContent = "Request sent"; $("result-sms").hidden = true; $("result-copy").hidden = true;
        $("result-status").textContent = "The shop got your request. They will confirm your time by text, and once they do it goes on their calendar. Here is what you sent:";
      } else {
        $("result-title").textContent = "One more step: send it to the shop"; $("result-sms").hidden = false; $("result-copy").hidden = false;
        $("result-status").textContent = "We could not send that automatically. Text it to the shop, or copy it and send it any way you like. Here is your request:";
      }
      $("result").dataset.text = text;
      $("ask").scrollIntoView({ block: "start", behavior: "auto" });
      $("result-title").focus({ preventScroll: true });
    }
    async function finish(path, text){
      if (!tsToken) {
        tsShowNote(tsRendered ? "Please finish the quick check above, then send again." : "The quick check could not load. Check your connection, then try again.");
        tsBox.scrollIntoView({ block: "center", behavior: T.reduced() ? "auto" : "smooth" });
        return;
      }
      st.lastPath = path;
      overlay.hidden = false;
      overlay.classList.remove("is-run");
      void overlay.offsetWidth;
      overlay.classList.add("is-run");
      const wait = new Promise(res => setTimeout(res, T.reduced() ? 900 : 2000));
      const sent = await sendRequest(path, text);
      tsReset();
      await wait;
      showResult(text, sent);
    }
    $("result-copy").addEventListener("click", async () => {
      const text = $("result").dataset.text || "";
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        try { const ta = T.el("textarea", { readonly: true, style: "position:fixed;top:0;left:0;opacity:0" }); ta.value = text; document.body.append(ta); ta.select(); ok = document.execCommand("copy"); ta.remove(); } catch (e2) { ok = false; }
      }
      $("result-status").textContent = ok ? "Copied. Paste it anywhere." : "Copy didn't work here. Select the text above and copy it.";
    });
    $("result-edit").addEventListener("click", () => {
      if (st.lastPath === "guided") { st.step = steps().length - 1; }
      selectPath(st.lastPath, false);
      if (st.lastPath === "guided") renderStep(null, true);
      else { qName.focus(); }
    });

    window.__form = {
      requestArtist(slug){
        const a = artistBySlug[slug];
        if (!a) return;
        st.artist = slug;
        st.artistNote = null;
        if (!families().some(f => a.families.indexOf(f) !== -1)) {
          const item = all.find(i => i.family === a.families[0]);
          if (item) setPicked(item.id, true);
        }
        syncQuickArtist();
        selectPath("guided", false);
        st.step = steps().findIndex(s => s.id === "who");
        if (st.step < 0) st.step = 0;
        renderStep(null, true);
        $("ask").scrollIntoView({ block: "start", behavior: T.reduced() ? "auto" : "smooth" });
      },
      toggleService(id){
        const on = !st.picked.has(id);
        setPicked(id, on);
        if (on) {
          st.step = 0;
          selectPath("guided", false);
          $("ask").scrollIntoView({ block: "start", behavior: T.reduced() ? "auto" : "smooth" });
        } else if (st.path === "guided" && result.hidden) {
          renderStep(null, false);
        }
      }
    };
    if (!roster.length) $("form-summary").style.height = "calc(4 * 1.5em + var(--sp-2))";
    renderSummary();
  },
  footer(){},
  jump(root){
    const req = document.getElementById("jump-request");
    const bar = document.querySelector(".s-callbar");
    const hero = document.querySelector(".s-hero");
    function lift(){
      const barH = (bar && getComputedStyle(bar).display !== "none") ? bar.offsetHeight : 0;
      root.style.bottom = (barH ? barH + 8 : 16) + "px";
    }
    function onScroll(){ root.classList.toggle("is-on", window.scrollY > (hero ? hero.offsetHeight : 400)); }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { lift(); onScroll(); });
    const ask = document.getElementById("ask");
    if (ask && "IntersectionObserver" in window) {
      new IntersectionObserver(en => root.classList.toggle("is-off", en[0].isIntersecting)).observe(ask);
    }
    document.getElementById("jump-up").addEventListener("click", () => window.scrollTo({ top: 0, behavior: T.reduced() ? "auto" : "smooth" }));
    req.classList.remove("is-hidden");
    lift(); onScroll();
  },
  callbar(){},
  schema(root){
    const S = SITE;
    const spec = [];
    S.hours.forEach(([day, val]) => { const sp = T.span(val); if (sp) spec.push({ "@type": "OpeningHoursSpecification", dayOfWeek: "https://schema.org/" + day,
      opens: String(Math.floor(sp.open / 60)).padStart(2, "0") + ":" + String(sp.open % 60).padStart(2, "0"),
      closes: String(Math.floor(sp.close / 60)).padStart(2, "0") + ":" + String(sp.close % 60).padStart(2, "0") }); });
    root.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "TattooParlor", name: S.name, telephone: S.phoneE164,
      address: { "@type": "PostalAddress", streetAddress: S.street, addressLocality: S.town, addressRegion: S.region, postalCode: S.zip, addressCountry: "US" },
      openingHoursSpecification: spec, sameAs: [S.facebook]
    });
  }
};

try { if (window.SiteContent) { SiteContent.previewBar(!!SiteContent.read()); SiteContent.mergeHome(SITE.artists); SiteContent.homePolicies(); } } catch (e) { console.error('[site-content] could not apply the published artists: ' + e.message); }
(function boot(){
  try {
    document.querySelectorAll("[data-fill]").forEach(n => { const v = T.pathGet(SITE, n.dataset.fill); if (v != null) n.textContent = v; });
    document.querySelectorAll("[data-href]").forEach(n => { const v = T.pathGet(SITE, n.dataset.href); if (v != null) n.href = v; });
    const phoneBtn = document.querySelector(".s-header .c-btn span");
    if (phoneBtn) phoneBtn.prepend(" ");
  } catch (e) { console.error("fill failed", e); }
  document.querySelectorAll("[data-module]").forEach(el => {
    const fn = MODULES[el.dataset.module];
    if (!fn) return;
    try { fn(el); } catch (e) { console.error("module failed:", el.dataset.module, e); }
  });
  const pvWorkEl = document.querySelector('[data-module="work"]');
  if (pvWorkEl) pvWorkEl.addEventListener('pv-rebuild-work', () => {
    const ob = document.getElementById('open-book');
    const nb = ob.cloneNode(true);
    ob.replaceWith(nb);
    document.getElementById('book').innerHTML = '';
    MODULES.work(pvWorkEl);
  });
})();
