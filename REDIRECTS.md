# Redirect rules in the Cloudflare zone

APPLIED 2026-11-27 (rule set 1): all six rules are live in the zone's
http_request_dynamic_redirect ruleset and verified (every old value 301s
to its slot, tagged variants included). One deviation from the original
spec: the zone's plan does not allow the regex "matches" operator (a
Business plan feature), so each rule is per-value and matches the artist
parameter without regex: sole parameter (query eq "artist=<v>"), first
parameter (query contains "artist=<v>&"), or later parameter (query
contains "&artist=<v>"), inside the two old path spellings. Applied by
~/workspace/scratch-navfix/api-setup/cf_apply_redirects.py (idempotent,
appends only missing rules). Rule set 2 below remains a template for
future use. The original spec text follows.

The artist pages moved to stable slot addresses (`/artist1/`, `/artist2/`,
`/artist3/`; see README-slots.md). The old addresses carry the artist in a
query string (`/view/pages/artist?artist=lex`), and Cloudflare Pages
`_redirects` files match on the path only, never on the query string, so
these rules cannot live in a `_redirects` file. They belong in the zone's
Redirect Rules (dashboard: Rules, Redirect Rules, or the bulk-redirects /
`http_request_dynamic_redirect` ruleset through the API), which can match
the query string. Zone rules also run before the Pages origin answers, so
they win over the still-deployed artist.html.

All redirects below are 301 (permanent) and drop the query string: the
target is the full slot address, nothing carried over.

## Rule set 1: old artist query addresses to their slots

One rule per artist. The expression matches both path spellings of the old
page and the artist value as a whole query parameter, so extra parameters
(such as utm tags) do not break the match.

For each row, create a rule:

- **When:** `(http.request.uri.path in {"/view/pages/artist" "/view/pages/artist.html"} and http.request.uri.query matches "(^|&)artist=<VALUE>(&|$)")`
- **Then:** URL redirect, static, `https://instattoosionalized.net/<SLOT>/`, status code 301, preserve query string OFF.

| artist value in the old address | slot |
| --- | --- |
| lex | artist1 |
| alexis | artist1 |
| liv | artist2 |
| olivia | artist2 |
| dawlface | artist3 |
| diana | artist3 |

Both spellings of each artist are listed: the site's own links used the
roster keys (lex, liv, dawlface), the sitemap and shared links used the
page variables of the day (alexis, olivia), and diana is the retired page
variable of the artist now called Dawlface.

The bare old address with no artist parameter (`/view/pages/artist` on its
own) is not redirected: it still serves the roster page, which is a fine
landing spot and keeps working for anything that links to it.

## Rule set 2: a retired slot goes home (template for future use)

When an artist leaves and their slot retires (status in slots.json set to
"retired", prerender re-run so the slot page is no longer generated), add
one rule for that slot:

- **When:** `(http.request.uri.path in {"/artistN" "/artistN/"})`
- **Then:** URL redirect, static, `https://instattoosionalized.net/`, status code 301, preserve query string OFF.

This is the one deliberate exception to the site's 404 page: an address
that belonged to a real artist sends people home, while an address that
never existed answers 404.

## Order and notes

- The two rule sets touch different paths, so their order relative to each
  other does not matter.
- Do not add a rule for a slot while it is active; the redirect would
  shadow the live page.
- If an artist is ever renamed again, nothing here changes: the slot
  address carries no name, and the new page variable is covered by adding
  one row to rule set 1 for the old variable.
