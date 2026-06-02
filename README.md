# Headless WordPress + Next.js

Frontend for a headless WordPress business website. Built with Next.js (App Router) and deployed on Vercel; WordPress lives on Pantheon.

## Stack at a glance

| Layer | Code | Hosting |
| --- | --- | --- |
| Frontend (Next.js App Router) | [`teamcornett/WP-Headless`](https://github.com/teamcornett/WP-Headless) | Vercel |
| Backend (WordPress) | Pantheon Git (`until-you-ownit`) | Pantheon (Dev / Test / Live) |

Vercel pulls posts and pages from Pantheon over the WordPress REST API. See [docs/architecture.md](docs/architecture.md).

## Quick start (frontend)

```bash
git clone https://github.com/teamcornett/WP-Headless.git Headless
cd Headless
npm install
cp .env.example .env.local
npm run dev
```

`.env.example` already points at Pantheon Dev, so a fresh checkout connects to the live backend immediately. Open [http://localhost:3000](http://localhost:3000).

For everything else — accounts, the WordPress backend repo, deploy flows, caching, troubleshooting — see the docs below.

## Documentation

- [docs/architecture.md](docs/architecture.md) — system overview, request flow, where each piece lives
- [docs/getting-started.md](docs/getting-started.md) — full new-developer walkthrough (accounts, clone, install, run, verify)
- [docs/wordpress-pantheon.md](docs/wordpress-pantheon.md) — Pantheon backend deep dive (environments, Git workflow, plugins, content)
- [docs/deployment.md](docs/deployment.md) — Vercel + Pantheon deploy runbook, env-var mapping
- [docs/caching.md](docs/caching.md) — Fastly + Next.js caching, invalidation, why edits sometimes lag
- [docs/troubleshooting.md](docs/troubleshooting.md) — common issues and fixes
- [CONTRIBUTING.md](CONTRIBUTING.md) — branch naming, commit style, PR expectations

## Project layout

```
src/
  app/                 # App Router routes (about, be-counted, owners, podcast, events, services, contact, [slug], layout)
  lib/wordpress.ts     # REST helpers, types, mock fallback
public/                # Static assets
docs/                  # Documentation (start with architecture.md)
.env.example           # Required env vars template
docker-compose.wordpress.yml   # Optional offline WP fallback
```

## Required environment variables

Set in `.env.local` (locally) and in **Vercel → Settings → Environment Variables** (for all three scopes — Production / Preview / Development):

| Variable | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_WORDPRESS_URL` | `https://dev-until-you-ownit.pantheonsite.io` | Base URL of the WordPress backend (no `/wp-json` — the app appends it). |
| `NEXT_PUBLIC_USE_MOCK_WP` | `false` | When `true`, the app skips real WP requests and serves hardcoded mock data — useful when the backend is unreachable. |
| `MEGAPHONE_RSS_URL` | _(optional)_ | Defaults to **Own It** at `https://feeds.megaphone.fm/ownit`. Set to override with another Megaphone RSS URL. |

`NEXT_PUBLIC_*` vars are inlined at build time, so changing them on Vercel requires a redeploy. Details in [docs/deployment.md](docs/deployment.md).

## Day-to-day workflow

1. `git checkout main && git pull origin main`
2. `git checkout -b feat/<short-name>`
3. Edit, commit, run `npm run lint`.
4. `git push -u origin feat/<short-name>` (Vercel builds a Preview).
5. Open a PR into `main` on `teamcornett/WP-Headless`.
6. Verify the Vercel Preview URL the bot posts on the PR.
7. Merge → Vercel Production deploys automatically.

Branch naming and commit style are documented in [CONTRIBUTING.md](CONTRIBUTING.md).
