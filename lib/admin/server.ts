import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminContext } from "./types";

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

export async function requireSite(permission = "content.read") {
  const state = await getIdentity();
  const site = state.context.site;
  if (state.context.profile.status !== "active" || !state.context.is_admin ||
      !site?.permissions.includes(permission))
    throw new Error("No tienes acceso administrativo vigente.");
  return { ...state, site };
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
