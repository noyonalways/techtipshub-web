import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSlug } from "@/lib/slug";

/**
 * Records one read of an article.
 *
 * `POST /api/views/<slug>` forwards to the API's `POST /views/<slug>`, attaching
 * the session token when the reader is signed in (the cookies are httpOnly, so
 * the browser cannot). The article page is prerendered and served from the CDN,
 * so the read cannot be counted during that render; the page's view counter
 * calls this from the browser instead.
 *
 * The slug arrives percent-encoded and may contain non-ASCII characters, so it
 * is decoded once before the API address is built — encoding it as-is produces
 * a double-encoded path (`%25E0...`) that the API answers with 404.
 */
const baseApi = (
  process.env.BASE_API ??
  process.env.NEXT_PUBLIC_BASE_API ??
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export const POST = async (
  request: Request,
  context: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await context.params;

  const headers = new Headers({ "Content-Type": "application/json" });

  const accessToken = (await cookies()).get("tth_access_token")?.value;
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  let upstream: Response;
  try {
    upstream = await fetch(
      `${baseApi}/views/${encodeURIComponent(decodeSlug(slug))}`,
      {
        method: "POST",
        headers,
        body: await request.text(),
        cache: "no-store",
        redirect: "manual",
      },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "The API did not answer" },
      { status: 502 },
    );
  }

  // The count is per reader, never shared: no intermediate may store this.
  const response = new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
  });
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) response.headers.set("content-type", upstreamType);
  response.headers.set("cache-control", "no-store");

  return response;
};
