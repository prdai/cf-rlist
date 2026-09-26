import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, verifyPassword } from "../../lib/auth";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  if (!(await verifyPassword(password, env.ADMIN_PASSWORD_HASH))) {
    return redirect("/login?error=1");
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
  });

  return redirect("/");
};
