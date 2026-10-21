"use client";
import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { mutate } from "@/app/admin/actions";
import type { Row, Json } from "@/lib/admin/types";

export type Field = {
  key: string;
  label: string;
  type?: "textarea" | "select" | "checkbox" | "number" | "email" | "roles";
  required?: boolean;
  immutableOnEdit?: boolean;
  maxLength?: number;
  help?: string;
  options?: { value: string; label: string }[];
  defaultValue?: Json;
};
export function ResourceManager({
  title,
  action,
  siteId,
  rows,
  fields,
  columns,
  allowDelete = false,
  description,
  createLabel,
  allowCreate = true,
  confirmation,
}: {
  title: string;
  action: string;
  siteId?: string;
  rows: Row[];
  fields: Field[];
  columns: { key: string; label: string }[];
  allowDelete?: boolean;
  description?: string;
  createLabel?: string;
  allowCreate?: boolean;
  confirmation?: string;
}) {
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [result, setResult] = useState<{ error?: string; message?: string }>(
    {},
  );
  const [pending, start] = useTransition();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = rows.filter((r) =>
    columns.some((c) =>
      String(r[c.key] || "")
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
    ),
  );
  function submit(data: Record<string, Json>, remove = false) {
    start(async () => {
      try {
        const r = await mutate({
          action,
          siteId,
          id: remove ? deleting!.id : editing?.id,
          data,
        });
        setResult(r);
        if (!r.error) {
          setEditing(undefined);
          setDeleting(null);
          router.refresh();
        }
      } catch {
        setResult({
          error:
            "No se pudo conectar. Tu formulario sigue abierto; vuelve a intentar.",
        });
      }
    });
  }
  return (
    <section className="panel-card space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="!mb-1">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {allowCreate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setResult({});
              setEditing(null);
            }}
          >
            <Plus />
            {createLabel || "Agregar"}
          </Button>
        )}
      </div>
      {result.message && <Alert variant="success" title={result.message} />}
      {result.error && editing === undefined && !deleting && (
        <Alert variant="error" title={result.error} />
      )}
      <Input
        aria-label={`Buscar en ${title}`}
        placeholder="Buscar…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
      />
      {filtered.length ? (
        <>
          <DataTable
            caption={title}
            rowKey={(r) => r.id}
            rows={filtered.slice((page - 1) * 10, page * 10)}
            columns={[
              ...columns.map((c) => ({
                key: c.key,
                header: c.label,
                cell: (r: Row) =>
                  Array.isArray(r[c.key])
                    ? (r[c.key] as Json[]).join(", ") || "Sin roles"
                    : typeof r[c.key] === "boolean"
                      ? r[c.key]
                        ? "Sí"
                        : "No"
                      : String(r[c.key] ?? "—"),
              })),
              {
                key: "actions",
                header: "Acciones",
                cell: (r: Row) => (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar ${String(r[columns[0].key])}`}
                      onClick={() => {
                        setResult({});
                        setEditing(r);
                      }}
                    >
                      <Pencil />
                    </Button>
                    {allowDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Eliminar registro"
                        onClick={() => {
                          setResult({});
                          setDeleting(r);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
          <div className="panel-pagination">
            <span>{filtered.length} resultados</span>
            <div>
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page * 10 >= filtered.length}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-lg bg-muted p-5 text-sm text-muted-foreground">
          No hay registros que mostrar.{" "}
          {allowCreate
            ? "Agrega el primero para comenzar."
            : "Prueba otra búsqueda."}
        </p>
      )}
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open && !pending) setEditing(undefined);
        }}
        title={`${editing ? "Editar" : "Agregar"} · ${title}`}
        description={confirmation || description}
      >
        {editing !== undefined && (
          <RecordForm
            key={editing?.id || "new"}
            fields={fields}
            initial={editing || { id: "" }}
            pending={pending}
            error={result.error}
            onSubmit={submit}
          />
        )}
      </Dialog>
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !pending) setDeleting(null);
        }}
        title="Eliminar registro"
        description="Esta acción elimina el registro. Si está asociado a otros datos o a contenido publicado, la base de datos puede impedirlo."
      >
        {result.error && <Alert variant="error" title={result.error} />}
        <div className="mt-5 flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => setDeleting(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => submit({ delete: true }, true)}
          >
            {pending ? "Eliminando…" : "Confirmar eliminación"}
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
export function RecordForm({
  fields,
  initial,
  onSubmit,
  pending,
  error,
  submitLabel = "Guardar cambios",
}: {
  fields: Field[];
  initial: Row;
  onSubmit: (data: Record<string, Json>) => void;
  pending: boolean;
  error?: string;
  submitLabel?: string;
}) {
  const prefix = useId();
  const [data, setData] = useState<Record<string, Json>>(() =>
    Object.fromEntries(
      fields.map((f) => [
        f.key,
        initial[f.key] ??
          f.defaultValue ??
          (f.type === "checkbox" ? false : f.type === "roles" ? [] : ""),
      ]),
    ),
  );
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(data);
      }}
    >
      <fieldset disabled={pending} className="space-y-5">
        {fields.map((f) => {
          const id = `${prefix}-${f.key}`;
          const options = f.options || [];
          return (
            <div className="panel-field" key={f.key}>
              <Label htmlFor={id}>
                {f.label}
                {f.required ? " *" : ""}
              </Label>
              {f.type === "roles" ? (
                <div className="space-y-2">
                  {options.map((o) => (
                    <label className="flex items-center gap-2" key={o.value}>
                      <Checkbox
                        checked={
                          Array.isArray(data[f.key]) &&
                          (data[f.key] as Json[]).includes(o.value)
                        }
                        onCheckedChange={(checked) =>
                          setData({
                            ...data,
                            [f.key]: checked
                              ? [...((data[f.key] as Json[]) || []), o.value]
                              : (data[f.key] as Json[]).filter(
                                  (v) => v !== o.value,
                                ),
                          })
                        }
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              ) : f.type === "checkbox" ? (
                <Checkbox
                  id={id}
                  checked={data[f.key] === true}
                  onCheckedChange={(v) =>
                    setData({ ...data, [f.key]: v === true })
                  }
                />
              ) : f.type === "select" ? (
                <Select
                  id={id}
                  disabled={Boolean(initial.id && f.immutableOnEdit)}
                  required={f.required}
                  value={String(data[f.key] ?? "")}
                  onChange={(e) =>
                    setData({ ...data, [f.key]: e.target.value })
                  }
                >
                  <option value="">Seleccionar…</option>
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea
                  id={id}
                  maxLength={f.maxLength || 10000}
                  required={f.required}
                  value={String(data[f.key] ?? "")}
                  onChange={(e) =>
                    setData({ ...data, [f.key]: e.target.value })
                  }
                />
              ) : (
                <Input
                  id={id}
                  maxLength={f.maxLength || 200}
                  min={f.type === "number" ? 0 : undefined}
                  type={f.type || "text"}
                  required={f.required}
                  value={String(data[f.key] ?? "")}
                  onChange={(e) =>
                    setData({
                      ...data,
                      [f.key]:
                        f.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}
              {f.help && <small>{f.help}</small>}
            </div>
          );
        })}
        {error && <Alert variant="error" title={error} />}
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </fieldset>
    </form>
  );
}
