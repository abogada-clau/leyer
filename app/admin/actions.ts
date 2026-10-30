"use server";

import { reservedPath, publicPathValid } from "@/lib/public/paths";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  getIdentity,
  requireSite,
  checked,
} from "@/lib/admin/server";
import {
  path,
  safeHref,
  text,
  uuid,
  validateSnapshot,
} from "@/lib/admin/validation";
import type { ActionResult, Json, Snapshot, Asset } from "@/lib/admin/types";

function failure(e: unknown): ActionResult {
  const err = e as { message?: string; code?: string };
  if (err.code === "40001")
    return {
      conflict: true,
      error:
        err.message?.includes("Testimonial") ? "El testimonio cambió en otra sesión. Recarga la página antes de guardar; tu edición no ha sobrescrito los cambios." : "Otro editor guardó una revisión nueva. Tu trabajo sigue aquí. Descárgalo o recupera los cambios para compararlos con la versión actual.",
    };
  const message =
    err.message || "No se pudo completar la operación. Intenta nuevamente.";
  if (message === "NEXT_REDIRECT")
    return { error: "Inicia sesión para continuar." };
  if (message.includes("immutable"))
    return {
      error:
        "Este recurso está protegido porque pertenece a una versión publicada. Crea una nueva versión.",
    };
  if (err.code === "42501")
    return {
      error:
        "Ya no tienes permiso vigente para esta operación. Comprueba el acceso de tu cuenta.",
    };
  if (err.code === "23505")
    return {
      error:
        "Ya existe un registro con ese identificador, ruta o programación. Revisa los datos antes de volver a guardar.",
    };
  if (err.code === "23503")
    return {
      error:
        "Hay una referencia a un registro que todavía está en uso. Revisa las relaciones y los recursos seleccionados.",
    };
  if (message.includes("Publishable assets"))
    return {
      error:
        "Para publicar, todos los recursos deben existir en el destino público. Crea una copia pública desde la biblioteca y selecciónala en una nueva revisión.",
    };
  if (message.includes("Only approved"))
    return { error: "Aprueba la revisión antes de publicarla." };
  if (message.includes("Image blocks"))
    return { error: "Cada bloque de imagen necesita un recurso asociado." };
  return { error: message };
}
export async function saveContent(input: {

  entryId: string;
  expectedRevisionId: string | null;
  internalName: string;
  parentId: string | null;
  content: Snapshot;
}): Promise<ActionResult> {
  try {
    const { db, site } = await requireSite("content.edit");
    const entryId = uuid(input.entryId);
    const entries = checked(
      await db.rpc("get_cms_entries", { p_site_id: site.id }).eq("id", entryId),
    );
    if (!entries?.length)
      throw new Error("El contenido no pertenece al sitio autorizado.");
    validateSnapshot(input.content);
    const id = checked(
      await db.rpc("save_cms_entry", {
        p_entry_id: entryId,
        p_expected_revision_id: input.expectedRevisionId
          ? uuid(input.expectedRevisionId)
          : null,
        p_internal_name: text(input.internalName, "Nombre interno", 250),
        p_parent_id: input.parentId ? uuid(input.parentId) : null,
        p_content: input.content,
      }),
    );
    revalidatePath("/admin");
    revalidatePath("/admin/content");
    return { id, message: "Nueva revisión guardada." };
  } catch (e) {
    return failure(e);
  }
}
export async function loadSnapshot(

  entryId: string,
  revisionId: string,
) {
  const { db, site } = await requireSite("content.read");
  const snapshot = checked(
    await db.rpc("get_cms_snapshot", { p_revision_id: uuid(revisionId) }),
  );
  if (
    !snapshot ||
    snapshot.site_id !== site.id ||
    snapshot.entry_id !== uuid(entryId)
  )
    throw new Error("Revisión no autorizada.");
  return snapshot as Snapshot;
}
export async function contentOperation(input: {

  entryId: string;
  revisionId?: string;
  operation: string;
  runAt?: string;
}): Promise<ActionResult> {
  try {
    const permission = ["draft", "in_review"].includes(input.operation)
      ? "content.edit"
      : "content.publish";
    const { db, site } = await requireSite(permission);
    const entryId = uuid(input.entryId);
    if (
      !checked(
        await db
          .rpc("get_cms_entries", { p_site_id: site.id })
          .eq("id", entryId),
      )?.length
    )
      throw new Error("Contenido no autorizado.");
    const revisionId = input.revisionId ? uuid(input.revisionId) : null;
    if (!["unpublish", "archive", "cancel"].includes(input.operation)) {
      if (!revisionId) throw new Error("Guarda una revisión primero.");
      await loadSnapshot(entryId, revisionId);
    }
    if (["draft", "in_review", "approved"].includes(input.operation))
      checked(
        await db.rpc("set_revision_state", {
          p_revision_id: revisionId,
          p_state: input.operation,
        }),
      );
    else if (input.operation === "publish")
      checked(
        await db.rpc("publish_content_revision", { p_revision_id: revisionId }),
      );
    else if (input.operation === "unpublish" || input.operation === "archive")
      checked(
        await db.rpc("unpublish_content", {
          p_entry_id: entryId,
          p_archive: input.operation === "archive",
        }),
      );
    else if (input.operation === "schedule") {
      const runAt = new Date(input.runAt || "");
      if (!Number.isFinite(runAt.getTime()) || runAt.getTime() <= Date.now())
        throw new Error("Selecciona una fecha futura.");
      checked(
        await db.from("scheduled_publications").insert({
          site_id: site.id,
          entry_id: entryId,
          revision_id: revisionId,
          run_at: runAt.toISOString(),
        }),
      );
    } else if (input.operation === "cancel")
      checked(
        await db
          .from("scheduled_publications")
          .update({ status: "cancelled" })
          .eq("entry_id", entryId)
          .eq("site_id", site.id)
          .eq("status", "pending")
          .select("id")
          .single(),
      );
    else throw new Error("Acción desconocida.");
    revalidatePath("/admin", "layout");
    return { message: "Operación completada." };
  } catch (e) {
    return failure(e);
  }
}

export async function mutate(input: {
  action: string;

  id?: string;
  data: Record<string, Json>;
}): Promise<ActionResult> {
  try {
    const d = input.data;
    const id = input.id ? uuid(input.id) : undefined;
    if (input.action === "profile") {
      const { db, user, context } = await getIdentity();
      if (context.profile.status !== "active")
        throw new Error("Tu cuenta está suspendida.");
      const theme = String(d.theme || "system");
      if (!["light", "dark", "system"].includes(theme))
        throw new Error("Tema inválido.");
      checked(
        await db
          .from("profiles")
          .update({
            display_name: text(d.display_name, "Nombre", 200),
            preferences: { theme },
          })
          .eq("id", user.id)
          .select("id")
          .single(),
      );
    } else {
      const permission =
        input.action === "media" || input.action === "media.delete"
          ? "media.manage"
          : ["site", "menu", "menu_item", "redirect"].includes(input.action)
            ? "sites.manage"
            : "content.edit";
      const { db, site } = await requireSite(permission);
      const scope = {
        site_id: site.id,
      };
      if (input.action === "entry") {
        if (!["page", "landing", "post"].includes(String(d.kind)))
          throw new Error("Tipo de contenido inválido.");
        const row = checked(
          await db
            .from("content_entries")
            .insert({
              ...scope,
              internal_name: text(d.internal_name, "Nombre interno", 250),
              kind: d.kind,
              locale: text(d.locale || site.default_locale, "Idioma", 35),
            })
            .select("id")
            .single(),
        );
        if (!row) throw new Error("No se creó el contenido.");
        return { id: row.id };
      }
      if (input.action === "testimonial") {
        const position = Number(d.position);
        const version = d.expected_version == null ? null : Number(d.expected_version);
        if (!Number.isInteger(position) || position < 0 || position > 2147483647 || (id && (!Number.isInteger(version) || Number(version) < 1)) || typeof d.is_published !== "boolean") throw new Error("El orden, la versión o el estado del testimonio no son válidos.");
        checked(await db.rpc("save_testimonial", {
          p_site_id: site.id, p_id: id || null, p_expected_version: version,
          p_author_name: text(d.author_name, "Nombre público", 160), p_quote: text(d.quote, "Testimonio", 3000),
          p_context: text(d.context || "", "Referencia", 200, false), p_position: position, p_is_published: d.is_published,
        }));
        revalidateTag(`cms-site:${site.id}`, { expire: 0 });
        revalidatePath("/", "layout");
        return { message: "Testimonio guardado." };
      }
      if (input.action === "site") {
        const settings = d.settings;
        if (
          !settings ||
          typeof settings !== "object" ||
          Array.isArray(settings)
        )
          throw new Error("Configuración pública inválida.");
        const publicSettings = settings as Record<string, Json>;
        for (const field of ["public_name", "phone", "address", "description"])
          if (publicSettings[field] != null)
            text(
              publicSettings[field],
              field,
              field === "description" ? 10000 : 1000,
              false,
            );
        if (
          publicSettings.email &&
          (typeof publicSettings.email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicSettings.email))
        )
          throw new Error("El correo público no es válido.");
        for (const key of [
          "privacy_path",
          "contact_path",
          "blog_path",
          "team_path",
          "services_path",
        ]) {
          const value = publicSettings[key];
          if (
            value != null &&
            value !== "" &&
            (!publicPathValid(value) || reservedPath.test(value))
          )
            throw new Error(`La ruta de ${key} no es válida o está reservada.`);
        }
        for (const key of ["contact_enabled", "contact_on_landings"])
          if (
            publicSettings[key] != null &&
            typeof publicSettings[key] !== "boolean"
          )
            throw new Error(
              "La configuración de formularios debe ser verdadera o falsa.",
            );
        const domain = d.domain
          ? text(d.domain, "Dominio", 253).toLowerCase()
          : null;
        if (domain && !/^[a-z0-9][a-z0-9.-]+[a-z0-9]$/.test(domain))
          throw new Error("Escribe solo el dominio, sin protocolo.");
        const row = {
          name: text(d.name, "Nombre"),
          domain,
          default_locale: text(d.default_locale, "Idioma", 35),
          status: String(d.status),
          settings,
        };
        if (!["draft", "active", "archived"].includes(row.status))
          throw new Error("Estado de sitio inválido.");
        checked(
          await db.from("sites").update(row).eq("id", site.id).select("id").single(),
        );
      } else if (input.action === "media") {
        checked(
          await db
            .from("media_assets")
            .update({
              alt_text: text(d.alt_text, "Texto alternativo", 2000, false),
              credits: text(d.credits || "", "Créditos", 2000, false),
            })
            .eq("id", uuid(id))
            .eq("site_id", site.id)
            .select("id")
            .single(),
        );
      } else if (input.action === "media.delete") {
        const asset = checked(
          await db
            .rpc("get_cms_media", { p_site_id: site.id })
            .eq("id", uuid(id))
            .single(),
        ) as Asset;
        // Refuse before touching Storage if any revision or author still references the asset.
        for (const [table, column] of [
          ["revision_assets", "asset_id"],
          ["content_revisions", "cover_asset_id"],
          ["authors", "avatar_asset_id"],
        ]) {
          const refs = checked(
            await db
              .from(table)
              .select("id")
              .eq(column, asset.id)
              .eq("site_id", site.id)
              .limit(1),
          );
          if (refs?.length)
            throw new Error(
              "El recurso está asociado a contenido o autores. Quita las referencias editables; los recursos publicados se conservan.",
            );
        }
        checked(
          await db.storage.from(asset.bucket_id).remove([asset.storage_path]),
        );
        checked(
          await db
            .from("media_assets")
            .delete()
            .eq("id", asset.id)
            .eq("site_id", site.id),
        );
      } else if (input.action === "redirect") {
        checked(
          await db.rpc("manage_cms_redirect", {
            p_site_id: site.id,
            p_id: id || null,
            p_locale: text(d.locale || site.default_locale, "Idioma", 35),
            p_from_path: d.delete ? "/" : path(d.from_path),
            p_target_entry_id: d.delete ? null : uuid(d.target_entry_id),
            p_status_code: Number(d.status_code || 301),
            p_delete: d.delete === true,
          }),
        );
      } else {
        const tables: Record<string, string> = {
          author: "authors",
          taxonomy: "taxonomies",
          term: "terms",
          menu: "menus",
          menu_item: "menu_items",
        };
        const table = tables[input.action];
        if (!table) throw new Error("Operación no disponible.");
        if (d.delete === true)
          checked(
            await db
              .from(table)
              .delete()
              .eq("id", uuid(id))
              .eq("site_id", site.id)
              .select("id")
              .single(),
          );
        else {
          let row: Record<string, Json>;
          if (input.action === "author")
            row = {
              display_name: text(d.display_name, "Nombre"),
              slug: text(d.slug, "Identificador"),
              biography: text(d.biography || "", "Biografía", 10000, false),
              professional_title: text(
                d.professional_title || "",
                "Cargo",
                200,
                false,
              ),
              is_public: d.is_public === true,
              avatar_asset_id: d.avatar_asset_id
                ? uuid(d.avatar_asset_id)
                : null,
            };
          else if (input.action === "taxonomy")
            row = {
              name: text(d.name, "Nombre"),
              code: text(d.code, "Código"),
            };
          else if (input.action === "term")
            row = {
              taxonomy_id: uuid(d.taxonomy_id),
              name: text(d.name, "Nombre"),
              slug: text(d.slug, "Identificador"),
              parent_id: d.parent_id ? uuid(d.parent_id) : null,
            };
          else if (input.action === "menu")
            row = {
              code: text(d.code, "Código"),
              name: text(d.name, "Nombre"),
              locale: text(d.locale || site.default_locale, "Idioma", 35),
              is_public: d.is_public === true,
            };
          else {
            const position = Number(d.position);
            if (!Number.isInteger(position) || position < 0)
              throw new Error("La posición debe ser un entero desde cero.");
            if (d.external_url && !safeHref(d.external_url))
              throw new Error("Enlace externo inválido.");
            row = {
              menu_id: uuid(d.menu_id),
              label: text(d.label, "Etiqueta"),
              position,
              parent_id: d.parent_id ? uuid(d.parent_id) : null,
              entry_id: d.entry_id ? uuid(d.entry_id) : null,
              external_url: d.external_url
                ? text(d.external_url, "Enlace", 2000)
                : null,
            };
          }
          checked(
            id
              ? await db
                  .from(table)
                  .update(row)
                  .eq("id", id)
                  .eq("site_id", site.id)
                  .select("id")
                  .single()
              : await db.from(table).insert({ ...scope, ...row }),
          );
        }
      }
    }
    revalidatePath("/admin", "layout");
    return { message: "Cambios guardados." };
  } catch (e) {
    return failure(e);
  }
}

export async function searchAssets(

  query: string,
  page = 1,
  bucket = "",
  type = "",
) {
  const { db, site } = await requireSite("content.read");
  const currentPage = Math.max(1, Math.min(100000, Math.floor(page)));
  let request = db.rpc(
    "get_cms_media",
    { p_site_id: site.id },
    { count: "exact" },
  );
  if (query) request = request.ilike("filename", `%${query.slice(0, 200)}%`);
  if (["cms-public", "cms-private"].includes(bucket))
    request = request.eq("bucket_id", bucket);
  if (type === "images") request = request.like("mime_type", "image/%");
  if (type === "pdf") request = request.eq("mime_type", "application/pdf");
  const result = await request
    .order("created_at", { ascending: false })
    .order("id")
    .range((currentPage - 1) * 20, currentPage * 20 - 1);
  const data = checked(result);
  return { data, total: result.count || 0 };
}

export async function latestSnapshot(entryId: string) {
  const { db, site } = await requireSite("content.read");
  if (
    !checked(
      await db
        .rpc("get_cms_entries", { p_site_id: site.id })
        .eq("id", uuid(entryId)),
    )?.length
  )
    throw new Error("Contenido no autorizado.");
  const revisions = checked(
    await db
      .rpc("get_cms_revisions", { p_entry_id: entryId })
      .order("revision_number", { ascending: false })
      .limit(1),
  );
  if (!revisions?.[0]) throw new Error("No hay revisiones.");
  return loadSnapshot(entryId, revisions[0].id);
}

export async function revisionHistory(

  entryId: string,
  offset: number,
) {
  const { db, site } = await requireSite("content.read");
  if (
    !checked(
      await db
        .rpc("get_cms_entries", { p_site_id: site.id })
        .eq("id", uuid(entryId)),
    )?.length
  )
    throw new Error("Contenido no autorizado.");
  const start = Math.max(0, Math.min(1000000, Math.floor(offset)));
  return (
    checked(
      await db
        .rpc("get_cms_revisions", { p_entry_id: entryId })
        .order("revision_number", { ascending: false })
        .range(start, start + 19),
    ) || []
  );
}
