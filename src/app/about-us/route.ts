/**
 * Old public addresses, kept as `status/route.ts` handlers.
 *
 * These block a URL before page rendering, the same way a redirect in
 * next.config would, but they run before the router's trailing-slash
 * normalisation. Proxy runs after it, so a bookmarked `/about-us/` would take
 * two hops through this file's route; here it is one. The 308 keeps the
 * permanent semantic and passes any query string on.
 *
 * Internal links point at the new routes directly. These exist only for
 * links already in the wild: bookmarks, search results, older shares.
 */
const page = (destination: string) => (request: Request) => {
  const url = new URL(destination, request.url);
  url.search = new URL(request.url).search;
  return Response.redirect(url, 308);
};

export const GET = page("/about");
