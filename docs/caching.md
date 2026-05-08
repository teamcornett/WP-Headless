# Caching and Invalidation

A headless WordPress stack adds caching at every layer. When everything is configured correctly, content edits on Pantheon become visible on the live frontend within roughly **60 seconds**. When something is misconfigured — most commonly when the Pantheon Advanced Page Cache plugin is inactive — edits can stay invisible for hours.

This page documents every cache layer in the path, how it invalidates, and what to do when content isn't updating.

## The full path of a request

```
Visitor browser
  ↓
Vercel CDN (HTML cache)
  ↓
Vercel server-rendered Next.js
  ↓ Next.js fetch data cache (revalidate: 60)
  ↓
Pantheon Fastly edge (Varnish cache)
  ↓
Pantheon WordPress origin
```

Every layer caches by default and has its own invalidation rules.

## Layer 1: Browser cache

Vercel sets short cache headers on HTML responses (typically `public, max-age=0, must-revalidate`), so browsers re-check on every navigation. Static assets (`/_next/static/*`) are cached aggressively (1 year, content-hashed filenames).

**Invalidation:** automatic via content-hashed asset filenames; HTML always re-checks.

**You almost never need to clear this.** A user who sees stale content can hard-refresh (Cmd+Shift+R / Ctrl+Shift+R) to bust their browser cache.

## Layer 2: Vercel CDN

Vercel caches rendered HTML globally. The TTL is governed by Next.js's segment config / fetch config. With `next: { revalidate: 60 }` on WP fetches, the rendered HTML can be served from CDN for up to 60 seconds before re-rendering.

**Invalidation:**
- A new deployment invalidates everything for that project.
- ISR/`revalidate` re-renders on the next request after the window passes.
- You can manually purge via Vercel dashboard → **Deployments → ⋯ → Purge Data Cache**.

## Layer 3: Next.js fetch data cache

The fetch helpers in [`src/lib/wordpress.ts`](../src/lib/wordpress.ts) use:

```ts
fetch(wpJsonUrl, { next: { revalidate: 60 } })
```

That tells Next.js to cache the WordPress REST response for 60 seconds. After 60 seconds, the next request triggers a refetch. In dev mode this cache is in-memory; in production it's persisted in `.next/cache/fetch-cache`.

**Invalidation:**
- Automatic after 60 seconds.
- Invalidated by a new deployment.
- For local dev: kill the dev server (`Ctrl+C`), `rm -rf .next/cache`, restart with `npm run dev`.

### Why 60 seconds?

It's a balance: low enough that content edits show up quickly, high enough that we don't hammer Pantheon. Adjust by editing the helper — there's no env var for it.

## Layer 4: Pantheon Fastly edge cache

This is the layer that historically catches teams off guard. Pantheon puts **Fastly** (Varnish) in front of WordPress globally. By default, Fastly caches GET responses for hours, including REST API responses like `/wp-json/wp/v2/pages?slug=about`.

WordPress *does* tell Fastly to purge the **frontend page URL** (e.g. `/about/`) when you edit a page in WP Admin. **It does not tell Fastly to purge the REST endpoint by default.** That's the bug you'll hit if the Advanced Page Cache plugin isn't active.

### The fix: Pantheon Advanced Page Cache plugin

This plugin is committed under [`wp-content/plugins/pantheon-advanced-page-cache/`](https://github.com/pantheon-systems/pantheon-advanced-page-cache) in the Pantheon repo. Activate it in **WP Admin → Plugins**.

What it does:

- Adds **surrogate-key headers** (`Surrogate-Key`) to all WordPress responses, including REST API responses, identifying which pages/posts/terms each response depends on.
- Hooks into WP's `save_post`, `transition_post_status`, etc. to **emit purge requests** to Fastly that match those surrogate keys, blowing away every cached response that referenced the changed content.
- Result: editing a page in WP Admin purges its `/wp-json/wp/v2/pages?slug=...` cache entries within seconds.

You can verify it's active by checking response headers:

```bash
curl -I "https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/posts" | grep -iE "surrogate-key|x-cache"
```

You should see a `Surrogate-Key:` header listing keys like `post-1 rest-post-collection home`.

### Manual cache clear

If a stale response is stuck in Fastly:

- **Pantheon dashboard** → environment (Dev/Test/Live) → **Clear Caches** button. Wipes the entire Fastly cache for that environment.
- Or via Terminus: `terminus env:clear-cache until-you-ownit.dev`

This works even when the environment is in Git mode.

## Layer 5: WordPress object cache

WordPress and Pantheon manage an internal object cache (Redis on Pantheon, in fact). It mostly affects how fast a Fastly cache MISS resolves at the origin and rarely causes "stale content" symptoms.

**Invalidation:** the **Clear Caches** button also flushes this. WP itself manages most invalidations automatically.

## End-to-end timeline of a content edit

Editing the About page in WP Admin → Update:

1. **t = 0s.** WordPress saves to DB. Pantheon Advanced Page Cache emits Fastly purge for surrogate keys associated with that page.
2. **t = 0–2s.** Fastly clears its cached entries for the affected URLs.
3. **t = 0–60s.** Vercel + Next.js may still be serving from their data cache. The rendered HTML for `/about` keeps the old content until the `revalidate: 60` window expires.
4. **t = 60s.** Next request after the 60-second window triggers Next.js to re-fetch from Pantheon. Fastly returns the fresh content. Vercel re-renders. The visitor sees the update.

So **expect a ~60-second delay** from publishing in WP Admin to seeing the change on the live frontend. If it's longer than two minutes, something is wrong (see below).

## Diagnosing a stale-content issue

When a content edit isn't appearing:

1. **Confirm WP saved the change.** Visit the WP Admin page editor — does the change persist?
2. **Confirm the WP frontend renders it.** Visit `https://dev-until-you-ownit.pantheonsite.io/about/` — does the content show? If not, the problem is on the WordPress side, not the headless side.
3. **Check the REST endpoint directly:**
   ```bash
   curl "https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/pages?slug=about"
   ```
   Does the `content.rendered` field contain your new content? If not, you're hitting a Fastly cache MISS or the plugin isn't firing — click **Clear Caches** and re-test.
4. **Check the Surrogate-Key header is present.**
   ```bash
   curl -I "https://dev-until-you-ownit.pantheonsite.io/wp-json/wp/v2/pages?slug=about" | grep -i surrogate
   ```
   No header → Pantheon Advanced Page Cache plugin is **inactive**. Activate it.
5. **Check Next.js's data cache.** Restart `npm run dev` (kills in-memory cache). On Vercel: redeploy or wait 60 seconds.
6. **Check the right env var.** `console.log(process.env.NEXT_PUBLIC_WORDPRESS_URL)` in a server component to confirm Vercel Production isn't still pointed at an old URL.

If the REST endpoint shows fresh content but the frontend doesn't, the problem is downstream of Pantheon (Next.js or Vercel). If the REST endpoint is stale, the problem is at Pantheon.

## Common questions

**Q: Why not `revalidate: 0` (no cache)?**
You'd hit Pantheon on every request, and Vercel's CDN couldn't serve cached HTML. Cost and performance both suffer. 60s is a reasonable default; on-demand revalidation (via Next.js's `revalidatePath`) is a better future direction if you need instant updates.

**Q: Why not WordPress webhooks → Vercel?**
WordPress can be made to call a Next.js webhook on `save_post` to trigger a targeted Vercel revalidation. This is a worthwhile upgrade once you have content edits flowing regularly. Until then, the 60-second window is fine.

**Q: Vercel's Production URL still shows the old WP URL.**
Production was built before you updated the env var. `NEXT_PUBLIC_*` vars are baked into the bundle at build time — you must redeploy. **Vercel → Deployments → ⋯ → Redeploy** with **Use existing Build Cache UNCHECKED**.

## See also

- [wordpress-pantheon.md](./wordpress-pantheon.md) — installing and activating the cache plugin
- [troubleshooting.md](./troubleshooting.md) — wider list of common issues
