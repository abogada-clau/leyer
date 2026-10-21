import { createHash } from "node:crypto";
import { resolveContext } from "@/lib/public/context";
import { validateContact } from "@/lib/public/contact-validation";
import {
  verifyFormProof,
  requestOrigin,
  clientHash,
} from "@/lib/public/contact-security";
import { serviceClient } from "@/lib/admin/service";
const headers = { "Cache-Control": "no-store" };
async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new Error("BAD_BODY");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("BAD_BODY");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 24000) {
        await reader.cancel();
        throw new Error("BAD_BODY");
      }
      chunks.push(value);
    }
    const value = JSON.parse(Buffer.concat(chunks).toString());
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("BAD_BODY");
    return value;
  } finally {
    reader.releaseLock();
  }
}
export async function POST(request: Request) {
  try {
    const origin = requestOrigin(request);
    const body = await readBody(request);
    const proof = verifyFormProof(body.token);
    if (proof.origin !== origin.origin) throw new Error("BAD_ORIGIN");
    const c = await resolveContext(origin.raw, proof.requestPath);
    if (
      !c ||
      c.site.id !== proof.siteId ||
      c.locale !== proof.locale ||
      c.path !== proof.path
    )
      throw new Error("FORM_EXPIRED");
    const { value, errors } = validateContact(body);
    if (!value)
      return Response.json(
        { error: "Revisa los campos indicados.", fields: errors },
        { status: 422, headers },
      );
    const { website: _, ...input } = value;
    void _;
    const hash = createHash("sha256")
      .update(
        JSON.stringify({
          input,
          site: c.site.id,
          locale: c.locale,
          path: c.path,
          privacy: proof.privacyId,
        }),
      )
      .digest("hex");
    const { data, error } = await serviceClient().rpc("submit_contact", {
      p_site_id: c.site.id,
      p_locale: c.locale,
      p_source_entry_id: proof.entryId,
      p_source_path: c.path,
      p_name: value.name,
      p_email: value.email,
      p_phone: value.phone,
      p_subject: value.subject,
      p_message: value.message,
      p_consent: value.consent,
      p_privacy_revision_id: proof.privacyId,
      p_client_hash: clientHash(request, origin.host),
      p_idempotency_key: proof.nonce,
      p_request_hash: hash,
    });
    if (error) {
      if (error.message.includes("CONTACT_RATE_LIMIT"))
        return Response.json(
          {
            error:
              "Has enviado varias consultas. Espera unos minutos antes de intentar otra vez.",
          },
          { status: 429, headers: { ...headers, "Retry-After": "600" } },
        );
      if (error.code === "40001")
        return Response.json(
          {
            error:
              "La política de privacidad cambió. Actualiza el formulario y revísala antes de enviar.",
            refresh: true,
          },
          { status: 409, headers },
        );
      if (error.code === "42501")
        return Response.json(
          {
            error: "El formulario ya no está disponible. Actualiza la página.",
            refresh: true,
          },
          { status: 403, headers },
        );
      if (["23514", "23502", "23505"].includes(error.code))
        return Response.json(
          {
            error:
              "No se pudo validar la consulta. Actualiza el formulario y comprueba sus campos.",
            refresh: true,
          },
          { status: 422, headers },
        );
      throw new Error("DATABASE_ERROR");
    }
    return Response.json(
      {
        id: data,
        message:
          "Tu consulta quedó recibida. El estudio podrá revisarla desde su bandeja.",
      },
      { status: 201, headers },
    );
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "BAD_ORIGIN")
      return Response.json(
        { error: "Envía el formulario desde la página del estudio." },
        { status: 403, headers },
      );
    if (code === "FORM_EXPIRED")
      return Response.json(
        {
          error:
            "El formulario venció o cambió. Actualízalo y vuelve a intentar.",
          refresh: true,
        },
        { status: 409, headers },
      );
    if (code === "BAD_BODY" || e instanceof SyntaxError)
      return Response.json(
        { error: "La solicitud no tiene un formato válido." },
        { status: 400, headers },
      );
    return Response.json(
      {
        error:
          "No pudimos recibir tu consulta en este momento. Tu texto se conserva; intenta nuevamente o usa los datos de contacto del estudio.",
      },
      { status: 503, headers },
    );
  }
}
