import { requireSite } from "@/lib/admin/server";
import { Heading } from "@/components/admin/common";
import { SiteSettings } from "@/components/admin/site-settings";
export default async function Settings() {
  const { site } = await requireSite("sites.manage");
  return (
    <>
      <Heading
        title="Configuración"
        description="Estos datos son públicos. Guarda aquí únicamente la información de contacto y presentación del estudio."
      />
      <div className="space-y-6">
        <SiteSettings site={site} />
      </div>
    </>
  );
}
