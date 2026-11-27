/* Calendar: a month to see the shape of things, a week for the shape
   of a week, a day to see each chair's hours. */
(function () {
  'use strict';
  var OA = window.OA, h = OA.h, S = OA.store, ui = OA.ui, act = OA.act;
  var PPM = 1.15; /* pixels per minute in the day view */
  var CELL_CAP = 3; /* compact cards per month cell before the +N more link */

  var MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function monday(iso) { var d = OA.dow(iso); return OA.addDays(iso, d === 0 ? -6 : 1 - d); }
  /* Months are anchored on their first day, the way ?w= anchors a week on its Monday. */
  function monthFirst(iso) { return String(iso).slice(0, 8) + '01'; }
  function shiftMonth(iso, n) { var d = OA.parse(iso); d.setDate(1); d.setMonth(d.getMonth() + n); return OA.iso(d); }
  function monthLabel(iso) { var d = OA.parse(iso); return MONTHS_FULL[d.getMonth()] + ' ' + d.getFullYear(); }
  function chairIndex(slug) { var i = OA.chairs().map(function (c) { return c.slug; }).indexOf(slug); return i < 0 ? 0 : i % 5; }
  function chairsShown(q) { var c = OA.chairs(); if (OA.role.kind === 'artist') c = c.filter(function (x) { return x.slug === OA.role.slug; }); else if (q && q.chair) c = c.filter(function (x) { return x.slug === q.chair; }); return c; }

  function toolbar(mode, anchor, q) {
    var chairs = OA.role.kind === 'artist' ? null : ui.select([['', 'All chairs']].concat(OA.chairs().map(function (c) { return [c.slug, c.name]; })), q.chair || '', { 'aria-label': 'Show chair' });
    if (chairs) chairs.addEventListener('change', function () {
      var qq = { chair: chairs.value };
      if (mode === 'week') qq.w = anchor; else if (mode === 'month') qq.m = anchor;
      OA.go('calendar' + (mode === 'day' ? '/' + anchor : '') + OA.query(qq));
    });
    function link(n) {
      if (mode === 'month') return '#/calendar' + OA.query({ m: shiftMonth(anchor, n), chair: q.chair });
      var t = OA.addDays(anchor, n * (mode === 'week' ? 7 : 1));
      return mode === 'week' ? '#/calendar' + OA.query({ w: t, chair: q.chair }) : '#/calendar/' + t + OA.query({ chair: q.chair });
    }
    var label = mode === 'week' ? OA.fmtShort(anchor) + ' to ' + OA.fmtShort(OA.addDays(anchor, 6)) : mode === 'month' ? monthLabel(anchor) : OA.fmtLong(anchor);
    var todayLink = mode === 'week' ? '#/calendar' + OA.query({ chair: q.chair }) : mode === 'month' ? '#/calendar' + OA.query({ m: monthFirst(OA.todayISO()), chair: q.chair }) : '#/calendar/' + OA.todayISO() + OA.query({ chair: q.chair });
    return h('div', { class: 'toolbar cal-tools' },
      h('div', { class: 'row tight' }, ui.link('Back', link(-1), 'btn small'), h('strong', { class: 'cal-label', text: label }), ui.link('Forward', link(1), 'btn small'), ui.link('Today', todayLink, 'btn small quiet')),
      h('div', { class: 'row tight' }, h('div', { class: 'seg', role: 'group', 'aria-label': 'View' }, ui.link('Week', '#/calendar' + OA.query({ w: monday(anchor), chair: q.chair }), 'seg-b' + (mode === 'week' ? ' on' : '')), ui.link('Month', '#/calendar' + OA.query({ m: monthFirst(anchor), chair: q.chair }), 'seg-b' + (mode === 'month' ? ' on' : '')), ui.link('Day', '#/calendar/' + (mode === 'day' ? anchor : (OA.diffDays(OA.todayISO(), anchor) >= 0 && OA.diffDays(OA.todayISO(), anchor) < 7 ? OA.todayISO() : anchor)) + OA.query({ chair: q.chair }), 'seg-b' + (mode === 'day' ? ' on' : ''))), chairs));
  }

  function apptCard(a, compact) {
    var flags = OA.apptFlags(a).filter(function (f) { return f[0] !== 'ok' || a.status === 'arrived'; });
    return h('button', { type: 'button', class: 'cal-appt c' + chairIndex(a.artist) + ' st-' + a.status + (a.type === 'consult' ? ' consult' : ''), on: { click: function () { OA.apptDialog(a).then(function (r) { if (r) OA.rerender(); }); } }, 'aria-label': a.client + ', ' + OA.chairName(a.artist) + ', ' + OA.fmtRange(a.start, a.end) },
      h('span', { class: 'ca-time', text: OA.fmtTime(a.start) }),
      h('span', { class: 'ca-name', text: a.client }),
      h('span', { class: 'ca-meta', text: OA.chairName(a.artist) + (a.type === 'consult' ? ' · Consult' : '') }),
      compact ? null : (a.piece ? h('span', { class: 'ca-piece', text: a.piece }) : null),
      !compact && flags.length ? h('span', { class: 'chips' }, flags.slice(0, 2).map(function (f) { return ui.chip(f[1], f[0]); })) : null);
  }

  function gcalNote() {
    var st = OA.gcal.status();
    var txt = 'Google Calendar: ' + st.text.toLowerCase() + '. ' + (st.connected ? 'Appointments are placed on the shop’s master booking calendar.' : st.reason);
    return h('p', { class: 'note gcal-chip', text: txt });
  }

  function weekView(start, q) {
    var root = h('div', { class: 'page wide' }), shown = chairsShown(q), slugs = shown.map(function (c) { return c.slug; });
    root.appendChild(ui.pageHead('Calendar', null, [ui.btn('Send schedule', function () { OA.sendScheduleDialog(); }), ui.btn('Block time off', function () { OA.timeoffDialog({}).then(function (v) { if (v) OA.rerender(); }); }), ui.btn('New appointment', function () { OA.apptDialog(null, { date: OA.todayISO() }).then(function (r) { if (r) OA.rerender(); }); }, 'primary')]));
    root.appendChild(toolbar('week', start, q)); root.appendChild(gcalNote());
    var grid = h('div', { class: 'weekgrid' }), today = OA.todayISO(), any = 0;
    for (var i = 0; i < 7; i++) {
      (function (day) {
        var open = OA.isOpenDay(day), hr = OA.hoursFor(day);
        var list = OA.scopeAppts(S.state.appts).filter(function (a) { return a.date === day && a.status !== 'cancelled' && slugs.indexOf(a.artist) >= 0; }).sort(function (a, b) { return OA.mins(a.start) - OA.mins(b.start); });
        var off = S.state.timeoff.filter(function (t) { return t.date === day && slugs.indexOf(t.artist) >= 0; });
        any += list.length;
        var col = h('section', { class: 'weekday' + (day === today ? ' today' : '') + (!open && !list.length ? ' closed' : ''), 'aria-label': OA.fmtLong(day) },
          h('header', {}, h('a', { href: '#/calendar/' + day + OA.query({ chair: q.chair }), class: 'wd-link' }, h('b', { text: OA.DAYS[OA.dow(day)].slice(0, 3) }), h('span', { text: String(OA.parse(day).getDate()) })), h('small', { text: open ? OA.fmtRange(hr.open, hr.close).replace(/:00/g, '') : 'Closed' })));
        off.forEach(function (t) { col.appendChild(h('div', { class: 'cal-off', text: OA.chairName(t.artist) + ' off, ' + OA.fmtRange(t.start, t.end).replace(/:00/g, '') + (t.note ? ' (' + t.note + ')' : '') })); });
        list.forEach(function (a) { col.appendChild(apptCard(a, false)); });
        if (open && !list.length && !off.length) col.appendChild(h('p', { class: 'cal-none', text: 'Open, nothing booked' }));
        if (open || list.length) col.appendChild(h('button', { type: 'button', class: 'cal-add', 'aria-label': 'Add appointment on ' + OA.fmtLong(day), text: '+ Add', on: { click: function () { OA.apptDialog(null, { date: day, artist: shown[0] && shown[0].slug }).then(function (r) { if (r) OA.rerender(); }); } } }));
        grid.appendChild(col);
      })(OA.addDays(start, i));
    }
    root.appendChild(grid);
    if (!any) root.appendChild(h('p', { class: 'note', text: 'Nothing is booked this week' + (q.chair ? ' for ' + OA.chairName(q.chair) : '') + '. Requests that reach the booking stage land here.' }));
    var legend = h('div', { class: 'legend', 'aria-label': 'Chairs' }); OA.chairs().forEach(function (c) { legend.appendChild(h('span', { class: 'lg c' + chairIndex(c.slug) }, h('i'), c.name)); });
    root.appendChild(legend);
    return root;
  }

  /* One day in the month grid: the date, a compact time-off marker, and
     up to CELL_CAP compact appointment cards. A tap anywhere that is not
     a card or a link opens that date's day view. */
  function monthCell(day, q, slugs, first, today) {
    var open = OA.isOpenDay(day);
    var list = OA.scopeAppts(S.state.appts).filter(function (a) { return a.date === day && a.status !== 'cancelled' && slugs.indexOf(a.artist) >= 0; }).sort(function (a, b) { return OA.mins(a.start) - OA.mins(b.start); });
    var off = S.state.timeoff.filter(function (t) { return t.date === day && slugs.indexOf(t.artist) >= 0; });
    var dayLink = '#/calendar/' + day + OA.query({ chair: q.chair });
    var cell = h('div', { class: 'mday' + (day === today ? ' today' : '') + (OA.parse(day).getMonth() !== OA.parse(first).getMonth() ? ' out' : '') + (!open && !list.length ? ' closed' : ''), 'aria-label': OA.fmtLong(day) + (list.length ? ', ' + list.length + (list.length === 1 ? ' appointment' : ' appointments') : ''), on: { click: function (e) { if (e.target.closest('a,button')) return; OA.go('calendar/' + day + OA.query({ chair: q.chair })); } } },
      h('a', { href: dayLink, class: 'md-link', 'aria-label': OA.fmtLong(day) }, h('span', { class: 'md-num', text: String(OA.parse(day).getDate()) })));
    if (off.length) {
      var offs = h('div', { class: 'moffs' });
      off.forEach(function (t) { offs.appendChild(h('div', { class: 'cal-off moff', title: OA.chairName(t.artist) + ' off, ' + OA.fmtRange(t.start, t.end).replace(/:00/g, '') + (t.note ? ' (' + t.note + ')' : ''), text: OA.chairName(t.artist) + ' off' })); });
      cell.appendChild(offs);
    }
    if (list.length) {
      var entries = h('div', { class: 'mentries' });
      list.slice(0, CELL_CAP).forEach(function (a) { entries.appendChild(apptCard(a, true)); });
      if (list.length > CELL_CAP) entries.appendChild(h('a', { href: dayLink, class: 'mmore', text: '+' + (list.length - CELL_CAP) + ' more' }));
      cell.appendChild(entries);
    }
    return { cell: cell, count: list.length };
  }

  function monthView(first, q) {
    var root = h('div', { class: 'page wide' }), shown = chairsShown(q), slugs = shown.map(function (c) { return c.slug; });
    var today = OA.todayISO();
    root.appendChild(ui.pageHead('Calendar', null, [ui.btn('Send schedule', function () { OA.sendScheduleDialog(); }), ui.btn('Block time off', function () { OA.timeoffDialog({}).then(function (v) { if (v) OA.rerender(); }); }), ui.btn('New appointment', function () { OA.apptDialog(null, { date: monthFirst(today) === first ? today : first }).then(function (r) { if (r) OA.rerender(); }); }, 'primary')]));
    root.appendChild(toolbar('month', first, q)); root.appendChild(gcalNote());
    var head = h('div', { class: 'mhead', 'aria-hidden': 'true' });
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) { head.appendChild(h('span', { text: OA.DAYS[d].slice(0, 3) })); });
    root.appendChild(head);
    var grid = h('div', { class: 'monthgrid' }), any = 0;
    var lastDay = OA.addDays(shiftMonth(first, 1), -1);
    var end = OA.addDays(lastDay, (7 - OA.dow(lastDay)) % 7);
    for (var day = monday(first); OA.diffDays(day, end) <= 0; day = OA.addDays(day, 1)) {
      var built = monthCell(day, q, slugs, first, today);
      any += built.count;
      grid.appendChild(built.cell);
    }
    root.appendChild(grid);
    if (!any) root.appendChild(h('p', { class: 'note', text: 'Nothing is booked this month' + (q.chair ? ' for ' + OA.chairName(q.chair) : '') + '. Requests that reach the booking stage land here.' }));
    var legend = h('div', { class: 'legend', 'aria-label': 'Chairs' }); OA.chairs().forEach(function (c) { legend.appendChild(h('span', { class: 'lg c' + chairIndex(c.slug) }, h('i'), c.name)); });
    root.appendChild(legend);
    return root;
  }

  function dayView(day, q) {
    var root = h('div', { class: 'page wide' }), shown = chairsShown(q), open = OA.isOpenDay(day), hr = OA.hoursFor(day);
    var list = OA.scopeAppts(S.state.appts).filter(function (a) { return a.date === day && a.status !== 'cancelled'; });
    var off = S.state.timeoff.filter(function (t) { return t.date === day; });
    root.appendChild(ui.pageHead('Calendar', null, [ui.btn('Send schedule', function () { OA.sendScheduleDialog(); }), ui.btn('Block time off', function () { OA.timeoffDialog({ date: day }).then(function (v) { if (v) OA.rerender(); }); }), ui.btn('New appointment', function () { OA.apptDialog(null, { date: day, artist: shown[0] && shown[0].slug }).then(function (r) { if (r) OA.rerender(); }); }, 'primary')]));
    root.appendChild(toolbar('day', day, q)); root.appendChild(gcalNote());
    var lo = open ? OA.mins(hr.open) : 12 * 60, hi = open ? OA.mins(hr.close) : 17 * 60;
    list.concat(off).forEach(function (a) { lo = Math.min(lo, OA.mins(a.start)); hi = Math.max(hi, OA.mins(a.end)); });
    lo = Math.floor(lo / 60) * 60; hi = Math.ceil(hi / 60) * 60;
    if (!open) root.appendChild(h('p', { class: 'note', text: 'The shop is closed on ' + OA.dayName(day) + 's by its usual hours.' + (list.length ? ' Appointments below were booked anyway.' : '') }));
    var hours = h('div', { class: 'dg-hours', style: 'height:' + (hi - lo) * PPM + 'px' });
    for (var m = lo; m < hi; m += 60) hours.appendChild(h('div', { class: 'dg-h', style: 'top:' + (m - lo) * PPM + 'px', text: OA.fmtTime(OA.hhmm(m)).replace(':00', '') }));
    var lanes = h('div', { class: 'dg-lanes', style: 'grid-template-columns:repeat(' + shown.length + ',minmax(150px,1fr))' });
    shown.forEach(function (c) {
      var lane = h('div', { class: 'dg-lane', style: 'height:' + (hi - lo) * PPM + 'px', title: 'Click an empty spot to add an appointment' });
      for (var mm = lo; mm < hi; mm += 60) lane.appendChild(h('div', { class: 'dg-line', style: 'top:' + (mm - lo) * PPM + 'px' }));
      if (open) { /* shade outside shop hours */
        if (OA.mins(hr.open) > lo) lane.appendChild(h('div', { class: 'dg-shut', style: 'top:0;height:' + (OA.mins(hr.open) - lo) * PPM + 'px' }));
        if (OA.mins(hr.close) < hi) lane.appendChild(h('div', { class: 'dg-shut', style: 'top:' + (OA.mins(hr.close) - lo) * PPM + 'px;height:' + (hi - OA.mins(hr.close)) * PPM + 'px' }));
      }
      lane.addEventListener('click', function (e) {
        if (e.target !== lane && !e.target.classList.contains('dg-line') && !e.target.classList.contains('dg-shut')) return;
        var r = lane.getBoundingClientRect(), mins = Math.round(((e.clientY - r.top) / PPM + lo) / 15) * 15;
        OA.apptDialog(null, { date: day, artist: c.slug, start: OA.hhmm(OA.clamp(mins, 0, 23 * 60))  }).then(function (x) { if (x) OA.rerender(); });
      });
      off.filter(function (t) { return t.artist === c.slug; }).forEach(function (t) { lane.appendChild(h('div', { class: 'dg-off', style: 'top:' + (OA.mins(t.start) - lo) * PPM + 'px;height:' + (OA.mins(t.end) - OA.mins(t.start)) * PPM + 'px', title: 'Time off' }, h('span', { text: 'Time off' + (t.note ? ': ' + t.note : '') }), ui.btn('Remove', function () { act.removeTimeoff(t.id); ui.toast('Time off removed'); OA.rerender(); }, 'small quiet'))); });
      list.filter(function (a) { return a.artist === c.slug; }).forEach(function (a) {
        var el = apptCard(a, false); el.classList.add('dg-appt'); el.style.top = (OA.mins(a.start) - lo) * PPM + 'px'; el.style.height = Math.max(34, (OA.mins(a.end) - OA.mins(a.start)) * PPM - 2) + 'px'; lane.appendChild(el);
      });
      lanes.appendChild(h('div', { class: 'dg-col' }, h('div', { class: 'dg-head c' + chairIndex(c.slug) }, ui.avatar(c.full), h('strong', { text: c.name })), lane));
    });
    root.appendChild(h('div', { class: 'daygrid' }, h('div', { class: 'dg-gutter' }, h('div', { class: 'dg-head' }), hours), lanes));
    if (!list.length) root.appendChild(h('p', { class: 'note', text: 'Nothing booked. Click an empty spot in a chair’s column to add something.' }));
    return root;
  }

  OA.views.calendar = {
    title: function (p) { return p[0] ? OA.fmtLong(p[0]) : 'Calendar'; },
    render: function (parts, q) {
      if (parts[0]) {
        if (!OA.validISO(parts[0])) return ui.empty('That date is not valid', 'Dates in the address look like 2026-11-24.', ui.link('Open the calendar', '#/calendar', 'btn primary'));
        return dayView(parts[0], q);
      }
      if (OA.validISO(q.m)) return monthView(monthFirst(q.m), q);
      return weekView(OA.validISO(q.w) ? monday(q.w) : monday(OA.todayISO()), q);
    }
  };
})();
