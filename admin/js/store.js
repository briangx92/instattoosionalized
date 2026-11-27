/* State, persistence, and the image store.
   Working data is kept in this browser (localStorage for data, IndexedDB for uploaded photos).
   Every change goes through OA.store.commit(), which is the one place a live backend would plug in. */
(function () {
  'use strict';
  var OA = window.OA, KEY = 'oa2:state:v1';
  var S = OA.store = { state: null, error: null, subs: [], seq: 0 };

  OA.STATUSES = ['New', 'Contacted', 'Consultation Scheduled', 'Awaiting Deposit', 'Booked', 'Closed'];
  OA.STATUS_LABEL = { 'New': 'New', 'Contacted': 'Contacted', 'Consultation Scheduled': 'Consult set', 'Awaiting Deposit': 'Deposit pending', 'Booked': 'Booked', 'Closed': 'Closed' };
  OA.APPT_STATUS = { booked: 'Booked', arrived: 'In the chair', done: 'Done', noshow: 'No-show', cancelled: 'Cancelled' };
  OA.APPT_TYPES = { consult: 'Consultation', session: 'Tattoo session', touchup: 'Touch-up', piercing: 'Piercing', other: 'Other' };

  S.subscribe = function (fn) { S.subs.push(fn); };
  S.emit = function () { S.subs.forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); };
  S.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(S.state)); S.error = null; return true; }
    catch (e) {
      S.error = 'This browser would not save your changes (' + (e && e.name === 'QuotaExceededError' ? 'storage is full' : 'storage is blocked') + '). What you see now will be lost when this tab closes. Download a backup from Settings, then free up space.';
      return false;
    }
  };
  S.commit = function () { S.state.touched = true; S.seq++; S.save(); S.emit(); };

  S.load = function () {
    var raw = null, st = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { S.error = 'This browser is blocking storage, so nothing you change here can be kept.'; }
    if (raw) {
      try { st = JSON.parse(raw); } catch (e) {
        try { localStorage.setItem(KEY + ':unreadable:' + Date.now(), raw); } catch (e2) { /* nothing more to try */ }
        S.error = 'Saved data could not be read, so a fresh empty portal was loaded instead. The unreadable copy was kept in this browser.';
        st = null;
      }
    }
    if (!st || st.v !== 1) { st = OA.freshState(); S.state = st; S.save(); }
    S.state = OA.migrate(st);
    /* The portal is live: records left over from the old built-in sample
       data (marked sample) are removed on load. Anything the shop added
       by hand is never marked, so it is never touched. */
    ['requests', 'appts', 'clients', 'timeoff'].forEach(function (k) {
      if (Array.isArray(S.state[k])) S.state[k] = S.state[k].filter(function (x) { return !x.sample; });
    });
    S.save();
  };
  S.reset = function () { S.state = OA.freshState(); S.error = null; OA.clearLive(); S.save(); S.emit(); };
  S.replace = function (st) { S.state = OA.migrate(st); S.save(); S.emit(); };
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !e.newValue) return;
    try { S.state = OA.migrate(JSON.parse(e.newValue)); S.emit(); } catch (err) { /* ignore a half-written value */ }
  });

  /* ---------- sample data ---------- */
  function hoursFromSeed(seed) {
    return seed.hours.map(function (p) {
      if (!p[1]) return { day: p[0], open: null, close: null };
      var m = p[1].match(/(\d+):(\d+)\s*(AM|PM)\s*\S+\s*(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return { day: p[0], open: null, close: null };
      function t(h, mi, ap) { h = +h % 12; if (/pm/i.test(ap)) h += 12; return OA.pad(h) + ':' + mi; }
      return { day: p[0], open: t(m[1], m[2], m[3]), close: t(m[4], m[5], m[6]) };
    });
  }
  OA.isOpenDay = function (iso, hours) { var hrs = hours || S.state.site.hours; var x = hrs[(OA.dow(iso) + 6) % 7]; return !!(x && x.open); };
  OA.hoursFor = function (iso) { return S.state.site.hours[(OA.dow(iso) + 6) % 7]; };

  var TEMPLATES = {
    ack: { name: 'Got your request', body: 'Hi {first}, this is {shop}. We got your request and will get back to you soon.' },
    details: { name: 'Ask for details', body: 'Hi {first}, thanks for reaching out about your tattoo. Can you send a photo of where it is going, plus any reference pictures? We will put a quote together after that.' },
    quote: { name: 'Quote and deposit', body: 'Hi {first}, {artist} can do this for about {quote}. To hold your spot, the shop’s deposit is {deposit}. {depositHow}' },
    confirm: { name: 'Booking confirmation', body: 'Hi {first}, you are booked with {artist} on {date} at {time}. Reply here if anything changes. {shop}, {address}' },
    reminder: { name: 'Appointment reminder', body: 'Hi {first}, a reminder about your appointment with {artist} on {date} at {time} at {shop}, {address}. See you then!' },
    aftercare: { name: 'Healing check-in', body: 'Hi {first}, it is {shop} checking in on your tattoo. How is it healing? When it is healed, send us a photo. We would love to see it.' },
    review: { name: 'Ask for a review', body: 'Thanks again for coming in, {first}! If you have a minute, a Google review helps a small shop a lot: {reviewLink}' },
    waitlist: { name: 'Books are open', body: 'Hi {first}, {artist}’s books are open again. Want to set up a time? {shop}' },
    blank: { name: 'New text', body: 'Hi {first}, ' },
    decline: { name: 'Polite decline', body: 'Hi {first}, thanks so much for thinking of us. This one is not a fit for the shop right now, but we would love to see you for something else.' }
  };
  OA.TEMPLATES = TEMPLATES;

  OA.freshState = function () {
    var seed = window.OA_SEED_SITE, today = OA.todayISO(), hours = hoursFromSeed(seed);
    var artists = [], portfolio = {};
    seed.artists.forEach(function (a) {
      artists.push({ slug: a.slug, name: a.name, role: a.role || 'Tattoo', ig: OA.igOf(a.socials) || a.ig || '', socials: OA.seedSocials(a), bio: a.about.join('\n\n'), portrait: a.portrait, books: a.slug === 'liv' ? 'closed' : 'open', until: a.slug === 'liv' ? OA.addDays(today, 21) : '', untilSample: a.slug === 'liv', visible: true, removedAt: null });
      portfolio[a.slug] = a.work.map(function (w, i) { return { id: a.slug + '-' + (i + 1), src: w.src, cap: w.cap, sec: '', onSite: true, ord: (i + 1) * 10, date: w.date || '', dateSource: w.dateSource || '' }; });
    });
    var site = {
      shop: { name: seed.name, short: seed.shortName, phone: seed.phoneDisplay, street: seed.street, town: seed.town, region: seed.region, zip: seed.zip, facebook: seed.facebook },
      hours: hours,
      banner: { on: false, text: '', start: '', end: '' },
      announcements: [],
      policies: { deposit: 'The shop’s deposit is $40 and holds your spot.', age: '', aftercare: '' },
      services: [].concat.apply([], seed.pickGroups.map(function (g) { return g.items.map(function (it) { return { id: it.id, family: g.family, name: it.name, blurb: it.blurb }; }); })),
      prices: seed.prices.map(function (g) { return { group: g.group, sample: !!g.sample, items: g.items.map(function (x) { return [x[0], x[1]]; }) }; }),
      quotes: [],
      artists: artists,
      portfolio: portfolio
    };
    var tpl = {}; Object.keys(TEMPLATES).forEach(function (k) { tpl[k] = TEMPLATES[k].body; });
    return {
      v: 1, anchor: today, created: Date.now(), touched: false,
      site: site, published: { at: Date.now(), by: '717 Digital Studio', site: OA.clone(site) }, history: [],
      requests: [], appts: [], clients: [], timeoff: [],
      settings: { depositAmount: '$40', depositHow: '', reviewLink: '', templates: tpl, rating: { stars: seed.rating.stars, count: seed.rating.count, source: seed.rating.source } },
      people: [
        { id: 'p1', name: 'Admin', email: 'owner@example.com', role: 'owner', artist: '' },
        { id: 'p3', name: 'Lex', email: 'lex@example.com', role: 'artist', artist: 'lex' },
        { id: 'p4', name: 'Liv', email: 'liv@example.com', role: 'artist', artist: 'liv' },
        { id: 'p5', name: 'Dawlface', email: 'dawlface@example.com', role: 'artist', artist: 'dawlface' }
      ],
      activity: []
    };
  };

  /* Retired with the demo data: the portal is live and starts empty.
     Kept as a no-op so older callers do not break; it only re-anchors
     the state's date. */
  OA.refreshSamples = function (quiet) {
    var st = S.state, today = OA.todayISO();
    st.anchor = today;
    S.save(); if (!quiet) { st.touched = true; S.save(); S.emit(); }
  };

  /* ---------- images: uploads are shrunk, then kept in IndexedDB (localStorage is far too small for photos) ---------- */
  var DBN = 'oa2-images', urlCache = {};
  function db() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) { rej(new Error('This browser has no photo storage (IndexedDB is unavailable).')); return; }
      var rq = indexedDB.open(DBN, 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore('blobs'); };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(new Error('Photo storage could not be opened: ' + (rq.error && rq.error.message || 'unknown error'))); };
    });
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction('blobs', mode), out = fn(t.objectStore('blobs'));
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : undefined); };
        t.onerror = t.onabort = function () { rej(new Error('Photo storage failed: ' + (t.error && t.error.message || 'the browser refused the write'))); };
      });
    });
  }
  OA.img = {
    compress: function (file, max, q) {
      max = max || 1600; q = q || 0.82;
      if (!file || !/^image\//.test(file.type || '')) return Promise.reject(new Error('“' + (file && file.name || 'That file') + '” is not a photo. Use a JPEG, PNG, or WebP.'));
      var load = window.createImageBitmap ? createImageBitmap(file) : new Promise(function (res, rej) {
        var im = new Image(), u = URL.createObjectURL(file); im.onload = function () { res(im); }; im.onerror = function () { rej(new Error('decode')); }; im.src = u;
      });
      return load.then(function (bm) {
        var w = bm.width, h = bm.height, sc = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w * sc)); c.height = Math.max(1, Math.round(h * sc));
        var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height); cx.drawImage(bm, 0, 0, c.width, c.height);
        return new Promise(function (res, rej) { c.toBlob(function (b) { b ? res(b) : rej(new Error('encode')); }, 'image/jpeg', q); });
      }).catch(function () { throw new Error('“' + (file.name || 'That photo') + '” could not be read. If it came from an iPhone, share it as JPEG instead of HEIC.'); });
    },
    put: function (blob) { var id = 'idb:' + OA.uid('img'); return tx('readwrite', function (s) { return s.put(blob, id); }).then(function () { return id; }); },
    del: function (id) { if (urlCache[id]) { URL.revokeObjectURL(urlCache[id]); delete urlCache[id]; } return tx('readwrite', function (s) { return s.delete(id); }).catch(function () { /* a leftover blob is harmless */ }); },
    url: function (id) {
      if (urlCache[id]) return Promise.resolve(urlCache[id]);
      return tx('readonly', function (s) { return s.get(id); }).then(function (b) { if (!b) return ''; urlCache[id] = URL.createObjectURL(b); return urlCache[id]; });
    },
    blob: function (id) { return tx('readonly', function (s) { return s.get(id); }).then(function (b) { return b || null; }); },
    all: function () { return tx('readonly', function (s) { return s.getAllKeys(); }); },
    /* Plain repo photos live one folder up from this page. */
    src: function (ref) { if (!ref) return ''; if (/^(idb:)/.test(ref)) return ''; if (/^(https?:|data:|blob:)/.test(ref)) return ref; var m = /^(?:\.\.\/)?([a-z0-9-]+)-((?:portrait|work-\d+)\.jpg)$/.exec(ref); if (m) ref = 'portfolio/' + m[1] + '/images/' + m[1] + '-' + m[2]; return '../' + ref; },
    /* The date a photo was taken, from its EXIF block (DateTimeOriginal, else the
       file's DateTime), as YYYY-MM-DD. Null when the photo carries none, which is
       most photos that passed through Instagram or Facebook. Read the ORIGINAL
       file: compress() re-encodes and strips EXIF. */
    exifDate: function (file) {
      if (!file) return Promise.resolve(null);
      return file.slice(0, 262144).arrayBuffer().then(function (buf) {
        var v = new DataView(buf);
        if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return null;
        var off = 2;
        while (off + 4 <= v.byteLength) {
          var marker = v.getUint16(off);
          if ((marker & 0xFF00) !== 0xFF00) return null;
          var len = v.getUint16(off + 2);
          if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) return readTiff(v, off + 10);
          if (marker === 0xFFDA) return null;
          off += 2 + len;
        }
        return null;
      }).catch(function () { return null; });
      function readTiff(v, t) {
        var le = v.getUint16(t) === 0x4949;
        function u16(o) { return v.getUint16(o, le); }
        function u32(o) { return v.getUint32(o, le); }
        function tagVal(ifd, tag) {
          var n = u16(ifd), i, e;
          for (i = 0; i < n; i++) {
            e = ifd + 2 + i * 12;
            if (u16(e) === tag) return e;
          }
          return 0;
        }
        function ascii(e) {
          var cnt = u32(e + 4), o = cnt <= 4 ? e + 8 : t + u32(e + 8), s = '', i;
          for (i = 0; i < cnt && o + i < v.byteLength; i++) { var c = v.getUint8(o + i); if (!c) break; s += String.fromCharCode(c); }
          return s;
        }
        function dateAt(ifd, tag) {
          var e = tagVal(ifd, tag);
          if (!e) return null;
          var m = /^(\d{4}):(\d{2}):(\d{2})/.exec(ascii(e));
          return m ? m[1] + '-' + m[2] + '-' + m[3] : null;
        }
        var ifd0 = t + u32(t + 4);
        var ex = tagVal(ifd0, 0x8769);
        if (ex) { var d = dateAt(t + u32(ex + 8), 0x9003); if (d) return d; }
        return dateAt(ifd0, 0x0132);
      }
    },
    el: function (ref, alt, cls) {
      var im = OA.h('img', { alt: alt || '', class: cls || '', loading: 'lazy', decoding: 'async' });
      if (/^idb:/.test(ref || '')) {
        OA.img.url(ref).then(function (u) { if (u) im.src = u; else im.classList.add('img-missing'); }).catch(function () { im.classList.add('img-missing'); });
      } else if (ref) { im.src = OA.img.src(ref); im.addEventListener('error', function () { im.classList.add('img-missing'); }); }
      return im;
    }
  };
  /* After a publish nothing needs the photos that are no longer in the site, so free them. */
  OA.gcImages = function () {
    var used = {};
    function scan(site) { Object.keys(site.portfolio).forEach(function (k) { site.portfolio[k].forEach(function (p) { [p.src, p.pair && p.pair.b, p.pair && p.pair.a].forEach(function (x) { if (x) used[x] = 1; }); }); site.artists.forEach(function (a) { if (a.portrait) used[a.portrait] = 1; }); }); }
    scan(S.state.site); scan(S.state.published.site);
    (S.state.requests || []).forEach(function (r) { (r.refs || []).forEach(function (x) { if (x.img) used[x.img] = 1; }); });
    (S.state.appts || []).forEach(function (a) { (a.refs || []).forEach(function (x) { if (x.img) used[x.img] = 1; }); });
    return OA.img.all().then(function (keys) { return Promise.all(keys.filter(function (k) { return !used[k]; }).map(function (k) { return OA.img.del(k); })); }).catch(function () { /* leftovers are harmless */ });
  };
})();
