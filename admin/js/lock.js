/* Portal lock screen.
   The portal page also lives on hosts the Cloudflare Access wall cannot
   cover (the Pages staging address), so the page carries its own lock.
   Every person at the shop has their own username and password, checked
   by the shop server, never here; passwords are stored server-side as
   salted hashes. The first account (the owner) is claimed with the shop
   passcode Brian hands over once; after that the passcode only resets
   passwords. New people ask for an account from this screen and wait
   for the owner to approve them. A good sign-in earns a session token
   kept in this browser (12 hours, or 30 days when "Remember me on
   this device" is checked at sign-in; unchecked, the token lives in
   sessionStorage and dies with the browser session), and the answer
   names who signed in and their role, so the portal opens straight
   into their view (OA_LOCK.user() / OA_LOCK.ready()). The sign-in
   also carries the same Cloudflare Turnstile human check the public
   form uses; the server verifies it before it looks at the password.
   Bookings and request data stay behind their own sign-in as before;
   this screen guards the portal itself. */
(function () {
  "use strict";
  var API = "https://api.instattoosionalized.net";
  var KEY = "oa2:unlock:v1";

  /* Who the server says is signed in: {username, role, artist} with the
     server's role words (owner | manager | artist), or null when the
     sign-in carries no account (legacy passcode mode). app.js waits on
     ready() before it builds anything. */
  var currentUser = null;
  var opened = false;
  var waiters = [];

  function el(id) { return document.getElementById(id); }

  /* The stored sign-in: {token, at, ttl} (ttl in seconds, the lifetime
     the server issued). A remembered sign-in lives in localStorage;
     an unremembered one lives in sessionStorage, so it ends with the
     browser session. Entries saved before ttl was recorded carry the
     original 12-hour cap. Only one copy ever exists: storing clears
     both homes first, and sign-out clears both too. */
  function readSaved() {
    try {
      var raw = null;
      try { raw = sessionStorage.getItem(KEY); } catch (e) {}
      if (!raw) raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.token || !data.at) return null;
      return data;
    } catch (e) { return null; }
  }

  function saved() {
    var data = readSaved();
    if (!data) return null;
    var cap = data.ttl ? data.ttl * 1000 : 12 * 3600 * 1000;
    if (Date.now() - data.at > cap) return null;
    return data.token;
  }

  function store(token, ttlSeconds, remember) {
    clear();
    try {
      var data = JSON.stringify({ token: token, at: Date.now(), ttl: ttlSeconds || 12 * 3600 });
      if (remember === false) sessionStorage.setItem(KEY, data);
      else localStorage.setItem(KEY, data);
    } catch (e) {}
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  /* The human check (Cloudflare Turnstile): the same widget and site
     key as the public form, rendered explicitly into the sign-in
     card. Its token rides with the sign-in post and the server
     verifies it before checking credentials. Tokens are single-use,
     so every failed try resets the widget for the next one. The theme
     follows the portal's own stored theme, resolved the way app.js
     resolves it. */
  var SITE_KEY = "0x4AAAAAAGUSsdQqWpUsmajE";
  var tsWidget = null, tsRendered = false, tsToken = "";

  function tsTheme() {
    try {
      var t = localStorage.getItem("oa2:theme");
      if (t === "dark" || t === "light") return t;
    } catch (e) {}
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function tsRender() {
    if (tsRendered || !window.turnstile) return;
    var box = el("lock-ts");
    if (!box) return;
    tsRendered = true;
    tsWidget = window.turnstile.render(box, {
      sitekey: SITE_KEY,
      theme: tsTheme(),
      callback: function (t) { tsToken = t; },
      "expired-callback": function () { tsToken = ""; },
      "error-callback": function () { tsToken = ""; },
    });
    box.hidden = false;
  }

  function tsStart() {
    (function wait(n) {
      if (window.turnstile) { tsRender(); return; }
      if (n > 60) return;
      setTimeout(function () { wait(n + 1); }, 250);
    })(0);
  }

  function tsReset() {
    tsToken = "";
    if (tsWidget !== null && window.turnstile) { try { window.turnstile.reset(tsWidget); } catch (e) {} }
  }

  function rememberChecked() {
    var box = el("lock-remember");
    return !!(box && box.checked);
  }

  function open() {
    var lock = el("lock");
    if (lock) lock.remove();
  }

  /* The lock is open: remember who signed in (null in legacy mode),
     wake anyone waiting on ready(), and take the screen away. */
  function finishOpen(user) {
    currentUser = user || null;
    opened = true;
    var ws = waiters;
    waiters = [];
    ws.forEach(function (fn) { fn(currentUser); });
    open();
  }

  function post(path, body) {
    return fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, data: d }; });
    });
  }

  /* "users": accounts exist, show the sign-in form. "setup": no accounts
     yet, show the owner-account creation form. "legacy": the server does
     not know accounts yet (older deployment), fall back to the shop
     passcode form so the portal never locks anyone out mid-upgrade. */
  function authState() {
    return fetch(API + "/portal-auth-state")
      .then(function (r) {
        if (!r.ok) return "legacy";
        return r.json().then(function (d) { return d && d.users_exist ? "users" : "setup"; });
      })
      .catch(function () { return "legacy"; });
  }

  function wireLegacy() {
    var form = el("lock-form");
    if (!form) return;
    form.hidden = false;
    var user = el("lock-user");
    var pass = el("lock-code");
    var btn = el("lock-btn");
    var note = el("lock-note");
    var sub = form.querySelector(".lock-sub");
    var labels = form.querySelectorAll(".lock-label");
    if (user) user.hidden = true;
    if (labels[0]) labels[0].hidden = true;
    if (labels[1]) labels[1].textContent = "Passcode";
    pass.placeholder = "Shop passcode";
    pass.setAttribute("autocomplete", "off");
    if (sub) sub.textContent = "This portal is private. Type the shop passcode to open it.";
    function say(t) { if (note) note.textContent = t || ""; }
    tsStart();
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var code = pass.value.trim();
      if (!code) { say("Type the shop passcode."); return; }
      var remember = rememberChecked();
      btn.disabled = true;
      say("Checking...");
      post("/portal-unlock", { code: code, turnstile_token: tsToken, remember: remember }).then(function (res) {
        btn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok && res.data.token) {
          store(res.data.token, res.data.ttl, remember);
          finishOpen(null);
          return;
        }
        tsReset();
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.status === 503) { say("The lock is not set up yet. Ask Brian."); return; }
        if (res.data && res.data.error === "captcha_failed") { say("Please finish the human check and try again."); return; }
        say("That passcode did not match. Try again.");
        pass.select();
      }).catch(function () {
        btn.disabled = false;
        tsReset();
        say("Could not reach the server. Check your connection and try again.");
      });
    });
    pass.focus();
  }

  function wireLogin() {
    var form = el("lock-form");
    if (!form) return;
    form.hidden = false;
    var user = el("lock-user");
    var pass = el("lock-code");
    var btn = el("lock-btn");
    var note = el("lock-note");
    function say(t) { if (note) note.textContent = t || ""; }
    tsStart();
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var username = user.value.trim();
      var password = pass.value;
      if (!username || !password) { say("Type your username and password."); return; }
      var remember = rememberChecked();
      btn.disabled = true;
      say("Checking...");
      post("/portal-unlock", { username: username, password: password, turnstile_token: tsToken, remember: remember }).then(function (res) {
        btn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok && res.data.token) {
          store(res.data.token, res.data.ttl, remember);
          finishOpen({ username: res.data.username || username, role: res.data.role || "", artist: res.data.artist || "" });
          return;
        }
        tsReset();
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.data && res.data.error === "captcha_failed") { say("Please finish the human check and try again."); return; }
        if (res.data && res.data.error === "pending_approval") { say("Your account is waiting for the shop owner to approve it."); return; }
        if (res.data && res.data.error === "account_paused") { say("This account was paused after 90 days away. Ask the shop owner to reactivate it."); return; }
        if (res.data && res.data.error === "account_removed") { say("This account was deactivated by the shop owner. Ask them if it should be turned back on."); return; }
        say("That username and password did not match. Try again.");
        pass.select();
      }).catch(function () {
        btn.disabled = false;
        tsReset();
        say("Could not reach the server. Check your connection and try again.");
      });
    });
    wireRequest();
    user.focus();
  }

  /* "Request an account" swaps the sign-in card for a request card.
     The request lands on the server as a pending account; the owner
     approves it in Settings before it can sign in. */
  function wireRequest() {
    var toggle = el("lock-request-toggle");
    var form = el("lock-requestform");
    var login = el("lock-form");
    if (!toggle || !form) return;
    var back = el("lock-request-back");
    var user = el("lock-req-user");
    var a = el("lock-req-pass");
    var b = el("lock-req-pass2");
    var btn = el("lock-req-btn");
    var note = el("lock-req-note");
    function say(t) { if (note) note.textContent = t || ""; }
    toggle.addEventListener("click", function () {
      login.hidden = true;
      form.hidden = false;
      user.focus();
    });
    if (back) back.addEventListener("click", function () {
      form.hidden = true;
      login.hidden = false;
    });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var username = user.value.trim();
      if (!username) { say("Pick a username."); return; }
      if (a.value.length < 10) { say("Use at least 10 characters for the password."); return; }
      if (a.value !== b.value) { say("The two passwords do not match."); return; }
      btn.disabled = true;
      say("Sending your request...");
      post("/portal-register-request", { username: username, password: a.value }).then(function (res) {
        btn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok) {
          say("Request sent. The shop owner approves new accounts, so you will be able to sign in once yours is approved.");
          user.value = "";
          a.value = "";
          b.value = "";
          return;
        }
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.data && res.data.error === "username_taken") { say("That username is taken. Pick another one."); return; }
        if (res.data && res.data.error === "invalid_username") { say("Usernames use letters, numbers, dots, dashes or underscores, at least 3 characters."); return; }
        if (res.data && res.data.error === "password_too_short") { say("Use at least 10 characters for the password."); return; }
        say("That did not work. Try again.");
      }).catch(function () {
        btn.disabled = false;
        say("Could not reach the server. Check your connection and try again.");
      });
    });
  }

  function wireSetup() {
    var form = el("lock-setupform");
    if (!form) { wireLogin(); return; }
    form.hidden = false;
    var code = el("lock-setup-code");
    var user = el("lock-setup-user");
    var a = el("lock-setup-pass");
    var b = el("lock-setup-pass2");
    var btn = el("lock-setup-btn");
    var note = el("lock-setup-note");
    function say(t) { if (note) note.textContent = t || ""; }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var username = user.value.trim();
      if (!code.value.trim()) { say("Type the shop passcode Brian gave you."); return; }
      if (!username) { say("Pick a username."); return; }
      if (a.value.length < 10) { say("Use at least 10 characters for the password."); return; }
      if (a.value !== b.value) { say("The two passwords do not match."); return; }
      btn.disabled = true;
      say("Creating your account...");
      post("/portal-register", { code: code.value.trim(), username: username, password: a.value }).then(function (res) {
        btn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok && res.data.token) {
          store(res.data.token);
          finishOpen({ username: res.data.username || username, role: res.data.role || "owner", artist: res.data.artist || "" });
          return;
        }
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.data && res.data.error === "wrong_code") { say("That passcode did not match. Check it and try again."); return; }
        if (res.data && res.data.error === "invalid_username") { say("Usernames use letters, numbers, dots, dashes or underscores, at least 3 characters."); return; }
        if (res.data && res.data.error === "password_too_short") { say("Use at least 10 characters for the password."); return; }
        say("That did not work. Try again.");
      }).catch(function () {
        btn.disabled = false;
        say("Could not reach the server. Check your connection and try again.");
      });
    });
    code.focus();
  }

  function showMode(mode) {
    if (mode === "users") wireLogin();
    else if (mode === "setup") wireSetup();
    else wireLegacy();
  }

  function main() {
    var token = saved();
    if (token) {
      var note = el("lock-note");
      if (note) note.textContent = "Checking your sign-in...";
      post("/portal-session", { token: token }).then(function (res) {
        if (res.data && res.data.ok) {
          finishOpen({ username: res.data.username || "", role: res.data.role || "", artist: res.data.artist || "" });
          return;
        }
        clear();
        if (note) note.textContent = "";
        authState().then(showMode);
      });
      return;
    }
    authState().then(showMode);
  }

  /* The portal's Sign out button calls this: drop the session here too,
     then reload so the lock screen is what comes back. user() names the
     account the server signed in (null in legacy mode); token() hands
     the session token to signed-in screens that call the server (the
     Settings account list); ready() resolves with user() once the lock
     opens, so the portal can open straight into the account's view. */
  window.OA_LOCK = {
    signOut: function () { clear(); location.reload(); },
    user: function () { return currentUser; },
    token: function () { return saved(); },
    ready: function () {
      if (opened) return Promise.resolve(currentUser);
      return new Promise(function (resolve) { waiters.push(resolve); });
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main);
  else main();
})();
