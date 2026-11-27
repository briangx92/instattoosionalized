/* Settings: the words in texts, who can sign in, and the data itself. */
(function () {
  'use strict';
  var OA = window.OA, h = OA.h, S = OA.store, ui = OA.ui, act = OA.act;
  var TABS = [['messages', 'Messages'], ['people', 'Accounts'], ['connection', 'Website connection'], ['integrations', 'Schedules'], ['data', 'Data and backup']];
  var VARS = ['first', 'shop', 'artist', 'quote', 'deposit', 'depositHow', 'date', 'time', 'address', 'reviewLink'];
  var ROLE = { owner: 'Admin', artist: 'Artist' };

  function note(el, msg, bad) { el.className = 'saved' + (bad ? ' bad' : ''); el.textContent = msg; }

  function messages() {
    var set = S.state.settings, root = h('div', {}), saved = h('div', { class: 'saved', 'aria-live': 'polite' });
    var f = { dep: OA.moneyInput(set.depositAmount, { placeholder: '$40' }), how: ui.input(set.depositHow, { placeholder: 'e.g. Pay by Venmo @shop or at the counter.' }) };
    function save() {
      set.depositAmount = OA.money(f.dep.value); set.depositHow = f.how.value.trim(); OA.syncPolicyFromAmount(); S.commit(); note(saved, 'Saved');
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

  /* One Accounts list (Brian's sketch + roles wizard, 2026-11-27):
     the shop's server accounts and its local people in one card,
     under one heading, with what each role can do behind the info
     button. A new account, once approved below, appears in the list
     with everyone else. The roles are Admin and Artist; the Front
     desk role is retired. */
  function people() {
    var isOwner = !!(window.OA_LOCK && OA_LOCK.user && OA_LOCK.user() && OA_LOCK.user().role === 'owner');
    var root = h('section', { class: 'card' });
    var roleTipText = h('div', { class: 'hint tip-text', hidden: true, text: 'Admin: everything, including the site and settings. Artist: only their own chair, their clients and their portfolio.' });
    var roleTipBtn = h('button', { type: 'button', class: 'tip-btn', 'aria-expanded': 'false', 'aria-label': 'What can each role do?', text: '?', on: { click: function () { roleTipText.hidden = !roleTipText.hidden; roleTipBtn.setAttribute('aria-expanded', String(!roleTipText.hidden)); } } });
    var head = h('h2', { text: 'Accounts' });
    head.appendChild(roleTipBtn);
    root.appendChild(head);
    root.appendChild(roleTipText);
    var acctLedger = h('div', { class: 'ledger' });
    if (isOwner) root.appendChild(acctLedger);
    /* The accounts ARE the list (Brian, 2026-11-27, voice call): one
       row per signed-up person carrying their role, chair, email,
       password change and remove. The old local people ledger that
       sat under the accounts listed the same faces a second time and
       drove nothing else in the portal, so its rows are gone from
       this card. The Add someone form went in the same call: it
       only ever fed that local list, and once Brian weighed it
       against the real new-account flow (a person asks, an admin
       approves, they land in the accounts above) he ruled it
       redundant. Only an
       admin account ever sees this block: the server enforces that
       too. */
    if (isOwner) root.appendChild(accountsBlock(acctLedger));
    return root;
  }

  /* Sign-in accounts on the shop server: requests waiting for an
     admin's yes, and every account with its standing, painted into
     the Accounts list at the top of the card. Approving sets the
     role (and the chair, for an artist) the account signs in with;
     denying deletes the request. An account that stays away 90 days
     pauses itself and waits here for a tap to reactivate it. When an
     artist leaves, Remove is the revocation: no sign-in, no live
     session, and the tap here can undo it. Their appointments stay
     on the calendar for the shop to reassign or cancel. Change
     password is the admin-driven path: the admin sets a new one,
     the old sessions end, and the person signs back in with it. The
     reset codes list is the person's own path: someone who forgot
     asks from the sign-in screen, the code waits here with the code
     itself showing (the admin reads it out in the shop; there is no
     email channel), and it leaves the list when it is spent, runs
     out, or the admin cancels it. */
  function accountsBlock(acctLedger) {
    var API = 'https://api.instattoosionalized.net';
    var WSTATUS = { active: 'Active', paused: 'Paused after 90 days away', removed: 'Deactivated' };
    var wrap = h('div', {});
    wrap.appendChild(h('h3', { text: 'Account requests' }));
    var reqList = h('div', { class: 'ledger' });
    wrap.appendChild(reqList);
    wrap.appendChild(h('h3', { text: 'Password reset codes' }));
    var codeList = h('div', { class: 'ledger' });
    wrap.appendChild(codeList);
    var out = h('div', { class: 'saved', 'aria-live': 'polite' });
    wrap.appendChild(out);
    var lastUsers = [];
    function token() { return window.OA_LOCK && OA_LOCK.token ? OA_LOCK.token() : ''; }
    function call(path, body) {
      return fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, data: d }; }); });
    }
    function decide(body, okMsg) {
      call('/portal-users-decide', Object.assign({ token: token() }, body)).then(function (res) {
        if (res.status === 200 && res.data && res.data.ok) { ui.toast(okMsg); load(); return; }
        if (res.data && res.data.error === 'artist_required') { note(out, 'Pick a chair for the artist first.', true); return; }
        note(out, 'That did not go through. Try again.', true);
      }, function () { note(out, 'Could not reach the server. Try again.', true); });
    }
    /* Role changes and email edits get their own errors worth naming,
       so they do not ride decide(): the list repaints from the server
       either way, and a refusal says what happened. */
    function decideRole(u, role, artist) {
      call('/portal-users-decide', { token: token(), username: u.username, decision: 'set_role', role: role, artist: artist }).then(function (res) {
        if (res.status === 200 && res.data && res.data.ok) {
          var me = window.OA_LOCK && OA_LOCK.user && OA_LOCK.user();
          if (me && me.username === u.username && role !== (u.role === 'artist' ? 'artist' : 'owner')) {
            ui.toast('Your role changed. Sign back in to use it.');
            if (window.OA_LOCK && OA_LOCK.signOut) OA_LOCK.signOut();
            return;
          }
          ui.toast(u.username + ' is now ' + (role === 'owner' ? 'an admin' : 'an artist') + '.'); load(); return;
        }
        var errs = { last_owner: 'There has to be at least one admin.', invalid_role: 'That role is not one the portal uses.', not_active: 'That account is not active, so its role cannot change.', artist_required: 'Pick a chair for the artist first.' };
        ui.fail(errs[res.data && res.data.error] || 'That did not go through. Try again.');
        load();
      }, function () { ui.fail('Could not reach the server. Try again.'); load(); });
    }
    function decideEmail(u, email, field) {
      call('/portal-users-decide', { token: token(), username: u.username, decision: 'set_email', email: email }).then(function (res) {
        if (res.status === 200 && res.data && res.data.ok) { u.email = email; ui.toast('Email saved for ' + u.username + '.'); return; }
        var errs = { invalid_email: 'That does not look like an email address. Not saved.', email_unavailable: 'Email cannot be saved for accounts yet. Tell Brian.' };
        ui.fail(errs[res.data && res.data.error] || 'That did not go through. Try again.');
        field.value = u.email || '';
      }, function () { ui.fail('Could not reach the server. Try again.'); field.value = u.email || ''; });
    }
    /* Renaming an account gets its own errors worth naming, like the
       role and email edits. The field asks first: a rename signs the
       person out everywhere, so a stray edit should not fire it. */
    function decideUsername(u, next, field) {
      call('/portal-users-decide', { token: token(), username: u.username, decision: 'set_username', new_username: next }).then(function (res) {
        if (res.status === 200 && res.data && res.data.ok) {
          var me = window.OA_LOCK && OA_LOCK.user && OA_LOCK.user();
          if (me && me.username === u.username) {
            ui.toast('Your name is now ' + next + '. Sign back in with it.');
            if (window.OA_LOCK && OA_LOCK.signOut) OA_LOCK.signOut();
            return;
          }
          ui.toast(u.username + ' is now ' + next + '.'); load(); return;
        }
        var errs = { username_taken: 'That name is already taken.', invalid_username: 'Names are at least 3 characters: lowercase letters, numbers, dots, dashes, underscores.', not_active: 'That account is not active, so its name cannot change.', not_authorized: 'Your sign-in is no longer an admin sign-in. Sign in again and try from there.', rate_limited: 'Too many tries from this address. Wait a while and try again.' };
        ui.fail(errs[res.data && res.data.error] || 'That did not go through. Try again.');
        field.value = u.username;
      }, function () { ui.fail('Could not reach the server. Try again.'); field.value = u.username; });
    }
    /* Removing an admin takes that account's own password (Brian,
       2026-11-27: not a hard lockout, the password makes it official),
       so admin rows get a password dialog instead of the plain
       confirm artists get. A wrong password keeps the dialog open
       and says so. */
    function removeAccount(u) {
      if (u.role !== 'owner') {
        ui.confirm('Remove ' + u.username + '?', 'They cannot sign in, and a session they already have open stops working. Their appointments stay on the calendar for the shop to reassign or cancel. You can bring the account back here.', 'Remove', true).then(function (ok) { if (ok) decide({ username: u.username, decision: 'deactivate' }, u.username + ' can no longer sign in.'); });
        return;
      }
      var pw = ui.input('', { type: 'password', autocomplete: 'current-password', 'aria-label': u.username + "'s password" });
      var flight = null;
      ui.dialog({
        title: 'Remove ' + u.username + '?',
        body: h('div', { class: 'form-grid' },
          ui.field(u.username + "'s password", pw, 'Removing an admin takes the account\'s own password. That is what makes it official. They cannot sign in afterward, and you can bring the account back here.')),
        actions: [
          { label: 'Cancel', kind: 'quiet', value: null },
          { label: 'Remove', kind: 'danger', run: function () {
            if (!pw.value) return { error: 'Type ' + u.username + "'s password." };
            /* One removal in flight at a time: a second click while
               the first call is still out returns the same promise
               instead of sending a second deactivate. */
            if (!flight) flight = call('/portal-users-decide', { token: token(), username: u.username, decision: 'deactivate', password: pw.value }).then(function (res) {
              if (res.status === 200 && res.data && res.data.ok) return 'removed';
              flight = null;
              var errs = { wrong_password: 'That is not ' + u.username + "'s password.", last_owner: 'There has to be at least one admin.', not_active: 'That account is not active.', not_authorized: 'Your sign-in is no longer an admin sign-in. Sign in again and try from there.', rate_limited: 'Too many tries from this address. Wait a while and try again.' };
              return { error: errs[res.data && res.data.error] || 'That did not go through. Try again.' };
            }, function () { flight = null; return { error: 'Could not reach the server. Try again.' }; });
            return flight;
          } }
        ]
      }).then(function (v) {
        if (v !== 'removed') return;
        var me = window.OA_LOCK && OA_LOCK.user && OA_LOCK.user();
        if (me && me.username === u.username) { ui.toast('Your account is removed. You are signed out.'); if (window.OA_LOCK && OA_LOCK.signOut) OA_LOCK.signOut(); return; }
        ui.toast(u.username + ' can no longer sign in.');
        load();
      });
    }
    /* Demoting another admin takes that admin's own password, the
       same one rule as removing one (Brian's ruling, 2026-11-27):
       the picker change opens this dialog instead of the plain
       confirm self-demotion gets, and a wrong password keeps the
       dialog open and says so. */
    function demoteAdmin(u, artist) {
      var pw = ui.input('', { type: 'password', autocomplete: 'current-password', 'aria-label': u.username + "'s password" });
      var flight = null;
      ui.dialog({
        title: 'Make ' + u.username + ' an artist?',
        body: h('div', { class: 'form-grid' },
          ui.field(u.username + "'s password", pw, 'They lose admin access: no Settings, no site controls, no accounts. They sign back in as an artist. Demoting an admin takes the account\'s own password. That is what makes it official.')),
        actions: [
          { label: 'Cancel', kind: 'quiet', value: null },
          { label: 'Make artist', kind: 'danger', run: function () {
            if (!pw.value) return { error: 'Type ' + u.username + "'s password." };
            if (!flight) flight = call('/portal-users-decide', { token: token(), username: u.username, decision: 'set_role', role: 'artist', artist: artist, password: pw.value }).then(function (res) {
              if (res.status === 200 && res.data && res.data.ok) return 'demoted';
              flight = null;
              var errs = { wrong_password: 'That is not ' + u.username + "'s password.", last_owner: 'There has to be at least one admin.', not_active: 'That account is not active.', not_authorized: 'Your sign-in is no longer an admin sign-in. Sign in again and try from there.', rate_limited: 'Too many tries from this address. Wait a while and try again.' };
              return { error: errs[res.data && res.data.error] || 'That did not go through. Try again.' };
            }, function () { flight = null; return { error: 'Could not reach the server. Try again.' }; });
            return flight;
          } }
        ]
      }).then(function (v) {
        if (v === 'demoted') ui.toast(u.username + ' is now an artist.');
        load();
      });
    }
    /* Changing a password is a decide call with its own errors worth
       naming (too short, not active), so it does not ride decide():
       the dialog stays open on a refusal and says what happened. A
       change signs the person out everywhere, including the admin
       changing their own: the toast says so and there is no reload
       to attempt with the dead session. Changing ANOTHER admin's
       password also takes that admin's current password (the same
       one rule as removal and demotion), asked for in the dialog. */
    function resetPassword(u) {
      var me0 = window.OA_LOCK && OA_LOCK.user && OA_LOCK.user();
      var gated = u.role === 'owner' && !(me0 && me0.username === u.username);
      var cur = gated ? ui.input('', { type: 'password', autocomplete: 'current-password', 'aria-label': u.username + "'s current password" }) : null;
      var pw = ui.input('', { type: 'password', autocomplete: 'new-password', 'aria-label': 'New password for ' + u.username });
      var pw2 = ui.input('', { type: 'password', autocomplete: 'new-password', 'aria-label': 'New password for ' + u.username + ', typed again' });
      var grid = h('div', { class: 'form-grid' });
      if (gated) grid.appendChild(ui.field(u.username + "'s current password", cur, 'Changing an admin\'s password takes their current password too. That is what makes it official.'));
      grid.appendChild(ui.field('New password', pw, 'At least 10 characters. ' + u.username + ' is signed out everywhere and signs back in with this password.'));
      grid.appendChild(ui.field('Type it again', pw2));
      ui.dialog({
        title: 'Change password for ' + u.username,
        body: grid,
        actions: [
          { label: 'Cancel', kind: 'quiet', value: null },
          { label: 'Set password', kind: 'primary', run: function () {
            if (gated && !cur.value) return { error: 'Type ' + u.username + "'s current password." };
            if (pw.value !== pw2.value) return { error: 'The two passwords do not match.' };
            var body = { token: token(), username: u.username, decision: 'reset_password', password: pw.value };
            if (gated) body.current_password = cur.value;
            return call('/portal-users-decide', body).then(function (res) {
              if (res.status === 200 && res.data && res.data.ok) return 'reset';
              var errs = { wrong_password: 'That is not ' + u.username + "'s current password.", password_too_short: 'Passwords need at least 10 characters.', not_active: 'That account is not active, so its password cannot be changed.', no_such_user: 'That account is no longer there.', not_authorized: 'Only an admin can change a password.', rate_limited: 'Too many tries from this address. Wait a while and try again.' };
              return { error: errs[res.data && res.data.error] || 'That did not go through. Try again.' };
            }, function () { return { error: 'Could not reach the server. Try again.' }; });
          } }
        ]
      }).then(function (v) {
        if (v !== 'reset') return;
        var me = window.OA_LOCK && OA_LOCK.user && OA_LOCK.user();
        if (me && me.username === u.username) { ui.toast('Your password is changed. Sign back in with the new password.'); return; }
        ui.toast(u.username + ' can sign in with the new password now.');
        load();
      });
    }
    function codeLeft(expires) {
      var ms = Date.parse(expires) - Date.now();
      if (!(ms > 0)) return 'about to run out';
      var mins = Math.round(ms / 60000);
      return mins <= 1 ? 'under a minute left' : 'about ' + mins + ' minutes left';
    }
    function justAdded(u) { return !!u.created_at && (Date.now() - Date.parse(u.created_at)) < 24 * 3600 * 1000; }
    function paint(users, resetCodes) {
      lastUsers = users;
      OA.clear(reqList); OA.clear(acctLedger); OA.clear(codeList);
      var pending = users.filter(function (u) { return u.status === 'pending'; });
      if (!pending.length) reqList.appendChild(h('p', { class: 'note', text: 'No accounts are waiting for approval.' }));
      pending.forEach(function (u) {
        var role = ui.select([['artist', ROLE.artist], ['owner', ROLE.owner]], 'artist', { 'aria-label': u.username + ' role' });
        var art = ui.select([['', 'Pick a chair']].concat(OA.chairs().filter(function (c) { return c.slug !== 'piercing'; }).map(function (c) { return [c.slug, c.name]; })), '', { 'aria-label': u.username + ' chair' });
        role.addEventListener('change', function () { art.hidden = role.value !== 'artist'; });
        reqList.appendChild(h('div', { class: 'ledger-row acct' },
          h('div', { class: 'lr-main' }, h('strong', { text: u.username }), h('span', { text: 'Asked ' + (u.created_at ? OA.ago(Date.parse(u.created_at)) : '') })),
          h('div', { class: 'row tight' }, role, art,
            ui.btn('Approve', function () { decide({ username: u.username, decision: 'approve', role: role.value, artist: role.value === 'artist' ? art.value : '' }, u.username + ' can sign in now.'); }, 'small primary'),
            ui.btn('Deny', function () {
              ui.confirm('Deny ' + u.username + '?', 'Their request is deleted and they cannot sign in. They can ask again from the sign-in screen.', 'Deny', true).then(function (ok) { if (ok) decide({ username: u.username, decision: 'deny' }, 'Request from ' + u.username + ' denied.'); });
            }, 'small quiet'))));
      });
      var accounts = users.filter(function (u) { return u.status !== 'pending'; });
      if (!accounts.length) acctLedger.appendChild(h('p', { class: 'note', text: 'No accounts yet.' }));
      accounts.forEach(function (u) {
        var last = u.last_login_at ? 'Last sign-in ' + OA.ago(Date.parse(u.last_login_at)) : 'Never signed in';
        var role = ui.select([['owner', ROLE.owner], ['artist', ROLE.artist]], u.role === 'artist' ? 'artist' : 'owner', { 'aria-label': u.username + ' role' });
        var art = ui.select([['', 'Pick a chair']].concat(OA.chairs().filter(function (c) { return c.slug !== 'piercing'; }).map(function (c) { return [c.slug, c.name]; })), u.artist || '', { 'aria-label': u.username + ' chair' });
        art.hidden = role.value !== 'artist';
        function sendRole() {
          var next = role.value;
          if (next === 'artist' && !art.value) { ui.fail('Pick their chair first. The role changes once a chair is chosen.'); return; }
          if (u.role === 'owner' && next !== 'owner' && lastUsers.filter(function (x) { return x.role === 'owner' && x.status === 'active'; }).length <= 1) { ui.fail('There has to be at least one admin.'); load(); return; }
          if (u.role === 'owner' && next === 'artist') {
            var me = window.OA_LOCK && OA_LOCK.user && OA_LOCK.user();
            if (me && me.username !== u.username) { demoteAdmin(u, art.value); return; }
            ui.confirm('Make ' + u.username + ' an artist?', 'They lose admin access: no Settings, no site controls, no accounts. They sign back in as an artist.', 'Make artist', false).then(function (ok) { if (ok) decideRole(u, next, art.value); });
            return;
          }
          decideRole(u, next, next === 'artist' ? art.value : '');
        }
        role.addEventListener('change', function () { art.hidden = role.value !== 'artist'; if (role.value === 'artist' && !art.value) { ui.fail('Pick their chair. The role changes once a chair is chosen.'); return; } sendRole(); });
        art.addEventListener('change', function () { if (role.value === 'artist') sendRole(); });
        var email = ui.input(u.email || '', { type: 'email', 'aria-label': u.username + ' email' });
        email.addEventListener('change', function () {
          var v = email.value.trim();
          if (v === (u.email || '')) return;
          if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { ui.fail('That does not look like an email address. Not saved.'); email.value = u.email || ''; return; }
          decideEmail(u, v, email);
        });
        var nameNode;
        if (u.status === 'active' || u.status === 'paused') {
          var nameField = ui.input(u.username, { 'aria-label': u.username + ' username' });
          nameField.addEventListener('change', function () {
            var v = nameField.value.trim().toLowerCase();
            if (v === u.username) { nameField.value = u.username; return; }
            if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(v)) { ui.fail('Names are at least 3 characters: lowercase letters, numbers, dots, dashes, underscores.'); nameField.value = u.username; return; }
            ui.confirm('Rename ' + u.username + ' to ' + v + '?', u.username + ' is signed out everywhere and signs back in as ' + v + '.', 'Rename', false).then(function (ok) {
              if (ok) decideUsername(u, v, nameField); else nameField.value = u.username;
            });
          });
          nameNode = nameField;
        } else {
          nameNode = h('strong', { text: u.username });
        }
        var main = h('div', { class: 'lr-main' }, nameNode, email,
          h('span', { text: (WSTATUS[u.status] || u.status) + ' · ' + last }));
        if (justAdded(u)) main.appendChild(ui.chip('Just added', 'ok'));
        var side = h('div', { class: 'row tight' }, role, art);
        var btns = h('div', { class: 'row tight' });
        var row = h('div', { class: 'ledger-row acct' }, main, side, btns);
        if (u.status === 'paused' || u.status === 'removed') btns.appendChild(ui.btn('Reactivate', function () { decide({ username: u.username, decision: 'reactivate' }, u.username + ' can sign in again.'); }, 'small'));
        if (u.status === 'active' || u.status === 'paused') btns.appendChild(ui.btn('Remove', function () { removeAccount(u); }, 'small danger-quiet'));
        if (u.status === 'active' || u.status === 'paused') btns.appendChild(ui.btn('Change password', function () { resetPassword(u); }, 'small'));
        acctLedger.appendChild(row);
      });
      if (!resetCodes.length) codeList.appendChild(h('p', { class: 'note', text: 'No one is waiting on a reset code.' }));
      resetCodes.forEach(function (rc) {
        var side = h('div', { class: 'row tight' },
          ui.btn('Cancel', function () { decide({ username: rc.username, decision: 'cancel_reset' }, 'The reset code for ' + rc.username + ' is cancelled.'); }, 'small danger-quiet'));
        codeList.appendChild(h('div', { class: 'ledger-row acct' },
          h('div', { class: 'lr-main' }, h('strong', { text: rc.username }), h('span', { text: 'Code ' + rc.code + ' · ' + codeLeft(rc.expires_at) })),
          side));
      });
    }
    function load() {
      if (!token()) { note(out, 'Sign-in information is not available on this screen.', true); return; }
      call('/portal-users', { token: token() }).then(function (res) {
        if (res.status === 200 && res.data && res.data.ok) { paint(res.data.users || [], res.data.reset_codes || []); return; }
        note(out, 'Could not load the account list.', true);
      }, function () { note(out, 'Could not reach the server.', true); });
    }
    load();
    return wrap;
  }

  function connection() {
    var root = h('div', {}), api = OA.api, st = api.state();
    var feed = api.status();
    var card = h('section', { class: 'card narrow' }, h('h2', { text: 'Website connection' }),
      h('p', { text: 'What people send through the website form is saved on the shop server. This portal checks that server for new requests on its own. To check right away, use Check for new requests on the Requests page. There is no token to type here: the server sits behind the same sign-in wall as the calendar, and this browser carries its sign-in.' }));
    card.appendChild(h('div', { class: 'row' }, ui.chip(feed.text, feed.kind), feed.detail ? h('span', { class: 'note', text: feed.detail }) : null));
    card.appendChild(h('p', { class: 'note', text: st.lastOk ? 'Last checked for new requests ' + OA.ago(st.lastOk) + '.' : 'Not checked for new requests yet.' }));
    if (st.lastError) card.appendChild(h('p', { class: 'note', text: 'Last problem: ' + st.lastError }));
    root.appendChild(card); return root;
  }

  /* How each artist hears about their appointments. One list for the whole shop;
     Edit opens that artist's full setting in place. The management route works
     today; the rest are saved choices that need the server. */
  function delivery() {
    var saved = h('div', { class: 'saved', 'aria-live': 'polite' }), card = h('section', { class: 'card narrow' }, h('h2', { text: 'How each artist gets their schedule' }),
      h('p', { class: 'note', text: 'The calendar in this portal is the schedule. Everyone on the team can see it. This is only how an artist hears about their own appointments. New artists start with Management, so nobody needs a calendar account. Phone numbers and emails here stay in the portal and never go on the website.' }));
    var chairs = OA.chairs().filter(function (c) { return c.slug !== 'piercing'; });
    if (!chairs.length) card.appendChild(ui.empty('No artists yet', 'Add an artist and they show up here.'));
    var openEditor = null, openBtn = null;
    function modeLabel(value) { var m = OA.NOTIFY_MODES.filter(function (x) { return x[0] === value; })[0]; return m ? m[1] : value; }
    chairs.forEach(function (c) {
      var n = OA.notify(c.slug);
      var label = h('span', { class: 'note', text: modeLabel(n.mode) });
      var chip = ui.chip('', '');
      function paintSummary() {
        var cur = OA.notify(c.slug), live = !!OA.NOTIFY_LIVE[cur.mode];
        label.textContent = modeLabel(cur.mode);
        chip.textContent = live ? 'Works now' : 'Needs the server';
        chip.className = 'chip ' + (live ? 'ok' : 'warn');
      }
      var mode = ui.select(OA.NOTIFY_MODES, n.mode, { 'aria-label': c.name + ' schedule delivery' });
      var phone = ui.input(n.phone, { 'aria-label': c.name + ' phone', placeholder: '10 digits', inputmode: 'tel' });
      var email = ui.input(n.email, { 'aria-label': c.name + ' email', placeholder: 'name@example.com', type: 'email' });
      var why = h('p', { class: 'hint' });
      function paintWhy() { why.textContent = OA.NOTIFY_LIVE[mode.value] ? 'Works now: use Send schedule on the Calendar page.' : OA.NOTIFY_WHY; why.className = 'hint' + (OA.NOTIFY_LIVE[mode.value] ? '' : ' warn'); }
      mode.addEventListener('change', function () { OA.setNotify(c.slug, { mode: mode.value }); paintWhy(); paintSummary(); note(saved, 'Saved.'); });
      phone.addEventListener('change', function () { var v = phone.value.trim(); if (v && !OA.phoneOk(v)) { note(saved, OA.PHONE_MSG + ' Not saved.', true); return; } OA.setNotify(c.slug, { phone: v }); note(saved, 'Saved.'); });
      email.addEventListener('change', function () { var v = email.value.trim(); if (v && !OA.emailOk(v)) { note(saved, 'That does not look like an email address. Not saved.', true); return; } OA.setNotify(c.slug, { email: v }); note(saved, 'Saved.'); });
      paintWhy(); paintSummary();
      var editor = h('div', { class: 'form-grid', hidden: 'hidden' }, ui.field('How they hear', mode, null, 'span2'), ui.field('Phone', phone), ui.field('Email', email), h('div', { class: 'span2' }, why));
      var btn = ui.btn('Edit', function () {
        var opening = !!editor.hidden;
        if (openEditor && openEditor !== editor) { openEditor.hidden = true; if (openBtn) openBtn.textContent = 'Edit'; }
        editor.hidden = !opening;
        btn.textContent = opening ? 'Close' : 'Edit';
        openEditor = opening ? editor : null; openBtn = opening ? btn : null;
      }, 'small');
      var head = h('div', { class: 'row' }, h('h3', { text: c.name, style: 'margin:0' }), label, chip, h('span', { style: 'margin-left:auto' }, btn));
      card.appendChild(h('div', { class: 'deliv' }, head, editor));
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

  function fmtBytes(n) {
    if (!isFinite(n) || n < 0) n = 0;
    var units = ['B', 'KB', 'MB', 'GB'], i = 0, v = n;
    while (v >= 1024 && i < units.length - 1) { v = v / 1024; i++; }
    var r = i === 0 ? v : Math.round(v * 10) / 10;
    if (r >= 1024 && i < units.length - 1) { i++; r = 1; }
    return r + ' ' + units[i];
  }

  function data() {
    var root = h('div', {}), size = 0; try { size = JSON.stringify(S.state).length; } catch (e) { size = 0; }
    root.appendChild(h('section', { class: 'card narrow' }, h('h2', { text: 'Where this data lives' }),
      h('p', { text: 'This portal’s working data is kept in this browser, about ' + Math.max(1, Math.round(size / 1024)) + ' KB of settings, requests, appointments and clients.' }),
      h('p', { class: 'note', text: 'Publishing sends site changes to the live website, and confirmed bookings are kept on the shop’s calendars. Clearing this browser’s data, or using a different browser or device, starts this device fresh.' })));
    var saved = h('div', { class: 'saved', 'aria-live': 'polite' });
    var file = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr', id: 'restore', 'aria-label': 'Choose a records backup file' });
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
      h('p', { text: 'A backup is one file with the portal’s records: requests, appointments, clients, settings and the site draft.' }),
      h('p', { class: 'note', text: 'It does not include photos. Photos have their own backup below.' }),
      h('div', { class: 'row wrap' }, ui.btn('Download records backup', function () { OA.download('instattoosionalized-portal-records-backup-' + OA.todayISO() + '.json', JSON.stringify(S.state, null, 1)); ui.toast('Records backup downloaded. Check your Downloads folder.'); }, 'primary'), h('label', { class: 'btn', for: 'restore', text: 'Restore records from a backup' }), file), saved));
    var photoCount = h('p', { class: 'note', text: 'Checking...' });
    /* CF-STORAGE-PLACEHOLDER: when Cloudflare photo storage (R2) is turned on
       for the shop, fetch the real usage from the Worker and set cfUsage's text
       here: the amount used of the free 10 GB. Until then it reads not turned on. */
    var cfUsage = h('p', { class: 'note', text: 'Website photo storage in Cloudflare: not turned on yet.' });
    var photoCard = h('section', { class: 'card narrow' }, h('h2', { text: 'Photos' }),
      h('p', { text: 'Photos uploaded in this portal are stored in this browser. They are not in the records backup above. Download them here to keep a copy of your own.' }),
      photoCount,
      h('p', { class: 'note', text: 'Photos published to the website are stored in the shop’s Cloudflare account instead. The first 10 GB there is free. Past 10 GB, Cloudflare starts charging for storage.' }),
      cfUsage,
      h('div', { class: 'row wrap' }, ui.btn('Download all photos', function () {
        OA.img.all().then(function (keys) {
          if (!keys.length) { ui.toast('No photos are stored in this browser.'); return; }
          ui.toast('Downloading ' + OA.plural(keys.length, 'photo') + '. Your browser may ask to allow more than one download.');
          var exts = { 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
          var settled = 0, failed = 0;
          keys.forEach(function (k, i) {
            OA.img.blob(k).then(function (b) {
              if (!b) { failed++; return; }
              var u = URL.createObjectURL(b), a = h('a', { href: u, download: 'portal-photo-' + (i + 1) + '.' + (exts[b.type] || 'jpg') });
              document.body.appendChild(a); a.click(); a.remove();
              setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
            }).catch(function () { failed++; }).then(function () {
              settled++;
              if (settled === keys.length && failed) ui.toast(failed === 1 ? '1 photo could not be read and was not downloaded.' : failed + ' photos could not be read and were not downloaded.');
            });
          });
        }).catch(function (e) { ui.fail(e.message); });
      }, 'primary')));
    OA.img.all().then(function (keys) {
      if (!keys.length) { photoCount.textContent = 'No photos stored in this browser yet.'; return; }
      Promise.all(keys.map(function (k) { return OA.img.blob(k); })).then(function (blobs) {
        var bytes = blobs.reduce(function (t, b) { return t + (b ? b.size : 0); }, 0);
        photoCount.textContent = OA.plural(keys.length, 'uploaded photo') + ' stored in this browser, using about ' + fmtBytes(bytes) + ' of this device’s storage.';
      }).catch(function () { photoCount.textContent = OA.plural(keys.length, 'uploaded photo') + ' stored in this browser.'; });
    }).catch(function (e) { photoCount.textContent = 'Photo storage is not available here: ' + e.message; });
    root.appendChild(photoCard);
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
