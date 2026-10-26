"use server";
import { revalidatePath } from "next/cache";
import { requireSite, checked } from "@/lib/admin/server";
import { uuid, text } from "@/lib/admin/validation";
import type { ActionResult } from "@/lib/admin/types";
export async function updateContact(

  id: string,
  status: string,
  notes: string,
): Promise<ActionResult> {
  try {
    const { db, site } = await requireSite("contacts.manage");
    if (!["new", "in_progress", "closed", "spam"].includes(status))
      throw new Error("Estado inválido.");
    checked(
      await db
        .from("contact_submissions")
        .update({
          status,
          internal_notes: text(notes, "Notas internas", 5000, false),
        })
        .eq("id", uuid(id))
        .eq("site_id", site.id)
        .select("id")
        .single(),
    );
    revalidatePath("/admin/contacts");
    return { message: "Consulta actualizada." };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "No se pudo actualizar la consulta. Comprueba tus permisos.",
    };
  }
}
