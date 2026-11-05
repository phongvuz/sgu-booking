// Browser mutations must come from this site. Requests without browser origin
// headers are still usable by same-site tools and server-side clients.
export function isSameOriginRequest(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestUrl = new URL(request.url);
  // Next may build request.url using its internal listening hostname. Host is
  // the browser's actual destination, including its port; do not trust a caller's
  // forwarded-host header as an alternative destination.
  const host = request.headers.get("host");
  if (!host) return origin === requestUrl.origin;
  if (/[\s/\\@?#,]/.test(host)) return false;
  try {
    return origin === new URL(`${requestUrl.protocol}//${host}`).origin;
  } catch {
    return false;
  }
}
