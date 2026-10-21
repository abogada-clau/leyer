import { sitemapResponse } from "@/lib/public/sitemap";
export async function GET(request: Request) {
  return sitemapResponse(request);
}
