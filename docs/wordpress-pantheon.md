# WordPress on Pantheon

The WordPress backend for this project lives on Pantheon as the `until-you-ownit` site. Pantheon hosts three environments and uses Git as the deploy mechanism for code changes.

## Environments

| Environment | URL | Purpose |
| --- | --- | --- |
| Dev | https://dev-until-you-ownit.pantheonsite.io | Active development. Content authors and devs work here. |
| Test | https://test-until-you-ownit.pantheonsite.io | Stage for QA before going live. Created on first deploy from Dev. |
| Live | https://live-until-you-ownit.pantheonsite.io | Production WordPress. Visitors and Vercel Production read from here. |

Each environment has its **own database and uploads directory**. Code (themes, plugins, mu-plugins, `wp-config*.php`) is shared via git; content is not.

WP Admin is at `/wp-admin` on each URL. Use your Pantheon-issued WordPress account.

## Pantheon connection mode (Git vs SFTP)

Each environment can be in one of two modes, toggled in the Pantheon dashboard:

- **Git mode** (default for this project) — the file system is read-only via SFTP. All code changes must come through `git push` to Pantheon. WP Admin disables plugin/theme upload buttons. Database changes (publishing pages, activating plugins, changing settings) still work normally.
- **SFTP mode** — the file system is writable through Pantheon's SFTP. WP Admin's "Add Plugin" / "Add Theme" buttons work. Pantheon shows a "Commit message" panel where you turn pending file changes into a Pantheon git commit, then switch back to Git mode.

**Default policy: keep Dev in Git mode.** Use SFTP mode only as a temporary workaround. The Git workflow gives you a real history, code review, and reproducibility. See [Installing plugins](#installing-plugins) below.

## Cloning the WordPress repo

The Pantheon Git repo is a full WordPress install with `wp-content/` versioned. Clone it next to (not inside) the frontend repo:

```bash
cd ~/Documents
git clone ssh://codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192@codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192.drush.in:2222/~/repository.git -b master until-you-ownit
```

Prerequisites:

- A Pantheon team account with access to the `until-you-ownit` site.
- Your SSH **public** key uploaded under **Pantheon dashboard → Account → SSH Keys**.
- The Dev environment in **Git** connection mode (default).

If you see `Host key verification failed`, run once:

```bash
ssh-keyscan -p 2222 -H codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192.drush.in >> ~/.ssh/known_hosts
```

The default branch is `master` (Pantheon's convention).

## Standard code-change workflow

For any change to themes, plugins, mu-plugins, or `wp-config*.php`:

```bash
cd ~/Documents/until-you-ownit
git checkout master
git pull origin master

# make changes...

git add wp-content/...
git commit -m "Concise summary of the change"
git push origin master
```

Push goes to Pantheon's git server, which immediately deploys the commit to the **Dev** environment. Then in the Pantheon dashboard:

1. **Dev → Deploys → Deploy to Test** (check "Clone database and files from Dev to Test" the **first** time, or whenever you want Test to mirror Dev's content).
2. QA on Test.
3. **Test → Deploys → Deploy to Live** (check "Clone database and files from Test to Live" the **first** time, or whenever you want Live to mirror Test's content).

Note: cloning DB/files **overwrites** the destination's content. Don't tick that box if Live already has real content you want to preserve. Code-only deploys leave content alone.

## Installing plugins

### Recommended: Git workflow (works in Git mode)

1. Download the plugin zip from [WordPress.org](https://wordpress.org/plugins/), extract it, and place the folder under `wp-content/plugins/<plugin-slug>/`.
2. Commit and push:
   ```bash
   git add wp-content/plugins/<plugin-slug>
   git commit -m "Add <Plugin Name> v<version>"
   git push origin master
   ```
3. The plugin **files** are now on Pantheon Dev. Activation is a database action and works in Git mode:
   - Go to https://dev-until-you-ownit.pantheonsite.io/wp-admin/plugins.php → click **Activate** on the new plugin.

### Custom block: Full Bleed (from this repo)

The Next.js repo ships a WordPress plugin at [`wordpress-plugins/ownit-fullbleed/`](../wordpress-plugins/ownit-fullbleed/) (`ownit/fullbleed` block: full viewport width band, background color or image, inner blocks). Copy the whole `ownit-fullbleed` folder into Pantheon’s `wp-content/plugins/`, run `npm install && npm run build` inside it after edits, commit, push, then activate **Own It Full Bleed** in WP Admin. Headless styling for the saved markup lives in [`src/styles/blocks/_wordpress-blocks.scss`](../src/styles/blocks/_wordpress-blocks.scss) (search for `ownit-fullbleed`).

### Alternative: temporary SFTP mode

If you'd rather use WP Admin's installer:

1. Pantheon dashboard → Dev → switch **Connection: Git** to **SFTP**.
2. WP Admin → **Plugins → Add New** → install + activate.
3. Pantheon dashboard → Dev shows pending changes → write a commit message → **Commit**.
4. Switch Connection back to **Git**.

This is fine for one-offs but skips peer review.

### Required: Pantheon Advanced Page Cache plugin

This plugin is **already installed** in this repo and must stay **active**. Without it, Pantheon's Fastly edge does not auto-purge REST API responses when WP content changes, which causes the headless frontend to serve stale content.

If a fresh environment doesn't have it active, activate it at WP Admin → **Plugins** → *Pantheon Advanced Page Cache* → **Activate**. See [caching.md](./caching.md) for the full picture.

## Required page slugs for the frontend

The Next.js frontend has hardcoded routes that read specific WP page slugs. Create these pages in WP Admin → **Pages → Add New** with the **slug** matching exactly:

| Frontend route | WP page slug | Title (suggested) |
| --- | --- | --- |
| `/about` | `about` | About |
| `/be-counted` | `be-counted` | Be Counted |
| `/services` | `services` | Services |
| `/contact` | `contact` | Contact |

The slug is in the right sidebar under **Page → URL** when editing. It's lowercase, no spaces. If a slug doesn't match, the frontend route renders Next.js's 404 page.

Other pages you create can be reached via `/[slug]` — see [`src/app/[slug]/page.tsx`](../src/app/[slug]/page.tsx).

## Authoring content

- **Posts** appear on the homepage's "Latest posts" grid.
- **Pages** are reachable via their slug under `/[slug]`.
- WordPress publishes immediately by default. Drafts and scheduled posts are not exposed by REST until they're `publish` status.
- Featured images and media are returned by REST when the frontend asks for them. Today the frontend doesn't render featured images — adding that is a frontend change.

### Gutenberg: custom CSS classes (e.g. `about-tag`)

You do **not** need a plugin for this in core WordPress:

1. Select the block (Group, Paragraph, Heading, Columns, etc.).
2. Open the **block settings** sidebar → **Advanced**.
3. In **Additional CSS class(es)**, enter space-separated classes, e.g. `about-tag`.

Those classes are saved on the block’s wrapper in the HTML. The headless Next app renders `content.rendered` as HTML inside `.wp-content`, so any class you add must have matching styles in the frontend repo — see [`src/styles/blocks/_wordpress-blocks.scss`](../src/styles/blocks/_wordpress-blocks.scss) (search for `about-tag`). Add new utility classes there as you introduce them in the editor.

### Gutenberg: section background images

Use one of these patterns (both output markup the REST API returns unchanged):

- **Group** — With a recent WordPress version, select the Group → **Styles** / **Background** (wording varies by version) → set a **background image**. WordPress saves `style="background-image: url(...); ..."` on the group wrapper.
- **Cover** — Insert a **Cover** block, set the image, add inner blocks. Core block CSS from `@wordpress/block-library` handles most Cover layout.

The frontend adds responsive `background-size`, `background-position`, and padding for Groups (and Columns) that include a `background-image` in their inline style so sections read well on small screens. For full-bleed bands aligned to the viewport edge, use WordPress alignment (**Align full width** / `alignfull`) if your content uses it; you may need extra layout tweaks in SCSS depending on the page shell.

## Pantheon-managed `mu-plugins`

`wp-content/mu-plugins/` is reserved for Pantheon's required must-use plugins. **Don't delete or modify** anything in there unless Pantheon support tells you to — they get re-applied on Pantheon upgrades.

## Updating WordPress core

Pantheon publishes WordPress core updates as commits on the **upstream** repo. To pull the latest core:

1. Pantheon dashboard → Dev → **Updates** tab.
2. If updates are available, click **Apply Updates**. Choose "**Auto-Resolve**" unless there are conflicts.
3. The applied commit lands on Dev's `master`. Run a `git pull origin master` in your local clone to stay current.
4. Test on Dev → deploy to Test → deploy to Live.

## Optional: offline WordPress via Docker

This repo includes [`docker-compose.wordpress.yml`](../docker-compose.wordpress.yml) for working offline:

```bash
docker compose -f docker-compose.wordpress.yml up -d
```

That spins up WordPress at [http://localhost:8080](http://localhost:8080) with MariaDB. Set `NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8080` in `.env.local` to point the frontend at it.

This is **not** the same WordPress as Pantheon Dev — it's a fresh local install with no shared data. Useful only as a fallback when Pantheon is unreachable or you're on a plane.

## Useful Pantheon URLs

- Site dashboard: https://dashboard.pantheon.io/sites/ccfdbe54-802c-4fec-aff7-367d18097192
- Dev WP Admin: https://dev-until-you-ownit.pantheonsite.io/wp-admin
- Dev REST sanity check: https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts
- Pantheon Advanced Page Cache plugin: https://wordpress.org/plugins/pantheon-advanced-page-cache/

## See also

- [getting-started.md](./getting-started.md) — initial setup
- [deployment.md](./deployment.md) — promoting Dev → Test → Live + Vercel mapping
- [caching.md](./caching.md) — Fastly + Next.js caching, why edits sometimes lag
- [troubleshooting.md](./troubleshooting.md) — when something doesn't work
