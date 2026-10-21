import { requireSite, checked } from "@/lib/admin/server";
import { Heading } from "@/components/admin/common";
import { ResourceManager } from "@/components/admin/resource-manager";
import { DataTable } from "@/components/ui/data-table";
import { Alert } from "@/components/ui/alert";
import type { Row, Entry } from "@/lib/admin/types";
export default async function Routes() {
  const { db, site } = await requireSite("sites.manage");
  const results = await Promise.all([
    db.from("content_routes").select("*").eq("site_id", site.id).order("path"),
    db.from("redirects").select("*").eq("site_id", site.id).order("from_path"),
    db.rpc("get_cms_listing", { p_site_id: site.id }),
  ]);
  const routes = (checked(results[0]) || []) as Row[];
  const redirects = (checked(results[1]) || []) as Row[];
  const entries = (checked(results[2]) || []) as Entry[];
  const name = (id: unknown) =>
    entries.find((e) => e.id === id)?.internal_name || String(id);
  return (
    <>
      <Heading
        title="Rutas y redirecciones"
        description="La publicación reserva la ruta canónica y crea una redirección cuando cambia. Las rutas retiradas permanecen reservadas."
      />
      <Alert
        title="Las rutas canónicas se gestionan desde el editor"
        className="mb-6"
      >
        Para cambiar una URL, guarda y publica una nueva revisión del contenido.
      </Alert>
      <section className="panel-card mb-6">
        <h2>Rutas reservadas</h2>
        {routes.length ? (
          <DataTable
            caption="Rutas canónicas"
            rows={routes}
            rowKey={(r) => r.id}
            columns={[
              { key: "path", header: "Ruta", cell: (r) => String(r.path) },
              {
                key: "locale",
                header: "Idioma",
                cell: (r) => String(r.locale),
              },
              {
                key: "entry",
                header: "Contenido",
                cell: (r) => name(r.entry_id),
              },
            ]}
          />
        ) : (
          <p className="text-muted-foreground">
            Todavía no se han publicado contenidos.
          </p>
        )}
      </section>
      <ResourceManager
        title="Redirecciones"
        action="redirect"
        siteId={site.id}
        rows={redirects.map((r) => ({
          ...r,
          target_name: name(r.target_entry_id),
        }))}
        columns={[
          { key: "from_path", label: "Origen" },
          { key: "target_name", label: "Destino" },
          { key: "status_code", label: "Código" },
        ]}
        fields={[
          {
            key: "from_path",
            label: "Ruta de origen",
            required: true,
            help: "No puede ocupar la ruta canónica de otro contenido.",
          },
          {
            key: "locale",
            label: "Idioma",
            required: true,
            defaultValue: site.default_locale,
          },
          {
            key: "target_entry_id",
            label: "Contenido de destino",
            type: "select",
            required: true,
            options: entries.map((e) => ({
              value: e.id,
              label: e.internal_name,
            })),
          },
          {
            key: "status_code",
            label: "Tipo de redirección",
            type: "select",
            required: true,
            defaultValue: "301",
            options: [
              { value: "301", label: "301 · Permanente" },
              { value: "308", label: "308 · Permanente, conserva método" },
            ],
          },
        ]}
        allowDelete
      />
    </>
  );
}
