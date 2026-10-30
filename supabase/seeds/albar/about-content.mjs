/** CMS blocks shared by the initial seed and the incremental editorial update. */
const block = (type, data, variant = 'default') => ({ type, schema_version: 1, variant, data });
export const aboutTitle = 'Conoce a ALBAR Abogados y Claudia';
export const aboutExcerpt = 'Somos ALBAR Abogados: asesoramos y representamos a personas y empresas con una estrategia fundada en los hechos, un trato cercano y claridad para decidir.';
export const homeStudioIntro = 'Somos ALBAR Abogados. Asesoramos y representamos a personas y empresas con una estrategia construida a partir de los hechos de cada caso. Nuestra fundadora, Claudia Albiña Aros, combina el análisis de los antecedentes con una explicación clara de las alternativas. Trabajamos para que comprendas tus opciones y puedas decidir cómo avanzar.';
export function aboutBlocks() {
  return [
    block('split_content', {
      eyebrow: 'Nuestro estudio', heading: 'El origen de ALBAR Abogados',
      body: 'Somos un estudio jurídico que nace de una convicción: cada persona y cada empresa merecen una estrategia diseñada para su realidad. Detrás de una consulta hay decisiones que pueden cambiar una vida, una familia o el futuro de un negocio. Por eso, nuestro trabajo comienza por escuchar y comprender el contexto de cada caso.\n\nEn ALBAR basamos nuestras recomendaciones en los hechos y en los antecedentes disponibles. Explicamos las alternativas con honestidad y acordamos los próximos pasos con un trato cercano, tanto en la asesoría preventiva como en la representación judicial.\n\nNuestro nombre surge del de nuestra fundadora, Claudia Albiña Aros. Expresa una forma de ejercer el Derecho en la que la confianza, el estudio riguroso y el acompañamiento forman parte de cada asesoría.',
    }),
    { ...block('split_content', {
      eyebrow: 'Nuestra fundadora', heading: 'Conoce a Claudia Albiña Aros',
      body: 'ALBAR fue fundado por Claudia Albiña Aros, abogada formada en la Pontificia Universidad Católica de Chile. Su trayectoria incluye experiencia en estudios jurídicos y en materias del sector público y privado, una práctica profesional en la Fiscalía Metropolitana Sur y participación, a través de un estudio externo, en asesoría laboral para una empresa del sector retail.\n\nCon esa experiencia como base, en ALBAR asesoramos y representamos a personas y empresas en asuntos de familia, laborales, civiles, de insolvencia, corporativos y de contratación pública. Combinamos la revisión de antecedentes con una planificación jurídica ajustada a las necesidades de cada cliente.',
    }, 'image-left'), asset_key: 'claudia-perfil' },
    block('card_grid', {
      aria_label: 'Experiencia y enfoque de ALBAR', columns: '4', tone: 'primary',
      items: [
        { icon: 'users', heading: '+100', body: 'Clientes asesorados y representados por nuestra fundadora durante su trayectoria.' },
        { icon: 'heart-handshake', heading: 'Personas y empresas', body: 'Asesoría jurídica integral y estrategias adaptadas a cada realidad.' },
        { icon: 'scale', heading: 'Litigación y asesoría jurídica', body: 'Acompañamiento preventivo y representación en controversias.' },
        { icon: 'book-open-check', heading: 'Abogada PUC', body: 'Formación de nuestra fundadora y compromiso con la actualización profesional.' },
      ],
    }, 'metrics'),
    block('card_grid', {
      eyebrow: 'La preparación detrás de cada estrategia', heading: 'Formación y actualización profesional',
      body: 'La formación de nuestra fundadora y el estudio permanente respaldan nuestra forma de abordar cada caso.', columns: '4',
      items: [
        { icon: 'book-open-check', heading: 'Abogada', body: 'Pontificia Universidad Católica de Chile', detail: 'Título profesional obtenido en 2023.' },
        { icon: 'file-check', heading: 'Licenciada en Ciencias Sociales', body: 'Pontificia Universidad Católica de Chile', detail: 'Major en Derecho. Minor en Relaciones Internacionales.' },
        { icon: 'scale', heading: 'Diplomado en Derecho Penal Económico', body: 'Pontificia Universidad Católica de Chile', detail: '2025.' },
        { icon: 'file-text', heading: 'Formación continua', body: 'Actualización jurídica permanente', detail: 'Participamos en diplomados, seminarios y programas de actualización en distintas áreas del Derecho.' },
      ],
    }, 'credentials'),
    block('card_grid', {
      eyebrow: 'Nuestra forma de trabajar', heading: 'Una estrategia empieza por escuchar', columns: '4',
      items: [
        { icon: 'message-circle', heading: 'Escuchamos antes de recomendar', body: 'Comprendemos el contexto y las prioridades de cada cliente antes de proponer una vía.' },
        { icon: 'book-open-check', heading: 'Trabajamos con antecedentes', body: 'Distinguimos los hechos acreditados, la información pendiente y las decisiones que dependen de ella.' },
        { icon: 'heart-handshake', heading: 'Explicamos con claridad', body: 'Presentamos las alternativas, sus condiciones y sus posibles efectos para que puedas decidir con información.' },
        { icon: 'wallet-cards', heading: 'Acordamos cómo avanzar', body: 'Definimos el alcance del encargo, las actuaciones y los honorarios antes de iniciar las gestiones.' },
      ],
    }),
    block('card_grid', {
      eyebrow: 'Cómo podemos ayudarte', heading: 'Áreas de práctica', columns: '4',
      body: 'Asesoramos y representamos en distintas materias. El primer paso es revisar la situación y determinar qué vía corresponde.',
      items: [
        { icon: 'users', heading: 'Derecho de familia', body: 'Asesoramos en divorcios, alimentos, cuidado personal, relación directa y regular, compensación económica y medidas de protección.', href: '/personas/derecho-de-familia', link_label: 'Conocer el área' },
        { icon: 'wallet-cards', heading: 'Derecho laboral', body: 'Asesoramos y representamos ante despidos, conflictos laborales, vulneraciones de derechos y accidentes del trabajo.', href: '/personas/derecho-laboral', link_label: 'Conocer el área' },
        { icon: 'file-text', heading: 'Derecho civil', body: 'Revisamos contratos, arrendamientos, responsabilidad civil y cumplimiento de obligaciones, y representamos en litigios.', href: '/personas/derecho-civil', link_label: 'Conocer el área' },
        { icon: 'coins', heading: 'Insolvencia y reemprendimiento', body: 'Evaluamos alternativas de reorganización o liquidación para personas y empresas según sus antecedentes y los requisitos aplicables.', href: '/liquidacion-concursal', link_label: 'Conocer el área' },
      ],
    }, 'practice'),
    block('testimonials', { eyebrow: 'Testimonios', heading: 'Experiencias con ALBAR' }),
    block('cta', {
      eyebrow: 'Conversemos sobre tu situación', heading: 'Cada caso merece una estrategia diseñada para su realidad.',
      body: 'En ALBAR revisamos los antecedentes, explicamos las alternativas y definimos contigo los próximos pasos. Cuéntanos qué necesitas resolver para comenzar.',
      actions: [{ label: 'Solicitar evaluación de mi caso', href: '/contacto', style: 'primary', icon: 'arrow-up-right' }],
    }),
  ];
}
