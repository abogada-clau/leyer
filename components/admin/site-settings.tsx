"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RecordForm } from "./resource-manager";
import { Alert } from "@/components/ui/alert";
import { mutate } from "@/app/admin/actions";
import type { Site, ActionResult } from "@/lib/admin/types";
export function SiteSettings({ site }: { site: Site }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  const router = useRouter();
  return (
    <section className="panel-card">
      <h2>Configuración del sitio y datos públicos</h2>
      <RecordForm
        initial={{
          ...site,
          public_name: site.settings.public_name || "",
          email: site.settings.email || "",
          phone: site.settings.phone || "",
          address: site.settings.address || "",
          description: site.settings.description || "",
          contact_enabled: site.settings.contact_enabled === true,
          contact_on_landings: site.settings.contact_on_landings === true,
          privacy_path: site.settings.privacy_path || "/privacidad",
          contact_path: site.settings.contact_path || "/contacto",
          blog_path: site.settings.blog_path || "/articulos",
          team_path: site.settings.team_path || "/equipo",
          services_path: site.settings.services_path || "/servicios",
        }}
        fields={[
          { key: "name", label: "Nombre interno del sitio", required: true },
          {
            key: "domain",
            label: "Dominio",
            help: "Sin protocolo ni barras, por ejemplo estudio.cl.",
          },
          {
            key: "default_locale",
            label: "Idioma predeterminado",
            required: true,
          },
          {
            key: "status",
            label: "Estado del sitio",
            type: "select",
            required: true,
            options: [
              { value: "draft", label: "Borrador" },
              {
                value: "active",
                label: "Activo · permite ver el contenido publicado",
              },
              {
                value: "archived",
                label: "Archivado · retira el sitio público",
              },
            ],
          },
          {
            key: "contact_enabled",
            label: "Activar formularios de consulta",
            type: "checkbox",
            help: "Requiere una política de privacidad publicada y la configuración del servidor.",
          },
          {
            key: "contact_on_landings",
            label: "Mostrar formulario en landings de servicios",
            type: "checkbox",
          },
          {
            key: "privacy_path",
            label: "Ruta de la política de privacidad",
            required: true,
          },
          { key: "contact_path", label: "Ruta de contacto", required: true },
          { key: "blog_path", label: "Ruta de artículos", required: true },
          { key: "team_path", label: "Ruta del equipo", required: true },
          { key: "services_path", label: "Ruta de servicios", required: true },
          { key: "public_name", label: "Nombre público del estudio" },
          { key: "email", label: "Correo público", type: "email" },
          { key: "phone", label: "Teléfono público" },
          { key: "address", label: "Dirección pública" },
          {
            key: "description",
            label: "Presentación del estudio",
            type: "textarea",
          },
        ]}
        pending={pending}
        error={result.error}
        onSubmit={(data) =>
          start(async () => {
            const {
              public_name,
              email,
              phone,
              address,
              description,
              contact_enabled,
              contact_on_landings,
              privacy_path,
              contact_path,
              blog_path,
              team_path,
              services_path,
              ...config
            } = data;
            const r = await mutate({
              action: "site",
              siteId: site.id,
              id: site.id,
              data: {
                ...config,
                settings: {
                  ...site.settings,
                  public_name,
                  email,
                  phone,
                  address,
                  description,
                  contact_enabled,
                  contact_on_landings,
                  privacy_path,
                  contact_path,
                  blog_path,
                  team_path,
                  services_path,
                },
              },
            });
            setResult(r);
            if (!r.error) router.refresh();
          })
        }
      />
      {result.message && (
        <Alert variant="success" title={result.message} className="mt-5" />
      )}
    </section>
  );
}
