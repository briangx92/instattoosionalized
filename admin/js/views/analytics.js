/* Analytics: how the website is doing.
   Visits to the live site are counted by Cloudflare Web Analytics.
   The counts live in the shop's Cloudflare account and are read back
   through the shop server (GET /analytics), which holds the account
   token; the token never reaches this page. When the server cannot
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
      if (!j || j.ok !== true || !j.visits || !j.pageviews || !Array.isArray(j.topPages)) {
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
    statInto(stats, 'Visits today', v.today, p.today + (p.today === 1 ? ' pageview' : ' pageviews'));
    statInto(stats, 'Visits, last 7 days', v.d7, p.d7 + (p.d7 === 1 ? ' pageview' : ' pageviews'));
    statInto(stats, 'Visits, last 30 days', v.d30, p.d30 + (p.d30 === 1 ? ' pageview' : ' pageviews'));
    card.appendChild(stats);
    card.appendChild(h('h3', { text: 'Top pages, last 7 days' }));
    if (j.topPages.length) {
      j.topPages.forEach(function (tp) {
        card.appendChild(h('div', { class: 'row tight' }, h('span', { text: tp.path }), h('b', { text: String(tp.views) })));
      });
      card.appendChild(h('p', { class: 'note', text: 'Page counts are page loads. Read from Cloudflare Web Analytics ' + OA.ago(Date.parse(j.generatedAt)) + '.' }));
    } else {
      card.appendChild(h('p', { class: 'note', text: 'No page views recorded in the last 7 days yet. The counter is attached to the website and is collecting.' }));
    }
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
