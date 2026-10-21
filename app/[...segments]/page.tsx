import { publicPage, publicMetadata } from "@/lib/public/page";
export const instant = false;
type Props = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props) {
  return publicMetadata("/" + (await params).segments.join("/"));
}
export default async function Page({ params, searchParams }: Props) {
  return publicPage(
    "/" + (await params).segments.join("/"),
    await searchParams,
  );
}
