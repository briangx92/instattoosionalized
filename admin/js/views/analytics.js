/* Analytics: how the website is doing.
   Visits to the live site are counted by Cloudflare Web Analytics, which
   is attached to the site itself. Those numbers live in the shop's
   Cloudflare account; they are not mirrored into the portal, and this
   page never fills the gap with made-up numbers. Requests sent from the
   website form are stored on the shop server; counting them here waits
   on that feed being connected to the portal. */
(function () {
  'use strict';
  var OA = window.OA, h = OA.h, ui = OA.ui;

  function render() {
    var page = h('div', { class: 'page' });
    page.appendChild(ui.pageHead('Analytics', 'How the website is doing: visits, speed, and how many visits turn into requests.'));
    page.appendChild(h('section', { class: 'card' }, h('h2', { text: 'Website visits' }),
      h('p', { text: 'Visits to the live website are counted by Cloudflare Web Analytics, attached to the site when it went live. The counts, top pages, and page speed live in the shop’s Cloudflare account, under Web Analytics for instattoosionalized.net.' }),
      h('p', { class: 'note', text: 'They are not shown inside the portal yet, so there is nothing to read here that is not real.' })));
    page.appendChild(h('section', { class: 'card' }, h('h2', { text: 'Requests from the website form' }),
      h('p', { text: 'Every request sent from the website form is stored on the shop’s server. Counting them on this page waits on that feed being connected to the portal.' }),
      h('p', { class: 'note', text: 'Until that feed is connected, the Requests tab only shows what the shop adds by hand.' })));
    return page;
  }

  OA.views.analytics = { title: function () { return 'Analytics'; }, render: render };
})();
