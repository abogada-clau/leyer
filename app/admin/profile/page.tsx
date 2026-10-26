import Link from "next/link";
import { getIdentity } from "@/lib/admin/server";
import { Heading, StateBadge } from "@/components/admin/common";
import { MutationForm } from "@/components/admin/mutation-form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
export default async function Profile() {
  const { context, user } = await getIdentity();
  return (
    <>
      <Heading title="Mi cuenta" description={user.email} />
      <div className="panel-grid">
        <div>
          {context.profile.status === "active" ? (
            <MutationForm
              title="Perfil y preferencias"
              action="profile"
              initial={{
                id: user.id,
                display_name: context.profile.display_name,
                theme: context.profile.preferences.theme || "system",
              }}
              fields={[
                {
                  key: "display_name",
                  label: "Nombre para mostrar",
                  required: true,
                },
                {
                  key: "theme",
                  label: "Tema preferido",
                  type: "select",
                  required: true,
                  options: [
                    { value: "light", label: "Claro" },
                    { value: "dark", label: "Oscuro" },
                    { value: "system", label: "Según el dispositivo" },
                  ],
                },
              ]}
            />
          ) : (
            <Alert variant="warning" title="Tu cuenta está suspendida">
              Contacta a la persona responsable para reactivarla.
            </Alert>
          )}
          <Button asChild variant="outline" className="mt-5">
            <Link href="/auth/update-password">Cambiar contraseña</Link>
          </Button>
        </div>
        <section className="panel-card">
          <h2>Accesos actuales</h2>
          <StateBadge state={context.profile.status} />
          <p className="mt-4 font-medium">
            {context.is_admin ? "Administración del sitio" : "Sin acceso administrativo"}
          </p>
        </section>
      </div>
    </>
  );
}
