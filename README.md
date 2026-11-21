# Instattoosionalized

Website and owner portal for Instattoosionalized, tattoos and piercings, 1852 Main St, Northampton, PA.
Built and maintained by 717 Digital Studio.

## Folder layout

```
public/       everything the web serves. This is the website.
  admin/      the owner portal
  next/       staging copy of the site
  scratch/    design mockups
app/          server code (not started)
routes/       the list of API addresses (not started)
database/
  migrations/ database table changes, in order (not started)
config/       shop settings that are not secret (not started)
resources/    source content the pages are built from (not started)
tests/        automated checks (not started)
```

Only `public/` is published. Page addresses are the same as before. The empty folders only mark where things will go.

## Publishing

`.github/workflows/deploy.yml` publishes `public/` when `main` changes. In the repo's Settings > Pages, Source must be set to **GitHub Actions**. If it is still set to deploy from a branch, the site will show nothing, because the files are no longer at the top of the repo.

- Site: `public/instattoosionalized-tattoos-and-piercings.html` (artist pages alongside it)
- Owner portal: `public/admin/`
