/* Shell: sign-in, role, tabs, routing. Each tab has its own address, so Back, refresh and shared links all work. */
(function () {
  'use strict';
  var OA = window.OA, h = OA.h, S = OA.store, ui = OA.ui;
  var SESSION = 'oa2:session', THEME = 'oa2:theme';
  var TABS = [
    { key: 'today', label: 'Today' }, { key: 'requests', label: 'Requests' }, { key: 'calendar', label: 'Calendar' },
    { key: 'clients', label: 'Clients' }, { key: 'artists', label: 'Artists' }, { key: 'analytics', label: 'Analytics' }, { key: 'site', label: 'Site' }, { key: 'settings', label: 'Settings' }
  ];
  var PERMS = { today: 1, requests: 1, calendar: 1, clients: 1, artists: 1, analytics: 'owner', site: 'owner', settings: 'owner' };
  var main, nav, chrome = {}, current = { parts: [], q: {} }, firstRender = true;

  OA.can = function (tab) { var p = PERMS[tab]; return p === 1 || p === OA.role.kind; };
  OA.go = function (path, replace) {
    var target = '#/' + path.replace(/^#?\/?/, '');
    if (location.hash === target) { OA.rerender(); return; }
    if (replace) location.replace(target); else location.hash = target;
  };
  OA.href = function (path) { return '#/' + path; };

  function readSession() { try { return JSON.parse(sessionStorage.getItem(SESSION)); } catch (e) { return null; } }
  function writeSession(s) { try { if (s) sessionStorage.setItem(SESSION, JSON.stringify(s)); else sessionStorage.removeItem(SESSION); } catch (e) { /* private mode: the role lasts until reload */ } }
  OA.setRole = function (kind, slug) { OA.role = { kind: kind, slug: slug || '' }; writeSession(OA.role); };

  function parseHash() {
    var raw = location.hash.replace(/^#\/?/, ''), qi = raw.indexOf('?'), q = {};
    if (qi >= 0) { raw.slice(qi + 1).split('&').forEach(function (p) { var kv = p.split('='); if (kv[0]) q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); }); raw = raw.slice(0, qi); }
    var parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
    return { parts: parts, q: q };
  }
  OA.query = function (obj) { var s = Object.keys(obj).filter(function (k) { return obj[k] !== '' && obj[k] != null; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); }).join('&'); return s ? '?' + s : ''; };

  /* ---------- sign-in ---------- */
  function signIn() {
    var shop = S.state.site.shop;
    document.title = 'Sign in | ' + shop.short + ' portal';
    OA.clear(document.body.querySelector('#app'));
    var chooser = h('div', { class: 'signin-roles' });
    [['owner', '', 'Admin', 'Everything, including the site and settings'], ['artist', 'lex', 'Lex', 'Her own chair, clients and portfolio'], ['artist', 'liv', 'Liv', 'Her own chair, clients and portfolio'], ['artist', 'dawlface', 'Dawlface', 'Her own chair, clients and portfolio']].forEach(function (r) {
      chooser.appendChild(h('button', { type: 'button', class: 'role-btn', on: { click: function () { OA.setRole(r[0], r[1]); start(); } } }, h('strong', { text: r[2] }), h('span', { text: r[3] })));
    });
    document.querySelector('#app').appendChild(h('div', { class: 'signin' },
      h('img', { class: 'signin-logo', src: '../assets/instattoosionalized-logo.jpg', alt: '' }),
      h('h1', { text: shop.name }),
      h('p', { class: 'lead', text: 'Owner portal' }),
      chooser));
  }

  /* ---------- chrome ---------- */
  function buildChrome() {
    var app = document.querySelector('#app'); OA.clear(app);
    var shop = S.state.site.shop;
    chrome.err = h('div', { class: 'bar bad', role: 'alert', hidden: true });
    chrome.publish = h('a', { class: 'btn publish', href: '#/site/publish', hidden: true });
    var theme = ui.btn('Dark', function () { var d = document.documentElement.getAttribute('data-theme') === 'dark'; setTheme(d ? 'light' : 'dark'); }, 'quiet small', { 'aria-pressed': 'false' }); chrome.theme = theme;
    var out = ui.btn('Sign out', function () { if (OA.live) OA.live.stop(); writeSession(null); OA.role = null; if (window.OA_LOCK) { OA_LOCK.signOut(); return; } location.hash = ''; start(); }, 'quiet small');
    nav = h('nav', { class: 'tabs', 'aria-label': 'Portal sections' });
    TABS.forEach(function (t) { var a = h('a', { class: 'tab', href: '#/' + t.key, 'data-tab': t.key }, h('span', { text: t.label }), h('span', { class: 'badge', hidden: true })); nav.appendChild(a); });
    main = h('main', { id: 'main', tabindex: '-1' });
    app.appendChild(h('a', { class: 'skip', href: '#main', text: 'Skip to content', on: { click: function (e) { e.preventDefault(); main.focus(); } } }));
    app.appendChild(chrome.err);
    app.appendChild(h('header', { class: 'top' },
      h('div', { class: 'top-in' },
        h('a', { class: 'brand', href: '#/today' }, h('img', { src: '../assets/instattoosionalized-logo.jpg', alt: '' }), h('span', { class: 'brand-name' }, h('b', { text: shop.short || shop.name }), h('i', { text: 'Owner portal' }))),
        h('div', { class: 'top-tools' }, OA.liveLink('btn small quiet'), chrome.publish, theme, out)),
      nav));
    app.appendChild(main);
    syncTheme();
  }
  function setTheme(t) { try { localStorage.setItem(THEME, t); } catch (e) { /* theme just won't persist */ } syncTheme(); }
  function syncTheme() {
    var t; try { t = localStorage.getItem(THEME); } catch (e) { t = null; }
    if (!t) t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    if (chrome.theme) { chrome.theme.textContent = t === 'dark' ? 'Light mode' : 'Dark mode'; chrome.theme.setAttribute('aria-pressed', String(t === 'dark')); }
  }
  function updateChrome() {
    if (!main) return;
    OA.$$('.tab', nav).forEach(function (a) {
      var k = a.getAttribute('data-tab'), ok = OA.can(k); a.hidden = !ok;
      var b = OA.$('.badge', a), n = 0;
      if (k === 'requests') n = OA.scopeReqs(S.state.requests).filter(function (r) { return r.status === 'New'; }).length;
      b.hidden = !n; b.textContent = n || ''; b.setAttribute('aria-label', n + ' new');
    });
    var pend = OA.role.kind === 'owner' ? OA.pendingChanges().length : 0;
    chrome.publish.hidden = !pend; chrome.publish.textContent = 'Review & publish · ' + OA.plural(pend, 'change');
    chrome.err.hidden = !S.error; chrome.err.textContent = S.error || '';
  }
  OA.updateChrome = updateChrome;

  /* ---------- routing ---------- */
  OA.rerender = function () { render(true); };
  function render(keepScroll) {
    var r = parseHash(), tab = r.parts[0];
    current = r;
    if (!tab) { location.replace('#/today'); return; }
    if (!PERMS[tab]) { show('Not found', ui.empty('That page does not exist', 'The address may be old or mistyped.', ui.link('Go to Today', '#/today', 'btn primary'))); markTab(''); return; }
    if (!OA.can(tab)) { show('No access', ui.empty('This section is for an admin', 'You are signed in as ' + roleLabel() + '.', ui.link('Back to Today', '#/today', 'btn primary'))); markTab(''); return; }
    var v = OA.views[tab], y = window.scrollY, node;
    try { node = v.render(r.parts.slice(1), r.q); } catch (e) {
      console.error(e);
      node = ui.empty('This page hit an error', 'Nothing was lost. Reload the page. If it happens again, tell 717 Digital Studio what you clicked: ' + (e && e.message), ui.btn('Reload', function () { location.reload(); }, 'primary'));
    }
    show(v.title ? v.title(r.parts.slice(1)) : tab, node, keepScroll ? y : 0);
    markTab(tab); updateChrome();
  }
  function roleLabel() { return OA.role.kind === 'owner' ? 'the admin' : OA.chairName(OA.role.slug); }
  function show(title, node, y) {
    document.title = title + ' | ' + S.state.site.shop.short + ' portal';
    OA.clear(main); main.appendChild(node);
    if (y) window.scrollTo(0, y); else { window.scrollTo(0, 0); if (!firstRender) { var hh = main.querySelector('h1'); if (hh) { hh.setAttribute('tabindex', '-1'); hh.focus({ preventScroll: true }); } } }
    firstRender = false;
  }
  function markTab(tab) {
    OA.$$('.tab', nav).forEach(function (a) { var on = a.getAttribute('data-tab') === tab; a.classList.toggle('on', on); if (on) { a.setAttribute('aria-current', 'page'); a.scrollIntoView && a.scrollIntoView({ block: 'nearest', inline: 'center' }); } else a.removeAttribute('aria-current'); });
  }

  /* The lock screen's account decides the view: the server's role
     words map to the portal's, and an artist lands in their own
     chair. No picking. */
  function accountRole(user) {
    if (!user || !user.role) return null;
    if (user.role === 'owner') return ['owner', ''];
    if (user.role === 'artist') return ['artist', user.artist || ''];
    return null;
  }
  function start() {
    if (window.OA_LOCK && OA_LOCK.ready) {
      OA_LOCK.ready().then(function (user) {
        var r = accountRole(user);
        if (r) {
          OA.setRole(r[0], r[1]); buildChrome(); updateChrome(); render();
          /* The boot-time calendar probe ran before the sign-in, so it
             carried no session token. Probe again now that the portal's
             own sign-in can open the calendar door. */
          if (OA.gcal) OA.gcal.connect().then(refreshView, refreshView);
          if (OA.live) OA.live.start();
          return;
        }
        /* A real account whose stored role maps to nothing (a word
           the portal no longer uses) signs out rather than falling
           into the legacy picker: the picker is only for sign-ins
           that carry no account at all. */
        if (user) { OA_LOCK.signOut(); return; }
        startPicked();
      });
      return;
    }
    startPicked();
  }
  /* Fallback for a sign-in that carries no account (the legacy
     passcode lock): the role picker, as before. */
  function startPicked() {
    var s = readSession();
    if (s && s.kind !== 'owner' && s.kind !== 'artist') { writeSession(null); s = null; }
    if (!s) { signIn(); return; }
    OA.role = s; buildChrome(); updateChrome(); render();
    if (OA.live) OA.live.start();
  }
  window.addEventListener('hashchange', function () { if (OA.role) { render(); } });
  S.subscribe(function () { if (OA.role && main) { updateChrome(); } });
  window.addEventListener('storage', function (e) { if (e.key === 'oa2:state:v1' && OA.role && main) { render(true); } });

  document.addEventListener('DOMContentLoaded', function () {
    S.load();
    if (S.error) console.warn(S.error);
    try { var t = localStorage.getItem(THEME) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.setAttribute('data-theme', t); } catch (e) { /* default theme */ }
    start();
    /* The calendar connection is live or it is not; find out on load
       instead of waiting for someone to press a button in Settings.
       A failed probe only sets the status reason, it never blocks. */
    if (OA.gcal) OA.gcal.connect().then(refreshView, refreshView);
  });
  function refreshView() { if (OA.role && main) render(true); }
})();
