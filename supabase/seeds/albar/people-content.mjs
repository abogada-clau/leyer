export const peopleSteps = [
  ['Conocemos tu caso', 'Escuchamos tu situación y reunimos los antecedentes para entender tu caso.'],
  ['Diseñamos la estrategia', 'Analizamos las alternativas legales y diseñamos una estrategia ajustada a tu situación.'],
  ['Te acompañamos', 'Te representamos y asesoramos durante el proceso, con una comunicación cercana y constante.'],
  ['Buscamos la mejor solución posible', 'Trabajamos para proteger tus intereses y buscar la solución más favorable que permitan los antecedentes de tu caso.'],
];

export const companySteps = [
  ['Diagnóstico', 'Entendemos tu negocio y sus necesidades legales.'],
  ['Análisis jurídico', 'Evaluamos riesgos y oportunidades.'],
  ['Diseño de la estrategia', 'Proponemos soluciones legales a medida.'],
  ['Implementación', 'Te acompañamos en la ejecución de la estrategia.'],
  ['Seguimiento', 'Monitoreamos y ajustamos la estrategia para proteger tu empresa.'],
];

const benefits = {
  personas: [
    ['users', 'Estrategias personalizadas', 'Cada caso merece una solución diseñada para su realidad.'],
    ['message-circle', 'Comunicación cercana', 'Te mantenemos informado en cada etapa del proceso.'],
    ['file-check', 'Estudio riguroso', 'Cada estrategia nace del análisis detallado de los antecedentes.'],
    ['heart-handshake', 'Acompañamiento integral', 'Estamos contigo desde la primera consulta hasta el cierre del caso.'],
  ],
  empresas: [
    ['file-check', 'Prevención', 'Anticipamos riesgos antes de que se transformen en conflictos.'],
    ['heart-handshake', 'Estrategia', 'Soluciones jurídicas alineadas con los objetivos de tu empresa.'],
    ['message-circle', 'Respuesta oportuna', 'Comunicación rápida y acompañamiento permanente.'],
    ['users', 'Visión integral', 'Asesoría preventiva y representación jurídica cuando se requiere.'],
  ],
};

export function studioBenefits(audience) {
  return {
    type: 'card_grid',
    schema_version: 1,
    variant: 'studio-benefits',
    data: {
      heading: '¿Por qué trabajar con ALBAR?',
      tone: audience === 'personas' ? 'sand' : 'ivory',
      items: benefits[audience].map(([icon, heading, body]) => ({ icon, heading, body })),
    },
  };
}
