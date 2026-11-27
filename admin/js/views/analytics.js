/* Analytics: how the website is doing.
   Visits to the live site are counted by Cloudflare Web Analytics.
   The counts live in the shop's Cloudflare account and are read back
   through the shop server (GET /analytics), which holds the account
   token; the token never reaches this page. The answer carries the
   totals, a per-day series for the last 30 days (drawn below as a
   chart), and the top pages over 30 days. When the server cannot
   answer, this page says so and shows no numbers rather than a guess.
   Request counts are counted here, from the same requests the portal
   already pulls from the website form feed: no second feed, and the
   numbers always match the Requests tab. */
(function () {
  'use strict';
  var OA = window.OA, h = OA.h, ui = OA.ui, S = OA.store;

  /* ---------- website visits (from the shop server) ---------- */
  var visits = { state: 'idle', data: null };
  var feedTried = false;

  function loadVisits() {
    if (visits.state === 'loading') return;
    visits.state = 'loading';
    OA.api.call('/analytics').then(function (j) {
      if (!j || j.ok !== true || !j.visits || !j.pageviews || !Array.isArray(j.topPages) || !Array.isArray(j.series) || !Array.isArray(j.pages30)) {
        throw new Error('The shop server sent something this portal does not recognize.');
      }
      visits.state = 'ok'; visits.data = j;
    }, function () {
      visits.state = 'error'; visits.data = null;
    }).then(function () { OA.rerender(); });
  }

  function statInto(stats, label, val, note) {
    stats.appendChild(h('div', {}, h('dt', { text: label }), h('dd', { text: String(val) }), note ? h('dd', { class: 'note', text: note }) : null));
  }

  /* ---------- the daily chart (inline SVG, drawn here) ----------
     OA.h builds HTML elements only; SVG needs its own namespace, so
     the chart uses this small builder on the same conventions (the
     qr.js module builds its SVG the same way). Page views are bars in
     the accent; visits ride over them as a dot-and-line series in a
     second color, on the same scale, because the two counts answer
     the same question per day and a second axis would invite a false
     comparison. The axis tops out at a whole step at or above the
     busiest day: nothing is cut off and no bar is stretched. */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    });
    Array.prototype.slice.call(arguments, 2).forEach(function add(kid) {
      if (kid == null || kid === false) return;
      if (Array.isArray(kid)) kid.forEach(add);
      else el.appendChild(kid);
    });
    return el;
  }

  function dayChart(series) {
    var W = 720, H = 240, LEFT = 36, RIGHT = 8, TOP = 10, PLOT = 190;
    var base = TOP + PLOT, plotW = W - LEFT - RIGHT;
    var max = 0;
    series.forEach(function (d) { max = Math.max(max, d.pageviews, d.visits); });
    var step = Math.max(1, Math.ceil(max / 4)), axisTop = step * 4;
    function y(v) { return base - (v / axisTop) * PLOT; }
    var kids = [];
    for (var g = 0; g <= 4; g++) {
      var gv = g * step, gy = y(gv);
      kids.push(s('line', { x1: LEFT, x2: W - RIGHT, y1: gy, y2: gy, class: g === 0 ? 'ch-axis' : 'ch-grid' }));
      kids.push(s('text', { x: LEFT - 6, y: gy + 4, 'text-anchor': 'end', class: 'ch-lab', text: String(gv) }));
    }
    var slot = plotW / series.length, barW = Math.max(2, Math.floor(slot * 0.6));
    var pts = [];
    series.forEach(function (d, i) {
      var cx = LEFT + i * slot + slot / 2;
      var bh = (d.pageviews / axisTop) * PLOT;
      kids.push(s('rect', { x: cx - barW / 2, y: base - bh, width: barW, height: bh, class: 'ch-bar' },
        s('title', { text: OA.fmtShort(d.date) + ': ' + d.pageviews + (d.pageviews === 1 ? ' page view' : ' page views') + ', ' + d.visits + (d.visits === 1 ? ' visit' : ' visits') })));
      pts.push((Math.round(cx * 10) / 10) + ',' + (Math.round(y(d.visits) * 10) / 10));
      if (i % 5 === 0 || i === series.length - 1) {
        kids.push(s('text', { x: cx, y: base + 18, 'text-anchor': 'middle', class: 'ch-lab', text: OA.fmtShort(d.date) }));
      }
    });
    kids.push(s('polyline', { points: pts.join(' '), class: 'ch-line' }));
    series.forEach(function (d, i) {
      var cx = LEFT + i * slot + slot / 2;
      kids.push(s('circle', { cx: cx, cy: y(d.visits), r: 2.4, class: 'ch-dot' }));
    });
    var busiest = series.reduce(function (a, b) { return b.pageviews > a.pageviews ? b : a; }, series[0]);
    return s('svg', {
      viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img',
      'aria-label': 'Daily chart for the last 30 days. Busiest day: ' + OA.fmtShort(busiest.date) + ', ' + busiest.pageviews + (busiest.pageviews === 1 ? ' page view' : ' page views') + '.'
    }, kids);
  }

  function chartBlock(series) {
    var wrap = h('div', {});
    wrap.appendChild(h('h3', { text: 'Page views and visits, last 30 days' }));
    wrap.appendChild(h('div', { class: 'row tight ch-keys' },
      h('span', { class: 'ch-key' }, h('i', { class: 'ch-sw pv' }), 'Page views'),
      h('span', { class: 'ch-key' }, h('i', { class: 'ch-sw vt' }), 'Visits')));
    wrap.appendChild(dayChart(series));
    return wrap;
  }

  /* Views by page over 30 days. The bar under each path is sized
     against the top page, so the ranking reads at a glance and the
     number beside the path stays the exact count. This one list
     replaces the old 7-day list: the 7-day totals still sit in the
     stats above, and two lists of the same pages invited confusion. */
  function pagesBlock(pages) {
    var wrap = h('div', {});
    wrap.appendChild(h('h3', { text: 'Views by page, last 30 days' }));
    var top = pages.length ? pages[0].views : 0;
    pages.forEach(function (tp) {
      var pct = top > 0 ? Math.round((tp.views / top) * 1000) / 10 : 0;
      wrap.appendChild(h('div', { class: 'pgrow' },
        h('div', { class: 'pg-top' }, h('span', { class: 'pg-path', title: tp.path, text: tp.path }), h('b', { text: String(tp.views) })),
        h('div', { class: 'pg-track' }, h('div', { class: 'pg-fill', style: 'width:' + pct + '%' }))));
    });
    return wrap;
  }

  function visitsCard() {
    var card = h('section', { class: 'card' }, h('h2', { text: 'Website visits' }));
    if (!OA.api.configured()) {
      card.appendChild(h('p', { text: 'Visits to the live website are counted by Cloudflare Web Analytics. This portal is not pointed at the shop server yet, so the counts cannot be read from here.' }));
      return card;
    }
    if (visits.state === 'idle') loadVisits();
    if (visits.state === 'loading' || visits.state === 'idle') {
      card.appendChild(h('p', { class: 'note', text: 'Reading the visit counts from the shop server...' }));
      return card;
    }
    if (visits.state === 'error') {
      card.appendChild(h('p', { text: 'Could not load visit counts right now.' }));
      card.appendChild(h('p', { class: 'note', text: 'Nothing is shown rather than a guess. The counts are still being collected on the website itself.' }));
      card.appendChild(h('div', { class: 'row end' }, ui.btn('Retry', function () { visits.state = 'idle'; OA.rerender(); }, 'quiet')));
      return card;
    }
    var j = visits.data, v = j.visits, p = j.pageviews;
    var stats = h('dl', { class: 'stats' });
    statInto(stats, 'Visits today', v.today, p.today + (p.today === 1 ? ' page view' : ' page views'));
    statInto(stats, 'Visits, last 7 days', v.d7, p.d7 + (p.d7 === 1 ? ' page view' : ' page views'));
    statInto(stats, 'Visits, last 30 days', v.d30, p.d30 + (p.d30 === 1 ? ' page view' : ' page views'));
    card.appendChild(stats);
    var hasData = j.pages30.length > 0 || j.series.some(function (d) { return d.pageviews > 0 || d.visits > 0; });
    if (!hasData) {
      card.appendChild(h('p', { class: 'note', text: 'No page views recorded in the last 7 days yet. The counter is attached to the website and is collecting.' }));
      return card;
    }
    card.appendChild(chartBlock(j.series));
    if (j.pages30.length) card.appendChild(pagesBlock(j.pages30));
    card.appendChild(h('p', { class: 'note', text: 'Page counts are page loads. Read from Cloudflare Web Analytics ' + OA.ago(Date.parse(j.generatedAt)) + '.' }));
    return card;
  }

  /* ---------- requests (counted from the portal's own feed) ---------- */
  function requestCounts() {
    var all = OA.scopeReqs ? OA.scopeReqs(S.state.requests || []) : (S.state.requests || []);
    var now = Date.now(), w7 = now - 7 * 24 * 3600 * 1000, w30 = now - 30 * 24 * 3600 * 1000;
    var c = { total: all.length, d7: 0, d30: 0, fresh: 0, progress: 0, booked: 0, closed: 0 };
    all.forEach(function (r) {
      var t = typeof r.created === 'number' ? r.created : 0;
      if (t >= w7) c.d7++;
      if (t >= w30) c.d30++;
      if (r.status === 'New') c.fresh++;
      else if (r.status === 'Booked') c.booked++;
      else if (r.status === 'Closed') c.closed++;
      else c.progress++;
    });
    return c;
  }

  function requestsCard() {
    var card = h('section', { class: 'card' }, h('h2', { text: 'Requests from the website form' }));
    if (OA.api.configured()) {
      var feed = OA.api.status();
      card.appendChild(h('div', { class: 'row tight feed' }, ui.chip(feed.text, feed.kind), feed.detail ? h('span', { class: 'note', text: feed.detail }) : null));
      if (!OA.api.state().lastOk && !feedTried) {
        feedTried = true;
        OA.api.pull().then(function () { OA.rerender(); }, function () { OA.rerender(); });
      }
    } else {
      card.appendChild(h('p', { class: 'note', text: 'The website form feed is not connected to this portal yet, so these counts cover only what the shop has added by hand.' }));
    }
    var c = requestCounts();
    var stats = h('dl', { class: 'stats' });
    statInto(stats, 'Requests in total', c.total);
    statInto(stats, 'Last 7 days', c.d7);
    statInto(stats, 'Last 30 days', c.d30);
    card.appendChild(stats);
    card.appendChild(h('h3', { text: 'Where they stand' }));
    var by = h('dl', { class: 'stats' });
    statInto(by, 'New', c.fresh);
    statInto(by, 'In progress', c.progress, 'Contacted, consult set, or waiting on a deposit');
    statInto(by, 'Booked', c.booked);
    statInto(by, 'Closed', c.closed);
    card.appendChild(by);
    if (!c.total) card.appendChild(h('p', { class: 'note', text: 'No requests yet. New website requests appear here as they come in.' }));
    return card;
  }

  function render() {
    var page = h('div', { class: 'page' });
    page.appendChild(ui.pageHead('Analytics', 'How the website is doing: visits, top pages, and the requests it brings in.'));
    page.appendChild(visitsCard());
    page.appendChild(requestsCard());
    return page;
  }

  OA.views.analytics = { title: function () { return 'Analytics'; }, render: render };
})();
