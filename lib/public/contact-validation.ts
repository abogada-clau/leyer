export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
  website: string;
};
export const contactLimits = {
  name: 200,
  email: 254,
  phone: 50,
  subject: 200,
  message: 5000,
};
export function validateContact(input: unknown): {
  value?: ContactInput;
  errors: Record<string, string>;
} {
  const raw =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const value: ContactInput = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: raw.consent === true,
    website: typeof raw.website === "string" ? raw.website : "",
  };
  const errors: Record<string, string> = {};
  for (const [key, max] of Object.entries(contactLimits)) {
    const field = key as keyof typeof contactLimits;
    const v = raw[field];
    value[field] = typeof v === "string" ? v.trim() : "";
    if (
      typeof v !== "string" ||
      value[field].length > max ||
      /\u0000/.test(value[field])
    )
      errors[field] = `Revisa este campo; admite hasta ${max} caracteres.`;
  }
  if (value.name.length < 2) errors.name = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))
    errors.email = "Escribe un correo electrónico válido.";
  if (value.subject.length < 2)
    errors.subject = "Indica el motivo de tu consulta.";
  if (value.message.length < 10)
    errors.message = "Describe tu consulta con al menos 10 caracteres.";
  if (!value.consent)
    errors.consent =
      "Debes aceptar el tratamiento descrito en la política de privacidad.";
  if (value.website) errors.website = "No se pudo validar el envío.";
  return { value: Object.keys(errors).length ? undefined : value, errors };
}

export const contactStatuses: Record<string, string> = {
  new: "Nueva",
  in_progress: "En seguimiento",
  closed: "Cerrada",
  spam: "No deseada",
};
