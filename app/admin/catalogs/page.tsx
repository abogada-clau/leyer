import { requireSite, checked } from "@/lib/admin/server";
import { Heading } from "@/components/admin/common";
import { ResourceManager } from "@/components/admin/resource-manager";
import type { Row } from "@/lib/admin/types";
export default async function Catalogs() {
  const { db, site } = await requireSite("content.edit");
  const results = await Promise.all([
    db.from("authors").select("*").eq("site_id", site.id).order("display_name"),
    db.from("taxonomies").select("*").eq("site_id", site.id).order("name"),
    db.from("terms").select("*").eq("site_id", site.id).order("name"),
    db.rpc("get_cms_media", { p_site_id: site.id }),
  ]);
  const [authors, taxonomies, terms, media] = results.map(
    (r) => (checked(r) || []) as Row[],
  );
  return (
    <>
      <Heading
        title="Autores y taxonomías"
        description="Catálogos compartidos por los contenidos de este sitio. Los cambios se reflejan en las páginas que los utilizan."
      />
      <div className="space-y-6">
        <ResourceManager
          title="Autores"
          action="author"
          rows={authors}
          columns={[
            { key: "display_name", label: "Nombre" },
            { key: "slug", label: "Identificador" },
          ]}
          fields={[
            { key: "display_name", label: "Nombre público", required: true },
            { key: "slug", label: "Identificador", required: true },
            { key: "biography", label: "Biografía", type: "textarea" },
            {
              key: "professional_title",
              label: "Cargo o presentación profesional",
            },
            {
              key: "is_public",
              label: "Mostrar en el equipo público",
              type: "checkbox",
              help: "Activa un perfil público independiente de sus artículos. Usa una imagen pública.",
            },
            {
              key: "avatar_asset_id",
              label: "Imagen del autor",
              type: "select",
              options: media
                .filter((a) => String(a.mime_type).startsWith("image/"))
                .map((a) => ({
                  value: a.id,
                  label: `${a.filename} · ${a.bucket_id}`,
                })),
              help: "Para publicar contenido de este autor, su imagen debe estar en el destino público.",
            },
          ]}
          allowDelete
        />
        <ResourceManager
          title="Taxonomías"
          action="taxonomy"
          rows={taxonomies}
          columns={[
            { key: "name", label: "Nombre" },
            { key: "code", label: "Código" },
          ]}
          fields={[
            { key: "name", label: "Nombre", required: true },
            {
              key: "code",
              label: "Código",
              required: true,
              help: "Ejemplos: category (categorías), tag (etiquetas).",
            },
          ]}
          allowDelete
        />
        <ResourceManager
          title="Categorías y etiquetas"
          action="term"
          rows={terms.map((t) => ({
            ...t,
            taxonomy_name: String(
              taxonomies.find((tx) => tx.id === t.taxonomy_id)?.name || "",
            ),
          }))}
          columns={[
            { key: "name", label: "Nombre" },
            { key: "taxonomy_name", label: "Taxonomía" },
            { key: "slug", label: "Identificador" },
          ]}
          fields={[
            {
              key: "taxonomy_id",
              label: "Taxonomía",
              type: "select",
              required: true,
              options: taxonomies.map((t) => ({
                value: t.id,
                label: String(t.name),
              })),
            },
            { key: "name", label: "Nombre", required: true },
            { key: "slug", label: "Identificador", required: true },
            {
              key: "parent_id",
              label: "Término superior",
              type: "select",
              options: terms.map((t) => ({
                value: t.id,
                label: String(t.name),
              })),
              help: "Debe pertenecer a la misma taxonomía. La base de datos impide ciclos.",
            },
          ]}
          allowDelete
        />
      </div>
    </>
  );
}
