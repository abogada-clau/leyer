import { publicPage, publicMetadata } from "@/lib/public/page";
export const instant = false;
type Props = {
  params: Promise<{ organization: string; site: string; segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
function path(p: Awaited<Props["params"]>) {
  return `/sitios/${p.organization}/${p.site}${p.segments?.length ? "/" + p.segments.join("/") : ""}`;
}
export async function generateMetadata({ params }: Props) {
  return publicMetadata(path(await params));
}
export default async function Page({ params, searchParams }: Props) {
  return publicPage(path(await params), await searchParams);
}
