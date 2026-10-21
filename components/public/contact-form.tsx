"use client";
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  validateContact,
  contactLimits,
} from "@/lib/public/contact-validation";
export function ContactForm({
  token,
  privacyHref,
  privacyVersion,
  subject = "",
}: {
  token: string;
  privacyHref: string;
  privacyVersion: string;
  subject?: string;
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
  if (receipt)
    return (
      <div className="contact-received" role="status">
        <span>
          <Check aria-hidden />
        </span>
        <h2 className="font-editorial text-4xl">Consulta recibida</h2>
        <p>
          El estudio ya puede revisarla. La referencia de tu consulta es{" "}
          {receipt.slice(-8)}.
        </p>
        <p className="text-sm text-muted-foreground">
          No se ha enviado una confirmación por correo.
        </p>
      </div>
    );
  return (
    <form
      ref={form}
      className="public-contact-form"
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
          } else setReceipt(body.id);
        } catch {
          setError(
            "No se pudo conectar. Tu texto sigue aquí; vuelve a intentar.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <fieldset disabled={pending} className="grid gap-6 sm:grid-cols-2">
        <legend className="sr-only">Cuéntanos cómo podemos orientarte</legend>
        {[
          ["name", "Tu nombre", "text"],
          ["email", "Correo electrónico", "email"],
          ["phone", "Teléfono · opcional", "tel"],
          ["subject", "Motivo de la consulta", "text"],
        ].map(([key, label, type]) => (
          <div className="public-field" key={key}>
            <Label htmlFor={`${id}-${key}`}>{label}</Label>
            <Input
              id={`${id}-${key}`}
              name={key}
              type={type}
              autoComplete={
                key === "name"
                  ? "name"
                  : key === "email"
                    ? "email"
                    : key === "phone"
                      ? "tel"
                      : "off"
              }
              maxLength={contactLimits[key as keyof typeof contactLimits]}
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
        ))}
        <div className="public-field sm:col-span-2">
          <Label htmlFor={`${id}-message`}>¿En qué podemos ayudarte?</Label>
          <Textarea
            id={`${id}-message`}
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
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
        <div className="sm:col-span-2">
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
        <div className="sm:col-span-2 flex flex-wrap items-center gap-5">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Enviando consulta…" : "Enviar consulta"}
            <ArrowUpRight aria-hidden />
          </Button>
          <span className="text-xs text-muted-foreground">
            El envío no crea una relación de representación.
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
