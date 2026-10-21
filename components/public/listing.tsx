import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EntryCards } from "./entry-cards";
import { listEntries } from "@/lib/public/data";
import { publicClient, result } from "@/lib/public/db";
import { publicHref } from "@/lib/public/paths";
import type { PublicContext } from "@/lib/public/types";
export async function PublicListing({
  context: c,
  kind = "post",
  search = {},
  termId,
  authorId,
}: {
  context: PublicContext;
  kind?: string;
  search?: Record<string, string | string[] | undefined>;
  termId?: string;
  authorId?: string;
}) {
  const q = String(search.q || "").slice(0, 200);
  const page = Math.max(
    1,
    Math.min(100000, Math.floor(Number(search.page) || 1)),
  );
  const selected = termId || String(search.term || "");
  const terms =
    kind === "post"
      ? result(
          await publicClient()
            .from("terms")
            .select("id,name")
            .eq("site_id", c.site.id)
            .order("name"),
        ) || []
      : [];
  const { rows, total } = await listEntries(c, {
    kind,
    q,
    page,
    termId: selected || undefined,
    authorId,
  });
  const pages = Math.max(1, Math.ceil(total / 9));
  const href = (n: number) =>
    publicHref(c, c.path) +
    "?" +
    new URLSearchParams({ q, term: selected, page: String(n) });
  return (
    <section className="public-listing">
      {!authorId && (
        <form className="public-list-filters" action={publicHref(c, c.path)}>
          <div className="public-field">
            <Label htmlFor="public-search">
              Buscar {kind === "post" ? "artículos" : "servicios"}
            </Label>
            <Input
              name="q"
              id="public-search"
              placeholder="¿Qué te gustaría conocer?"
              defaultValue={q}
            />
          </div>
          {terms.length > 0 && !termId && (
            <div className="public-field">
              <Label htmlFor="public-term">Tema</Label>
              <Select id="public-term" name="term" defaultValue={selected}>
                <option value="">Todos los temas</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>
      )}
      {rows.length ? (
        <EntryCards entries={rows} context={c} />
      ) : (
        <div className="public-empty">
          <h2 className="font-editorial">
            Todavía no hay publicaciones para mostrar.
          </h2>
          <p>
            {q || selected
              ? "Prueba otra búsqueda o tema."
              : "Vuelve pronto para encontrar nuevo contenido del estudio."}
          </p>
        </div>
      )}
      {total > 9 && (
        <nav
          aria-label="Paginación de publicaciones"
          className="public-pagination"
        >
          <span>
            {total} publicaciones · Página {page} de {pages}
          </span>
          <div>
            {page > 1 && (
              <Button asChild variant="outline">
                <Link href={href(page - 1)}>Anterior</Link>
              </Button>
            )}
            {page < pages && (
              <Button asChild variant="outline">
                <Link href={href(page + 1)}>Siguiente</Link>
              </Button>
            )}
          </div>
        </nav>
      )}
    </section>
  );
}
