import type { MenuItem, PublicContext, PublicSite } from "./types";
export const reservedPath =
  /^\/(admin|auth|api|protected|site-unavailable|design-system|sitios|idioma|autores|taxonomias|_next)(\/|$)|^\/(sitemap\.xml|robots\.txt|favicon\.ico|icon\.svg|opengraph-image|twitter-image)(\/|$)/i;
export function publicPathValid(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !/[?#%\s\\]|\/\/|(^|\/)\.\.?($|\/)/.test(path) &&
    (path === "/" || !path.endsWith("/"))
  );
}
export function sitePath(site: PublicSite, key: string, fallback: string) {
  const value = site.settings[key];
  return publicPathValid(value) && !reservedPath.test(value) ? value : fallback;
}
export function localePrefix(locale: string, defaultLocale: string) {
  return locale === defaultLocale
    ? ""
    : `/idioma/${encodeURIComponent(locale)}`;
}
export function publicHref(
  context: Pick<PublicContext, "locale" | "site">,
  path: string,
  locale = context.locale,
) {
  return (
    `${localePrefix(locale, context.site.default_locale)}${path === "/" ? "" : path}` ||
    "/"
  );
}
export function contentLink(
  context: PublicContext,
  value: unknown,
): string | null {
  if (typeof value !== "string" || /[\s\\\u0000-\u001f]/.test(value))
    return null;
  if (/^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) {
    if (reservedPath.test(value.split(/[?#]/)[0])) return null;
    const [path, ...rest] = value.split(/(?=[?#])/);
    return publicHref(context, path) + rest.join("");
  }
  try {
    const url = new URL(value);
    if (!["https:", "mailto:", "tel:"].includes(url.protocol) || url.username || url.password)
      return null;
    if (url.protocol !== "https:" || url.port || url.searchParams.get("text")?.trim())
      return value;
    const isPhoneChat = (url.hostname === "wa.me" && /^\/\d{8,15}\/?$/.test(url.pathname)) ||
      (url.hostname === "api.whatsapp.com" && /^\/send\/?$/.test(url.pathname) &&
        /^\+?\d{8,15}$/.test(url.searchParams.get("phone") || ""));
    if (!isPhoneChat) return value;
    url.searchParams.set("text", whatsAppMessage(context));
    return url.href;
  } catch {
    return null;
  }
}
export function siteName(site: PublicSite) {
  return typeof site.settings.public_name === "string" &&
    site.settings.public_name.trim()
    ? site.settings.public_name
    : site.name;
}

function whatsAppMessage({ path, route, site }: PublicContext) {
  const name = siteName(site);
  const page = route?.entry;
  if (path === "/" || page?.template_key === "home")
    return `Hola, visité el sitio de ${name} y quisiera orientación sobre mi caso.`;
  if (path === sitePath(site, "contact_path", "/contacto") || page?.template_key === "contact")
    return `Hola, quisiera coordinar una consulta con ${name}.`;
  if (path === "/personas")
    return "Hola, quisiera recibir orientación sobre una consulta legal personal.";
  if (path === "/empresas")
    return "Hola, quisiera recibir asesoría legal para mi empresa.";
  if (path === sitePath(site, "services_path", "/servicios"))
    return "Hola, estuve revisando sus servicios y quisiera ayuda para elegir la asesoría adecuada.";

  const title = (page?.title || route?.term?.name || route?.author?.display_name)?.replace(/\s+/g, " ").trim();
  if (title && page?.kind === "post")
    return `Hola, leí «${title}» en su sitio y quisiera hacer una consulta.`;
  if (title) return `Hola, quisiera recibir orientación sobre «${title}».`;
  return `Hola, quisiera hacer una consulta a ${name}.`;
}

export function isWhatsAppLink(href: string | null) {
  return href !== null && /^https:\/\/(?:wa\.me|api\.whatsapp\.com|wa\.link)\/[^/\s]+/i.test(href);
}

export function publicContactLinks(site: PublicSite, items: MenuItem[]) {
  const email = typeof site.settings.email === "string" && /^[^\s@?#]+@[^\s@?#]+\.[^\s@?#]+$/.test(site.settings.email)
    ? site.settings.email : undefined;
  const whatsapp = items.map(item => item.external_url).find(
    (href): href is string => typeof href === "string" && /^https:\/\/wa\.me\/\d{8,15}\/?$/.test(href),
  );
  return { email, whatsapp };
}
