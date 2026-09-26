# cf-rlist

A public reading list. Anyone can read it; only the owner can add, tick off, or delete items.

- Astro (on-demand rendering) on Cloudflare Workers via `@astrojs/cloudflare`
- Items stored as a single JSON array in Workers KV (binding `RLIST`)
- `/login` checks a password against a PBKDF2-SHA256 hash from an env var
- Login state is a signed (HMAC-SHA256), stateless cookie

## Setup

```sh
npm install
```

Generate the password hash and put it in `.dev.vars` (copy `.dev.vars.example`):

```sh
RLIST_PASSWORD='your password' npm run hash-password
```

Set `SESSION_SECRET` to any long random string (e.g. `openssl rand -base64 32`). `.dev.vars` is gitignored.

```ini
ADMIN_PASSWORD_HASH=pbkdf2:sha256:100000:...
SESSION_SECRET=...
```

## Develop

```sh
npm run dev
```

Runs in the Cloudflare `workerd` runtime. Local KV data persists in `.wrangler/`.

## Deploy

```sh
npx wrangler login
npx wrangler secret put ADMIN_PASSWORD_HASH
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
- PBKDF2 runs on every login attempt. On the Workers free tier (10 ms CPU) a high iteration
  count can exceed the limit; lower it with `npm run hash-password -- --iterations 50000` if needed.
- KV writes are eventually consistent across regions (up to ~60s). Irrelevant for a single user.
