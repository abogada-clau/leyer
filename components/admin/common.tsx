import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export function Heading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="panel-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}
export function StateBadge({ state }: { state: string }) {
  return (
    <Badge
      variant={
        state === "Publicado" || state === "active" || state === "completed"
          ? "success"
          : state === "En revisión" ||
              state === "pending" ||
              state === "invited"
            ? "warning"
            : state === "failed" || state === "suspended"
              ? "destructive"
              : "neutral"
      }
    >
      {(
        {
          active: "Activo",
          suspended: "Suspendido",
          archived: "Archivado",
          draft: "Borrador",
          pending: "Pendiente",
          completed: "Completado",
          failed: "Fallido",
          cancelled: "Cancelado",
          invited: "Invitado",
        } as Record<string, string>
      )[state] || state}
    </Badge>
  );
}
export function Pagination({
  page,
  total,
  size = 20,
  base,
  params = {},
}: {
  page: number;
  total: number;
  size?: number;
  base: string;
  params?: Record<string, string>;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  const href = (p: number) =>
    `${base}?${new URLSearchParams({ ...params, page: String(p) })}`;
  return (
    <nav className="panel-pagination" aria-label="Paginación">
      <span>
        {total} resultados · Página {page} de {pages}
      </span>
      <div>
        {page > 1 && (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page - 1)}>Anterior</Link>
          </Button>
        )}
        {page < pages && (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page + 1)}>Siguiente</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
