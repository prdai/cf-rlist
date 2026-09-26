# cf-rlist

A public reading list. Anyone can read it; only the owner can add, tick off, or delete items.

- Astro (on-demand rendering) on Cloudflare Workers via `@astrojs/cloudflare`
- Items stored as a single JSON array in Workers KV (binding `RLIST`)
- `/login` checks the password in `ADMIN_PASSWORD`
- Login sets a static token cookie (`SESSION_SECRET`); rotate that token to log everyone out

## Setup

```sh
npm install
```

Put your password and a random token in `.dev.vars` (copy `.env.example`). Wrangler reads
`.dev.vars` for local dev; `.env` is not loaded, and `.dev.vars` is gitignored.

```ini
ADMIN_PASSWORD=...
SESSION_SECRET=...   # any long random string, e.g. `openssl rand -base64 32`
```

## Develop

```sh
npm run dev
```

Runs in the Cloudflare `workerd` runtime. Local KV data persists in `.wrangler/`.

## Deploy

```sh
npx wrangler login
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npm run deploy
```

The `RLIST` KV namespace is provisioned automatically on first deploy. Wrangler writes the
namespace id back into `wrangler.jsonc`.

## Custom domain

Add `rlist.prdai.dev` to the Worker (requires `prdai.dev` on the same Cloudflare account):

```jsonc
"routes": [{ "pattern": "rlist.prdai.dev", "custom_domain": true }]
```

## Notes

- Item titles are fetched from the link on add (`og:title`, falling back to `<title>`, then the
  URL's host and path).
- KV writes are eventually consistent across regions (up to ~60s). Irrelevant for a single user.
