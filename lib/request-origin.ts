// Browser mutations must come from this site. Requests without browser origin
// headers are still usable by same-site tools and server-side clients.
export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  return request.headers.get("sec-fetch-site") !== "cross-site" &&
    (!origin || origin === new URL(request.url).origin);
}
