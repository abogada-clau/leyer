export type Testimonial = {
  id: string;
  author_name: string;
  quote: string;
  context: string;
};

/** Explicitly fictional copy for the component showcase, never a public endorsement. */
export const testimonialExamples: Testimonial[] = [
  { id: "example-1", author_name: "Ejemplo editable 1", quote: "Texto de ejemplo: el equipo nos explicó las alternativas con claridad y nos ayudó a comprender qué antecedentes debíamos reunir antes de tomar una decisión.", context: "Asesoría para personas · ejemplo" },
  { id: "example-2", author_name: "Ejemplo editable 2", quote: "Texto de ejemplo: valoramos la comunicación cercana y la explicación de los pasos del proceso. Pudimos plantear nuestras preguntas y entender el alcance de la asesoría.", context: "Acompañamiento jurídico · ejemplo" },
  { id: "example-3", author_name: "Ejemplo editable 3", quote: "Texto de ejemplo: recibimos una revisión ordenada de la situación de la empresa y una explicación de las opciones disponibles para definir los próximos pasos.", context: "Asesoría para empresas · ejemplo" },
];
