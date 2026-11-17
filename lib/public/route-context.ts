import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PublicContext, PublicRouteData } from "./types";

export const publicRouteHeader = "x-albar-public-route";
const maxHeaderLength = 4096;
const maxAge = 15000;

function signature(secret: string, host: string, payload: string) {
  return createHmac("sha256", secret)
    .update(`albar:public-route:${host}\n${payload}`)
    .digest("base64url");
}

function routeSecret() {
  return [process.env.WORKER_SECRET, process.env.CONTACT_FORM_SECRET]
    .find(value => value && value.length >= 32);
}

export function signPublicRoute(host: string, context: PublicContext) {
  const secret = routeSecret();
  if (!secret || !context.route) return null;
  const { origin, locale, path, requestPath, local, route } = context;
  const payload = Buffer.from(JSON.stringify({ origin, locale, path, requestPath, local, route, issuedAt: Date.now() })).toString("base64url");
  const header = `${payload}.${signature(secret, host, payload)}`;
  return header.length <= maxHeaderLength ? header : null;
}

export function readPublicRoute(host: string, path: string, header: string | null): PublicContext | null {
  const secret = routeSecret();
  if (!secret || !header || header.length > maxHeaderLength) return null;
  const [payload, mac, ...extra] = header.split(".");
  if (!payload || !mac || extra.length) return null;
  const expected = signature(secret, host, payload);
  if (Buffer.byteLength(mac) !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const { issuedAt, ...context } = JSON.parse(Buffer.from(payload, "base64url").toString()) as Omit<PublicContext, "site" | "route"> & {
      issuedAt: number;
      route: PublicRouteData;
    };
    const age = Date.now() - issuedAt;
    if (!Number.isFinite(age) || age < -1000 || age > maxAge || context.requestPath !== path || !context.route?.site) return null;
    return { ...context, site: context.route.site };
  } catch {
    return null;
  }
}
