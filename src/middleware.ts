import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  context.locals.authed = await verifySessionToken(token, env.SESSION_SECRET);

  if (context.locals.authed && context.url.pathname === "/login") {
    return context.redirect("/");
  }

  return next();
});
