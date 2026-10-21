import Link from "next/link";
import { FileText, ImageIcon, Clock, Shield } from "lucide-react";
import { getSelection, checked } from "@/lib/admin/server";
import { Heading, StateBadge } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/patterns/content";
import { DataTable } from "@/components/ui/data-table";
import { CreateSite } from "@/components/admin/create-site";
import { dateTime } from "@/lib/admin/types";
export default async function Dashboard() {
  const { db, context, site, organization } = await getSelection();
  if (context.profile.status !== "active")
    return (
      <>
        <Heading title="Cuenta suspendida" />
        <Alert variant="warning" title="El acceso está suspendido">
          Contacta a un superadministrador para reactivar tu cuenta.
        </Alert>
      </>
    );
  if (!site) {
    const member = context.memberships.find(
      (m) => m.organization_id === organization?.id && m.status === "active",
    );
    const canCreate = context.super_admin || member?.roles.includes("admin");
    return (
      <>
        <Heading
          title={`Hola${context.profile.display_name ? `, ${context.profile.display_name}` : ""}`}
          description="Tu espacio de trabajo en Leyer."
        />
        <EmptyState
          icon={Shield}
          title={
            member?.roles.includes("lawyer")
              ? "Tu cuenta de abogado está activa"
              : "Acceso pendiente"
          }
          description={
            member?.roles.includes("lawyer")
              ? "Tu membresía no incluye administración de contenidos. Puedes consultar tu cuenta. La gestión documental y los expedientes se habilitarán en una etapa posterior."
              : "Todavía no tienes un sitio autorizado. Un superadministrador puede asignarte un estudio y los roles que correspondan."
          }
          action={
            <Button asChild variant="outline">
              <Link href="/admin/profile">Ver mi cuenta</Link>
            </Button>
          }
        />
        {organization && canCreate && (
          <div className="mt-6">
            <CreateSite organizationId={organization.id} />
          </div>
        )}
        {context.super_admin && (
          <Button asChild className="mt-6">
            <Link href="/admin/platform">Gestionar estudios y usuarios</Link>
          </Button>
        )}
      </>
    );
  }
  const [metricsResult, schedulesResult, activityResult] = await Promise.all([
    db.rpc("get_cms_dashboard", { p_site_id: site.id }),
    db
      .from("scheduled_publications")
      .select("id,entry_id,run_at,status,error_message")
      .eq("site_id", site.id)
      .eq("status", "pending")
      .order("run_at")
      .limit(5),
    site.permissions.includes("audit.read")
      ? db
          .from("audit_events")
          .select("id,action,table_name,created_at")
          .eq("organization_id", site.organization_id)
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const metrics = checked(metricsResult);
  const schedules = checked(schedulesResult) || [];
  const activity = checked(activityResult) || [];
  return (
    <>
      <Heading
        title="Vista general"
        description={`${organization?.name} · ${site.name}. La actividad y los indicadores reflejan los datos guardados.`}
      >
        <div className="flex flex-wrap gap-2">
          {site.permissions.includes("content.edit") && (
            <Button asChild>
              <Link href="/admin/content/new">Crear contenido</Link>
            </Button>
          )}
          {site.permissions.includes("media.manage") && (
            <Button asChild variant="outline">
              <Link href="/admin/media">Cargar recursos</Link>
            </Button>
          )}
        </div>
      </Heading>
      {site.status !== "active" && (
        <Alert
          className="mb-6"
          variant="info"
          title="El sitio todavía no está activo"
        >
          Las publicaciones se conservan en el CMS. Activa el sitio desde su
          configuración cuando deba ser público.
        </Alert>
      )}
      <div className="panel-stats">
        {[
          ["Contenidos publicados", metrics.published],
          ["Borradores por trabajar", metrics.draft],
          ["Pendientes de revisión", metrics.review],
          ["Recursos de biblioteca", metrics.media],
        ].map(([label, value]) => (
          <div className="panel-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="panel-grid">
        <section className="panel-card">
          <h2 className="flex items-center gap-2">
            <Clock size={18} />
            Publicaciones programadas
          </h2>
          {schedules.length ? (
            <ul className="divide-y">
              {schedules.map((j) => (
                <li key={j.id} className="space-y-2 py-4">
                  <Link
                    className="underline underline-offset-4"
                    href={`/admin/content/${j.entry_id}`}
                  >
                    {dateTime(j.run_at)}
                  </Link>{" "}
                  <StateBadge state={j.status} />
                  {j.error_message && (
                    <p className="text-sm text-destructive">
                      {j.error_message}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FileText}
              title="Sin publicaciones programadas"
              description="Aprueba una revisión y elige cuándo publicarla desde el editor."
            />
          )}
        </section>
        <section className="panel-card">
          <h2>Actividad reciente del estudio</h2>
          {activity.length ? (
            <DataTable
              caption="Actividad reciente"
              rows={activity}
              rowKey={(a) => String(a.id)}
              columns={[
                {
                  key: "action",
                  header: "Operación",
                  cell: (a) => (
                    <span>
                      {
                        (
                          {
                            INSERT: "Creación",
                            UPDATE: "Actualización",
                            DELETE: "Eliminación",
                          } as Record<string, string>
                        )[a.action]
                      }{" "}
                      ·{" "}
                      {(
                        {
                          publication_events: "Publicación",
                          content_routes: "Rutas",
                          content_entries: "Contenido",
                          content_revisions: "Revisión",
                          content_blocks: "Bloques",
                          media_assets: "Recurso",
                          sites: "Sitio",
                        } as Record<string, string>
                      )[a.table_name] || "Configuración"}
                    </span>
                  ),
                },
                {
                  key: "date",
                  header: "Fecha",
                  cell: (a) => dateTime(a.created_at),
                },
              ]}
            />
          ) : (
            <EmptyState
              icon={ImageIcon}
              title="Aún no hay actividad visible"
              description="Los cambios autorizados aparecerán aquí a medida que trabajes."
            />
          )}
          {site.permissions.includes("audit.read") && (
            <Button asChild variant="link" className="mt-4">
              <Link href="/admin/audit">Consultar auditoría</Link>
            </Button>
          )}
        </section>
      </div>
    </>
  );
}
