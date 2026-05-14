# Own It Full Bleed (WordPress block)

Block name: `ownit/fullbleed`. Full-width section (edge to edge in the browser on the headless site), optional background **color** and/or **image**, and any inner Gutenberg blocks.

## Install on Pantheon (or any WordPress)

1. Copy this entire folder to `wp-content/plugins/ownit-fullbleed/` in the WordPress repo.
2. In that folder, install and build (Node 20+ recommended for `@wordpress/scripts`):
   ```bash
   npm install
   npm run build
   ```
3. Commit the `build/` output along with `src/` and push to Pantheon.
4. WP Admin → **Plugins** → activate **Own It Full Bleed**.
5. In the editor, add block **Full Bleed** (Layout category).

## Headless (Next.js / Vercel)

The REST API returns HTML only; Vercel does **not** load this plugin’s CSS. Layout rules for `.wp-block-ownit-fullbleed` are duplicated in the frontend repo: `src/styles/blocks/_wordpress-blocks.scss`.

## Rebuild after changing `src/`

```bash
npm run build
```
