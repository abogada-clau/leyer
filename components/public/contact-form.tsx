"use client";
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  validateContact,
  contactLimits,
  contactWhatsAppUrl,
} from "@/lib/public/contact-validation";

const contactFields = {
  name: { label: "Tu nombre", type: "text", autoComplete: "name" },
  email: { label: "Correo electrónico", type: "email", autoComplete: "email" },
  phone: { label: "Teléfono · opcional", type: "tel", autoComplete: "tel" },
  subject: { label: "Motivo de la consulta", type: "text", autoComplete: "off" },
};
export function ContactForm({
  token,
  privacyHref,
  privacyVersion,
  subject = "",
  whatsappHref,
  compact = false,
}: {
  token: string;
  privacyHref: string;
  privacyVersion: string;
  subject?: string;
  whatsappHref?: string;
  compact?: boolean;
}) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [consentFor, setConsentFor] = useState<string | null>(null);
  const consent = consentFor === privacyVersion;
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [messageHref, setMessageHref] = useState("");
  const visibleFields = compact ? ["name", "phone", "email"] as const : ["name", "email", "phone", "subject"] as const;
  if (receipt)
    return (
      <div className="contact-received" role="status">
        <span>
          <Check aria-hidden />
        </span>
        <h3 className="font-editorial">{messageHref ? "Tu mensaje está listo" : "Consulta recibida"}</h3>
        {messageHref ? (
          <>
            <p>Envía el mensaje en WhatsApp para iniciar la conversación.</p>
            <Button asChild variant="terracotta" className="mt-4">
              <a href={messageHref}><MessageCircle aria-hidden /> Abrir WhatsApp</a>
            </Button>
          </>
        ) : (
          <p>El estudio ya puede revisarla. La referencia de tu consulta es {receipt.slice(-8)}.</p>
        )}
      </div>
    );
  return (
    <form
      ref={form}
      className={`public-contact-form${compact ? " contact-form-compact" : ""}`}
      method="post"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        const data = Object.fromEntries(new FormData(e.currentTarget));
        const input = { ...data, consent };
        const checked = validateContact(input);
        setFields(checked.errors);
        setError("");
        setRefresh(false);
        if (!checked.value) {
          const first = Object.keys(checked.errors)[0];
          form.current
            ?.querySelector<HTMLElement>(`[name="${first}"]`)
            ?.focus();
          return;
        }
        setPending(true);
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...checked.value, token }),
          });
          const body = await response.json();
          if (!response.ok) {
            setFields(body.fields || {});
            setError(body.error || "No se pudo completar el envío.");
            setRefresh(Boolean(body.refresh));
          } else {
            setReceipt(body.id);
            if (whatsappHref) {
              const href = contactWhatsAppUrl(whatsappHref, checked.value);
              setMessageHref(href);
              window.location.assign(href);
            }
          }
        } catch {
          setError(
            "No se pudo conectar. Tu texto sigue aquí; vuelve a intentar.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <fieldset disabled={pending} className="contact-form-fields">
        <legend className="sr-only">Cuéntanos cómo podemos orientarte</legend>
        {compact && <input name="subject" type="hidden" value={subject.slice(0, contactLimits.subject)} />}
        {visibleFields.map((key) => {
          const { label, type, autoComplete } = contactFields[key];
          return (
            <div className="public-field" data-field={key} key={key}>
              <Label htmlFor={`${id}-${key}`}>{label}</Label>
              <Input
                id={`${id}-${key}`}
                name={key}
                type={type}
                autoComplete={autoComplete}
                maxLength={contactLimits[key]}
                defaultValue={key === "subject" ? subject : ""}
                required={key !== "phone"}
                aria-invalid={Boolean(fields[key])}
                aria-describedby={fields[key] ? `${id}-${key}-error` : undefined}
              />
              {fields[key] && (
                <p id={`${id}-${key}-error`} className="text-sm text-destructive">
                  {fields[key]}
                </p>
              )}
            </div>
          );
        })}
        <div className="public-field contact-form-wide">
          <Label htmlFor={`${id}-message`}>¿En qué podemos ayudarte?</Label>
          <Textarea
            id={`${id}-message`}
            name="message"
            required
            minLength={10}
            maxLength={contactLimits.message}
            rows={compact ? 3 : 6}
            aria-invalid={Boolean(fields.message)}
            aria-describedby={`${id}-message-help${fields.message ? ` ${id}-message-error` : ""}`}
          />
          <small id={`${id}-message-help`}>
            Este es un primer contacto. Evita incluir documentos, contraseñas o
            detalles sensibles innecesarios.
          </small>
          {fields.message && (
            <p id={`${id}-message-error`} className="text-sm text-destructive">
              {fields.message}
            </p>
          )}
        </div>
        <div className="hidden" aria-hidden>
          <label>
            Deja este campo vacío
            <input
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </label>
        </div>
        <div className="contact-form-wide">
          <div className="flex items-start gap-3">
            <Checkbox
              id={`${id}-consent`}
              name="consent"
              checked={consent}
              onCheckedChange={(v) =>
                setConsentFor(v === true ? privacyVersion : null)
              }
              aria-invalid={Boolean(fields.consent)}
              aria-describedby={
                fields.consent ? `${id}-consent-error` : undefined
              }
            />
            <Label htmlFor={`${id}-consent`} className="leading-relaxed">
              Acepto el tratamiento de mis datos para responder esta consulta
              según la{" "}
              <a
                href={privacyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                política de privacidad
              </a>
              .
            </Label>
          </div>
          {fields.consent && (
            <p
              id={`${id}-consent-error`}
              className="mt-2 text-sm text-destructive"
            >
              {fields.consent}
            </p>
          )}
        </div>
        <div className="contact-form-wide contact-form-submit">
          <Button type="submit" size="lg" variant={whatsappHref ? "terracotta" : "default"} disabled={pending}>
            {pending ? "Preparando consulta…" : whatsappHref ? "Continuar por WhatsApp" : "Enviar consulta"}
            {whatsappHref ? <MessageCircle aria-hidden /> : <ArrowUpRight aria-hidden />}
          </Button>
          <span className="text-xs text-muted-foreground">
            {whatsappHref
              ? "Se abrirá WhatsApp con tu consulta lista para enviar."
              : "El envío no crea una relación de representación."}
          </span>
        </div>
      </fieldset>
      {error && (
        <Alert variant="error" title={error} className="mt-6">
          {refresh && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.refresh()}
            >
              Actualizar formulario
            </Button>
          )}
        </Alert>
      )}
    </form>
  );
}
