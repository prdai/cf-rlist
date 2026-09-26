export function normalizeUrl(raw: string): URL {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withScheme);
}

export async function resolveTitle(url: URL): Promise<string> {
  const fallback = `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
  const page = await fetchPage(url);
  if (!page) return fallback;
  const title = await extractTitle(page);
  return title || fallback;
}

async function fetchPage(url: URL): Promise<Response | null> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      headers: { accept: "text/html,application/xhtml+xml" },
    });
    if (!response.ok) return null;
    if (!(response.headers.get("content-type") ?? "").includes("html")) return null;
    return response;
  } catch {
    return null;
  }
}

async function extractTitle(response: Response): Promise<string> {
  let pageTitle = "";
  let ogTitle = "";

  const rewriter = new HTMLRewriter()
    .on("title", {
      text(chunk) {
        pageTitle += chunk.text;
      },
    })
    .on('meta[property="og:title"]', {
      element(element) {
        ogTitle ||= element.getAttribute("content") ?? "";
      },
    });

  try {
    await rewriter.transform(response).arrayBuffer();
  } catch {
    return "";
  }

  return (ogTitle || pageTitle).replace(/\s+/g, " ").trim();
}
