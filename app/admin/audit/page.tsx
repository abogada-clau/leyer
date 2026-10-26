import {
  requireSite,
  checked,
  pageNumber,
  type Search,
} from "@/lib/admin/server";
import { Heading, Pagination } from "@/components/admin/common";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dateTime, type Row } from "@/lib/admin/types";
const tables: Record<string, string> = {
  profiles: "Perfiles",
  sites: "Configuración",
  content_entries: "Contenidos",
  content_revisions: "Revisiones",
  content_blocks: "Bloques",
  media_assets: "Recursos",
  menus: "Menús",
  menu_items: "Elementos de menú",
  scheduled_publications: "Programación",
  redirects: "Redirecciones",
  authors: "Autores",
  taxonomies: "Taxonomías",
  terms: "Categorías y etiquetas",
};
const actions: Record<string, string> = {
  INSERT: "Creación",
  UPDATE: "Actualización",
  DELETE: "Eliminación",
};
export default async function Audit({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { db } = await requireSite("audit.read");
  const p = await searchParams;
  const page = pageNumber(p.page);
  const table = String(p.table || "");
  const action = String(p.action || "");
  const from = String(p.from || "");
  const to = String(p.to || "");
  const actor = String(p.actor || "");
  let query = db.from("audit_events").select("*", { count: "exact" });
  if (table in tables) query = query.eq("table_name", table);
  if (action in actions) query = query.eq("action", action);
  if (/^\d{4}-\d{2}-\d{2}$/.test(from))
    query = query.gte("created_at", `${from}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to))
    query = query.lte("created_at", `${to}T23:59:59.999Z`);
  if (/^[0-9a-f-]{36}$/.test(actor)) query = query.eq("actor_id", actor);
  const result = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);
  const rows = (checked(result) || []) as Row[];
  return (
    <>
      <Heading
        title="Auditoría"
        description="Registro de cambios disponible según tus permisos. Se conservan las operaciones y los nombres de campos modificados, sin cuerpos de documentos ni credenciales."
      />
      <form className="panel-filters">
        <div className="panel-field">
          <Label htmlFor="audit-table">Área</Label>
          <Select id="audit-table" name="table" defaultValue={table}>
            <option value="">Todas</option>
            {Object.entries(tables).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div className="panel-field">
          <Label htmlFor="audit-action">Acción</Label>
          <Select id="audit-action" name="action" defaultValue={action}>
            <option value="">Todas</option>
            {Object.entries(actions).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div className="panel-field">
          <Label htmlFor="audit-from">Desde · UTC</Label>
          <Input id="audit-from" type="date" name="from" defaultValue={from} />
        </div>
        <div className="panel-field">
          <Label htmlFor="audit-to">Hasta · UTC</Label>
          <Input id="audit-to" type="date" name="to" defaultValue={to} />
        </div>
        <div className="panel-field">
          <Label htmlFor="audit-actor">Identificador de la persona</Label>
          <Input id="audit-actor" name="actor" defaultValue={actor} />
        </div>
        <Button variant="outline">Aplicar</Button>
      </form>
      <div className="panel-card">
        {rows.length ? (
          <DataTable
            caption="Eventos de auditoría"
            rows={rows}
            rowKey={(r) => String(r.id)}
            columns={[
              {
                key: "date",
                header: "Fecha · Santiago",
                cell: (r) => dateTime(String(r.created_at)),
              },
              {
                key: "action",
                header: "Acción",
                cell: (r) => actions[String(r.action)],
              },
              {
                key: "table",
                header: "Área",
                cell: (r) =>
                  tables[String(r.table_name)] || String(r.table_name),
              },
              {
                key: "actor",
                header: "Persona",
                cell: (r) => (
                  <span className="text-xs">
                    {String(r.actor_id || "Proceso del sistema")}
                  </span>
                ),
              },
              {
                key: "changed",
                header: "Campos modificados",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground">
                    {(r.changed_fields as string[]).join(", ")}
                  </span>
                ),
              },
            ]}
          />
        ) : (
          <p className="text-muted-foreground">
            No hay eventos para estos filtros.
          </p>
        )}
      </div>
      <Pagination
        page={page}
        total={result.count || 0}
        base="/admin/audit"
        params={{ table, action, from, to, actor }}
      />
    </>
  );
}
