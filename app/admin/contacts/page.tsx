import {
  requireSite,
  checked,
  pageNumber,
  type Search,
} from "@/lib/admin/server";
import { Heading, Pagination } from "@/components/admin/common";
import { ContactInbox } from "@/components/admin/contact-inbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { contactStatuses } from "@/lib/public/contact-validation";
import type { Row } from "@/lib/admin/types";
export default async function Contacts({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { db, site } = await requireSite("contacts.read");
  const p = await searchParams;
  const page = pageNumber(p.page);
  const q = String(p.q || "")
    .slice(0, 200)
    .replace(/[,%()\\"]/g, " ");
  const state = String(p.status || "");
  let query = db
    .from("contact_submissions")
    .select("*", { count: "exact" })
    .eq("site_id", site.id);
  if (q)
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,subject.ilike.%${q}%`,
    );
  if (state in contactStatuses) query = query.eq("status", state);
  const response = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  return (
    <>
      <Heading
        title="Consultas"
        description="Primeros contactos recibidos por el sitio seleccionado. Solo las personas con permisos de consultas pueden acceder a esta bandeja."
      />
      <form className="panel-filters">
        <div className="panel-field">
          <Label htmlFor="inbox-q">Buscar</Label>
          <Input
            id="inbox-q"
            name="q"
            defaultValue={q}
            placeholder="Nombre, correo o motivo"
          />
        </div>
        <div className="panel-field">
          <Label htmlFor="inbox-status">Estado</Label>
          <Select id="inbox-status" name="status" defaultValue={state}>
            <option value="">Todos</option>
            {Object.entries(contactStatuses).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="outline">Aplicar</Button>
      </form>
      <ContactInbox
        rows={(checked(response) || []) as Row[]}
        siteId={site.id}
        canManage={site.permissions.includes("contacts.manage")}
      />
      <Pagination
        page={page}
        total={response.count || 0}
        base="/admin/contacts"
        params={{ q, status: state }}
      />
    </>
  );
}
