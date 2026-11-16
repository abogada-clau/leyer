"use server";

import { createClient } from "@/lib/supabase/server";

export async function acceptInvitation(token: string) {
  if (typeof token !== "string" || !/^[a-f0-9]{32,128}$/.test(token))
    return { error: "El enlace de invitación no es válido." };

  const db = await createClient();
  const { error } = await db.auth.verifyOtp({ type: "invite", token_hash: token });
  return error
    ? { error: "Este enlace caducó o ya se usó. Solicita otro al administrador." }
    : {};
}
