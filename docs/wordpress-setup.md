# WordPress Backend Setup (Pantheon)

This project's WordPress backend is hosted on **Pantheon** as the `until-you-ownit` site. Pantheon serves as the single source of truth for WordPress content, themes, plugins, and configuration.

The Next.js frontend consumes the WordPress core REST endpoints:

- `wp/v2/pages` for `about`, `services`, `contact`
- `wp/v2/posts` for latest posts on the homepage

## Pantheon environments

| Environment | URL |
| --- | --- |
| Dev | https://dev-until-you-ownit.pantheonsite.io |
| Test | https://test-until-you-ownit.pantheonsite.io |
| Live | https://live-until-you-ownit.pantheonsite.io |

## Clone the WordPress codebase locally

The Pantheon site has its own git repo. Clone it as a sibling of this Next.js repo:

```bash
cd ~/Documents
git clone ssh://codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192@codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192.drush.in:2222/~/repository.git -b master until-you-ownit
```

Prerequisites:

- Pantheon account with access to the `until-you-ownit` site.
- Your SSH public key uploaded under **Pantheon → Account → SSH Keys**.
- The Dev environment in **Git** mode (toggle in the Pantheon dashboard if it's currently in SFTP mode).

Standard Pantheon workflow:

1. Make WordPress code changes (themes, plugins, `wp-content`) in the cloned repo.
2. `git push origin master` to push to Pantheon Dev.
3. In the Pantheon dashboard, deploy Dev → Test → Live.

## Create the business pages in WordPress

In WP Admin (`https://dev-until-you-ownit.pantheonsite.io/wp-admin`):

- `Pages` → `Add New`
- Create and publish:
  - `About` (slug: `about`)
  - `Services` (slug: `services`)
  - `Contact` (slug: `contact`)

Optional: publish a few `Posts` so the homepage's "Latest posts" section has content beyond the default `Hello world!`.

## Verify the REST API

```bash
curl https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/pages?slug=about
curl https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts
```

Both should return JSON.

## Connect Next.js to Pantheon

In `.env.local`:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://dev-until-you-ownit.pantheonsite.io
NEXT_PUBLIC_USE_MOCK_WP=false
```

Restart `npm run dev` after changing env values.

## Optional: local WordPress via Docker

`docker-compose.wordpress.yml` is retained as an offline fallback only. Pantheon is the canonical environment for all WordPress work.
