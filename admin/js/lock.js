/* Portal lock screen.
   The portal page also lives on hosts the Cloudflare Access wall cannot
   cover (the Pages staging address), so the page carries its own lock.
   Every person at the shop has their own username and password, checked
   by the shop server, never here; passwords are stored server-side as
   salted hashes. The first account (the owner) is claimed with the shop
   passcode Brian hands over once; after that the passcode only resets
   passwords. New people ask for an account from this screen and wait
   for an admin to approve them. A good sign-in earns a session token
   kept in this browser for 72 hours (Brian, 2026-11-27: one length
   for every sign-in, no remember-me split), and the answer
   names who signed in and their role, so the portal opens straight
   into their view (OA_LOCK.user() / OA_LOCK.ready()). The sign-in
   also carries the same Cloudflare Turnstile human check the public
   form uses; the server verifies it before it looks at the password.
   The account request carries the same check, verified before the
   server records the request. The forgot-password card carries it
   too: the person asks for a reset code, the owner reads it to them
   from Settings (there is no email channel), and the code plus a new
   password, typed here, is what changes the password. Bookings and request data stay behind
   their own sign-in as before; this screen guards the portal itself. */
(function () {
  "use strict";
  var API = "https://api.instattoosionalized.net";
  var KEY = "oa2:unlock:v1";

  /* Who the server says is signed in: {username, role, artist} with the
     server's role words (owner | artist), or null when the
     sign-in carries no account (legacy passcode mode). app.js waits on
     ready() before it builds anything. */
  var currentUser = null;
  var opened = false;
  var waiters = [];

  function el(id) { return document.getElementById(id); }

  /* The stored sign-in: {token, at, ttl} (ttl in seconds, the lifetime
     the server issued). It lives in localStorage, so it survives the
     browser closing and reopening inside its 72 hours. Entries saved
     before ttl was recorded carry the original 12-hour cap, and an
     entry an older build left in sessionStorage is still honored
     until it runs out. Only one copy ever exists: storing clears
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

  function store(token, ttlSeconds) {
    clear();
    try {
      var data = JSON.stringify({ token: token, at: Date.now(), ttl: ttlSeconds || 72 * 3600 });
      localStorage.setItem(KEY, data);
    } catch (e) {}
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  /* The human check (Cloudflare Turnstile): the same widget and site
     key as the public form, rendered explicitly into a card. Its
     token rides with that card's post and the server verifies it
     before anything else. Tokens are single-use, so every failed try
     resets the widget for the next one. The theme follows the
     portal's own stored theme, resolved the way app.js resolves it.
     Each card carries its own widget (makeTs): a token belongs to
     the submit it was minted for, so the sign-in card and the
     account-request card never share one. */
  var SITE_KEY = "0x4AAAAAAGUSsdQqWpUsmajE";

  function tsTheme() {
    try {
      var t = localStorage.getItem("oa2:theme");
      if (t === "dark" || t === "light") return t;
    } catch (e) {}
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function makeTs(boxId) {
    var widget = null, rendered = false, token = "";
    function render() {
      if (rendered || !window.turnstile) return;
      var box = el(boxId);
      if (!box) return;
      rendered = true;
      widget = window.turnstile.render(box, {
        sitekey: SITE_KEY,
        theme: tsTheme(),
        callback: function (t) { token = t; },
        "expired-callback": function () { token = ""; },
        "error-callback": function () { token = ""; },
      });
      box.hidden = false;
    }
    return {
      start: function () {
        (function wait(n) {
          if (window.turnstile) { render(); return; }
          if (n > 60) return;
          setTimeout(function () { wait(n + 1); }, 250);
        })(0);
      },
      reset: function () {
        token = "";
        if (widget !== null && window.turnstile) { try { window.turnstile.reset(widget); } catch (e) {} }
      },
      token: function () { return token; },
    };
  }

  var tsSignin = makeTs("lock-ts");
  var tsRequest = makeTs("lock-req-ts");
  var tsForgot = makeTs("lock-forgot-ts");

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
    var forgotLine = el("lock-forgot-line");
    if (forgotLine) forgotLine.hidden = true;
    if (user) user.hidden = true;
    if (labels[0]) labels[0].hidden = true;
    if (labels[1]) labels[1].textContent = "Passcode";
    pass.placeholder = "Shop passcode";
    pass.setAttribute("autocomplete", "off");
    if (sub) sub.textContent = "This portal is private. Type the shop passcode to open it.";
    function say(t) { if (note) note.textContent = t || ""; }
    tsSignin.start();
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var code = pass.value.trim();
      if (!code) { say("Type the shop passcode."); return; }
      btn.disabled = true;
      say("Checking...");
      post("/portal-unlock", { code: code, turnstile_token: tsSignin.token() }).then(function (res) {
        btn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok && res.data.token) {
          store(res.data.token, res.data.ttl);
          finishOpen(null);
          return;
        }
        tsSignin.reset();
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.status === 503) { say("The lock is not set up yet. Ask Brian."); return; }
        if (res.data && res.data.error === "captcha_failed") { say("Please finish the human check and try again."); return; }
        say("That passcode did not match. Try again.");
        pass.select();
      }).catch(function () {
        btn.disabled = false;
        tsSignin.reset();
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
    tsSignin.start();
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var username = user.value.trim();
      var password = pass.value;
      if (!username || !password) { say("Type your username and password."); return; }
      btn.disabled = true;
      say("Checking...");
      post("/portal-unlock", { username: username, password: password, turnstile_token: tsSignin.token() }).then(function (res) {
        btn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok && res.data.token) {
          store(res.data.token, res.data.ttl);
          finishOpen({ username: res.data.username || username, role: res.data.role || "", artist: res.data.artist || "" });
          return;
        }
        tsSignin.reset();
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.data && res.data.error === "captcha_failed") { say("Please finish the human check and try again."); return; }
        if (res.data && res.data.error === "pending_approval") { say("Your account is waiting for an admin to approve it."); return; }
        if (res.data && res.data.error === "account_paused") { say("This account was paused after 90 days away. Ask an admin to reactivate it."); return; }
        if (res.data && res.data.error === "account_removed") { say("This account was deactivated by an admin. Ask them if it should be turned back on."); return; }
        say("That username and password did not match. Try again.");
        pass.select();
      }).catch(function () {
        btn.disabled = false;
        tsSignin.reset();
        say("Could not reach the server. Check your connection and try again.");
      });
    });
    wireRequest();
    wireForgot();
    user.focus();
  }

  /* "Request an account" swaps the sign-in card for a request card.
     The request lands on the server as a pending account; the owner
     approves it in Settings before it can sign in. The card carries
     its own human-check widget (tsRequest), started when the card
     opens; the server verifies the token before recording anything. */
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
      tsRequest.start();
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
      post("/portal-register-request", { username: username, password: a.value, turnstile_token: tsRequest.token() }).then(function (res) {
        btn.disabled = false;
        // The token is spent either way; the card stays on screen,
        // so reset the widget for the next try.
        tsRequest.reset();
        if (res.status === 200 && res.data && res.data.ok) {
          say("Request sent. The shop owner approves new accounts, so you will be able to sign in once yours is approved.");
          user.value = "";
          a.value = "";
          b.value = "";
          return;
        }
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.data && res.data.error === "captcha_failed") { say("Please finish the human check and try again."); return; }
        if (res.data && res.data.error === "username_taken") { say("That username is taken. Pick another one."); return; }
        if (res.data && res.data.error === "invalid_username") { say("Usernames use letters, numbers, dots, dashes or underscores, at least 3 characters."); return; }
        if (res.data && res.data.error === "password_too_short") { say("Use at least 10 characters for the password."); return; }
        say("That did not work. Try again.");
      }).catch(function () {
        btn.disabled = false;
        tsRequest.reset();
        say("Could not reach the server. Check your connection and try again.");
      });
    });
  }

  /* "Forgot your password" swaps the sign-in card for a reset card.
     The person asks for a code with their username (the card carries
     its own human-check widget, tsForgot, started when the card
     opens); the server answers the same whether or not the username
     has an account, so the note never confirms one exists. The owner
     sees the code in Settings and reads it out; the person types it
     here with a new password, and the server swaps the password,
     ends their other sessions, and spends the code. Someone who
     already holds a code can skip straight to that step. Both action
     buttons are plain buttons with click handlers; the form's own
     submit (the Enter key) routes to whichever step is showing, so
     nothing ever fires twice. */
  function wireForgot() {
    var toggle = el("lock-forgot-toggle");
    var form = el("lock-forgotform");
    var login = el("lock-form");
    if (!toggle || !form) return;
    var back = el("lock-forgot-back");
    var have = el("lock-forgot-have");
    var haveLine = el("lock-forgot-have-line");
    var step2 = el("lock-forgot-step2");
    var user = el("lock-forgot-user");
    var askBtn = el("lock-forgot-btn");
    var setBtn = el("lock-forgot-set-btn");
    var code = el("lock-forgot-code");
    var a = el("lock-forgot-pass");
    var b = el("lock-forgot-pass2");
    var note = el("lock-forgot-note");
    function say(t) { if (note) note.textContent = t || ""; }
    function showStep2() {
      step2.hidden = false;
      if (haveLine) haveLine.hidden = true;
      code.focus();
    }
    toggle.addEventListener("click", function () {
      login.hidden = true;
      form.hidden = false;
      tsForgot.start();
      user.focus();
    });
    if (back) back.addEventListener("click", function () {
      form.hidden = true;
      login.hidden = false;
    });
    if (have) have.addEventListener("click", showStep2);
    function ask() {
      var username = user.value.trim();
      if (!username) { say("Type your username."); return; }
      askBtn.disabled = true;
      say("Asking for a code...");
      post("/portal-reset-request", { username: username, turnstile_token: tsForgot.token() }).then(function (res) {
        askBtn.disabled = false;
        // The token is spent either way; reset the widget for the
        // next try, like the other cards.
        tsForgot.reset();
        if (res.status === 200 && res.data && res.data.ok) {
          say("If that username has an account, a code is waiting. Ask the shop owner for it (they can see it in Settings), then type it below with a new password. Codes last 30 minutes.");
          showStep2();
          return;
        }
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.data && res.data.error === "captcha_failed") { say("Please finish the human check and try again."); return; }
        say("That did not work. Try again.");
      }).catch(function () {
        askBtn.disabled = false;
        tsForgot.reset();
        say("Could not reach the server. Check your connection and try again.");
      });
    }
    function complete() {
      var username = user.value.trim();
      if (!username) { say("Type your username."); return; }
      if (!code.value.trim()) { say("Type the 6-digit code the owner gave you."); return; }
      if (a.value.length < 10) { say("Use at least 10 characters for the password."); return; }
      if (a.value !== b.value) { say("The two passwords do not match."); return; }
      setBtn.disabled = true;
      say("Setting your new password...");
      post("/portal-reset-complete", { username: username, code: code.value.trim(), password: a.value }).then(function (res) {
        setBtn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok) {
          code.value = "";
          a.value = "";
          b.value = "";
          form.hidden = true;
          login.hidden = false;
          var ln = el("lock-note");
          if (ln) ln.textContent = "Your password is changed. Sign in with the new one.";
          return;
        }
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        if (res.data && res.data.error === "invalid_code") { say("That code did not work. Check it and try again, or ask for a new one."); return; }
        if (res.data && res.data.error === "code_expired") { say("That code has expired. Ask for a new one."); return; }
        if (res.data && res.data.error === "too_many_attempts") { say("Too many wrong tries, so that code no longer works. Ask for a new one."); return; }
        if (res.data && res.data.error === "password_too_short") { say("Use at least 10 characters for the password."); return; }
        say("That did not work. Try again.");
      }).catch(function () {
        setBtn.disabled = false;
        say("Could not reach the server. Check your connection and try again.");
      });
    }
    askBtn.addEventListener("click", ask);
    setBtn.addEventListener("click", complete);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (step2.hidden) ask(); else complete();
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
