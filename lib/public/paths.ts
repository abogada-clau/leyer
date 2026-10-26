import type { PublicContext, PublicSite } from "./types";
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
  context: Pick<PublicContext, "locale" | "site">,
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
    return ["https:", "mailto:", "tel:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? value
      : null;
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
