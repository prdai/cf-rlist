import type { APIRoute } from "astro";
import { addItem, deleteItem, toggleItem } from "../../lib/store";
import { normalizeUrl, resolveTitle } from "../../lib/title";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!locals.authed) return redirect("/login");

  const form = await request.formData();
  const action = String(form.get("action") ?? "");

  if (action === "add") {
    const raw = String(form.get("url") ?? "").trim();
    if (raw) {
      let url: URL;
      try {
        url = normalizeUrl(raw);
      } catch {
        return redirect("/?error=invalid-url");
      }
      await addItem(await resolveTitle(url), url.toString());
    }
  } else if (action === "toggle") {
    await toggleItem(String(form.get("id") ?? ""));
  } else if (action === "delete") {
    await deleteItem(String(form.get("id") ?? ""));
  }

  return redirect("/");
};
