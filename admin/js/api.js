/* The shop server: pulls website requests into the portal. The server address
   is set at deploy time (the portal-api meta tag, which the page's
   Content-Security-Policy also names). There is no token to type: the
   portal's own session token (from the lock screen's sign-in) rides on
   every call as Authorization: Bearer ..., and the server accepts it in
   place of the Cloudflare sign-in wall; the Access cookie still goes
   along too (credentials: include) for hosts where it exists. */
(function () {
  'use strict';
  var OA = window.OA, S = OA.store, act = OA.act, ui = OA.ui;
  var POLL_MS = 90000, MAX_PAGES = 20, busy = null, timer = null;

  function authHeaders(extra) {
    var hdrs = extra || {};
    var tok = (window.OA_LOCK && OA_LOCK.token) ? OA_LOCK.token() : '';
    if (tok) hdrs.Authorization = 'Bearer ' + tok;
    return hdrs;
  }

  function base() {
    var m = document.querySelector('meta[name="portal-api"]'), v = m ? (m.getAttribute('content') || '').trim() : '';
    if (!v) return '';
    try { var u = new URL(v), local = u.hostname === 'localhost' || u.hostname === '127.0.0.1'; return (u.protocol === 'https:' || (u.protocol === 'http:' && local)) ? u.origin : ''; } catch (e) { return ''; }
  }
  function state() { var s = S.state.settings; if (!s.api) s.api = { after: 0, lastOk: null, lastError: '', added: 0 }; return s.api; }

  /* The storage key inside a photo-library URL (…/photo/<artist>/<file>),
     or '' when the value is not one. Used to delete the stored file when
     a library photo leaves the works. */
  OA.photoKeyOf = function (url) {
    if (typeof url !== 'string' || url.indexOf('https://') !== 0) return '';
    var u;
    try { u = new URL(url); } catch (e) { return ''; }
    if (u.pathname.indexOf('/photo/') !== 0) return '';
    try { return decodeURIComponent(u.pathname.slice('/photo/'.length)); } catch (e) { return ''; }
  };

  var api = OA.api = {
    base: base,
    configured: function () { return !!base(); },
    state: state,
    ready: function () { return api.configured(); },
    /* The photo description service has no route on the shop server yet,
       so its button stays hidden until one exists. */
    describeReady: function () { return false; },

    call: function (path) {
      if (!api.configured()) return Promise.reject(new Error('This portal is not pointed at a shop server yet.'));
      return fetch(base() + path, { credentials: 'include', cache: 'no-store', headers: authHeaders() }).then(function (r) {
        return r.json().catch(function () { return null; }).then(function (j) {
          if (r.ok && j) return j;
          if (r.status === 403) throw new Error('The shop server refused. Sign in to the portal first (the server door), then try again.');
          if (r.status === 429) throw new Error('Too many tries. Wait a few minutes.');
          throw new Error((j && typeof j.error === 'string' && j.error) || 'The shop server answered with an error (' + r.status + ').');
        });
      }, function () { throw new Error('Could not reach the shop server. Check the connection, then try again.'); });
    },

    /* Pull every request newer than the saved cursor. Safe to run twice: requests carry the server's id and are skipped if already here. */
    pull: function () {
      if (busy) return busy;
      var st = state(), added = 0;
      function page(n) {
        if (n >= MAX_PAGES) return Promise.resolve();
        return api.call('/api/requests?limit=100&after=' + encodeURIComponent(st.after || 0)).then(function (j) {
          if (!j || !Array.isArray(j.requests)) throw new Error('The shop server sent something this portal does not recognize.');
          added += act.importRemote(j.requests, j.next_after);
          return j.requests.length >= 100 ? page(n + 1) : undefined;
        });
      }
      busy = page(0).then(function () { st.lastOk = Date.now(); st.lastError = ''; S.commit(); return { added: added }; },
        function (e) { st.lastError = e.message; S.commit(); throw e; }).then(function (r) { busy = null; return r; }, function (e) { busy = null; throw e; });
      return busy;
    },

    callPost: function (path, body) {
      if (!api.configured()) return Promise.reject(new Error('This portal is not pointed at a shop server yet.'));
      return fetch(base() + path, { method: 'POST', credentials: 'include', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(body || {}), cache: 'no-store' }).then(function (r) {
        return r.json().catch(function () { return null; }).then(function (j) {
          if (r.ok && j) return j;
          if (r.status === 403) throw new Error('The shop server refused. Sign in to the portal first (the server door), then try again.');
          if (r.status === 429) throw new Error('Too many tries. Wait a few minutes.');
          throw new Error((j && typeof j.error === 'string' && j.error) || 'The shop server answered with an error (' + r.status + ').');
        });
      }, function () { throw new Error('Could not reach the shop server. Check the connection, then try again.'); });
    },

    /* Upload one photo to the shop's photo library on the server. The
       file itself goes up (the server checks it is an image and at most
       25 MB); what comes back is the public URL the work carries, so the
       next publish shows the photo to every visitor. A 501 means the
       library is not switched on for this shop yet. */
    uploadPhoto: function (artist, file) {
      if (!api.configured()) return Promise.reject(new Error('This portal is not pointed at a shop server yet.'));
      var fd = new FormData();
      fd.append('artist', artist);
      fd.append('file', file, file && file.name ? file.name : 'photo');
      return fetch(base() + '/photos', { method: 'POST', credentials: 'include', headers: authHeaders(), body: fd }).then(function (r) {
        return r.json().catch(function () { return null; }).then(function (j) {
          if (r.ok && j && j.ok && typeof j.url === 'string' && j.url) return j;
          if (r.status === 501) throw new Error('Photo uploads are not switched on for this shop yet.');
          if (r.status === 403) throw new Error('The shop server refused. Sign in to the portal first (the server door), then try again.');
          if (r.status === 413) throw new Error('That photo is over 25 MB. Send a smaller copy.');
          if (r.status === 400 && j && j.error === 'not_an_image') throw new Error('That file is not a photo. Use a JPEG, PNG, WebP, or GIF.');
          throw new Error((j && typeof j.error === 'string' && j.error) || 'The shop server answered with an error (' + r.status + ').');
        });
      }, function () { throw new Error('Could not reach the shop server. Check the connection, then try again.'); });
    },

    /* Delete a library photo's stored file by its public URL. Best
       effort by design: resolves true/false and never throws, so taking
       a photo out of the works is never blocked by the server copy. */
    deletePhoto: function (url) {
      var key = OA.photoKeyOf(url);
      if (!key || !api.configured()) return Promise.resolve(false);
      return fetch(base() + '/photos/' + key.split('/').map(encodeURIComponent).join('/'), { method: 'DELETE', credentials: 'include', headers: authHeaders(), cache: 'no-store' }).then(function (r) { return r.ok; }, function () { return false; });
    },

    /* Ask the shop server to draft a description (and an SEO file name) for one
       portfolio photo. The server holds the Vision key; the owner always reads
       and edits the draft before the photo can be shown. */
    describe: function (item) {
      function photoBlob() {
        if (!item || !item.src) return Promise.resolve(null);
        if (String(item.src).indexOf('idb:') === 0) return OA.img.blob(item.src);
        return fetch(OA.img.src(item.src), { cache: 'no-store' }).then(function (r) { return r.ok ? r.blob() : null; }).catch(function () { return null; });
      }
      function toB64(blob) {
        return new Promise(function (res, rej) {
          var fr = new FileReader();
          fr.onload = function () { res(String(fr.result).split(',')[1] || ''); };
          fr.onerror = function () { rej(new Error('That photo could not be read.')); };
          fr.readAsDataURL(blob);
        });
      }
      return photoBlob().then(function (blob) {
        if (!blob) throw new Error('That photo could not be read.');
        return toB64(blob);
      }).then(function (b64) {
        return api.callPost('/api/describe', { image: b64 });
      }).then(function (j) {
        if (!j || typeof j.description !== 'string' || !j.description) throw new Error('The description service sent something this portal does not recognize.');
        return { description: j.description, fileName: typeof j.fileName === 'string' ? j.fileName : '' };
      });
    },

    /* One line for the Requests header. Never says all is well unless the last check worked. */
    status: function () {
      var st = state();
      if (!api.configured()) return { kind: 'quiet', text: 'Website form not connected', detail: 'Requests from the website will not show up here until the portal is pointed at the shop server.' };
      if (st.lastError) return { kind: 'bad', text: 'Last check failed', detail: st.lastError };
      if (st.lastOk) return { kind: 'ok', text: 'Checked ' + OA.ago(st.lastOk), detail: '' };
      return { kind: 'quiet', text: 'Not checked yet', detail: '' };
    },

    startPolling: function () {
      if (timer) return;
      timer = setInterval(function () {
        if (document.hidden || !api.ready()) return;
        api.pull().then(function (r) {
          if (r.added) { ui.toast(OA.plural(r.added, 'new website request') + ' came in.'); var t = (location.hash.split('/')[1] || '').split('?')[0]; if (t === 'requests' || t === 'today') OA.rerender(); }
        }, function () { /* the failure shows in the Requests header */ });
      }, POLL_MS);
    }
  };
})();
