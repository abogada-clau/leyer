/** Brand swatches stay stable; semantic tokens adapt to the selected theme. */
export const brandColors = [
  {
    name: "Pino",
    token: "--brand-pine",
    value: "#183A30",
    use: "Marca y acciones",
    dark: true,
  },
  {
    name: "Marfil",
    token: "--brand-ivory",
    value: "#F7F6F3",
    use: "Lienzo y calma",
    dark: false,
  },
  {
    name: "Arena",
    token: "--brand-sand",
    value: "#E6DCCB",
    use: "Superficies cálidas",
    dark: false,
  },
  {
    name: "Salvia",
    token: "--brand-sage",
    value: "#CAD8CD",
    use: "Acentos naturales",
    dark: false,
  },
  {
    name: "Terracota",
    token: "--brand-terracotta",
    value: "#A35638",
    use: "Énfasis editorial",
    dark: true,
  },
  {
    name: "Tinta",
    token: "--brand-ink",
    value: "#23342D",
    use: "Texto y contraste",
    dark: true,
  },
] as const;

export const spacing = [4, 8, 12, 16, 24, 32, 48, 64] as const;
export const radii = [
  { name: "Pequeño", value: 6 },
  { name: "Base", value: 10 },
  { name: "Amplio", value: 16 },
] as const;

export const navigation = [
  {
    label: "INTRODUCCIÓN",
    links: [{ id: "overview", label: "Visión general", icon: "overview" }],
  },
  {
    label: "FUNDAMENTOS",
    links: [
      { id: "colors", label: "Colores", icon: "colors" },
      { id: "typography", label: "Tipografía", icon: "typography" },
      { id: "layout", label: "Espaciado y forma", icon: "layout" },
      { id: "icons", label: "Iconografía", icon: "icons" },
    ],
  },
  {
    label: "COMPONENTES",
    links: [
      { id: "buttons", label: "Botones y acciones", icon: "buttons" },
      { id: "forms", label: "Formularios", icon: "forms" },
      { id: "feedback", label: "Estados y mensajes", icon: "feedback" },
      { id: "images", label: "Imágenes y carga", icon: "images" },
    ],
  },
  {
    label: "EN CONTEXTO",
    links: [
      { id: "patterns", label: "Sitio y administración", icon: "patterns" },
      { id: "guidelines", label: "Principios de uso", icon: "guidelines" },
    ],
  },
] as const;
