import { requireSite, checked } from "@/lib/admin/server";
import { Heading } from "@/components/admin/common";
import { ResourceManager } from "@/components/admin/resource-manager";
import type { Row, Entry } from "@/lib/admin/types";
export default async function Navigation() {
  const { db, site } = await requireSite("sites.manage");
  const results = await Promise.all([
    db.from("menus").select("*").eq("site_id", site.id).order("name"),
    db.from("menu_items").select("*").eq("site_id", site.id).order("position"),
    db.rpc("get_cms_listing", { p_site_id: site.id }),
  ]);
  const menus = (checked(results[0]) || []) as Row[];
  const items = (checked(results[1]) || []) as Row[];
  const entries = (checked(results[2]) || []) as Entry[];
  return (
    <>
      <Heading
        title="Navegación"
        description="Configura los menús del sitio. La posición ordena los elementos desde cero; un elemento puede enlazar a un contenido o a una dirección externa."
      />
      <div className="space-y-6">
        <ResourceManager
          title="Menús"
          action="menu"
          siteId={site.id}
          rows={menus}
          columns={[
            { key: "name", label: "Nombre" },
            { key: "code", label: "Código" },
            { key: "locale", label: "Idioma" },
            { key: "is_public", label: "Público" },
          ]}
          fields={[
            { key: "name", label: "Nombre", required: true },
            { key: "code", label: "Código", required: true },
            {
              key: "locale",
              label: "Idioma",
              required: true,
              defaultValue: site.default_locale,
            },
            {
              key: "is_public",
              label: "Visible en el sitio público",
              type: "checkbox",
              help: "Solo se muestran los contenidos publicados y con el sitio activo.",
            },
          ]}
          allowDelete
        />
        <ResourceManager
          title="Elementos del menú"
          action="menu_item"
          siteId={site.id}
          rows={items.map((i) => ({
            ...i,
            menu_name: String(
              menus.find((m) => m.id === i.menu_id)?.name || "",
            ),
          }))}
          columns={[
            { key: "label", label: "Etiqueta" },
            { key: "menu_name", label: "Menú" },
            { key: "position", label: "Posición" },
            { key: "external_url", label: "Enlace externo" },
          ]}
          fields={[
            {
              key: "menu_id",
              label: "Menú",
              type: "select",
              required: true,
              options: menus.map((m) => ({
                value: m.id,
                label: String(m.name),
              })),
            },
            { key: "label", label: "Etiqueta visible", required: true },
            {
              key: "position",
              label: "Posición desde cero",
              type: "number",
              defaultValue: 0,
              required: true,
            },
            {
              key: "parent_id",
              label: "Elemento superior",
              type: "select",
              options: items.map((i) => ({
                value: i.id,
                label: String(i.label),
              })),
              help: "Debe pertenecer al mismo menú.",
            },
            {
              key: "entry_id",
              label: "Contenido de destino",
              type: "select",
              options: entries.map((e) => ({
                value: e.id,
                label: e.internal_name,
              })),
            },
            {
              key: "external_url",
              label: "O enlace externo",
              help: "Completa solo uno de los destinos. HTTPS, mailto: o tel:.",
            },
          ]}
          allowDelete
        />
      </div>
    </>
  );
}
