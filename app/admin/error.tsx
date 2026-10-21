"use client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <Alert variant="error" title="No pudimos cargar esta sección">
        Comprueba tu conexión y que tu cuenta aún tenga acceso al estudio
        seleccionado.
      </Alert>
      <Button onClick={reset}>Volver a intentar</Button>
    </div>
  );
}
