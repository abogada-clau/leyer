"use client";

import { useActionState, useState } from "react";
import { Copy } from "lucide-react";
import { createInvitation } from "@/app/admin/users/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UserInvitation() {
  const [copyStatus, setCopyStatus] = useState("");
  const [result, submit, pending] = useActionState(
    async (_: Awaited<ReturnType<typeof createInvitation>>, form: FormData) => {
      setCopyStatus("");
      try {
        return await createInvitation(form);
      } catch {
        return { error: "No se pudo generar la invitación. Intenta nuevamente." };
      }
    },
    {},
  );

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("Enlace copiado.");
    } catch {
      setCopyStatus("Selecciona el enlace y cópialo manualmente.");
    }
  }

  const url = result.url;
  return (
    <section className="panel-card max-w-2xl">
      <h2>Invitar usuario</h2>
      <p className="mb-5 text-sm text-muted-foreground">
        El enlace es de un solo uso. La persona invitada podrá crear su contraseña y acceder al panel como administradora.
      </p>
      <form action={submit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="invite-email">Correo electrónico</Label>
          <Input id="invite-email" name="email" type="email" required maxLength={254} />
        </div>
        <Button type="submit" disabled={pending} className="justify-self-start">
          {pending ? "Generando…" : "Generar enlace de invitación"}
        </Button>
      </form>
      {result.error && !pending && <Alert variant="error" title={result.error} className="mt-5" />}
      {url && !pending && (
        <div className="mt-5 grid gap-2">
          <Label htmlFor="invite-url">Enlace de invitación</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="invite-url"
              value={url}
              readOnly
              className="min-w-0 flex-1"
              onFocus={(event) => event.currentTarget.select()}
            />
            <Button type="button" variant="outline" onClick={() => copy(url)}>
              <Copy aria-hidden /> Copiar enlace
            </Button>
          </div>
          <p className="text-sm text-muted-foreground" role="status">
            {copyStatus || "Comparte el enlace solo con la persona invitada."}
          </p>
        </div>
      )}
    </section>
  );
}
