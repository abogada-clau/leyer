import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { navigation, publicLocales, sectionAvailable } from "@/lib/public/data";
import {
  publicHref,
  contentLink,
  siteName,
  sitePath,
} from "@/lib/public/paths";
import { PublicNavigation, type NavNode } from "./navigation";
import { PublicExperience } from "./experience";
import type { PublicContext, MenuItem } from "@/lib/public/types";
export async function PublicFrame({
  context: c,
  children,
}: {
  context: PublicContext;
  children: React.ReactNode;
}) {
  const contact = sitePath(c.site, "contact_path", "/contacto");
  const [nav, locales, contactReady] = await Promise.all([
    navigation(c.site.id, c.locale),
    c.route?.locales || publicLocales(c.site.id),
    c.site.settings.contact_enabled === true ? sectionAvailable(c, contact) : false,
  ]);
  function tree(
    items: MenuItem[],
    parent: string | null = null,
    depth = 0,
  ): NavNode[] {
    if (depth > 8) return [];
    return items
      .filter((i) => i.parent_id === parent)
      .map((i) => {
        const target = i.entry_id
          ? nav.entries.find((e) => e.id === i.entry_id)
          : null;
        return {
          id: i.id,
          label: i.label,
          href: target
            ? publicHref(c, target.path)
            : contentLink(c, i.external_url),
          children: tree(items, i.id, depth + 1),
        };
      })
      .filter((i) => i.href || i.children.length);
  }
  const primary =
    nav.menus.find((m) => m.code === "primary") ||
    nav.menus.find((m) => m.code === "main");
  const footer = nav.menus.find((m) => m.code === "footer");
  const main = primary
    ? tree(nav.items.filter((i) => i.menu_id === primary.id))
    : [];
  const footerItems = footer
    ? tree(nav.items.filter((i) => i.menu_id === footer.id))
    : [];
  const name = siteName(c.site);
  const email =
    typeof c.site.settings.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.site.settings.email)
      ? c.site.settings.email
      : null;
  const phone =
    typeof c.site.settings.phone === "string" ? c.site.settings.phone : null;
  const tel = phone?.replace(/[^+0-9]/g, "");
  // Only reuse a WhatsApp destination already published in this site's menu.
  const whatsapp = nav.items.map((item) => contentLink(c, item.external_url)).find((href) => {
    if (!href) return false;
    try {
      const url = new URL(href);
      return url.protocol === "https:" && url.hostname === "wa.me" && /^\/\d{8,15}$/.test(url.pathname);
    } catch { return false; }
  });
  return (
    <div className={`public-site${contactReady ? " has-contact-dock" : ""}`}>
      <a className="public-skip" href="#contenido-principal">
        Saltar al contenido
      </a>
      {c.site.settings.demo === true && (
        <div className="public-demo-note">
          Sitio de demostración local · contenido de prueba
        </div>
      )}
      <header className="public-header">
        <div className="public-container public-header-inner">
          <Link
            href={publicHref(c, "/")}
            aria-label={`${name} · Inicio`}
            className="public-wordmark"
          >
            <Image
              src="/images/albar-logo-hd.webp"
              alt={name}
              width={2133}
              height={451}
              className="public-logo"
              unoptimized
              loading="eager"
            />
          </Link>
          <PublicNavigation nodes={main}>
            {locales.length > 1 && (
              <div
                className="public-mobile-languages"
                aria-label="Idioma móvil"
              >
                {locales.map((l) => (
                  <Link
                    key={l}
                    href={publicHref(c, "/", l)}
                    lang={l}
                    aria-current={l === c.locale ? "true" : undefined}
                  >
                    {l.split("-")[0].toUpperCase()}
                  </Link>
                ))}
              </div>
            )}
          </PublicNavigation>
          <div className="public-header-tools">
            {locales.length > 1 && (
              <nav aria-label="Idioma" className="public-languages">
                {locales.map((l) => (
                  <Link
                    key={l}
                    href={publicHref(c, "/", l)}
                    lang={l}
                    aria-current={l === c.locale ? "true" : undefined}
                  >
                    {l.split("-")[0].toUpperCase()}
                  </Link>
                ))}
              </nav>
            )}
            <ThemeSwitcher />
            {contactReady && (
              <Link
                className="public-header-contact"
                href={publicHref(c, contact)}
              >
                Consultar mi caso
                <ArrowUpRight aria-hidden size={16} />
              </Link>
            )}
          </div>
        </div>
      </header>
      <PublicExperience contactHref={contactReady ? publicHref(c, contact) : undefined} whatsappHref={whatsapp || undefined}>
        <main id="contenido-principal" tabIndex={-1} lang={c.locale}>
          {children}
        </main>
      </PublicExperience>
      <footer className="public-footer">
        <div className="public-container">
          <div className="public-footer-top">
            <div>
              <Link
                href={publicHref(c, "/")}
                aria-label={`${name} · Inicio`}
                className="public-wordmark"
              >
                <Image
                  src="/images/albar-logo-hd.webp"
                  alt={name}
                  width={2133}
                  height={451}
                  className="public-logo"
                  unoptimized
                />
              </Link>
              {typeof c.site.settings.description === "string" && (
                <p className="public-footer-description">
                  {c.site.settings.description}
                </p>
              )}
            </div>
            <nav aria-label="Navegación al pie">
              <FooterTree nodes={footerItems} />
            </nav>
            <address>
              {email && <a href={`mailto:${email}`}>{email}</a>}
              {phone && tel && <a href={`tel:${tel}`}>{phone}</a>}
              {typeof c.site.settings.address === "string" && (
                <p>{c.site.settings.address}</p>
              )}
              {!email && !phone && (
                <p>Los datos de contacto todavía no están disponibles.</p>
              )}
            </address>
          </div>
          <div className="public-footer-bottom">
            <span>
              © {new Date().getFullYear()} {name}
            </span>
            <span>Claridad en cada paso.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterTree({ nodes }: { nodes: NavNode[] }) {
  return (
    <ul>
      {nodes.map((n) => (
        <li key={n.id}>
          {n.href ? (
            <Link href={n.href}>{n.label}</Link>
          ) : (
            <span>{n.label}</span>
          )}
          {n.children.length > 0 && <FooterTree nodes={n.children} />}
        </li>
      ))}
    </ul>
  );
}
