import { requireSite } from "@/lib/admin/server";
import { Heading } from "@/components/admin/common";
import { SiteSettings } from "@/components/admin/site-settings";
import { CreateSite } from "@/components/admin/create-site";
export default async function Settings() {
  const { site } = await requireSite("sites.manage");
  return (
    <>
      <Heading
        title="Sitio y estudio"
        description="Estos datos son públicos. Guarda aquí únicamente la información de contacto y presentación del estudio."
      />
      <div className="space-y-6">
        <SiteSettings site={site} />
        <CreateSite organizationId={site.organization_id} />
      </div>
    </>
  );
}
