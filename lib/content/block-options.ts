/** Stored values are allowlisted; editors cannot inject component names, CSS or markup. */
export const iconOptions = {
  none: "Sin icono", "heart-handshake": "Acompañamiento", "message-circle": "Conversación",
  "book-open-check": "Antecedentes", "wallet-cards": "Honorarios", users: "Personas",
  coins: "Aportes", house: "Hogar", "file-text": "Documento", scale: "Justicia",
  "file-check": "Acuerdo", "arrow-up-right": "Flecha diagonal", "arrow-right": "Flecha", check: "Verificación",
} as const;
export const visualOptions = { none: "Sin apoyo visual", image: "Imagen de la biblioteca", brand: "Ilustración de marca", requirements: "Ilustración de documentos" } as const;
export const toneOptions = { default: "Predeterminado", ivory: "Marfil", sage: "Salvia", sand: "Arena", primary: "Pino", terracotta: "Terracota" } as const;
export const actionStyles = { primary: "Botón principal", secondary: "Botón secundario", text: "Enlace de texto" } as const;
export const richLayouts = { reading: "Lectura continua", intro: "Introducción en columnas", columns: "Subapartados en columnas" } as const;
export const blockVariants = { default: "Predeterminada", "image-right": "Imagen a la derecha", "image-left": "Imagen a la izquierda", centered: "Centrada", benefits: "Franja de beneficios", metrics: "Franja de experiencia", credentials: "Formación profesional", practice: "Áreas de práctica" } as const;
