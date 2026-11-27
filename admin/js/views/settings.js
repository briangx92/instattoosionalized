/* Settings: the words in texts, who can sign in, and the data itself. */
(function () {
  'use strict';
  var OA = window.OA, h = OA.h, S = OA.store, ui = OA.ui, act = OA.act;
  var TABS = [['messages', 'Messages'], ['people', 'People and roles'], ['connection', 'Website connection'], ['integrations', 'Schedules'], ['data', 'Data and backup']];
  var VARS = ['first', 'shop', 'artist', 'quote', 'deposit', 'depositHow', 'date', 'time', 'address', 'reviewLink'];
  var ROLE = { owner: 'Shop owner', frontdesk: 'Front desk', artist: 'Artist' };

  function note(el, msg, bad) { el.className = 'saved' + (bad ? ' bad' : ''); el.textContent = msg; }

  function messages() {
    var set = S.state.settings, root = h('div', {}), saved = h('div', { class: 'saved', 'aria-live': 'polite' });
    var f = { dep: ui.input(set.depositAmount, { placeholder: '$40' }), how: ui.input(set.depositHow, { placeholder: 'e.g. Pay by Venmo @shop or at the counter.' }) };
    function save() {
      set.depositAmount = f.dep.value.trim(); set.depositHow = f.how.value.trim(); OA.syncPolicyFromAmount(); S.commit(); note(saved, 'Saved');
    }
    Object.keys(f).forEach(function (k) { f[k].addEventListener('change', save); });
    root.appendChild(h('section', { class: 'card narrow' }, h('h2', { text: 'Deposit' }), h('div', { class: 'form-grid' }, ui.field('Deposit amount', f.dep, 'Fills {deposit} in texts.'), ui.field('How clients pay it', f.how, 'Fills {depositHow}. The portal does not take payments.', 'span2')), saved,
      h('div', { class: 'row' }, h('span', { class: 'note', text: 'Google review link: set in Site > Reviews. It fills {reviewLink} in texts.' }), ui.link('Open Reviews', '#/site/reviews', 'btn small quiet'))));
    var VAR_MEANINGS = [
      ['first', 'the client’s first name'], ['shop', 'the shop’s name'], ['artist', 'the artist for that request or appointment'],
      ['quote', 'the price quoted for the piece'], ['deposit', 'the deposit amount, set under Deposit above'],
      ['depositHow', 'how the client pays the deposit, set under Deposit above'], ['date', 'the appointment date'],
      ['time', 'the appointment start time'], ['address', 'the shop’s address'], ['reviewLink', 'your Google review link, set in Site, Reviews']
    ];
    var varList = h('div', { class: 'hint tip-text', hidden: true }, VAR_MEANINGS.map(function (vm) {
      return h('p', { class: 'var-row' }, h('code', { text: '{' + vm[0] + '}' }), h('span', { text: ' — ' + vm[1] }));
    }));
    var varBtn = ui.btn('What the {blanks} mean', function () { varList.hidden = !varList.hidden; varBtn.setAttribute('aria-expanded', String(!varList.hidden)); }, 'small quiet', { 'aria-expanded': 'false' });
    var list = h('section', { class: 'card narrow' }, h('h2', { text: 'Text templates' }), h('p', { class: 'note', text: 'Blanks in curly braces fill in when you open a message.' }), h('div', { class: 'row tight' }, varBtn), varList);
    Object.keys(OA.TEMPLATES).filter(function (k) { return k !== 'blank'; }).forEach(function (k) {
      var ta = ui.area(set.templates[k] || OA.TEMPLATES[k].body, { rows: 3, 'aria-label': OA.TEMPLATES[k].name }), st = h('div', { class: 'saved', 'aria-live': 'polite' });
      ta.addEventListener('change', function () {
        var unknown = (ta.value.match(/\{(\w+)\}/g) || []).filter(function (t) { return VARS.indexOf(t.slice(1, -1)) < 0; });
        if (!ta.value.trim()) { note(st, 'A template cannot be empty. Not saved.', true); return; }
        if (unknown.length) { note(st, 'Unknown blank ' + unknown.join(', ') + '. It would show up as-is in the text. Not saved.', true); return; }
        set.templates[k] = ta.value.trim(); S.commit(); note(st, 'Saved');
      });
      list.appendChild(h('div', { class: 'tpl' }, ui.field(OA.TEMPLATES[k].name, ta), h('div', { class: 'row tight' }, ui.btn('Reset to the original', function () { set.templates[k] = OA.TEMPLATES[k].body; S.commit(); ta.value = OA.TEMPLATES[k].body; note(st, 'Reset'); }, 'small quiet'), st)));
    });
    root.appendChild(list); return root;
  }

  function people() {
    var root = h('section', { class: 'card' }, h('h2', { text: 'Who can sign in' }));
    root.appendChild(h('p', { class: 'note', text: 'Each person signs in with their own username and password. What a person can see and change follows their role.' }));
    var roleTipText = h('div', { class: 'hint tip-text', hidden: true, text: 'Owner: everything, including the site and settings. Front desk: requests, calendar and clients. Artist: only their own chair, their clients and their portfolio.' });
    var roleTipBtn = h('button', { type: 'button', class: 'tip-btn', 'aria-expanded': 'false', 'aria-label': 'What can each role do?', text: '?', on: { click: function () { roleTipText.hidden = !roleTipText.hidden; roleTipBtn.setAttribute('aria-expanded', String(!roleTipText.hidden)); } } });
    root.appendChild(h('div', { class: 'flab' }, h('span', { class: 'note', text: 'What can each role do?' }), roleTipBtn));
    root.appendChild(roleTipText);
    var owners = S.state.people.filter(function (p) { return p.role === 'owner'; }).length;
    var table = h('div', { class: 'ledger' });
    S.state.people.forEach(function (p) {
      var role = ui.select([['owner', ROLE.owner], ['frontdesk', ROLE.frontdesk], ['artist', ROLE.artist]], p.role, { 'aria-label': p.name + ' role' });
      role.addEventListener('change', function () {
        if (p.role === 'owner' && role.value !== 'owner' && owners <= 1) { ui.fail('There has to be at least one owner.'); role.value = 'owner'; return; }
        p.role = role.value; if (p.role !== 'artist') p.artist = ''; S.commit(); OA.rerender();
      });
      var art = p.role === 'artist' ? ui.select(OA.chairs().filter(function (c) { return c.slug !== 'piercing'; }).map(function (c) { return [c.slug, c.name]; }), p.artist, { 'aria-label': p.name + ' chair' }) : null;
      if (art) art.addEventListener('change', function () { p.artist = art.value; S.commit(); });
      table.appendChild(h('div', { class: 'ledger-row person' }, ui.avatar(p.name), h('div', { class: 'lr-main' }, h('strong', { text: p.name }), h('span', { text: p.email })), h('div', { class: 'row tight' }, role, art),
        ui.btn('Remove', function () {
          if (p.role === 'owner' && owners <= 1) { ui.fail('There has to be at least one owner.'); return; }
          ui.confirm('Remove ' + p.name + '?', p.email + ' will no longer be able to sign in once this is live.', 'Remove', true).then(function (ok) { if (ok) { S.state.people = S.state.people.filter(function (x) { return x !== p; }); S.commit(); OA.rerender(); } });
        }, 'small quiet')));
    });
    root.appendChild(table);
    var name = ui.input(''), em = ui.input('', { type: 'email' }), saved = h('div', { class: 'saved', 'aria-live': 'polite' });
    root.appendChild(h('h3', { text: 'Add someone' }));
    root.appendChild(h('div', { class: 'form-grid' }, ui.field('Name', name), ui.field('Email', em)));
    root.appendChild(h('div', { class: 'row' }, ui.btn('Add person', function () {
      if (!name.value.trim() || !/^\S+@\S+\.\S+$/.test(em.value)) { note(saved, 'Add a name and a valid email address.', true); return; }
      if (S.state.people.some(function (p) { return p.email.toLowerCase() === em.value.trim().toLowerCase(); })) { note(saved, 'That email is already on the list.', true); return; }
      S.state.people.push({ id: OA.uid('p'), name: name.value.trim(), email: em.value.trim(), role: 'frontdesk', artist: '' }); S.commit(); OA.rerender();
    }, 'primary'), saved));
    /* Server accounts live below the local list, and only the owner
       account ever sees them: the server enforces that too. */
    if (window.OA_LOCK && OA_LOCK.user && OA_LOCK.user() && OA_LOCK.user().role === 'owner') root.appendChild(accountsBlock());
    return root;
  }

  /* Sign-in accounts on the shop server: requests waiting for the
     owner's yes, and every account with its standing. Approving sets
     the role (and the chair, for an artist) the account signs in with;
     denying deletes the request. An account that stays away 90 days
     pauses itself and waits here for a tap to reactivate it. */
  function accountsBlock() {
    var API = 'https://api.instattoosionalized.net';
    var WROLE = { owner: 'Shop owner', manager: 'Front desk', artist: 'Artist' };
    var WSTATUS = { active: 'Active', pending: 'Waiting for approval', paused: 'Paused after 90 days away' };
    var wrap = h('div', {});
    wrap.appendChild(h('h3', { text: 'Account requests' }));
    var reqList = h('div', { class: 'ledger' });
    wrap.appendChild(reqList);
    wrap.appendChild(h('h3', { text: 'Accounts' }));
    var list = h('div', { class: 'ledger' });
    wrap.appendChild(list);
    var out = h('div', { class: 'saved', 'aria-live': 'polite' });
    wrap.appendChild(out);
    function token() { return window.OA_LOCK && OA_LOCK.token ? OA_LOCK.token() : ''; }
    function call(path, body) {
      return fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, data: d }; }); });
    }
    function decide(body, okMsg) {
      call('/portal-users-decide', Object.assign({ token: token() }, body)).then(function (res) {
        if (res.status === 200 && res.data && res.data.ok) { ui.toast(okMsg); load(); return; }
        note(out, 'That did not go through. Try again.', true);
      }, function () { note(out, 'Could not reach the server. Try again.', true); });
    }
    function paint(users) {
      OA.clear(reqList); OA.clear(list);
      var pending = users.filter(function (u) { return u.status === 'pending'; });
      if (!pending.length) reqList.appendChild(h('p', { class: 'note', text: 'No accounts are waiting for approval.' }));
      pending.forEach(function (u) {
        var role = ui.select([['artist', WROLE.artist], ['manager', WROLE.manager], ['owner', WROLE.owner]], 'artist', { 'aria-label': u.username + ' role' });
        var art = ui.select([['', 'Pick a chair']].concat(OA.chairs().filter(function (c) { return c.slug !== 'piercing'; }).map(function (c) { return [c.slug, c.name]; })), '', { 'aria-label': u.username + ' chair' });
        role.addEventListener('change', function () { art.disabled = role.value !== 'artist'; });
        reqList.appendChild(h('div', { class: 'ledger-row person' },
          h('div', { class: 'lr-main' }, h('strong', { text: u.username }), h('span', { text: 'Asked ' + (u.created_at ? OA.ago(Date.parse(u.created_at)) : '') })),
          h('div', { class: 'row tight' }, role, art,
            ui.btn('Approve', function () { decide({ username: u.username, decision: 'approve', role: role.value, artist: role.value === 'artist' ? art.value : '' }, u.username + ' can sign in now.'); }, 'small primary'),
            ui.btn('Deny', function () {
              ui.confirm('Deny ' + u.username + '?', 'Their request is deleted and they cannot sign in. They can ask again from the sign-in screen.', 'Deny', true).then(function (ok) { if (ok) decide({ username: u.username, decision: 'deny' }, 'Request from ' + u.username + ' denied.'); });
            }, 'small quiet'))));
      });
      if (!users.length) list.appendChild(h('p', { class: 'note', text: 'No accounts yet.' }));
      users.forEach(function (u) {
        var last = u.last_login_at ? 'Last sign-in ' + OA.ago(Date.parse(u.last_login_at)) : 'Never signed in';
        var row = h('div', { class: 'ledger-row person' },
          h('div', { class: 'lr-main' }, h('strong', { text: u.username }), h('span', { text: (WROLE[u.role] || u.role) + (u.artist ? ' · ' + OA.chairName(u.artist) : '') })),
          h('span', { class: 'note', text: (WSTATUS[u.status] || u.status) + ' · ' + last }));
        if (u.status === 'paused') row.appendChild(ui.btn('Reactivate', function () { decide({ username: u.username, decision: 'reactivate' }, u.username + ' can sign in again.'); }, 'small'));
        list.appendChild(row);
      });
    }
    function load() {
      if (!token()) { note(out, 'Sign-in information is not available on this screen.', true); return; }
      call('/portal-users', { token: token() }).then(function (res) {
        if (res.status === 200 && res.data && res.data.ok) { paint(res.data.users || []); return; }
        note(out, 'Could not load the account list.', true);
      }, function () { note(out, 'Could not reach the server.', true); });
    }
    load();
    return wrap;
  }


  function connection() {
    var root = h('div', {}), api = OA.api, st = api.state(), out = h('div', { class: 'saved', 'aria-live': 'polite' });
    var feed = api.status();
    var card = h('section', { class: 'card narrow' }, h('h2', { text: 'Website connection' }),
      h('p', { text: 'What people send through the website form is saved on the shop server. This portal checks that server for new requests on its own, and you can check any time. There is no token to type here: the server sits behind the same sign-in wall as the calendar, and this browser carries its sign-in.' }));
    card.appendChild(h('div', { class: 'row' }, ui.chip(feed.text, feed.kind), feed.detail ? h('span', { class: 'note', text: feed.detail }) : null));
    var row = h('div', { class: 'row' });
    row.appendChild(ui.btn('Check for new requests', function () {
      if (!api.configured()) { note(out, 'There is no server address set on this portal. Nothing was checked.', true); return; }
      note(out, 'Checking\u2026');
      api.pull().then(function (r) { note(out, r.added ? OA.plural(r.added, 'new website request') + ' came in.' : 'No new requests from the website.'); OA.rerender(); }, function (e) { note(out, e.message, true); });
    }, 'primary'));
    card.appendChild(row); card.appendChild(out);
    card.appendChild(h('p', { class: 'note', text: st.lastOk ? 'Last checked for new requests ' + OA.ago(st.lastOk) + '.' : 'Not checked for new requests yet.' }));
    if (st.lastError) card.appendChild(h('p', { class: 'note', text: 'Last problem: ' + st.lastError }));
    root.appendChild(card); return root;
  }

  /* How each artist hears about their appointments. The manager's own route works today; the rest are saved choices that need the server. */
  function delivery() {
    var saved = h('div', { class: 'saved', 'aria-live': 'polite' }), card = h('section', { class: 'card narrow' }, h('h2', { text: 'How each artist gets their schedule' }),
      h('p', { class: 'note', text: 'The calendar in this portal is the schedule. Everyone on the team can see it. This is only how an artist hears about their own appointments. New artists start with Manager tells them, so nobody needs a calendar account. Phone numbers and emails here stay in the portal and never go on the website.' }));
    var chairs = OA.chairs().filter(function (c) { return c.slug !== 'piercing'; });
    if (!chairs.length) card.appendChild(ui.empty('No artists yet', 'Add an artist and they show up here.'));
    chairs.forEach(function (c) {
      var n = OA.notify(c.slug);
      var mode = ui.select(OA.NOTIFY_MODES, n.mode, { 'aria-label': c.name + ' schedule delivery' });
      var phone = ui.input(n.phone, { 'aria-label': c.name + ' phone', placeholder: '10 digits', inputmode: 'tel' });
      var email = ui.input(n.email, { 'aria-label': c.name + ' email', placeholder: 'name@example.com', type: 'email' });
      var why = h('p', { class: 'hint' });
      function paintWhy() { why.textContent = OA.NOTIFY_LIVE[mode.value] ? 'Works now: use Send schedule on the Calendar page.' : OA.NOTIFY_WHY; why.className = 'hint' + (OA.NOTIFY_LIVE[mode.value] ? '' : ' warn'); }
      mode.addEventListener('change', function () { OA.setNotify(c.slug, { mode: mode.value }); paintWhy(); note(saved, 'Saved.'); });
      phone.addEventListener('change', function () { var v = phone.value.trim(); if (v && !OA.phoneOk(v)) { note(saved, OA.PHONE_MSG + ' Not saved.', true); return; } OA.setNotify(c.slug, { phone: v }); note(saved, 'Saved.'); });
      email.addEventListener('change', function () { var v = email.value.trim(); if (v && !OA.emailOk(v)) { note(saved, 'That does not look like an email address. Not saved.', true); return; } OA.setNotify(c.slug, { email: v }); note(saved, 'Saved.'); });
      paintWhy();
      card.appendChild(h('div', { class: 'deliv' }, h('h3', { text: c.name }), h('div', { class: 'form-grid' }, ui.field('How they hear', mode, null, 'span2'), ui.field('Phone for texts', phone), ui.field('Email', email), h('div', { class: 'span2' }, why))));
    });
    card.appendChild(h('div', { class: 'row' }, ui.btn('Send a schedule', function () { OA.sendScheduleDialog(); }, 'primary')));
    card.appendChild(saved); return card;
  }

  function integrations() {
    var st = OA.gcal.status(), root = h('div', {});
    root.appendChild(delivery());
    var head = h('section', { class: 'card narrow' }, h('h2', { text: 'Google Calendar' }), h('div', { class: 'row' }, ui.chip(st.text, 'quiet')),
      h('p', { text: 'Appointments added here are placed on the shop\u2019s master booking calendar, and changes or cancellations here update the same event. The website\u2019s open times are read from that same master book.' }),
      h('p', { class: 'note', text: st.reason }));
    var btn = ui.btn('Check the connection', function () { OA.gcal.connect().catch(function (e) { ui.fail(e.message); }); }, 'primary', { 'aria-describedby': 'gc-why' });
    head.appendChild(h('div', { class: 'row' }, btn, h('span', { id: 'gc-why', class: 'note', text: 'The calendar connection runs on the shop server, not in the browser.' })));
    root.appendChild(head);
    return root;
  }

  function data() {
    var root = h('div', {}), size = 0; try { size = JSON.stringify(S.state).length; } catch (e) { size = 0; }
    var photos = h('span', { text: 'checking...' });
    OA.img.all().then(function (k) { photos.textContent = OA.plural(k.length, 'uploaded photo') + ' stored in this browser'; }).catch(function (e) { photos.textContent = 'Photo storage is not available here: ' + e.message; });
    root.appendChild(h('section', { class: 'card narrow' }, h('h2', { text: 'Where this data lives' }),
      h('p', { text: 'This portal’s working data is kept in this browser, about ' + Math.max(1, Math.round(size / 1024)) + ' KB of settings, requests, appointments and clients, plus ' }), h('p', {}, photos),
      h('p', { class: 'note', text: 'Publishing sends site changes to the live website, and confirmed bookings are kept on the shop’s calendars. Clearing this browser’s data, or using a different browser or device, starts this device fresh.' })));
    var saved = h('div', { class: 'saved', 'aria-live': 'polite' });
    var file = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr', id: 'restore', 'aria-label': 'Choose a backup file' });
    file.addEventListener('change', function () {
      var fl = file.files[0]; file.value = ''; if (!fl) return;
      var rd = new FileReader();
      rd.onerror = function () { note(saved, 'That file could not be read.', true); };
      rd.onload = function () {
        var st; try { st = JSON.parse(rd.result); } catch (e) { note(saved, 'That is not a valid backup file (it is not JSON). Nothing was changed.', true); return; }
        var okShape = st && st.v === 1 && st.site && st.published && ['requests', 'appts', 'clients', 'timeoff', 'people', 'history'].every(function (k) { return Array.isArray(st[k]); }) && st.settings && st.settings.templates;
        if (!okShape) { note(saved, 'That file is not a backup from this portal, or it is from a newer version. Nothing was changed.', true); return; }
        ui.confirm('Replace everything with this backup?', 'Your current data (' + S.state.requests.length + ' requests, ' + S.state.appts.length + ' appointments, ' + S.state.clients.length + ' clients) will be replaced by the backup (' + st.requests.length + ', ' + st.appts.length + ', ' + st.clients.length + '). Download a backup first if you might want it back.', 'Replace with backup', true).then(function (ok) {
          if (!ok) return; S.replace(st); note(saved, S.error ? S.error : 'Backup restored.', !!S.error); OA.rerender();
        });
      };
      rd.readAsText(fl);
    });
    root.appendChild(h('section', { class: 'card narrow' }, h('h2', { text: 'Backup' }),
      h('p', { text: 'A backup is one file with requests, appointments, clients, settings and the site draft.' }),
      h('p', { class: 'note', text: 'It does not include the photo files you uploaded here. Keep the originals.' }),
      h('div', { class: 'row wrap' }, ui.btn('Download backup', function () { OA.download('instattoosionalized-portal-backup-' + OA.todayISO() + '.json', JSON.stringify(S.state, null, 1)); ui.toast('Backup downloaded. Check your Downloads folder.'); }, 'primary'), h('label', { class: 'btn', for: 'restore', text: 'Restore from a backup' }), file), saved));
    root.appendChild(h('section', { class: 'card narrow' }, h('h2', { text: 'This device' }),
      h('p', { text: 'This device keeps its own copy of the portal’s working data in this browser.' }),
      h('div', { class: 'row wrap' },
        ui.btn('Erase this device’s portal data', function () { ui.confirm('Erase this device’s data?', 'Everything stored in this browser is erased and the portal starts empty on this device. Bookings and requests on the shop’s calendars and server are not touched. This cannot be undone.', 'Erase data', true).then(function (ok) { if (ok) { S.reset(); ui.toast('Portal data erased on this device'); OA.go('today'); } }); }, 'danger-quiet'))));
    return root;
  }

  OA.views.settings = {
    title: function (p) { var t = TABS.filter(function (x) { return x[0] === (p[0] || 'messages'); })[0]; return 'Settings: ' + (t ? t[1] : 'Messages'); },
    render: function (parts) {
      var tab = parts[0] || 'messages', root = h('div', { class: 'page' });
      root.appendChild(ui.pageHead('Settings', null, null));
      var sub = h('nav', { class: 'subtabs', 'aria-label': 'Settings sections' });
      TABS.forEach(function (t) { sub.appendChild(ui.link(t[1], '#/settings/' + t[0], 'subtab' + (tab === t[0] ? ' on' : ''))); });
      root.appendChild(sub);
      var v = { messages: messages, people: people, connection: connection, integrations: integrations, data: data }[tab];
      root.appendChild(v ? v() : ui.empty('That section does not exist', null, ui.link('Messages', '#/settings/messages', 'btn primary')));
      return root;
    }
  };
})();
