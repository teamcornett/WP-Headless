# Deployment

This stack has two independent deploy pipelines:

- **Frontend (Next.js)** → Vercel, triggered by git pushes to `therealboone/WP-Headless`.
- **Backend (WordPress)** → Pantheon, triggered by `git push` to the Pantheon code server.

## Frontend deploys (Vercel)

Vercel is connected to **`therealboone/WP-Headless`**. Pushes to that repo (only) trigger builds.

| Action | Result |
| --- | --- |
| Push any branch to `origin` | Vercel builds a **Preview** deployment with a unique URL |
| Open a PR into `main` | Vercel posts the Preview URL as a PR comment |
| Merge a PR into `main` | Vercel builds and promotes a **Production** deployment |
| Manual Redeploy in Vercel UI | Re-runs the build for an existing deployment (use when env vars change) |

### Routine release flow

```bash
# from the frontend repo
git checkout main && git pull origin main
git checkout -b feat/<short-name>

# ...code changes...

npm run lint
git add . && git commit -m "feat: <summary>"

# push to deploy repo (Vercel triggers Preview)
git push -u origin feat/<short-name>

# mirror to team repo (no Vercel effect, just team visibility)
git push teamcornett feat/<short-name>
```

Open a PR into `main` on `therealboone/WP-Headless`. The Vercel bot comments with a Preview URL within ~1–2 minutes. Verify on Preview → merge → Production deploys automatically.

After merge, sync `main` to the mirror so both `main`s match:

```bash
git checkout main
git pull origin main
git push teamcornett main
git branch -d feat/<short-name>
git push origin --delete feat/<short-name>
git push teamcornett --delete feat/<short-name>
```

### Environment variables (Vercel)

Set both vars under **Vercel project → Settings → Environment Variables** for **all three** scopes (Production, Preview, Development):

| Variable | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_WORDPRESS_URL` | Pantheon environment URL (see mapping below) | Inlined into the JS bundle at build time. **Changes require a rebuild.** |
| `NEXT_PUBLIC_USE_MOCK_WP` | `false` | `true` would skip WP and serve hardcoded mock data. |

#### Recommended Pantheon → Vercel mapping

| Vercel scope | `NEXT_PUBLIC_WORDPRESS_URL` |
| --- | --- |
| Production | `https://live-until-you-ownit.pantheonsite.io` (or the Live custom domain once mapped) |
| Preview | `https://test-until-you-ownit.pantheonsite.io` |
| Development | `https://dev-until-you-ownit.pantheonsite.io` |

Until Pantheon Test/Live are populated, all three Vercel scopes can point at Pantheon **Dev**.

#### After changing env vars

`NEXT_PUBLIC_*` vars are baked into the build, so existing deploys keep their old values. To pick up a change:

- Push any commit (the easiest), **or**
- Vercel **Deployments → ⋯ → Redeploy** with **Use existing Build Cache UNCHECKED**.

### Custom domains

Vercel **Settings → Domains** controls the public hostname. When the project goes live with a custom domain (e.g. `untilyouownit.com`):

- Add the apex + `www` to the Vercel project.
- Update DNS at the registrar per the records Vercel provides (CNAME for `www`, A or ALIAS for the apex).
- HTTPS certs are auto-issued by Vercel.

## Backend deploys (Pantheon)

Pantheon promotes code via three environments: **Dev → Test → Live**. Each promotion is initiated from the Pantheon dashboard.

### Code deploys

Pushing to the Pantheon git remote deploys instantly to Dev:

```bash
cd ~/Documents/until-you-ownit
git checkout master
# ...changes...
git add . && git commit -m "Concise summary"
git push origin master
```

Visit `https://dev-until-you-ownit.pantheonsite.io` — the change is live in seconds.

To promote:

1. Pantheon dashboard → site → **Dev → Deploys** → **Deploy to Test**. Optionally check "Clone the database and files from Dev" to also copy content.
2. QA on Test.
3. **Test → Deploys → Deploy to Live**, similarly.

Cloning the database **overwrites** the destination's content. Code-only deploys are non-destructive.

### Database / file syncing direction

Pantheon's standard direction is **Dev → Test → Live** for code, and **Live → Test → Dev** for content (so devs can pull realistic data downward). Use the **Database / Files** panel on each environment to clone in either direction.

### Activation of plugins / themes

Plugin and theme **activation** is stored in the database, not in code. After deploying a code change that adds a plugin, you still need to log into the destination environment's WP Admin and click **Activate**.

The exception: when you "Clone database and files" during a deploy, plugin activation state copies along with the rest of the DB.

## End-to-end release runbook

Putting it together, here's what a full release looks like when both backend and frontend changes are involved.

### Backend-only release

1. Develop on `master` of the Pantheon repo, push to `origin master`.
2. Verify on `dev-until-you-ownit.pantheonsite.io`.
3. Pantheon dashboard: Deploy Dev → Test (with DB clone if you want Test to mirror Dev content). Test on `test-until-you-ownit.pantheonsite.io`.
4. Pantheon dashboard: Deploy Test → Live (with DB clone if appropriate).
5. If Vercel Production points at Pantheon Live, the change is now visible on the public site within ~60 seconds (Next.js revalidate window) plus any Fastly purge propagation.

### Frontend-only release

1. Branch off `main` of `therealboone/WP-Headless`, push, open PR.
2. Verify the Vercel Preview comment on the PR.
3. Merge → Vercel Production deploys.
4. Sync `main` to the `teamcornett` mirror.

### Coordinated release (frontend depends on new WP content / fields)

Order matters — promote backend first.

1. Land backend on Pantheon Live first.
2. Then merge the frontend PR. Vercel Production reads the updated WP and renders correctly.

If you merge frontend before backend, the frontend may render placeholders / 404s for new content shapes until the backend catches up.

## Cache considerations during deploys

After deploying:

- Frontend: Next.js's data cache is invalidated automatically by a new build. Browsers and Vercel CDN catch up within seconds.
- Backend: Pantheon's Fastly edge auto-purges related URLs **only if the [Pantheon Advanced Page Cache](https://wordpress.org/plugins/pantheon-advanced-page-cache/) plugin is active**. If it's not, manually click **Clear Caches** on the Pantheon environment after content changes.

See [caching.md](./caching.md).

## Rollback

### Frontend (Vercel)

- **Vercel → Deployments** → pick the previous good deployment → **⋯ → Promote to Production**. Instant rollback, no rebuild.
- Or revert the merge commit in `main`, push — Vercel rebuilds.

### Backend (Pantheon)

- **Code only:** `git revert <bad-commit>` in the Pantheon repo, push, then promote through environments.
- **Code + content:** Pantheon takes nightly DB backups. Restore from **Dev/Test/Live → Backups** in the dashboard. Restoring is destructive — make a fresh backup before doing it.

## See also

- [architecture.md](./architecture.md)
- [wordpress-pantheon.md](./wordpress-pantheon.md)
- [caching.md](./caching.md)
- [troubleshooting.md](./troubleshooting.md)
