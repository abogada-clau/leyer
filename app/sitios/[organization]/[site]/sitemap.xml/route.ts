import { sitemapResponse } from "@/lib/public/sitemap";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ organization: string; site: string }> },
) {
  const p = await params;
  return sitemapResponse(request, `/sitios/${p.organization}/${p.site}`);
}
