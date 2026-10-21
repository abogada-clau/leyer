import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminContext, Site } from "./types";

export const getIdentity = cache(async () => {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/auth/login");
  const { data, error: contextError } = await db.rpc("get_admin_context");
  if (contextError)
    throw new Error(`No se pudo comprobar tu acceso: ${contextError.message}`);
  if (!data?.profile)
    throw new Error("No se encontró tu perfil. Contacta al administrador.");
  return { db, user, context: data as AdminContext };
});

export const getSelection = cache(async () => {
  const identity = await getIdentity();
  const jar = await cookies();
  const organizations = identity.context.organizations.filter(
    (o) => o.status === "active",
  );
  const organization =
    organizations.find((o) => o.id === jar.get("leyer-org")?.value) ||
    organizations[0];
  const sites = identity.context.sites.filter(
    (s) => s.organization_id === organization?.id,
  );
  const site =
    sites.find((s) => s.id === jar.get("leyer-site")?.value) || sites[0];
  return { ...identity, organization, site };
});

export async function requireSite(
  permission = "content.read",
  siteId?: string,
) {
  const state = await getSelection();
  const site = siteId
    ? state.context.sites.find((s) => s.id === siteId)
    : state.site;
  if (
    state.context.profile.status !== "active" ||
    !site?.permissions.includes(permission)
  )
    throw new Error(
      "No tienes permiso vigente para esta operación en el sitio seleccionado.",
    );
  return { ...state, site: site as Site };
}
export async function requireSuper() {
  const state = await getIdentity();
  if (!state.context.super_admin)
    throw new Error("Esta función requiere un superadministrador activo.");
  return state;
}
export function checked<T>(result: {
  data: T;
  error: { message: string } | null;
}): T {
  if (result.error) throw result.error;
  return result.data;
}
export function pageNumber(value?: string | string[]) {
  return Math.max(1, Math.min(100000, Number(value) || 1));
}
export type Search = Promise<Record<string, string | string[] | undefined>>;
