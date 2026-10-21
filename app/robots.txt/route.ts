import { resolveContext, canonicalUrl } from "@/lib/public/context";
export async function GET(request: Request) {
  const c = await resolveContext(request.headers.get("host") || "", "/");
  const value =
    !c || c.local
      ? "User-agent: *\nDisallow: /\n"
      : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /auth\nDisallow: /api\nDisallow: /protected\nDisallow: /design-system\nDisallow: /sitios\nSitemap: ${canonicalUrl(c, "/sitemap.xml")}\n`;
  return new Response(value, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
