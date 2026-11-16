"use client";

import { useActionState } from "react";
import { acceptInvitation } from "@/app/auth/invite/actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function AcceptInvitation() {
  const [result, submit, pending] = useActionState(
    async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      try {
        const response = await acceptInvitation(params.get("token_hash") || "");
        if (!response.error) window.location.replace("/auth/update-password");
        return response;
      } catch {
        return { error: "No se pudo aceptar la invitación. Intenta nuevamente." };
      }
    },
    {},
  );

  return (
    <form action={submit} className="space-y-4">
      {result.error && <Alert variant="error" title={result.error} />}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Comprobando…" : "Aceptar invitación"}
      </Button>
    </form>
  );
}
