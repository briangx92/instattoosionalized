/* The public content format: what the portal publishes and the website reads.
   One shape for both the demo (kept in this browser) and the real site (served by the API later).
   It carries the banner, announcements, artists, policies, shop phone, hours, prices and services. */
(function () {
  'use strict';
  var OA = window.OA;

  OA.PUBLIC_KEY = 'oa2:published:v1';
  OA.PREVIEW_KEY = 'oa2:preview:v1';
  /* The demo website, relative to the portal. The real build points this at the shop's live address. */
  OA.LIVE_URL = '../index.html';
  OA.LIMITS = { policy: 800, artistName: 80, artistRole: 40, artistBio: 1500, bannerText: 140, annTitle: 80, annBody: 400, annLink: 300, annMax: 20 };
  OA.ANN_KINDS = [['notice', 'News'], ['closure', 'Closure'], ['special', 'Special']];

  var ISO = /^\d{4}-\d{2}-\d{2}$/;

  /* Saved data from before announcements existed gets an empty list, so nothing downstream has to ask. */
  /* The seed has each artist's links; an artist with only a handle gets that as an Instagram link. */
  OA.seedSocials = function (a) {
    var src = a.socials;
    if (!Array.isArray(src)) { var seed = (window.OA_SEED_SITE && window.OA_SEED_SITE.artists || []).filter(function (x) { return x.slug === a.slug; })[0]; src = seed && seed.socials; }
    if (!Array.isArray(src)) src = a.ig ? [{ p: 'Instagram', h: a.ig }] : [];
    return src.map(function (x, i) { return { id: x.id || 'so_' + a.slug + '_' + i, p: x.p, h: x.h }; });
  };

  /* Artist renames: the standing mechanism.
     When an artist is renamed, the public site and her photo files move to
     the new name on the server, but a roster saved before the rename still
     carries the old name and the old photo paths, and everything in the
     portal (appointments, requests, time off, artist sign-ins) is filed
     under her old roster key. Left alone, the next publish from such a
     browser would put the old name back, point her photos at files that
     moved, and publish her record under the old key, which the site's
     built-in roster no longer matches. One row per rename in the table
     below, and every browser's saved state converges the next time it
     loads: first the name and the moved photo paths are repaired, then
     the roster key itself and every record filed under it are re-keyed.

     Rows are keyed by roster key on purpose, never by page address: the
     address follows the artist's first name (OA.pageVar), so Lex's
     address is "alexis" while his key stays "lex", and Liv's is "olivia"
     while hers stays "liv". Deriving a re-key from names would break
     both. A row fires only while the old key is still in use and the new
     key is free; after that it is a no-op, so old rows are harmless.
     Publish history (st.history) and request logs are NOT rewritten:
     they keep the words they were written with, because they are the
     record of what happened then, not lookups. */
  var ARTIST_RENAMES = [
    { from: 'diana', to: 'dawlface', wasName: 'Diana', nowName: 'Dawlface' }
  ];

  function renameRef(s, row) {
    if (typeof s !== 'string') return s;
    var oldRef = 'portfolio/' + row.from + '/images/' + row.from + '-', newRef = 'portfolio/' + row.to + '/images/' + row.to + '-';
    var out = s.split(oldRef).join(newRef);
    /* Any other file under the artist's old folder (a portrait kept at the
       folder root, say) follows the folder even when its filename does not
       carry the standard prefix. */
    var oldDir = 'portfolio/' + row.from + '/', newDir = 'portfolio/' + row.to + '/';
    if (out.indexOf(oldDir) !== -1) out = out.split(oldDir).join(newDir);
    return out;
  }

  /* The name and photo repair for one rename row, on one site object.
     Only a record still in its pre-rename shape is touched. A record
     whose name was changed by hand keeps that name; its photo paths are
     still repaired, because the files moved either way. */
  function repairRenamedArtist(site, row) {
    if (!site || !Array.isArray(site.artists)) return;
    site.artists.forEach(function (a) {
      if (!a || a.slug !== row.from) return;
      /* The name and nick move only while they still read exactly as the
         old name; a hand-set name is kept. The photo paths are repaired
         either way, because the files moved either way. */
      if (a.name === row.wasName) a.name = row.nowName;
      if (a.nick === row.wasName) a.nick = row.nowName;
      a.portrait = renameRef(a.portrait, row);
      var work = ((site.portfolio || {})[a.slug] || []).slice();
      if (Array.isArray(a.work)) work = work.concat(a.work);
      work.forEach(function (w) {
        if (!w) return;
        w.src = renameRef(w.src, row);
        if (w.pair) { w.pair.a = renameRef(w.pair.a, row); w.pair.b = renameRef(w.pair.b, row); }
        /* Published copies carry the before/after pair as ba, not pair. */
        if (w.ba) { w.ba.a = renameRef(w.ba.a, row); w.ba.b = renameRef(w.ba.b, row); }
      });
    });
  }

  /* Move one site object's roster key: the artist record, her portfolio
     list, and the entry ids that were minted from the old key. If a
     portfolio list already sits under the new key (it should not, when
     no artist uses that key), the moved photos are merged in by src
     rather than overwriting anything. */
  function rekeySite(site, row) {
    if (!site || !Array.isArray(site.artists)) return;
    site.artists.forEach(function (a) {
      if (!a || a.slug !== row.from) return;
      a.slug = row.to;
      (a.socials || []).forEach(function (x) {
        if (x && typeof x.id === 'string' && x.id.indexOf('so_' + row.from + '_') === 0) x.id = 'so_' + row.to + '_' + x.id.slice(row.from.length + 4);
      });
    });
    var pf = site.portfolio || {};
    if (!Array.isArray(pf[row.from])) return;
    var moved = pf[row.from];
    delete pf[row.from];
    moved.forEach(function (w) {
      if (w && typeof w.id === 'string' && w.id.indexOf(row.from + '-') === 0) w.id = row.to + w.id.slice(row.from.length);
    });
    if (Array.isArray(pf[row.to])) {
      var seen = {};
      pf[row.to].forEach(function (w) { if (w) seen[w.src] = 1; });
      moved.forEach(function (w) { if (w && !seen[w.src]) pf[row.to].push(w); });
    } else pf[row.to] = moved;
  }

  /* One rename row against a whole saved state: repair, re-key both
     site copies (the draft and the published snapshot, which is a clone
     of the site, so its record and portfolio key follow), then re-file
     every record that names the artist by the old key. Counts never
     change; only the artist field on each record moves. */
  function rekeyArtist(st, row) {
    var site = st.site;
    if (!site || !Array.isArray(site.artists)) return;
    if (!site.artists.some(function (a) { return a && a.slug === row.from; })) return;
    if (site.artists.some(function (a) { return a && a.slug === row.to; })) return;
    var sites = [site, st.published && st.published.site];
    sites.forEach(function (s) { repairRenamedArtist(s, row); });
    sites.forEach(function (s) { rekeySite(s, row); });
    ['appts', 'requests', 'timeoff'].forEach(function (k) {
      if (!Array.isArray(st[k])) return;
      st[k].forEach(function (r) { if (r && r.artist === row.from) r.artist = row.to; });
    });
    /* Artist sign-ins are bound to the roster key, so the binding follows;
       a sign-in still labelled with the old name verbatim is relabelled,
       under the same guard as the artist record itself. A label someone
       set by hand is left alone. */
    if (Array.isArray(st.people)) st.people.forEach(function (p) {
      if (!p || p.artist !== row.from) return;
      p.artist = row.to;
      if (p.name === row.wasName) p.name = row.nowName;
    });
    /* Review quotes are prose, but a quote that names the artist by her
       old name reads wrong the day she renames (Brian, 2026-11-27), so a
       standalone old name in a quote's text follows the rename, in the
       draft, the published site copy, and the published payload. The
       attribution is never swept: it is a source line, and a person's
       name sitting in one (a reviewer, or someone the review mentions)
       must never be rewritten (Claude review, 2026-11-27). Quotes
       naming anyone else are untouched. */
    var sweepQuotes = function (quotes) {
      if (!Array.isArray(quotes)) return;
      var rx = new RegExp('\\b' + row.wasName + '\\b', 'g');
      quotes.forEach(function (q) {
        if (!q) return;
        if (typeof q.text === 'string') q.text = q.text.replace(rx, row.nowName);
      });
    };
    sites.forEach(function (s) { if (s) sweepQuotes(s.quotes); });
    if (st.published) sweepQuotes(st.published.quotes);
  }

  OA.migrate = function (st) {
    if (!st || !st.site) return st;
    [st.site, st.published && st.published.site].forEach(function (site) {
      if (site && Array.isArray(site.artists)) site.artists.forEach(function (a) { if (!Array.isArray(a.socials)) a.socials = OA.seedSocials(a); });
    });
    ARTIST_RENAMES.forEach(function (row) { rekeyArtist(st, row); });
    if (!Array.isArray(st.site.announcements)) st.site.announcements = [];
    if (st.published && st.published.site && !Array.isArray(st.published.site.announcements)) st.published.site.announcements = [];
    return st;
  };

  OA.httpsLink = function (s) {
    if (!s) return true;
    if (s.length > OA.LIMITS.annLink || /\s/.test(s)) return false;
    try { var u = new URL(s); return u.protocol === 'https:' && !!u.hostname; } catch (e) { return false; }
  };

  /* The first thing wrong with one announcement, in words the owner can act on. Empty string means fine. */
  OA.annProblem = function (a) {
    var L = OA.LIMITS;
    if (!String(a.title || '').trim()) return 'Add a title.';
    if (a.title.length > L.annTitle) return 'The title is over ' + L.annTitle + ' characters.';
    if (String(a.body || '').length > L.annBody) return 'The message is over ' + L.annBody + ' characters.';
    if (!OA.ANN_KINDS.some(function (k) { return k[0] === a.kind; })) return 'Pick what kind of announcement this is.';
    if (a.start && !ISO.test(a.start)) return 'The start date is not a date.';
    if (a.end && !ISO.test(a.end)) return 'The end date is not a date.';
    if (a.start && a.end && a.end < a.start) return 'It ends before it starts.';
    if (!OA.httpsLink(a.link || '')) return 'The link has to start with https:// and have no spaces.';
    return '';
  };

  /* Where an announcement stands on a given day: live, soon, or over. */
  OA.annStatus = function (a, today) {
    if (a.start && a.start > today) return 'soon';
    if (a.end && a.end < today) return 'over';
    return 'live';
  };

  /* The page variable an artist's profile lives at. It follows the artist's name, so a rename
     in the roster moves the page; the roster key (slug) stays put underneath and ties the
     record to its built-in photos. */
  OA.pageVar = function (a, taken) {
    var base = OA.slug(OA.first(a.name)) || 'artist', v = base, k = 2;
    while ((taken && taken[v]) || v === 'piercing' || v === 'roster' || v === 'dynamic') v = base + '-' + (k++);
    return v;
  };

  /* What the website needs to know about each artist, photo references included. Uploaded
     photos resolve in the owner's browser from the portal photo store until the server
     publish path lands at shipment. */
  OA.artistsContent = function (site) {
    var taken = {};
    return (site.artists || []).map(function (a) {
      var socials = [];
      (a.socials || []).forEach(function (x) { var n = OA.socialNorm(x.p, x.h); if (n.ok) socials.push({ p: x.p, label: n.label, url: n.url }); });
      var v = OA.pageVar(a, taken); taken[v] = 1;
      var work = [];
      ((site.portfolio || {})[a.slug] || []).forEach(function (w) {
        if (!w || w.onSite === false || !w.src) return;
        var item = { src: w.src, cap: w.cap || '', date: w.date || '' };
        if (w.pair) item.ba = { a: w.pair.a || '', b: w.pair.b || '', acap: w.pair.acap || '', bcap: w.pair.bcap || '', title: w.cap || '', story: '' };
        work.push(item);
      });
      return { slug: v, key: a.slug, name: a.name, nick: OA.nick(a), role: a.role || '', bio: a.bio || '', visible: !!a.visible && !a.removedAt, socials: socials, photo: a.portrait || '', work: work };
    });
  };

  /* 24h "17:00" to the site's "5:00 PM", and a display phone number to its +1 form. */
  function fmtTime(t) { var p = String(t).split(':'), h = +p[0], m = p[1] || '00', ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (!h) h = 12; return h + ':' + m + ' ' + ap; }
  function e164(display) { var d = String(display || '').replace(/\D/g, ''); if (d.length === 10) return '+1' + d; if (d.length === 11 && d[0] === '1') return '+' + d; return ''; }

  OA.publicContent = function (site, at) {
    var b = site.banner || {};
    return {
      v: 1,
      at: at,
      artists: OA.artistsContent(site),
      policies: { deposit: String((site.policies || {}).deposit || '').trim(), age: String((site.policies || {}).age || '').trim(), aftercare: String((site.policies || {}).aftercare || '').trim() },
      banner: { on: !!b.on, text: String(b.text || ''), start: b.start || '', end: b.end || '' },
      announcements: (site.announcements || []).map(function (a) {
        return { id: a.id, kind: a.kind, title: a.title, body: a.body || '', link: a.link || '', start: a.start || '', end: a.end || '', pinned: !!a.pinned };
      }),
      shop: { phone: String((site.shop || {}).phone || ''), phoneE164: e164((site.shop || {}).phone) },
      hours: (site.hours || []).map(function (x) {
        return [x.day, (x.open && x.close) ? fmtTime(x.open) + ' \u2013 ' + fmtTime(x.close) : null];
      }),
      prices: (site.prices || []).map(function (g) {
        return { group: g.group, sample: !!g.sample, items: (g.items || []).map(function (p) { return [String(p[0] || ''), String(p[1] || '')]; }) };
      }),
      services: (site.services || []).map(function (s) {
        return { id: s.id, family: s.family, name: s.name, blurb: s.blurb || '' };
      }),
      quotes: (site.quotes || []).slice(0, 6).map(function (q) {
        return { text: String(q.text || '').trim().slice(0, 280), who: String(q.who || '').trim().slice(0, 40) };
      }).filter(function (q) { return q.text; }),
      reviewLink: String(((OA.store.state || {}).settings || {}).reviewLink || '')
    };
  };

  /* Demo: the live copy is a key in this browser, which the public demo page reads. It is written, read back and compared,
     so "published" is never reported for a write that did not land. */
  OA.writeLive = function (content) {
    var json = JSON.stringify(content);
    try {
      localStorage.setItem(OA.PUBLIC_KEY, json);
      if (localStorage.getItem(OA.PUBLIC_KEY) !== json) return 'The live copy did not save. Nothing was published.';
    } catch (e) { return 'This browser would not keep the live copy, so nothing was published.'; }
    return '';
  };
  OA.clearLive = function () { try { localStorage.removeItem(OA.PUBLIC_KEY); localStorage.removeItem(OA.PREVIEW_KEY); } catch (e) { /* nothing to clear */ } };

  /* The server copy: publishing also sends the content to the shop's server, so the
     public website can fetch it on any device, not just this browser. Resolves ''
     when the server stored it, or a sentence saying what went wrong. The local copy
     above stays as the fallback this browser reads. The portal's own session token
     rides along (Authorization: Bearer ...) and opens the server door on its own;
     the Access cookie still works where it exists. */
  OA.pushLive = function (content) {
    var base = '';
    var m = document.querySelector('meta[name="gcal-api"]'), v = m ? (m.getAttribute('content') || '').trim() : '';
    if (v) base = v.replace(/\/+$/, '');
    else if (typeof location !== 'undefined' && location.hostname && location.hostname.indexOf('portal.') === 0) base = location.origin;
    if (!base) return Promise.resolve('No server address is set, so this update only lives in this browser.');
    var headers = { 'Content-Type': 'application/json' };
    var tok = (window.OA_LOCK && OA_LOCK.token) ? OA_LOCK.token() : '';
    if (tok) headers.Authorization = 'Bearer ' + tok;
    return fetch(base + '/content', { method: 'PUT', credentials: 'include', headers: headers, body: JSON.stringify(content) }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (j) {
        if (r.ok && j && j.ok) return '';
        if (r.status === 403 || (j && j.error === 'access_required')) return 'The server refused the update. Sign in to the portal first (the server door in Settings), then publish again.';
        if (r.ok) return 'The sign-in page answered instead of the server, so this update was not saved. Sign in to the portal first, then publish again.';
        return 'The server answered with an error (' + r.status + '), so visitors do not have this update yet.';
      });
    }, function () { return 'The server could not be reached, so visitors do not have this update yet. If this browser has not signed in to the portal yet, do that first, then publish again.'; });
  };

  /* A preview is the draft, saved apart from the live copy, so looking never changes what visitors see. */
  OA.writePreview = function (content) {
    var json = JSON.stringify(content);
    try {
      localStorage.setItem(OA.PREVIEW_KEY, json);
      if (localStorage.getItem(OA.PREVIEW_KEY) !== json) return 'The preview did not save, so it was not opened.';
    } catch (e) { return 'This browser would not keep the preview, so it was not opened.'; }
    return '';
  };

  /* Links to the website. Real links, so they open in a new tab like any link and stay keyboard friendly. */
  OA.liveLink = function (cls) {
    return OA.h('a', { class: cls || 'btn small quiet', href: OA.LIVE_URL, target: '_blank', rel: 'noopener noreferrer', text: 'View live site', title: 'Opens the public website in a new tab' });
  };
  OA.previewLink = function (cls) {
    var a = OA.h('a', { class: cls || 'btn small', href: OA.LIVE_URL + '?preview=1', target: '_blank', rel: 'noopener noreferrer', text: 'Preview site changes', title: 'Opens the website in a new tab with your unpublished changes. Visitors do not see this.' });
    a.addEventListener('click', function (e) {
      var bad = OA.writePreview(OA.publicContent(OA.store.state.site, Date.now()));
      if (bad) { e.preventDefault(); OA.ui.fail(bad); }
    });
    return a;
  };
})();
