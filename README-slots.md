# Artist slot URLs: the rules

Every artist gets a permanent, name-free slot address: `/artist1/`, `/artist2/`,
`/artist3/`, assigned in the order they join the roster. `slots.json` in this
folder is the registry: one row per slot, with the artist's roster key, the date
the slot was assigned, and its status.

The rules, settled with Brian on 2026-11-27:

- **A slot number is assigned once and NEVER reused.** A new artist gets the
  next number (artist5 after artist4), even while earlier numbers sit retired.
- **Everything personal lives in the page content, never in the address:**
  name, photos, bio, socials. An artist who renames changes only page content;
  no link anywhere breaks.
- **When an artist leaves, their slot retires.** Set its status in slots.json
  to "retired", run the prerender (scripts/prerender.mjs) so the slot page is
  no longer generated, and add the retired-slot redirect from REDIRECTS.md so
  the address answers with a redirect to the homepage. A retired slot is never
  filled by a different person, so an old shared link can never land on the
  wrong artist.
- **The slot IS the page** at `/artistN/`, no extra path segment.
- An address that never existed gets the site's 404 page. The retired-slot
  redirect is the one exception, on purpose.

The portal keeps publishing by roster key as always. The slot number is a
site-side assignment recorded here, made once at prerender time and never
changed after.
