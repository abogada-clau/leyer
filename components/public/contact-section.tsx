import { Alert } from "@/components/ui/alert";
import { ArrowUpRight, FileText, Mail, MessageCircle } from "lucide-react";
import { navigation, publicEntry } from "@/lib/public/data";
import { formConfigured, issueFormProof } from "@/lib/public/contact-security";
import { publicContactLinks, publicHref, sitePath } from "@/lib/public/paths";
import { ContactForm } from "./contact-form";
import type { PublicContext } from "@/lib/public/types";

export async function ContactChannels({ context: c }: { context: PublicContext }) {
  const { items } = await navigation(c.site.id, c.locale);
  const { email, whatsapp } = publicContactLinks(c.site, items);
  const channels = [
    { title: "WhatsApp", href: whatsapp, detail: "Inicia una conversación", Icon: MessageCircle },
    { title: "Correo electrónico", href: email && `mailto:${email}`, detail: email, Icon: Mail },
    { title: "Formulario", href: "#consulta", detail: "Envía tu consulta desde esta página", Icon: FileText },
  ];
  return (
    <nav className="public-contact-channels" aria-label="Vías de contacto">
      {channels.map(({ title, href, detail, Icon }) => href && (
        <a key={title} href={href}>
          <Icon size={22} aria-hidden />
          <span><strong>{title}</strong><small>{detail}</small></span>
          <ArrowUpRight size={17} aria-hidden />
        </a>
      ))}
    </nav>
  );
}

export async function ContactSection({
  context: c,
  entryId = null,
  subject = "",
  preview = false,
}: {
  context: PublicContext;
  entryId?: string | null;
  subject?: string;
  preview?: boolean;
}) {
  if (c.site.settings.contact_enabled !== true) return null;
  const privacyPath = sitePath(c.site, "privacy_path", "/privacidad");
  const privacy = await publicEntry(c, privacyPath);
  return (
    <section className="public-contact-section" id="consulta" tabIndex={-1}>
      <div className="contact-intro">
        <p className="public-eyebrow">El primer paso es conversar</p>
        <h2 className="font-editorial">Cuéntanos qué necesitas.</h2>
        <p>
          Comparte una descripción general de tu consulta para que el estudio
          pueda orientarte sobre el siguiente paso.
        </p>
      </div>
      <div>
        {!privacy || !formConfigured(c) ? (
          <Alert title="El formulario todavía no está disponible">
            Puedes utilizar los datos de contacto publicados al pie de la
            página.
          </Alert>
        ) : preview ? (
          <Alert title="Vista previa del formulario">
            El envío se habilita en la página pública con una política de
            privacidad publicada.
          </Alert>
        ) : (
          <ContactForm
            key={`${c.site.id}-${c.locale}-${c.path}`}
            token={issueFormProof(c, privacy.revision_id, entryId)}
            privacyHref={publicHref(c, privacyPath)}
            privacyVersion={privacy.revision_id}
            subject={subject}
          />
        )}
      </div>
    </section>
  );
}
