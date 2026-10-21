"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  LayoutDashboard,
  FileText,
  Images,
  Settings,
  ListTree,
  Tags,
  Route,
  ShieldCheck,
  Users,
  UserRound,
  MessagesSquare,
} from "lucide-react";
import { AdminShell } from "@/components/patterns/admin-shell";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/client";
import { selectWorkspace } from "@/app/admin/actions";
import type { AdminContext } from "@/lib/admin/types";

export function AdminFrame({
  context,
  organizationId,
  siteId,
  children,
}: {
  context: AdminContext;
  organizationId?: string;
  siteId?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const organization = context.organizations.find(
    (o) => o.id === organizationId,
  );
  const site = context.sites.find((s) => s.id === siteId);
  const can = (p: string) => site?.permissions.includes(p);
  const navigation = [
    { id: "/admin", label: "Vista general", icon: LayoutDashboard },
    ...(can("content.read")
      ? [
          { id: "/admin/content", label: "Contenidos", icon: FileText },
          { id: "/admin/media", label: "Biblioteca", icon: Images },
        ]
      : []),
    ...(can("content.edit")
      ? [{ id: "/admin/catalogs", label: "Autores y taxonomías", icon: Tags }]
      : []),
    ...(can("sites.manage")
      ? [
          { id: "/admin/navigation", label: "Navegación", icon: ListTree },
          { id: "/admin/routes", label: "Rutas y redirecciones", icon: Route },
          { id: "/admin/settings", label: "Sitio y estudio", icon: Settings },
        ]
      : []),
    ...(can("contacts.read")
      ? [{ id: "/admin/contacts", label: "Consultas", icon: MessagesSquare }]
      : []),
    ...(can("audit.read") || context.super_admin
      ? [{ id: "/admin/audit", label: "Auditoría", icon: ShieldCheck }]
      : []),
    ...(context.super_admin
      ? [{ id: "/admin/platform", label: "Estudios y usuarios", icon: Users }]
      : []),
    { id: "/admin/profile", label: "Mi cuenta", icon: UserRound },
  ].map((n) => ({ ...n, href: n.id }));
  const active =
    navigation.find((n) => n.id !== "/admin" && pathname.startsWith(n.id))
      ?.id || "/admin";
  const change = (org: string, selectedSite?: string) => {
    if (
      !window.dispatchEvent(
        new Event("leyer:before-navigate", { cancelable: true }),
      )
    )
      return;
    start(async () => {
      const result = await selectWorkspace(org, selectedSite);
      setError(result.error || "");
      if (!result.error) {
        router.push("/admin");
        router.refresh();
      }
    });
  };
  return (
    <AdminShell
      production
      organization={organization?.name || "Leyer"}
      user={context.profile.display_name || "Mi cuenta"}
      navigation={navigation}
      activeSection={active}
      workspaceControls={
        <div className="workspace-selectors" aria-busy={pending}>
          <Label htmlFor="organization-select">Estudio</Label>
          <Select
            id="organization-select"
            value={organizationId || ""}
            disabled={pending || !context.organizations.length}
            onChange={(e) => change(e.target.value)}
          >
            {!organizationId && <option value="">Sin estudio asignado</option>}
            {context.organizations
              .filter((o) => o.status === "active")
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
          </Select>
          {context.sites.some((s) => s.organization_id === organizationId) && (
            <>
              <Label htmlFor="site-select">Sitio</Label>
              <Select
                id="site-select"
                value={siteId || ""}
                disabled={pending}
                onChange={(e) => change(organizationId!, e.target.value)}
              >
                {context.sites
                  .filter((s) => s.organization_id === organizationId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </Select>
            </>
          )}
        </div>
      }
      breadcrumbs={
        <nav
          aria-label="Ruta de navegación"
          className="flex min-w-0 flex-wrap gap-2 text-sm text-muted-foreground"
        >
          <Link href="/admin">Inicio</Link>
          {active !== "/admin" && (
            <>
              <span aria-hidden>/</span>
              <Link href={active}>
                {navigation.find((n) => n.id === active)?.label}
              </Link>
            </>
          )}
          {pathname.includes("/content/") && (
            <>
              <span aria-hidden>/</span>
              <span>
                {pathname.endsWith("preview")
                  ? "Previsualización privada"
                  : pathname.endsWith("new")
                    ? "Nuevo contenido"
                    : "Editor"}
              </span>
            </>
          )}
        </nav>
      }
      userControls={
        <>
          <ThemeSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/profile">
              {context.profile.display_name || "Mi cuenta"}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (
                !window.dispatchEvent(
                  new Event("leyer:before-navigate", { cancelable: true }),
                )
              )
                return;
              await createClient().auth.signOut();
              router.push("/auth/login");
              router.refresh();
            }}
          >
            Salir
          </Button>
        </>
      }
    >
      {error && <Alert variant="error" title={error} />}
      {children}
    </AdminShell>
  );
}
