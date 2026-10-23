import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Browser-side admin API.
 *
 * Admin screens render on the client, where the API's bearer token is not
 * readable: the session cookies are httpOnly. So the browser calls this route
 * instead of the API. This handler forwards `/api/admin/<rest>` to the API's
 * `/api/v1/admin/<rest>`, attaching the session cookie, and returns the answer
 * unchanged.
 *
 * The app proxy (`src/proxy.ts`) has already checked the Admin role and
 * renewed the access token before this handler runs, so by here the request is
 * a live admin session. The handler itself never reads a body it does not
 * forward, and never trusts a path outside `/admin/`.
 */
const baseApi = (
  process.env.NEXT_PUBLIC_BASE_API ??
  process.env.BASE_API ??
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const handler = async (
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await context.params;
  const rest = (path ?? []).join("/");

  // The API surface is `/admin/...`; a caller can only reach that subtree.
  const target = new URL(`${baseApi}/admin/${rest}`);
  target.search = new URL(request.url).search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);

  // Same-origin guard for state changes: the browser sends the cookie on
  // same-site requests, and a forged form post must not borrow the session.
  const origin = request.headers.get("origin");
  if (origin && UNSAFE.has(request.method)) {
    const host = request.headers.get("host");
    if (!host || new URL(origin).host !== host) {
      return NextResponse.json(
        { success: false, message: "Cross-origin request refused" },
        { status: 403 },
      );
    }
  }

  const accessToken = (await cookies()).get("tth_access_token")?.value;
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "The API did not answer" },
      { status: 502 },
    );
  }

  const body = await upstream.arrayBuffer();
  const response = new NextResponse(body, { status: upstream.status });
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) response.headers.set("content-type", upstreamType);
  return response;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
