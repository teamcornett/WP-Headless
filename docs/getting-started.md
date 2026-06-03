# Getting Started

End-to-end setup for a developer joining the project. Allow ~30 minutes the first time. By the end you should have:

- A running local Next.js dev server pulling content from Pantheon Dev WordPress.
- A local clone of the Pantheon WordPress repo so you can ship backend code changes through git.
- Verified read access to the GitHub deploy repo and (if applicable) the Vercel project.

## 0. Accounts and access you need

Ask whoever's onboarding you to confirm or set up the following before you start:

| Service | What you need | Where it's used |
| --- | --- | --- |
| GitHub | Read/write on [`teamcornett/WP-Headless`](https://github.com/teamcornett/WP-Headless) | All frontend code changes |
| Vercel | Member of the Vercel project connected to `teamcornett/WP-Headless` | Reviewing deploys, env vars, domains |
| Pantheon | Team member on the `until-you-ownit` site | WP admin, code commits, cache clears |
| Pantheon SSH key | Your public key uploaded under **Pantheon → Account → SSH Keys** | Cloning/pushing the WordPress git repo |
| WordPress admin | A WP user with at least **Editor** role on Pantheon Dev (Admin if you'll install plugins) | Content + plugin work |

You can do meaningful frontend work with just GitHub + Vercel. WordPress backend work needs Pantheon access too.

## 1. Local prerequisites

Install once:

- **Node.js 20+** (`node -v`). Recommended via [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm).
- **Git** (any modern version).
- **macOS**: nothing else required. Linux/WSL: same Node + git.
- *(Optional)* **Docker Desktop** — only if you want the offline WordPress fallback (see [wordpress-pantheon.md](./wordpress-pantheon.md#optional-offline-wordpress-via-docker)).
- *(Optional)* **Terminus** — Pantheon's CLI for cache clears, deploys, db pulls. Install via:
  ```bash
  curl -O https://raw.githubusercontent.com/pantheon-systems/terminus-installer/master/builds/installer.phar && php installer.phar install
  terminus auth:login
  ```

## 2. Clone the frontend repo

```bash
cd ~/Documents          # or wherever you keep work
git clone https://github.com/teamcornett/WP-Headless.git Headless
cd Headless
git remote -v
```

Expected output:

```
origin  https://github.com/teamcornett/WP-Headless.git (fetch / push)
```

If you cloned before the org transfer, repoint `origin` and remove the old mirror remote:

```bash
git remote set-url origin https://github.com/teamcornett/WP-Headless.git
git remote remove teamcornett 2>/dev/null || true
```

## 3. Install dependencies

```bash
npm install
```

This installs Next.js 15, React 19, Tailwind, SCSS tooling, and TypeScript types.

## 4. Configure environment variables

Copy the template:

```bash
cp .env.example .env.local
```

The template already points at Pantheon Dev. The two variables you'll see:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://dev-until-you-ownit.pantheonsite.io
NEXT_PUBLIC_USE_MOCK_WP=false
```

- `NEXT_PUBLIC_WORDPRESS_URL` — base URL of the WordPress backend. The app appends `/wp-json/...` itself.
- `NEXT_PUBLIC_USE_MOCK_WP` — when `true`, the app skips real WP requests and renders mock data from [`src/lib/wordpress.ts`](../src/lib/wordpress.ts). Useful when offline or when the WP backend is down. Leave it `false` for normal work.

`.env.local` is **gitignored** — never commit it. Production-equivalent values live in the Vercel dashboard.

## 5. Run the dev server

```bash
npm run dev
```

You should see:

```
▲ Next.js 15.5.x (Turbopack)
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in ~800ms
```

Open [http://localhost:3000](http://localhost:3000). The homepage loads the WordPress page with slug **`home`** (Gutenberg content). Create that page in Pantheon if `/` returns 404 — see [wordpress-pantheon.md](./wordpress-pantheon.md#required-page-slugs-for-the-frontend).

## 6. Verify the headless connection

Three quick checks:

**a) WordPress REST is reachable**

```bash
curl -I https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts
# Expect HTTP/2 200
```

**b) Frontend pages load**

- [http://localhost:3000](http://localhost:3000) — homepage (WP page slug `home`)
- [http://localhost:3000/about](http://localhost:3000/about) — pulls WP page slug `about`
- [http://localhost:3000/be-counted](http://localhost:3000/be-counted) — pulls WP page slug `be-counted`
- [http://localhost:3000/owners](http://localhost:3000/owners) — pulls WP page slug `owners`
- [http://localhost:3000/podcast](http://localhost:3000/podcast) — pulls WP page slug `podcast`
- [http://localhost:3000/events](http://localhost:3000/events) — pulls WP page slug `events`
- [http://localhost:3000/services](http://localhost:3000/services)
- [http://localhost:3000/contact](http://localhost:3000/contact)

If any of `/`, `/about`, `/be-counted`, `/owners`, `/podcast`, `/events`, `/services`, or `/contact` is blank or 404, the matching page hasn't been created yet on Pantheon. Create it in WP Admin (see [wordpress-pantheon.md](./wordpress-pantheon.md#required-page-slugs-for-the-frontend)).

**c) Network requests hit Pantheon**

Open DevTools → **Network** → filter `wp-json`. Reload. You should see calls to `dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/...` and **zero** calls to any old/legacy host.

## 7. Clone the WordPress backend repo (optional, only if you'll touch backend code)

If you'll edit themes, plugins, or `wp-content` files, also clone the Pantheon Git repo as a sibling of this folder:

```bash
cd ~/Documents
git clone ssh://codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192@codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192.drush.in:2222/~/repository.git -b master until-you-ownit
```

If you get a "Host key verification failed" error, run this once to add Pantheon's code-server SSH host key:

```bash
ssh-keyscan -p 2222 -H codeserver.dev.ccfdbe54-802c-4fec-aff7-367d18097192.drush.in >> ~/.ssh/known_hosts
```

Then re-run the clone.

The WordPress repo is on the `master` branch (Pantheon convention). See [wordpress-pantheon.md](./wordpress-pantheon.md) for the full backend workflow.

## 8. Make a trivial change to test your setup

Pick a small visible thing — say, the footer year in [`src/app/layout.tsx`](../src/app/layout.tsx). Then:

```bash
git checkout -b chore/onboarding-test
# edit a file, save
npm run lint
git add .
git commit -m "chore: onboarding smoke test"
git push -u origin chore/onboarding-test
git push teamcornett chore/onboarding-test
```

Open the GitHub PR link printed by `git push`. Within a minute or two Vercel should comment on the PR with a Preview URL. If the Preview shows your change, your end-to-end setup is good. Close the PR without merging (it was just a smoke test).

## 9. Day-to-day workflow

Once you're set up, the daily loop is:

1. `git checkout main && git pull origin main`
2. `git checkout -b feat/your-feature` (or `fix/...`, `chore/...`)
3. Develop, commit, repeat.
4. `git push -u origin feat/your-feature`
5. Open a PR into `main` on `teamcornett/WP-Headless`.
6. Verify the Vercel Preview the bot posts on the PR.
7. Merge → Vercel Production deploys automatically.

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for branch naming, commit style, and PR expectations.

## What to read next

- [architecture.md](./architecture.md) — how the pieces fit together
- [wordpress-pantheon.md](./wordpress-pantheon.md) — content workflow, plugin installs, environments
- [deployment.md](./deployment.md) — how Vercel and Pantheon deploys work
- [caching.md](./caching.md) — what to do when content edits don't appear
- [troubleshooting.md](./troubleshooting.md) — common gotchas
