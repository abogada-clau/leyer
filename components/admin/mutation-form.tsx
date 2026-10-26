"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { RecordForm, type Field } from "./resource-manager";
import { Alert } from "@/components/ui/alert";
import { mutate } from "@/app/admin/actions";
import type { Row, Json, ActionResult } from "@/lib/admin/types";
export function MutationForm({
  action,
  id,
  initial,
  fields,
  submitLabel,
  title,
}: {
  action: string;

  id?: string;
  initial?: Row;
  fields: Field[];
  submitLabel?: string;
  title?: string;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  const router = useRouter();
  const { setTheme } = useTheme();
  return (
    <section className="panel-card">
      {title && <h2>{title}</h2>}
      <RecordForm
        fields={fields}
        initial={initial || { id: "" }}
        error={result.error}
        pending={pending}
        submitLabel={submitLabel}
        onSubmit={(data: Record<string, Json>) =>
          start(async () => {
            try {
              const r = await mutate({ action, id, data });
              setResult(r);
              if (!r.error) {
                if (action === "profile") setTheme(String(data.theme));
                router.refresh();
              }
            } catch {
              setResult({ error: "No se pudo conectar. Intenta nuevamente." });
            }
          })
        }
      />
      {result.message && (
        <Alert variant="success" className="mt-4" title={result.message} />
      )}
    </section>
  );
}
