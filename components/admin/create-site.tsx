"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RecordForm } from "./resource-manager";
import { createSite } from "@/app/admin/actions";
export function CreateSite({ organizationId }: { organizationId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <div className="panel-card max-w-lg">
      <h2>Crea el sitio del estudio</h2>
      <RecordForm
        fields={[
          { key: "name", label: "Nombre del sitio", required: true },
          {
            key: "slug",
            label: "Identificador",
            required: true,
            help: "Minúsculas, números y guiones.",
          },
        ]}
        initial={{ id: "" }}
        pending={pending}
        error={error}
        onSubmit={(d) =>
          start(async () => {
            const r = await createSite({
              organizationId,
              name: String(d.name),
              slug: String(d.slug),
            });
            setError(r.error || "");
            if (!r.error) router.refresh();
          })
        }
      />
    </div>
  );
}
