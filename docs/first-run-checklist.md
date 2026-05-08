# First Run Checklist (Pantheon Backend)

Fastest path from zero to seeing the Next.js frontend rendering Pantheon-hosted WordPress content.

## 1) Run the Next.js frontend

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.example` already points at the Pantheon dev environment, so no edits are required for a connected first run.

Open:

- [http://localhost:3000](http://localhost:3000)

## 2) Confirm Pantheon WordPress is reachable

```bash
curl -I https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts
```

Expect `HTTP/2 200`.

## 3) Clone the Pantheon backend repo (one time)

```bash
cd ~/Documents
git clone ssh://codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192@codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192.drush.in:2222/~/repository.git -b master until-you-ownit
```

You only need this if you'll be editing WordPress code (themes, plugins, mu-plugins). Pantheon's Dev environment must be in **Git mode** in the dashboard for pushes to take effect.

## 4) Create the core business pages in WordPress

In `https://dev-until-you-ownit.pantheonsite.io/wp-admin`:

- `Pages` → `Add New`
- create and publish:
  - About (slug: `about`)
  - Services (slug: `services`)
  - Contact (slug: `contact`)

## 5) (Optional) Add blog posts

In WP Admin:

- `Posts` → `Add New`
- publish 2-3 sample posts to populate the homepage

## 6) Verify end to end

- WordPress API checks:
  - [https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/pages?slug=about](https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/pages?slug=about)
  - [https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts](https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts)
- Frontend pages:
  - [http://localhost:3000](http://localhost:3000)
  - [http://localhost:3000/about](http://localhost:3000/about)
  - [http://localhost:3000/services](http://localhost:3000/services)
  - [http://localhost:3000/contact](http://localhost:3000/contact)

If those pages render WordPress content, the headless setup is connected to Pantheon.
