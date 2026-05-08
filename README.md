# Headless WordPress + Next.js

This repository is the frontend for a headless WordPress business website built with Next.js (App Router).

## Local setup (frontend)

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Edit `.env.local`:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://dev-until-you-ownit.pantheonsite.io
NEXT_PUBLIC_USE_MOCK_WP=false
```

> The WordPress backend lives on **Pantheon** (`dev-until-you-ownit.pantheonsite.io`). Set `NEXT_PUBLIC_USE_MOCK_WP=true` only if you need to develop the frontend offline.

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Architecture overview

This is a **two-repo** setup:

| Layer | Code | Hosting |
| --- | --- | --- |
| Frontend (this repo) | Next.js App Router | Vercel |
| Backend (WordPress) | `until-you-ownit` Pantheon site | Pantheon (Dev / Test / Live) |

Vercel pulls posts and pages from Pantheon over the WordPress REST API (`/wp-json/wp/v2/...`).

## Workflow: local development, GitHub, and Vercel

Frontend GitHub remote: [`teamcornett/headlesswordpress`](https://github.com/teamcornett/headlesswordpress) — this is what Vercel deploys from. (You may also see a personal `therealboone/WP-Headless` remote; the deployable remote is `teamcornett`.)

1. **Local** — Use `.env.local` (gitignored) for WordPress URL and mock flags. Default points at the Pantheon dev environment.
2. **GitHub** — Push branches; Vercel builds on push when the project is linked to that repo.
3. **Branches** — **Production** usually tracks `main` (set in Vercel **Settings → Git**). **Preview** deploys for other branches and pull requests.
4. **Vercel env** — Dashboard **Settings → Environment Variables** only; not `.env.local`. Set Production / Preview / (optional) Development scopes there. Point each Vercel environment at the matching Pantheon environment URL (e.g. Production → Pantheon Live, Preview → Pantheon Test/Dev).
5. **Optional** — `vercel link` in this folder, then `vercel env pull .env.local` to sync dashboard vars locally.

## WordPress backend on Pantheon

The WordPress codebase is a separate repository hosted by Pantheon. Clone it as a sibling of this folder so the two checkouts stay independent:

```bash
cd ~/Documents
git clone ssh://codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192@codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192.drush.in:2222/~/repository.git -b master until-you-ownit
```

Useful Pantheon URLs (Dev environment):

- Site: [https://dev-until-you-ownit.pantheonsite.io/](https://dev-until-you-ownit.pantheonsite.io/)
- WP Admin: [https://dev-until-you-ownit.pantheonsite.io/wp-admin](https://dev-until-you-ownit.pantheonsite.io/wp-admin)
- REST sanity check: [https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts](https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts)

Standard Pantheon flow: commit + push to the Pantheon git remote → changes go live on the **Dev** environment → deploy to **Test** → deploy to **Live** in the Pantheon dashboard.

## WordPress requirements

- Ensure your WordPress site is reachable from local development.
- REST API must be enabled (`/wp-json/wp/v2/posts` should return JSON).
- If your WordPress instance is private, you'll need authenticated API requests (next step after initial scaffold).

## Project structure

- `src/app/page.tsx`: Home page that fetches recent WordPress posts.
- `src/app/about/page.tsx`: About page pulled from WordPress page slug `about`.
- `src/app/services/page.tsx`: Services page pulled from WordPress page slug `services`.
- `src/app/contact/page.tsx`: Contact page pulled from WordPress page slug `contact`.
- `src/lib/wordpress.ts`: Shared WordPress REST API helpers.
- `.env.example`: Required environment variables.
- `docs/wordpress-setup.md`: WordPress setup for a business site.

## WordPress backend implementation

For backend setup and first-time full-stack run:

- `docs/wordpress-setup.md`
- `docs/first-run-checklist.md`
- `CONTRIBUTING.md` (branch and PR protocol)

## WordPress plugin included
No custom plugin is required for the base business-site setup. The frontend uses core WordPress REST endpoints (`pages` and `posts`).

## Local WordPress (Docker, optional)

The Pantheon dev environment is the source of truth for WordPress content. The bundled `docker-compose.wordpress.yml` is kept only as an offline fallback (e.g. when working without internet). If you need it:

```bash
docker compose -f docker-compose.wordpress.yml up -d
```

Then open WordPress at [http://localhost:8080](http://localhost:8080) and set `NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8080` in `.env.local`.

## Best Git Protocol (PR Workflow)

1. Create a feature branch from `main` (example: `feat/scss-architecture`).
2. Commit focused changes with clear commit messages.
3. Push branch to GitHub and open a pull request into `main`.
4. Verify PR includes summary, why, and test plan (see PR template).
5. Review files changed and confirm checks pass.
6. Merge PR into `main` when approved.
7. Delete the feature branch after merge.
8. Sync local before new work:

```bash
git checkout main
git pull
```

## Deploying to Vercel

1. [Vercel](https://vercel.com) → **Add New… → Project** → import [`teamcornett/headlesswordpress`](https://github.com/teamcornett/headlesswordpress) (or **Settings → Git** on an existing project).
2. **Settings → Environment Variables** — add for **Production**, **Preview**, and optionally **Development**:
   - **`NEXT_PUBLIC_WORDPRESS_URL`** — Pantheon site base URL (no `/wp-json`; the app adds that path). Recommended mapping:
     - Production → `https://live-until-you-ownit.pantheonsite.io` (or the mapped custom domain once Live is launched)
     - Preview → `https://test-until-you-ownit.pantheonsite.io`
     - Development → `https://dev-until-you-ownit.pantheonsite.io`
   - **`NEXT_PUBLIC_USE_MOCK_WP`** — `false` for real API (typical on Vercel); `true` only for mock data.
3. **Settings → Git** — production branch (usually `main`).
4. Push to GitHub to deploy. After changing env vars, trigger a new deployment so builds pick them up.

Until Pantheon Test/Live are populated you can point all three Vercel environments at the Pantheon **Dev** URL.
