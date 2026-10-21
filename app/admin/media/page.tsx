import {
  requireSite,
  checked,
  pageNumber,
  type Search,
} from "@/lib/admin/server";
import { Heading, Pagination } from "@/components/admin/common";
import { MediaLibrary } from "@/components/admin/media-library";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/lib/admin/types";
export default async function MediaPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { db, site } = await requireSite();
  const p = await searchParams;
  const page = pageNumber(p.page);
  const q = String(p.q || "").slice(0, 200);
  const bucket = String(p.bucket || "");
  const type = String(p.type || "");
  let query = db.rpc(
    "get_cms_media",
    { p_site_id: site.id },
    { count: "exact" },
  );
  if (q) query = query.ilike("filename", `%${q}%`);
  if (["cms-public", "cms-private"].includes(bucket))
    query = query.eq("bucket_id", bucket);
  if (type === "images") query = query.like("mime_type", "image/%");
  if (type === "pdf") query = query.eq("mime_type", "application/pdf");
  const result = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  const rows = (checked(result) || []) as Asset[];
  return (
    <>
      <Heading
        title="Biblioteca"
        description="Recursos del CMS. El destino público permite difusión abierta; el privado requiere acceso editorial. Los documentos de expedientes tendrán un espacio separado."
      />
      <form className="panel-filters">
        <div className="panel-field">
          <Label htmlFor="media-q">Buscar</Label>
          <Input
            id="media-q"
            name="q"
            defaultValue={q}
            placeholder="Nombre del archivo"
          />
        </div>
        <div className="panel-field">
          <Label htmlFor="bucket">Destino</Label>
          <Select id="bucket" name="bucket" defaultValue={bucket}>
            <option value="">Todos</option>
            <option value="cms-private">Privado</option>
            <option value="cms-public">Público</option>
          </Select>
        </div>
        <div className="panel-field">
          <Label htmlFor="media-type">Formato</Label>
          <Select id="media-type" name="type" defaultValue={type}>
            <option value="">Todos</option>
            <option value="images">Imágenes</option>
            <option value="pdf">PDF</option>
          </Select>
        </div>
        <Button variant="outline">Aplicar</Button>
      </form>
      <MediaLibrary
        rows={rows}
        siteId={site.id}
        canManage={site.permissions.includes("media.manage")}
      />
      <Pagination
        page={page}
        total={result.count || 0}
        base="/admin/media"
        params={{ q, bucket, type }}
      />
    </>
  );
}
