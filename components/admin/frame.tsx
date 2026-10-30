"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Images,
  Settings,
  ListTree,
  Tags,
  Route,
  ShieldCheck,
  UserRound,
  MessagesSquare,
  Quote,
} from "lucide-react";
import { AdminShell } from "@/components/patterns/admin-shell";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/client";
import type { AdminContext } from "@/lib/admin/types";

export function AdminFrame({
  context,

  children,
}: {
  context: AdminContext;

  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const site = context.site;
  const can = (p: string) => site?.permissions.includes(p);
  const navigation = [
    { id: "/admin", label: "Vista general", icon: LayoutDashboard },
    ...(can("content.read")
      ? [
          { id: "/admin/content", label: "Contenidos", icon: FileText },
          { id: "/admin/media", label: "Biblioteca", icon: Images },
          { id: "/admin/testimonials", label: "Testimonios", icon: Quote },
        ]
      : []),
    ...(can("content.edit")
      ? [{ id: "/admin/catalogs", label: "Autores y taxonomías", icon: Tags }]
      : []),
    ...(can("sites.manage")
      ? [
          { id: "/admin/navigation", label: "Navegación", icon: ListTree },
          { id: "/admin/routes", label: "Rutas y redirecciones", icon: Route },
          { id: "/admin/settings", label: "Configuración", icon: Settings },
        ]
      : []),
    ...(can("contacts.read")
      ? [{ id: "/admin/contacts", label: "Consultas", icon: MessagesSquare }]
      : []),
    ...(can("audit.read")
      ? [{ id: "/admin/audit", label: "Auditoría", icon: ShieldCheck }]
      : []),
    { id: "/admin/profile", label: "Mi cuenta", icon: UserRound },
  ].map((n) => ({ ...n, href: n.id }));
  const active =
    navigation.find((n) => n.id !== "/admin" && pathname.startsWith(n.id))
      ?.id || "/admin";
  return (
    <AdminShell
      production
      siteName={site?.name || "ALBAR Abogados"}
      user={context.profile.display_name || "Mi cuenta"}
      navigation={navigation}
      activeSection={active}
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
      {children}
    </AdminShell>
  );
}
