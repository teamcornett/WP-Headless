# Troubleshooting

Common issues and how to diagnose them. Most problems in a headless WordPress stack are either **cache** or **environment variable** related.

## Frontend issues

### Homepage shows mock posts ("Welcome to the Continuing Education Portal")

The frontend is in mock mode. Either:

- `NEXT_PUBLIC_USE_MOCK_WP=true` in `.env.local` (locally) — set it to `false`.
- `NEXT_PUBLIC_WORDPRESS_URL` is missing/empty in `.env.local` — the helpers fall back to mock data when the URL isn't set. Check the file exists and has the URL.
- On Vercel: the env var isn't set for the active environment scope. Check **Settings → Environment Variables**, ensure both vars are enabled for Production / Preview / Development.

After fixing locally: restart `npm run dev`. After fixing on Vercel: redeploy.

### `/about`, `/be-counted`, `/services`, or `/contact` is blank or 404

The matching WordPress page hasn't been created, or the slug doesn't match.

1. Go to https://dev-until-you-ownit.pantheonsite.io/wp-admin/edit.php?post_type=page.
2. Confirm a published page exists with slug exactly `about` (lowercase, no extras).
3. Sanity check: `curl "https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/pages?slug=about"` should return a non-empty array.

See [wordpress-pantheon.md → Required page slugs for the frontend](./wordpress-pantheon.md#required-page-slugs-for-the-frontend).

### Content edit doesn't appear within ~60 seconds

This is almost always a Pantheon Fastly cache issue. The fix:

1. Verify the **Pantheon Advanced Page Cache** plugin is **Active** in WP Admin → Plugins.
2. As a one-shot manual fix: Pantheon dashboard → environment → **Clear Caches**.
3. Restart your local dev server (`Ctrl+C`, then `npm run dev`) to flush Next.js's in-memory data cache.

Full deep dive: [caching.md](./caching.md).

### Vercel Production shows old content even after merging the PR

`NEXT_PUBLIC_*` env vars are inlined into the JS bundle at build time. If env vars changed but no rebuild ran, deploys keep the old values.

- Check Vercel → **Deployments**. Is there a Production deployment dated **after** your env-var change?
- If not: **⋯ → Redeploy** with **Use existing Build Cache UNCHECKED**.

Also, on the Production URL, open DevTools → **Network** → filter `wp-json`. The requests' host should be the current Pantheon URL, not the old one.

### Vercel Preview doesn't build for new branches

Most likely Vercel is connected to the **wrong** GitHub repo. Verify:

- **Vercel → Settings → Git** → "Connected Git Repository" should read `therealboone/WP-Headless`.
- If it shows a different repo, push to that repo instead — or repoint Vercel here.

If the repo is correct but pushes still don't trigger builds:

- The Vercel GitHub App may not have access to this repo. **GitHub → Settings → Applications → Vercel → Configure → grant access**.
- Production branch may not be `main`. **Vercel → Settings → Git → Production Branch**.

### `npm run dev` fails with `Error: NEXT_PUBLIC_WORDPRESS_URL is not set`

`.env.local` is missing or doesn't contain that variable. Run:

```bash
cp .env.example .env.local
```

If `.env.local` already exists, open it and confirm it has both required vars.

### `npm run dev` reports `EADDRINUSE :::3000`

Another Next.js dev server is already running on port 3000. Either kill it (`pkill -f "next dev"`) or run on a different port (`PORT=3001 npm run dev`).

## Backend (Pantheon) issues

### Plugin install fails with "Add Plugin button disabled"

The Pantheon environment is in **Git mode**, which disables WP Admin's plugin uploader. Two ways to install:

1. (Recommended) Add the plugin via git push from the local Pantheon repo. See [wordpress-pantheon.md → Installing plugins](./wordpress-pantheon.md#installing-plugins).
2. (Quick) Pantheon dashboard → environment → switch **Connection: Git → SFTP** → install in WP Admin → commit pending changes from the dashboard → switch back to Git.

### `git push origin master` fails with "Host key verification failed"

You haven't trusted Pantheon's code-server SSH host key. Run once:

```bash
ssh-keyscan -p 2222 -H codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192.drush.in >> ~/.ssh/known_hosts
```

Then re-run the push.

### `git push origin master` fails with "Permission denied (publickey)"

Your SSH public key isn't on your Pantheon account. Pantheon dashboard → **Account → SSH Keys** → paste the contents of `~/.ssh/id_ed25519.pub` (or `id_rsa.pub`).

If you don't have an SSH key yet:

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
cat ~/.ssh/id_ed25519.pub  # copy this into Pantheon
```

### `git pull origin master` shows merge conflicts after a Pantheon WordPress core update

Pantheon applied a core update that overlaps with something you committed locally.

```bash
git fetch origin
git rebase origin/master
# resolve conflicts (usually in wp-includes/ or wp-admin/)
git add <fixed-files>
git rebase --continue
git push origin master
```

If the conflicts are in core files you didn't intend to modify, the upstream Pantheon update probably wins:

```bash
git checkout origin/master -- <conflicted-file>
git add <conflicted-file>
git rebase --continue
```

### Pantheon WP Admin returns 502 / 503 / 504

Pantheon's edge couldn't reach the WordPress origin. Usually transient — wait 30 seconds and refresh. If persistent, check the [Pantheon Status page](https://status.pantheon.io/).

### REST API returns `{"code":"rest_no_route"}`

The slug or path doesn't exist, or permalinks are misconfigured. In WP Admin → **Settings → Permalinks**, click **Save Changes** even without changes — that re-flushes the rewrite rules.

### `/wp-json/wp/v2/pages?slug=about` returns `[]` even though the page exists

- Page is in **Draft** or **Pending Review** status. REST only returns `publish` by default. Publish it.
- Slug doesn't match exactly. Check WP Admin → page editor → right sidebar → **URL** → make sure it's `about` (no `-2` suffix from a duplicate).

## Git remote issues

### `git push teamcornett ...` fails with 403 / authentication error

You don't have write access to `teamcornett/headlesswordpress`. That's fine — you don't need it for Vercel deploys (those go through `origin`/`therealboone`). Either:

- Skip pushing to `teamcornett` and rely on `origin` for the day-to-day workflow.
- Ask the project owner to invite you to the `teamcornett` org.

### Local branch is `feat/...` but I want to swap to a clean `main`

```bash
git checkout main
git pull origin main
git branch -d feat/old-branch
```

If `git branch -d` complains about unmerged work, either rebase the branch into `main` first or use `git branch -D feat/old-branch` to force-delete (loses unmerged commits — be sure).

## Vercel issues

### Preview deploy shows "Authentication Required" / 401 page

That's Vercel's **Deployment Protection** — Preview URLs are gated behind a Vercel login. You must visit them while signed into Vercel. Outside testers cannot view Previews unless you disable protection at **Settings → Deployment Protection**.

### Production deploy succeeded but I see "Application error"

Open the Vercel deployment's **Functions / Logs** tab. Common causes:

- Missing env var → `NEXT_PUBLIC_WORDPRESS_URL is not set`. Set it and redeploy.
- Pantheon timed out → server component threw on the WP fetch. Check Pantheon status.
- Build succeeded but runtime crashed — check logs around the function that errored.

## Debugging tools and commands

```bash
# Confirm Pantheon REST is alive
curl -I https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts

# Check what the REST endpoint actually returns
curl 'https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/pages?slug=about' | jq

# Inspect Pantheon cache headers (look for Surrogate-Key)
curl -I 'https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/pages?slug=about'

# What env vars Next.js sees locally
cat .env.local

# Force-restart Next dev server cleanly
pkill -f "next dev"; rm -rf .next/cache; npm run dev

# Verify Vercel Production is using the expected backend (in browser DevTools)
# Network tab → filter wp-json → confirm host = dev/test/live-until-you-ownit.pantheonsite.io
```

## Where to ask for help

- Pantheon issues → [Pantheon Support](https://dashboard.pantheon.io/support) (chat in the dashboard).
- Vercel issues → [Vercel Support](https://vercel.com/help) or in-dashboard chat.
- Frontend code questions → ping the team in your usual channel; reference [`src/lib/wordpress.ts`](../src/lib/wordpress.ts) when relevant.
- This doc is incomplete — open a PR adding what bit you a few hours.

## See also

- [getting-started.md](./getting-started.md)
- [caching.md](./caching.md)
- [wordpress-pantheon.md](./wordpress-pantheon.md)
- [deployment.md](./deployment.md)
