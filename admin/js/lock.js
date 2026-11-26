/* Portal lock screen.
   The portal page also lives on hosts the Cloudflare Access wall cannot
   cover (the Pages staging address), so the page carries its own lock.
   Every person at the shop has their own username and password, checked
   by the shop server, never here; passwords are stored server-side as
   salted hashes. The first account (the owner) is claimed with the shop
   passcode Brian hands over once; after that the passcode only resets
   passwords. A good sign-in earns a session token (12 hours) kept in
   this browser. Bookings and request data stay behind their own sign-in
   as before; this screen guards the portal itself. */
(function () {
  "use strict";
  var API = "https://api.instattoosionalized.net";
  var KEY = "oa2:unlock:v1";

  function el(id) { return document.getElementById(id); }

  function saved() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.token || !data.at) return null;
      if (Date.now() - data.at > 12 * 3600 * 1000) return null;
      return data.token;
    } catch (e) { return null; }
  }

  function store(token) {
    try { localStorage.setItem(KEY, JSON.stringify({ token: token, at: Date.now() })); } catch (e) {}
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  function open() {
    var lock = el("lock");
    if (lock) lock.remove();
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

  function authState() {
    return fetch(API + "/portal-auth-state")
      .then(function (r) { return r.json(); })
      .then(function (d) { return !!(d && d.users_exist); })
      .catch(function () { return true; });
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
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var username = user.value.trim();
      var password = pass.value;
      if (!username || !password) { say("Type your username and password."); return; }
      btn.disabled = true;
      say("Checking...");
      post("/portal-unlock", { username: username, password: password }).then(function (res) {
        btn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok && res.data.token) {
          store(res.data.token);
          open();
          return;
        }
        if (res.status === 429) { say("Too many tries. Wait a bit and try again."); return; }
        say("That username and password did not match. Try again.");
        pass.select();
      }).catch(function () {
        btn.disabled = false;
        say("Could not reach the server. Check your connection and try again.");
      });
    });
    user.focus();
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
          open();
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

  function main() {
    var token = saved();
    if (token) {
      var note = el("lock-note");
      if (note) note.textContent = "Checking your sign-in...";
      post("/portal-session", { token: token }).then(function (res) {
        if (res.data && res.data.ok) { open(); return; }
        clear();
        if (note) note.textContent = "";
        authState().then(function (exist) { if (exist) wireLogin(); else wireSetup(); });
      });
      return;
    }
    authState().then(function (exist) { if (exist) wireLogin(); else wireSetup(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main);
  else main();
})();
