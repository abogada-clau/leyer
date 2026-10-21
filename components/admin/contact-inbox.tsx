"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { updateContact } from "@/app/admin/contacts/actions";
import { dateTime, type Row, type ActionResult } from "@/lib/admin/types";
import { contactStatuses } from "@/lib/public/contact-validation";
export function ContactInbox({
  rows,
  siteId,
  canManage,
}: {
  rows: Row[];
  siteId: string;
  canManage: boolean;
}) {
  const [selected, setSelected] = useState<Row | null>(null);
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  const router = useRouter();
  return (
    <>
      <p className="mb-5 text-sm text-muted-foreground">
        Las consultas están guardadas en la bandeja. No se envían notificaciones
        por correo.
      </p>
      {result.message && (
        <Alert variant="success" className="mb-5" title={result.message} />
      )}
      <div className="panel-card">
        {rows.length ? (
          <DataTable
            caption="Consultas recibidas"
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              {
                key: "name",
                header: "Persona",
                cell: (r) => (
                  <div>
                    <strong>{String(r.name)}</strong>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {String(r.email)}
                    </p>
                  </div>
                ),
              },
              {
                key: "subject",
                header: "Motivo",
                cell: (r) => String(r.subject),
              },
              {
                key: "status",
                header: "Estado",
                cell: (r) => contactStatuses[String(r.status)],
              },
              {
                key: "date",
                header: "Recibida",
                cell: (r) => dateTime(String(r.created_at)),
              },
              {
                key: "actions",
                header: "Detalle",
                cell: (r) => (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(r);
                      setStatus(String(r.status));
                      setNotes(String(r.internal_notes));
                      setResult({});
                    }}
                  >
                    Ver consulta
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <p className="text-muted-foreground">
            No hay consultas para estos filtros.
          </p>
        )}
      </div>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !pending) setSelected(null);
        }}
        title={String(selected?.subject || "Consulta")}
        description={
          selected
            ? `${selected.name} · ${dateTime(String(selected.created_at))}`
            : undefined
        }
      >
        {selected && (
          <div className="space-y-5">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Correo</dt>
                <dd>
                  <a className="underline" href={`mailto:${selected.email}`}>
                    {String(selected.email)}
                  </a>
                </dd>
              </div>
              {selected.phone && (
                <div>
                  <dt className="text-muted-foreground">Teléfono</dt>
                  <dd>{String(selected.phone)}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Mensaje</dt>
                <dd className="mt-2 whitespace-pre-wrap rounded-lg border p-4 leading-relaxed">
                  {String(selected.message)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Origen e idioma</dt>
                <dd>
                  {String(selected.source_path)} · {String(selected.locale)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Consentimiento</dt>
                <dd>
                  Aceptado el {dateTime(String(selected.consent_at))}. Versión
                  de la política:{" "}
                  <span className="break-all">
                    {String(selected.privacy_revision_id)}
                  </span>
                </dd>
              </div>
            </dl>
            {canManage ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  start(async () => {
                    const r = await updateContact(
                      siteId,
                      selected.id,
                      status,
                      notes,
                    );
                    setResult(r);
                    if (!r.error) {
                      setSelected(null);
                      router.refresh();
                    }
                  });
                }}
              >
                <fieldset disabled={pending} className="space-y-4">
                  <div className="panel-field">
                    <Label htmlFor="contact-status">Estado</Label>
                    <Select
                      id="contact-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {Object.entries(contactStatuses).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="panel-field">
                    <Label htmlFor="contact-notes">Notas internas</Label>
                    <Textarea
                      id="contact-notes"
                      maxLength={5000}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  {result.error && (
                    <Alert variant="error" title={result.error} />
                  )}
                  <Button type="submit" disabled={pending}>
                    {pending ? "Guardando…" : "Guardar seguimiento"}
                  </Button>
                </fieldset>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tu permiso permite consultar sin modificar el seguimiento.
              </p>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
