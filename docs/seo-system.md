# SEO System Architecture

This project now uses a data-driven SEO architecture for bilingual landing pages and programmatic profession pages.

## Core Files

- `lib/seo/config.ts`
  - Base URL helpers
  - locale helpers
  - canonical + hreflang alternates helper
- `lib/seo/landing-pages.ts`
  - TR/EN landing page definitions (content + metadata fields)
- `lib/seo/professions.ts`
  - profession seed data for programmatic pages
- `app/sitemap.ts`
  - dynamic sitemap including:
    - static pages
    - bilingual landing pages
    - programmatic list pages
    - programmatic profession detail pages
    - blog pages
- `app/robots.ts`
  - crawl directives + sitemap reference

## URL Structure

- Locale hubs:
  - `/en`
  - `/tr`
- Bilingual SEO landing pages:
  - `/en/{landing-slug}`
  - `/tr/{landing-slug}`
- Programmatic collections:
  - `/en/resume-examples`
  - `/tr/cv-ornekleri`
- Programmatic profession pages:
  - `/en/resume-examples/{profession-slug}`
  - `/tr/cv-ornekleri/{profession-slug}`

## Add a New Landing Page

1. Open `lib/seo/landing-pages.ts`.
2. Add one EN record and one TR record with the same `key`.
3. Ensure both records have unique localized `slug` values.
4. The page is automatically included in:
   - static generation
   - metadata
   - hreflang alternates
   - sitemap

## Add a New Profession Page

1. Open `lib/seo/professions.ts`.
2. Add a new `professionSeeds` item with:
   - `slug`
   - localized role names
   - localized summary
   - localized skills
   - localized achievement ideas
3. The profession page is automatically included in:
   - `/en/resume-examples/{slug}`
   - `/tr/cv-ornekleri/{slug}`
   - metadata alternates
   - sitemap

## Redirect Mapping

Legacy keyword slugs are mapped in `next.config.mjs` to the new SEO paths using permanent redirects (301).
