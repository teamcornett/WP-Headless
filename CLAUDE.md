# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server on :3000 (Turbopack)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript) — run before opening a PR
```

There is no test runner configured.

## Architecture

This repo is **only the frontend** of a headless WordPress stack. WordPress itself lives in a separate Pantheon git repo (`until-you-ownit`) and is not present here. The frontend reads content from WP via REST and renders it with the Next.js App Router on Vercel.

### Two repositories, one frontend

- `origin` → `teamcornett/WP-Headless` — the **deploy repo**, watched by Vercel. Pushes to any branch trigger a Preview; merges to `main` deploy Production.

### Data flow

Every page is a **server component** that calls helpers in `src/lib/wordpress.ts`, which `fetch()` `${NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/...` with `next: { revalidate: 60 }`. The request hits Pantheon's Fastly edge before the WP origin. Content edits propagate end-to-end in ~60 seconds when configured correctly; see `docs/caching.md` for the full layer-by-layer story.

Key constraint: the **Pantheon Advanced Page Cache** plugin must be active on the WordPress side for REST responses to get surrogate-key purges. Without it, Fastly serves stale REST JSON for hours and edits appear "stuck" even though WP saved them. This is the single most common cause of stale-content reports.

### `src/lib/wordpress.ts`

Central WP REST client. Three exported helpers — `getRecentPosts`, `getPageBySlug`, `getBusinessPages` — plus a `requestWordPressJSON` core that:

1. Tries `/wp-json/<route>` first.
2. Falls back to `?rest_route=<route>` (some local WP setups expose REST only this way).
3. Throws with both status codes if neither works.

When `NEXT_PUBLIC_USE_MOCK_WP=true` (or `NEXT_PUBLIC_WORDPRESS_URL` is unset), the helpers return hardcoded mock data instead of hitting the network — useful when Pantheon is unreachable. The mock data lists the canonical business-page slugs (`about`, `be-counted`, `owners`, `podcast`, `events`, `services`, `contact`).

### Routing model

- `src/app/page.tsx` — homepage, lists recent WP posts.
- `src/app/[slug]/page.tsx` — catch-all for any WP page; calls `getPageBySlug(slug)` and 404s if missing.
- `src/app/<name>/page.tsx` for `about`, `be-counted`, `owners`, `podcast`, `events`, `services`, `contact` — explicit routes that exist alongside `[slug]`. Adding a new top-level explicit route only makes sense if it needs custom layout/data beyond what `[slug]` provides (e.g. `podcast/` pulls from Megaphone RSS via `src/lib/megaphone.ts`).

The header nav in `src/app/layout.tsx` is hardcoded — adding a new section means editing the nav AND ensuring a matching WP page slug exists (or it'll 404 via `[slug]`).

### Styling

- Tailwind v3 (`tailwind.config.ts`) with one brand extension: `bg-brand-yellow` (`#EFD941`) and the `font-display` (Bebas Neue) / `font-sans` (Barlow) families wired through CSS vars in `layout.tsx`.
- WordPress core block CSS is imported in `layout.tsx` (`@wordpress/block-library/build-style/{style,theme}.css`) **before** `globals.scss`, so brand overrides in `globals.scss` win the cascade. Don't reorder these imports.

### Custom WordPress blocks (headless duplication)

`wordpress-plugins/ownit-fullbleed/` is the **source of a WP plugin** that registers an `ownit/fullbleed` Gutenberg block. It is deployed to Pantheon by copying the folder into `wp-content/plugins/` of the Pantheon repo and running `npm run build` there. The REST API returns rendered HTML for the block, but **not** the plugin's CSS — so layout rules for `.wp-block-ownit-fullbleed` must be **duplicated** on the frontend (per the plugin's README, in `src/styles/blocks/_wordpress-blocks.scss`). When changing the block's visual contract, edit both sides.

`wordpress-plugin/headless-ce-api/` is currently empty (placeholder).

## Environment variables

Required vars and defaults live in `.env.example`. Critical detail: `NEXT_PUBLIC_*` vars are **inlined at build time** — changing them in Vercel requires a redeploy. `MEGAPHONE_RSS_URL` is server-only and can be changed without rebuilding.

## Workflow

Branch from `main`: `feat/<name>`, `fix/<name>`, or `chore/<name>` (see `CONTRIBUTING.md`). Push to `origin` to get a Vercel Preview.

## Further docs

`docs/` is the authoritative reference. Start with `architecture.md`; `caching.md` is essential reading before debugging any "edit isn't showing up" report; `wordpress-pantheon.md` covers the backend repo and environments; `troubleshooting.md` catalogs common failures.
