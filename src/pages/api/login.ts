import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { SESSION_COOKIE, SESSION_MAX_AGE, verifyPassword } from "../../lib/auth";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  if (!verifyPassword(password, env.ADMIN_PASSWORD)) {
    return redirect("/login?error=1");
  }

  cookies.set(SESSION_COOKIE, env.SESSION_SECRET, {
    path: "/",
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
  });

  return redirect("/");
};
