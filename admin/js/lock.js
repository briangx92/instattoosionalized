/* Portal lock screen.
   The portal page also lives on hosts the Cloudflare Access wall cannot
   cover (the Pages staging address), so the page carries its own lock.
   The passcode is checked by the shop server, never here: a good code
   earns a session token (12 hours) kept in this browser. Bookings and
   request data stay behind their own sign-in as before; this screen
   guards the portal itself. */
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

  function note(text) {
    var n = el("lock-note");
    if (n) n.textContent = text || "";
  }

  function askSession(token) {
    return fetch(API + "/portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    }).then(function (r) { return r.json(); }).then(function (d) { return !!(d && d.ok); })
      .catch(function () { return false; });
  }

  function tryUnlock(code) {
    return fetch(API + "/portal-unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code }),
    }).then(function (r) {
      return r.json().then(function (d) { return { status: r.status, data: d }; });
    });
  }

  function wire() {
    var form = el("lock-form");
    var input = el("lock-code");
    var btn = el("lock-btn");
    if (!form || !input || !btn) return;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var code = input.value.trim();
      if (!code) { note("Type the portal passcode."); return; }
      btn.disabled = true;
      note("Checking...");
      tryUnlock(code).then(function (res) {
        btn.disabled = false;
        if (res.status === 200 && res.data && res.data.ok && res.data.token) {
          store(res.data.token);
          open();
          return;
        }
        if (res.status === 429) { note("Too many tries. Wait a bit and try again."); return; }
        if (res.status === 503) { note("The lock is not set up yet. Ask Brian."); return; }
        note("That passcode did not match. Try again.");
        input.select();
      }).catch(function () {
        btn.disabled = false;
        note("Could not reach the server. Check your connection and try again.");
      });
    });
    input.focus();
  }

  function main() {
    var token = saved();
    if (!token) { wire(); return; }
    note("Checking your sign-in...");
    askSession(token).then(function (ok) {
      if (ok) { open(); return; }
      clear();
      note("");
      wire();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main);
  else main();
})();
