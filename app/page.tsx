import { publicPage, publicMetadata } from "@/lib/public/page";
export const instant = false;
export async function generateMetadata() {
  return publicMetadata("/");
}
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return publicPage("/", await searchParams);
}
