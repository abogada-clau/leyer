import { requireSite } from "@/lib/admin/server";
import { Heading } from "@/components/admin/common";
import { NewContent } from "@/components/admin/new-content";
export default async function NewContentPage() {
  const { site } = await requireSite("content.edit");
  return (
    <>
      <Heading
        title="Crear contenido"
        description="El tipo y el idioma identifican el contenido y se mantienen durante todo su historial."
      />
      <NewContent locale={site.default_locale} />
    </>
  );
}
