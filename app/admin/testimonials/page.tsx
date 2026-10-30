import { requireSite, checked } from "@/lib/admin/server";
import { Heading } from "@/components/admin/common";
import { ResourceManager } from "@/components/admin/resource-manager";
import type { Row } from "@/lib/admin/types";
import { Testimonials } from "@/components/public/testimonials";

export default async function TestimonialsPage() {
  const { db, site } = await requireSite("content.edit");
  const rows = checked(await db.from("testimonials").select("*").eq("site_id", site.id).order("position").order("created_at").order("id")) as Row[];
  return <>
    <Heading title="Testimonios" description="Administra los testimonios compartidos por las páginas del sitio. Solo los publicados aparecen en los carruseles de Inicio y Sobre ALBAR; también puedes insertar el bloque en otros contenidos." />
    <ResourceManager title="Testimonios de clientes" action="testimonial" rows={rows} versioned createLabel="Crear testimonio"
      columns={[{ key: "author_name", label: "Nombre público" }, { key: "context", label: "Referencia" }, { key: "position", label: "Orden" }, { key: "is_published", label: "Publicado" }]}
      fields={[
        { key: "author_name", label: "Nombre público o iniciales", required: true, maxLength: 160 },
        { key: "quote", label: "Testimonio", type: "textarea", required: true, maxLength: 3000 },
        { key: "context", label: "Referencia breve · opcional", maxLength: 200, help: "Por ejemplo, asesoría familiar. Este texto también será público." },
        { key: "position", label: "Orden desde cero", type: "number", required: true, defaultValue: rows.length },
        { key: "is_published", label: "Publicar en el sitio", type: "checkbox", help: "Desactívalo para ocultar el testimonio sin eliminarlo." },
      ]} />
    {rows.length > 0 && <section className="panel-card mt-6">
      <h2>Vista previa privada</h2>
      <p className="mb-6 text-sm text-muted-foreground">Incluye borradores y ejemplos. En el sitio solo aparecen los testimonios publicados.</p>
      <div className="public-site"><Testimonials items={rows.map(row => ({ id: row.id, author_name: String(row.author_name), quote: String(row.quote), context: String(row.context || "") }))} /></div>
    </section>}
  </>;
}
