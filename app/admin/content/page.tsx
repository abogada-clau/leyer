import Link from "next/link";
import { FileText } from "lucide-react";
import {
  requireSite,
  checked,
  pageNumber,
  type Search,
} from "@/lib/admin/server";
import type { Entry } from "@/lib/admin/types";
import { kindLabels, entryState, dateTime } from "@/lib/admin/types";
import { Heading, Pagination, StateBadge } from "@/components/admin/common";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/patterns/content";
export default async function Contents({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { db, site } = await requireSite();
  const p = await searchParams;
  const page = pageNumber(p.page);
  const q = String(p.q || "")
    .slice(0, 200)
    .replace(/[,%()\\"]/g, " ");
  const kind = String(p.kind || "");
  const state = String(p.state || "");
  const sort = ["internal_name", "title", "updated_at"].includes(String(p.sort))
    ? String(p.sort)
    : "updated_at";
  const asc = p.direction === "asc";
  let query = db.rpc(
    "get_cms_listing",
    { p_site_id: site.id },
    { count: "exact" },
  );
  if (q)
    query = query.or(
      `internal_name.ilike.%${q}%,title.ilike.%${q}%,path.ilike.%${q}%`,
    );
  if (["page", "landing", "post"].includes(kind))
    query = query.eq("kind", kind);
  if (state === "published")
    query = query.not("published_revision_id", "is", null);
  else if (state === "archived") query = query.not("archived_at", "is", null);
  else if (state === "draft")
    query = query
      .or("editorial_state.eq.draft,revision_id.is.null")
      .is("archived_at", null);
  else if (["in_review", "approved"].includes(state))
    query = query.eq("editorial_state", state).is("archived_at", null);
  const result = await query
    .order(sort, { ascending: asc })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  const rows = (checked(result) || []) as Entry[];
  return (
    <>
      <Heading
        title="Contenidos"
        description="Páginas, landings y artículos. Cada guardado conserva una revisión independiente."
      >
        {site.permissions.includes("content.edit") && (
          <Button asChild>
            <Link href="/admin/content/new">Crear contenido</Link>
          </Button>
        )}
      </Heading>
      <form className="panel-filters">
        <div className="panel-field">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            name="q"
            defaultValue={q}
            placeholder="Nombre, título o ruta"
          />
        </div>
        <div className="panel-field">
          <Label htmlFor="kind">Tipo</Label>
          <Select id="kind" name="kind" defaultValue={kind}>
            <option value="">Todos</option>
            {Object.entries(kindLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div className="panel-field">
          <Label htmlFor="state">Estado</Label>
          <Select id="state" name="state" defaultValue={state}>
            <option value="">Todos</option>
            <option value="draft">Borradores</option>
            <option value="in_review">En revisión</option>
            <option value="approved">Aprobados</option>
            <option value="published">Con versión publicada</option>
            <option value="archived">Archivados</option>
          </Select>
        </div>
        <div className="panel-field">
          <Label htmlFor="sort">Ordenar por</Label>
          <Select id="sort" name="sort" defaultValue={sort}>
            <option value="updated_at">Última actualización</option>
            <option value="title">Título</option>
            <option value="internal_name">Nombre interno</option>
          </Select>
        </div>
        <div className="panel-field">
          <Label htmlFor="direction">Orden</Label>
          <Select
            id="direction"
            name="direction"
            defaultValue={asc ? "asc" : "desc"}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Aplicar
        </Button>
      </form>
      {rows.length ? (
        <div className="panel-card !p-0 overflow-hidden">
          <DataTable
            caption="Contenidos del sitio"
            rows={rows}
            rowKey={(e) => e.id}
            columns={[
              {
                key: "title",
                header: "Contenido",
                cell: (e) => (
                  <div>
                    <Link
                      className="font-medium"
                      href={`/admin/content/${e.id}`}
                    >
                      {e.title || e.internal_name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.internal_name} · {e.path || "Sin ruta todavía"}
                    </p>
                  </div>
                ),
              },
              { key: "kind", header: "Tipo", cell: (e) => kindLabels[e.kind] },
              {
                key: "state",
                header: "Estado",
                cell: (e) => (
                  <div className="space-y-1">
                    <StateBadge state={entryState(e)} />
                    {e.published_revision_id &&
                      e.published_revision_id !== e.revision_id && (
                        <p className="text-xs text-muted-foreground">
                          Versión anterior publicada
                        </p>
                      )}
                  </div>
                ),
              },
              { key: "locale", header: "Idioma", cell: (e) => e.locale },
              {
                key: "date",
                header: "Actualización",
                cell: (e) => dateTime(e.updated_at),
              },
            ]}
          />
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No hay contenidos para esta búsqueda"
          description="Prueba otros filtros o crea el primer contenido del sitio."
        />
      )}
      <Pagination
        page={page}
        total={result.count || 0}
        base="/admin/content"
        params={{ q, kind, state, sort, direction: asc ? "asc" : "desc" }}
      />
    </>
  );
}
