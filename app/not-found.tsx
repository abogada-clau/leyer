import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/design-system/brand";
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
      <Brand />
      <p className="mt-12 text-sm text-muted-foreground">
        Página no disponible · 404
      </p>
      <h1 className="font-editorial text-5xl">No encontramos esta página.</h1>
      <p className="leading-relaxed text-muted-foreground">
        La dirección puede haber cambiado, el contenido pudo retirarse o el
        sitio aún no está activo.
      </p>
      <div>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
