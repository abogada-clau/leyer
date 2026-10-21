import {
  requireSuper,
  checked,
  pageNumber,
  type Search,
} from "@/lib/admin/server";
import { serviceClient } from "@/lib/admin/service";
import { Heading, Pagination } from "@/components/admin/common";
import { ResourceManager } from "@/components/admin/resource-manager";
import { MutationForm } from "@/components/admin/mutation-form";
import { Alert } from "@/components/ui/alert";
import type { Row } from "@/lib/admin/types";
export default async function Platform({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { db } = await requireSuper();
  const p = await searchParams;
  const page = pageNumber(p.page);
  const results = await Promise.all([
    db.from("organizations").select("*").order("name"),
    db
      .from("organization_memberships")
      .select("*")
      .order("created_at", { ascending: false }),
    db.from("membership_roles").select("*"),
    db.from("platform_role_assignments").select("*"),
    serviceClient().auth.admin.listUsers({ page, perPage: 20 }),
  ]);
  const organizations = (checked(results[0]) || []) as Row[];
  const memberships = (checked(results[1]) || []) as Row[];
  const roles = checked(results[2]) || [];
  const globalRoles = checked(results[3]) || [];
  const authResult = results[4];
  if (authResult.error) throw authResult.error;
  const users = authResult.data.users;
  const ids = [
    ...new Set([
      ...users.map((u) => u.id),
      ...memberships.map((m) => String(m.user_id)),
    ]),
  ];
  const profiles = ids.length
    ? checked(await db.from("profiles").select("*").in("id", ids)) || []
    : [];
  const accounts: Row[] = users.map((u) => ({
    id: u.id,
    email: u.email || "",
    display_name: profiles.find((p) => p.id === u.id)?.display_name || "",
    status: profiles.find((p) => p.id === u.id)?.status || "",
    enabled: globalRoles.some((r) => r.user_id === u.id),
  }));
  return (
    <>
      <Heading
        title="Estudios y usuarios"
        description="Administración global exclusiva para superadministradores. Las cuentas comienzan sin roles; cada membresía puede tener cero o varios."
      />
      <Alert
        className="mb-6"
        variant="warning"
        title="Efecto de las acciones sensibles"
      >
        Suspender una cuenta revoca sus permisos en todos los estudios.
        Suspender una membresía afecta solo a ese estudio. Suspender un estudio
        deshabilita sus permisos y su presencia pública. Siempre debe existir un
        superadministrador activo.
      </Alert>
      <div className="space-y-6">
        <ResourceManager
          title="Estudios"
          action="platform.organization"
          rows={organizations}
          columns={[
            { key: "name", label: "Nombre" },
            { key: "slug", label: "Identificador" },
            { key: "status", label: "Estado" },
          ]}
          fields={[
            { key: "name", label: "Nombre", required: true },
            { key: "slug", label: "Identificador", required: true },
            {
              key: "status",
              label: "Estado",
              type: "select",
              defaultValue: "active",
              required: true,
              options: [
                { value: "active", label: "Activo" },
                { value: "suspended", label: "Suspendido" },
                { value: "archived", label: "Archivado" },
              ],
            },
          ]}
          confirmation="Al suspender o archivar un estudio se retiran sus permisos y el contenido deja de ser público. Guardar confirma este cambio."
        />
        <MutationForm
          title="Invitar una cuenta"
          action="platform.invite"
          submitLabel="Enviar invitación mediante Supabase Auth"
          fields={[
            { key: "display_name", label: "Nombre", required: true },
            {
              key: "email",
              label: "Correo electrónico",
              type: "email",
              required: true,
            },
          ]}
        />
        <ResourceManager
          title="Cuentas"
          action="platform.status"
          rows={accounts}
          allowCreate={false}
          columns={[
            { key: "email", label: "Correo" },
            { key: "display_name", label: "Nombre" },
            { key: "status", label: "Estado" },
          ]}
          fields={[
            {
              key: "status",
              label: "Estado de la cuenta",
              type: "select",
              required: true,
              options: [
                { value: "active", label: "Activa" },
                {
                  value: "suspended",
                  label: "Suspendida · revoca todos sus permisos",
                },
              ],
            },
          ]}
          confirmation="Guardar confirma el cambio de acceso de esta cuenta en todos los estudios. La suspensión de aplicación se comprueba en cada operación, sin depender del token de sesión."
        />
        <Pagination
          page={page}
          total={
            "total" in authResult.data
              ? Number(authResult.data.total)
              : page * 20 + (users.length === 20 ? 1 : 0)
          }
          base="/admin/platform"
        />
        <ResourceManager
          title="Superadministradores globales"
          action="platform.super"
          rows={accounts}
          allowCreate={false}
          columns={[
            { key: "email", label: "Correo" },
            { key: "enabled", label: "Superadministrador" },
          ]}
          fields={[
            {
              key: "enabled",
              label: "Conceder acceso global de superadministrador",
              type: "checkbox",
              help: "Desmarcar retira el rol. No se puede retirar el último superadministrador activo.",
            },
          ]}
          confirmation="Este rol puede gestionar todos los estudios, cuentas y contenidos. Guardar confirma la concesión o revocación de estos privilegios."
        />
        <ResourceManager
          title="Membresías y roles por estudio"
          action="platform.membership"
          rows={memberships.map((m) => ({
            ...m,
            user_name: String(
              profiles.find((p) => p.id === m.user_id)?.display_name ||
                m.user_id,
            ),
            organization_name: String(
              organizations.find((o) => o.id === m.organization_id)?.name || "",
            ),
            roles: roles
              .filter((r) => r.membership_id === m.id)
              .map((r) => String(r.role_code)),
          }))}
          columns={[
            { key: "user_name", label: "Persona" },
            { key: "organization_name", label: "Estudio" },
            { key: "status", label: "Estado" },
            { key: "roles", label: "Roles" },
          ]}
          fields={[
            {
              key: "user_id",
              label: "Cuenta",
              immutableOnEdit: true,
              type: "select",
              required: true,
              options: profiles.map((u) => ({
                value: u.id,
                label: `${u.display_name || u.id}${users.find((a) => a.id === u.id)?.email ? " · " + users.find((a) => a.id === u.id)!.email : ""}`,
              })),
            },
            {
              key: "organization_id",
              label: "Estudio",
              immutableOnEdit: true,
              type: "select",
              required: true,
              options: organizations.map((o) => ({
                value: o.id,
                label: String(o.name),
              })),
            },
            {
              key: "status",
              label: "Estado",
              type: "select",
              required: true,
              defaultValue: "active",
              options: [
                { value: "active", label: "Activa" },
                { value: "invited", label: "Invitada" },
                { value: "suspended", label: "Suspendida" },
              ],
            },
            {
              key: "roles",
              label: "Roles del estudio",
              type: "roles",
              help: "Puedes dejar ambos sin seleccionar. Un abogado necesita también Administrador para gestionar el CMS.",
              options: [
                { value: "admin", label: "Administrador del CMS" },
                { value: "lawyer", label: "Abogado" },
              ],
            },
          ]}
          confirmation="Los roles se reemplazan en una sola transacción. Al suspender o retirar Administrador, se revoca el acceso al CMS de este estudio."
        />
      </div>
    </>
  );
}
