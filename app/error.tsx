"use client";
import { Button } from "@/components/ui/button";
export default function PublicError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
      <h1 className="font-editorial text-5xl">No pudimos cargar el sitio.</h1>
      <p className="text-muted-foreground">
        Intenta nuevamente en un momento. Tu consulta no se ha enviado si no
        recibiste una confirmación.
      </p>
      <div>
        <Button onClick={reset}>Volver a intentar</Button>
      </div>
    </main>
  );
}
