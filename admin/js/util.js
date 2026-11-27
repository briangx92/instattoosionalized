/* Shared helpers. Everything user- or form-supplied goes through h() text nodes, never innerHTML. */
(function () {
  'use strict';
  var OA = window.OA = window.OA || { views: {}, act: {} };

  /* ---------- DOM ---------- */
  function add(el, kids) {
    kids.forEach(function (k) {
      if (k == null || k === false) return;
      if (Array.isArray(k)) add(el, k);
      else el.appendChild(k.nodeType ? k : document.createTextNode(String(k)));
    });
  }
  OA.h = function h(tag, attrs) {
    var el = document.createElement(tag), later = null;
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k === 'on') Object.keys(v).forEach(function (ev) { el.addEventListener(ev, v[ev]); });
      else if (k.slice(0, 3) === 'on:') el.addEventListener(k.slice(3), v);
      else if (k === 'value') later = v;
      else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'hidden' || k === 'open') el[k] = true;
      else el.setAttribute(k, v === true ? '' : v);
    });
    add(el, kids);
    if (later != null) el.value = later;
    return el;
  };
  OA.$ = function (s, r) { return (r || document).querySelector(s); };
  OA.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  OA.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };

  /* ---------- ids, numbers ---------- */
  OA.uid = function (p) { return (p || 'id') + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); };
  OA.pad = function (n) { return (n < 10 ? '0' : '') + n; };
  OA.clamp = function (n, a, b) { return Math.max(a, Math.min(b, n)); };
  OA.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  OA.eq = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };

  /* ---------- dates (local calendar days as 'YYYY-MM-DD') ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  OA.DAYS = DAYS;
  OA.iso = function (d) { return d.getFullYear() + '-' + OA.pad(d.getMonth() + 1) + '-' + OA.pad(d.getDate()); };
  OA.parse = function (s) { var p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  OA.validISO = function (s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || '') && OA.iso(OA.parse(s)) === s; };
  OA.todayISO = function () { return OA.iso(new Date()); };
  OA.addDays = function (s, n) { var d = OA.parse(s); d.setDate(d.getDate() + n); return OA.iso(d); };
  OA.diffDays = function (a, b) { return Math.round((OA.parse(a) - OA.parse(b)) / 86400000); };
  OA.dow = function (s) { return OA.parse(s).getDay(); };
  OA.dayName = function (s) { return DAYS[OA.dow(s)]; };
  OA.fmtLong = function (s) { var d = OA.parse(s); return DAYS[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); };
  OA.fmtShort = function (s) { var d = OA.parse(s); return MON[d.getMonth()] + ' ' + d.getDate(); };
  OA.fmtDow = function (s) { return DAYS[OA.dow(s)].slice(0, 3) + ' ' + OA.fmtShort(s); };
  OA.mins = function (t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1] || 0); };
  OA.hhmm = function (m) { return OA.pad(Math.floor(m / 60)) + ':' + OA.pad(m % 60); };
  OA.fmtTime = function (t) {
    if (!t) return '';
    var m = OA.mins(t), h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM', h12 = h % 12 || 12;
    return h12 + ':' + OA.pad(mm) + ' ' + ap;
  };
  OA.fmtRange = function (a, b) { return OA.fmtTime(a) + ' – ' + OA.fmtTime(b); };
  OA.nowHHMM = function () { var d = new Date(); return OA.pad(d.getHours()) + ':' + OA.pad(d.getMinutes()); };
  OA.fmtStamp = function (ts) {
    var d = new Date(ts), h = d.getHours(), ap = h >= 12 ? 'PM' : 'AM';
    return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + (h % 12 || 12) + ':' + OA.pad(d.getMinutes()) + ' ' + ap;
  };
  OA.ago = function (ts) {
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return 'just now';
    var m = Math.round(s / 60); if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    var d = Math.round(h / 24); if (d < 14) return d + (d === 1 ? ' day ago' : ' days ago');
    return Math.round(d / 7) + ' weeks ago';
  };
  OA.shiftTs = function (ts, days) { var d = new Date(ts); d.setDate(d.getDate() + days); return d.getTime(); };

  /* ---------- people, phones, messages ---------- */
  OA.first = function (name) { return String(name || '').replace(/["“”]/g, '').trim().split(/\s+/)[0] || 'there'; };
  OA.initials = function (name) {
    var p = String(name || '?').replace(/["“”]/g, '').trim().split(/\s+/);
    return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  };
  OA.digits = function (s) { return String(s || '').replace(/\D/g, ''); };
  /* US numbers: ten digits. When a number has exactly eleven digits, one leading 1 (country code) or 0 (trunk) is dropped; the ten digits themselves are never eaten into. Anything longer keeps its first ten digits for display; the check below counts the raw digits, so a longer number still fails there. */
  OA.phoneDigits = function (s) {
    var d = OA.digits(s);
    if (d.length === 11 && (d[0] === '0' || d[0] === '1')) d = d.slice(1);
    return d.slice(0, 10);
  };
  OA.phoneFormat = function (d) {
    if (!d) return '';
    return d.length <= 3 ? '(' + d : d.length <= 6 ? '(' + d.slice(0, 3) + ') ' + d.slice(3) : '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  };
  OA.fmtPhone = function (s) {
    var d = OA.digits(s); if (d.length === 11 && d[0] === '1') d = d.slice(1);
    return d.length === 10 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : String(s || '');
  };
  /* A phone is good when the number as typed is exactly ten digits (after dropping one leading 1 or 0 from an eleven-digit number) and the area code starts 2-9 (real US area codes never start with 0 or 1). The count is taken on the raw digits, not on phoneDigits: a number with an extra digit, an extension, or a second number in the field is not good, even when its first ten digits look fine. A number saved earlier that has not been changed is left alone (pass what was saved as prev; the two are compared by their digits, so a saved number the phone box shows reformatted still matches itself). */
  OA.phoneOk = function (s, prev) {
    var r = OA.digits(s);
    if (r.length === 11 && (r[0] === '0' || r[0] === '1')) r = r.slice(1);
    return (r.length === 10 && r[0] >= '2' && r[0] <= '9') || (prev != null && prev !== '' && OA.phoneDigits(prev) !== '' && OA.phoneDigits(s) === OA.phoneDigits(prev));
  };
  OA.PHONE_MSG = 'The phone number needs 10 digits, like (610) 555-0100.';
  /* An input that takes digits only, formats as you type, stops at ten digits, and copes with pasted +1 numbers and deleting over the dashes. */
  OA.phoneInput = function (value, attrs) {
    var el = OA.h('input', Object.assign({ type: 'tel', inputmode: 'tel', autocomplete: 'tel', maxlength: 18, placeholder: '(610) 555-0100', spellcheck: 'false', value: value == null ? '' : value }, attrs || {}));
    var prev = OA.phoneDigits(el.value);
    el.addEventListener('input', function (e) {
      var raw = el.value, pos = el.selectionStart == null ? raw.length : el.selectionStart, atEnd = pos >= raw.length;
      var before = OA.digits(raw.slice(0, pos)).length, d = OA.phoneDigits(raw);
      if (e.inputType && e.inputType.indexOf('delete') === 0 && d.length === prev.length && d.length) {   /* deleted a dash or bracket: take the digit beside it */
        var i = Math.max(0, Math.min(d.length, before) - 1); d = d.slice(0, i) + d.slice(i + 1); before = i;
      }
      var out = OA.phoneFormat(d); el.value = out; prev = d;
      if (!atEnd && el.setSelectionRange) { var n = Math.min(before, d.length), at = 0, seen = 0; while (at < out.length && seen < n) { if (/\d/.test(out[at])) seen++; at++; } el.setSelectionRange(at, at); }
    });
    el.addEventListener('blur', function () { var d = OA.phoneDigits(el.value); if (d.length === 10) el.value = OA.phoneFormat(d); });
    return el;
  };
  OA.e164 = function (s) { var d = OA.digits(s); if (d.length === 10) d = '1' + d; return '+' + d; };
  /* RFC 3339 timestamp with the zone's offset on that date, as the Google Calendar API wants it (timeMin, timeMax, dateTime). */
  OA.rfc3339 = function (date, time, tz) {
    var p = date.split('-'), t = time.split(':'), guess = Date.UTC(+p[0], +p[1] - 1, +p[2], +t[0], +(t[1] || 0));
    function off(ms) { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ms)).forEach(function (x) { o[x.type] = +x.value; }); return Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second) - Math.floor(ms / 1000) * 1000; }
    var o1 = off(guess), utc = guess - o1, o2 = off(utc); if (o2 !== o1) utc = guess - o2;
    var m = Math.round(off(utc) / 60000), a = Math.abs(m);
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return date + 'T' + z(+t[0]) + ':' + z(+(t[1] || 0)) + ':00' + (m < 0 ? '-' : '+') + z(Math.floor(a / 60)) + ':' + z(a % 60);
  };
  OA.telHref = function (s) { return 'tel:' + OA.e164(s); };
  OA.smsHref = function (s, body) { return 'sms:' + OA.e164(s) + '?&body=' + encodeURIComponent(body || ''); };
  OA.slug = function (s) { return String(s || '').toLowerCase().replace(/["“”']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'artist'; };
  OA.plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); };
  /* One amount, cleaned: commas out, the first decimal point kept, cents padded ("140.5" reads back "140.50"), leading zeros dropped. */
  function amt(t) {
    t = String(t).replace(/[^0-9.]/g, '');
    var i = t.indexOf('.');
    if (i >= 0) t = t.slice(0, i + 1) + t.slice(i + 1).replace(/\./g, '');
    if (!t || t === '.') return '';
    if (t[0] === '.') t = '0' + t;
    t = t.replace(/\.$/, '').replace(/^0+(?=\d)/, '');
    if (/\.\d$/.test(t)) t += '0';
    return t;
  }
  var AMT = '\\s*\\$*\\s*(?:\\d[\\d,]*(?:\\.\\d*)?|\\.\\d+)\\s*';
  var AMT_ONE = new RegExp('^' + AMT + '$'), AMT_RANGE = new RegExp('^' + AMT + '(?:-|–|—|to)' + AMT + '$', 'i');
  /* Money is stored as one canonical string with the dollar sign on ("$140"), the way the deposit and the price list already keep it, so every screen and text that shows the stored value shows the sign exactly once. Only a string that is clearly one amount, or a range of two, is rewritten; anything else (words, "per hour", a percent) is kept exactly as typed, so a saved value is never silently changed by being loaded or sent. Ranges store with a plain hyphen ("$100-$150"): an en dash is outside the basic SMS character set and would split a long text into extra parts. Empty stays empty: no price entered, no sign stored. */
  OA.money = function (s) {
    var str = String(s == null ? '' : s).trim();
    if (!str || str === '$') return '';
    if (AMT_ONE.test(str)) return '$' + amt(str);
    if (AMT_RANGE.test(str)) { var p = str.split(/-|–|—|to/i); return '$' + amt(p[0]) + '-$' + amt(p[1]); }
    return str;
  };
  /* Is this a real price (one amount, or a range of two)? Gates that need a price use this, never the truthiness of OA.money: free text like "TBD" passes through OA.money unchanged, so it is truthy without being a price. */
  OA.moneyOk = function (s) { return /^\$\d/.test(OA.money(s)); };
  /* A money box: the shop types a number and the dollar sign is added for them. The sign rides as a fixed prefix while typing (the caret counts digits, the point and the hyphen, the way the phone box counts digits), a typed or pasted $ is absorbed into the one sign, a range shows as "$100-$150" while it is typed, and leaving the box settles what is shown to the stored form. A second decimal point in one amount restores what was there before, instead of quietly changing the number. */
  OA.moneyInput = function (value, attrs) {
    var el = OA.h('input', Object.assign({ type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', placeholder: 'e.g. $140', value: value == null ? '' : value }, attrs || {}));
    el.value = OA.money(el.value);
    var last = el.value;
    el.addEventListener('input', function () {
      var raw = el.value, pos = el.selectionStart == null ? raw.length : el.selectionStart, atEnd = pos >= raw.length;
      var body = raw.replace(/[^0-9.\-]/g, ''), hi = body.indexOf('-');
      var left = hi >= 0 ? body.slice(0, hi) : body, right = hi >= 0 ? body.slice(hi + 1).replace(/-/g, '') : null;
      if ((left.match(/\./g) || []).length > 1 || (right != null && (right.match(/\./g) || []).length > 1)) {
        var p = Math.max(0, pos - 1); el.value = last; if (el.setSelectionRange) el.setSelectionRange(p, p); return;
      }
      var out = '';
      if (body || raw.indexOf('$') >= 0) { out = '$' + left; if (right != null) out += '-' + (right ? '$' + right : ''); }
      el.value = out; last = out;
      if (!atEnd && el.setSelectionRange) {
        var want = (raw.slice(0, pos).match(/[0-9.\-]/g) || []).length, at = 0, seen = 0;
        while (at < out.length && seen < want) { if (/[0-9.\-]/.test(out[at])) seen++; at++; }
        if (want === 0 && out.charAt(0) === '$') at = 1;
        el.setSelectionRange(at, at);
      }
    });
    el.addEventListener('blur', function () { el.value = OA.money(el.value); last = el.value; });
    return el;
  };

  /* ---------- misc ---------- */
  OA.debounce = function (fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; };
  OA.download = function (name, text, type) {
    var blob = new Blob([text], { type: type || 'application/json' }), url = URL.createObjectURL(blob);
    var a = OA.h('a', { href: url, download: name }); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  };
  OA.reduceMotion = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
})();
