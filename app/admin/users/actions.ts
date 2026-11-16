"use server";

import { requireSite } from "@/lib/admin/server";
import { serviceClient } from "@/lib/admin/service";

export async function createInvitation(form: FormData): Promise<{
  url?: string;
  error?: string;
}> {
  let access;
  try {
    access = await requireSite("sites.manage");
  } catch {
    return { error: "Necesitas acceso administrativo vigente para invitar usuarios." };
  }

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Ingresa un correo electrónico válido." };

  let inviteUrl: URL;
  try {
    const base = new URL(process.env.APP_URL || `https://${access.site.domain || ""}`);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
    if (!(base.protocol === "https:" || (local && base.protocol === "http:")) ||
        base.username || base.password)
      throw new Error("Invalid APP_URL");
    inviteUrl = new URL("/auth/invite", base);
  } catch {
    return { error: "Configura APP_URL con la dirección del sitio para generar la invitación." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return { error: "Falta la clave de servicio de Supabase en la configuración del servidor." };

  const { data, error } = await serviceClient().auth.admin.generateLink({
    type: "invite",
    email,
  });
  if (error || !data?.properties.hashed_token) {
    return {
      error: error?.code === "email_exists" || error?.code === "user_already_exists"
        ? "Ya existe una cuenta con este correo."
        : "No se pudo generar la invitación. Intenta nuevamente.",
    };
  }

  const { error: grantError } = await access.db.rpc("grant_invited_admin", {
    p_user_id: data.user.id,
  });
  if (grantError) {
    return {
      error: grantError.code === "23514"
        ? "La cuenta existente no admite una invitación."
        : "No se pudo habilitar la cuenta para el panel. Intenta nuevamente.",
    };
  }

  // A fragment keeps the credential out of request logs and link previews.
  inviteUrl.hash = new URLSearchParams({ token_hash: data.properties.hashed_token }).toString();
  return { url: inviteUrl.href };
}
