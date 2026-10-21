import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import type { PublicContext } from "./types";
import { hostName, localHost } from "./context";
export type FormProof = {
  siteId: string;
  entryId: string | null;
  locale: string;
  path: string;
  requestPath: string;
  origin: string;
  privacyId: string;
  nonce: string;
  expires: number;
};
function secret() {
  const key = process.env.CONTACT_FORM_SECRET;
  if (!key || key.length < 32) throw new Error("CONTACT_NOT_CONFIGURED");
  return key;
}
export function formConfigured(c: PublicContext) {
  return Boolean(
    process.env.CONTACT_FORM_SECRET &&
    process.env.CONTACT_FORM_SECRET.length >= 32 &&
    (c.local || process.env.CONTACT_IP_HEADER),
  );
}
function mac(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function issueFormProof(
  c: PublicContext,
  privacyId: string,
  entryId: string | null,
) {
  const proof: FormProof = {
    siteId: c.site.id,
    entryId,
    locale: c.locale,
    path: c.path,
    requestPath: c.requestPath,
    origin: c.origin,
    privacyId,
    nonce: randomUUID(),
    expires: Date.now() + 3600000,
  };
  const payload = Buffer.from(JSON.stringify(proof)).toString("base64url");
  return `${payload}.${mac(payload)}`;
}
export function verifyFormProof(token: unknown): FormProof {
  if (typeof token !== "string" || token.length > 6000)
    throw new Error("FORM_EXPIRED");
  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length) throw new Error("FORM_EXPIRED");
  const expected = mac(payload);
  if (
    Buffer.byteLength(signature) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    throw new Error("FORM_EXPIRED");
  let proof: FormProof;
  try {
    proof = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    throw new Error("FORM_EXPIRED");
  }
  if (
    !proof ||
    !Number.isFinite(proof.expires) ||
    proof.expires < Date.now() ||
    proof.expires > Date.now() + 3600000 ||
    !/^[a-f0-9-]{36}$/.test(proof.nonce)
  )
    throw new Error("FORM_EXPIRED");
  return proof;
}
export function requestOrigin(request: Request) {
  const raw = request.headers.get("host") || "";
  const host = hostName(raw);
  if (!host) throw new Error("BAD_ORIGIN");
  const origin = `${localHost(host) ? "http:" : "https:"}//${raw.toLowerCase()}`;
  if (request.headers.get("origin") !== origin) throw new Error("BAD_ORIGIN");
  return { origin, host, raw };
}
export function clientHash(request: Request, host: string) {
  let ip = "local";
  if (!localHost(host)) {
    const header = process.env.CONTACT_IP_HEADER;
    if (!header) throw new Error("CONTACT_NOT_CONFIGURED");
    ip = request.headers.get(header)?.split(",")[0].trim() || "";
    if (!isIP(ip)) throw new Error("CONTACT_NOT_CONFIGURED");
  }
  return createHmac("sha256", secret())
    .update(`contact-rate:${new Date().toISOString().slice(0, 10)}:${ip}`)
    .digest("hex");
}
