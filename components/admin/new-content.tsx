"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RecordForm } from "./resource-manager";
import { mutate } from "@/app/admin/actions";
import { kindLabels } from "@/lib/admin/types";
export function NewContent({

  locale,
}: {

  locale: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <div className="panel-card max-w-xl">
      <RecordForm
        fields={[
          {
            key: "internal_name",
            label: "Nombre interno",
            required: true,
            maxLength: 250,
          },
          {
            key: "kind",
            label: "Tipo",
            type: "select",
            required: true,
            defaultValue: "page",
            options: Object.entries(kindLabels).map(([value, label]) => ({
              value,
              label,
            })),
          },
          {
            key: "locale",
            label: "Idioma",
            required: true,
            defaultValue: locale,
          },
        ]}
        initial={{ id: "" }}
        pending={pending}
        error={error}
        onSubmit={(d) =>
          start(async () => {
            try {
              const r = await mutate({ action: "entry", data: d });
              setError(r.error || "");
              if (r.id) router.push(`/admin/content/${r.id}`);
            } catch {
              setError("No se pudo conectar. Intenta de nuevo.");
            }
          })
        }
        submitLabel="Crear y abrir editor"
      />
    </div>
  );
}
