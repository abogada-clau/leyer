-- ALBAR ABOGADOS. Generado desde content.mjs; no ejecutar como migración automática.
-- Solo SQL Editor/conexión de confianza. Requiere todas las migraciones, incluida 20261022000100_editable_service_presentation.sql.
-- Edita esta configuración. Sin actor válido la transacción aborta sin crear datos.
-- Por defecto TODO queda en revisión y el sitio en borrador.
begin;
create temporary table albar_seed_config(config jsonb) on commit drop;
insert into albar_seed_config values (
 $ALBAR_CONFIG${
  "actor_email": "",
  "admin_email": null,
  "domain": "www.albarabogados.cl",
  "publish": false,
  "activate_site": false,
  "legal_review_confirmed": false,
  "privacy_review_confirmed": false,
  "privacy_controller": null,
  "privacy_email": "contacto@abogadaclaudia.com",
  "privacy_processors": null,
  "retention_days": null,
  "phone": "+56 9 4697 8661",
  "address": "Av. Corrientes 1234, piso 5, Quinta Normal, Chile",
  "whatsapp": "56946978661",
  "contact_enabled": false,
  "demo": false,
  "assets": {}
 }$ALBAR_CONFIG$::jsonb
 || coalesce(nullif(current_setting('leyer.albar_config',true),'')::jsonb,'{}'::jsonb)
);
create temporary table albar_seed_source(payload jsonb) on commit drop;
insert into albar_seed_source values ($ALBAR_PAYLOAD${
  "seed_key": "albar-abogados-editorial-v1",
  "reviewed_at": "2026-10-21",
  "site": {
    "name": "Sitio principal ALBAR",
    "domain": "www.albarabogados.cl",
    "default_locale": "es-CL"
  },
  "author": {
    "slug": "claudia-albina-aros",
    "display_name": "Claudia Albiña Aros",
    "professional_title": "Abogada y fundadora de ALBAR Abogados",
    "biography": "Abogada y fundadora de ALBAR Abogados. Su presentación pública describe una práctica centrada en la revisión de antecedentes, la explicación de alternativas y un acompañamiento cercano a personas y empresas.",
    "asset_key": "claudia-perfil"
  },
  "terms": [
    {
      "key": "familia",
      "name": "Derecho de familia",
      "slug": "derecho-de-familia"
    },
    {
      "key": "insolvencia",
      "name": "Insolvencia y reemprendimiento",
      "slug": "insolvencia-y-reemprendimiento"
    }
  ],
  "menus": [
    {
      "code": "primary",
      "name": "Navegación principal",
      "items": [
        {
          "label": "Inicio",
          "entry": "home"
        },
        {
          "label": "Sobre ALBAR",
          "entry": "about"
        },
        {
          "label": "Personas",
          "entry": "personas",
          "children": [
            {
              "label": "Derecho de familia",
              "entry": "familia"
            },
            {
              "label": "Divorcio",
              "entry": "divorcios"
            },
            {
              "label": "Pensión de alimentos",
              "entry": "alimentos"
            },
            {
              "label": "Insolvencia",
              "entry": "liquidacion_persona"
            }
          ]
        },
        {
          "label": "Empresas",
          "entry": "empresas",
          "children": [
            {
              "label": "Insolvencia de empresas",
              "entry": "liquidacion_empresa"
            }
          ]
        },
        {
          "label": "Blog",
          "entry": "blog"
        },
        {
          "label": "Contacto",
          "entry": "contacto"
        }
      ]
    },
    {
      "code": "footer",
      "name": "Navegación al pie",
      "items": [
        {
          "label": "Sobre ALBAR",
          "entry": "about"
        },
        {
          "label": "Personas",
          "entry": "personas"
        },
        {
          "label": "Empresas",
          "entry": "empresas"
        },
        {
          "label": "Blog",
          "entry": "blog"
        },
        {
          "label": "Contacto",
          "entry": "contacto"
        },
        {
          "label": "Privacidad",
          "entry": "privacidad"
        },
        {
          "label": "Aviso legal",
          "entry": "aviso"
        }
      ]
    }
  ],
  "redirects": [
    {
      "from": "/sobre-mi",
      "entry": "about"
    },
    {
      "from": "/conoce-a-claudia",
      "entry": "about"
    },
    {
      "from": "/personas/derecho-de-familia/divorcio",
      "entry": "divorcios"
    }
  ],
  "captures": [
    "Cese de Pensión de Alimentos en Chile.png",
    "ChatGPT Image 4 sept 2026, 07_11_52 p.m..png",
    "ChatGPT Image 4 sept 2026, 07_16_44 p.m. (1).png",
    "ChatGPT Image 4 sept 2026, 07_16_44 p.m. (2).png",
    "Cobro de pensión de alimentos.png",
    "Cobro deuda de alimentos_ soluciones legales.png",
    "Divorcio de mutuo acuerdo en Chile.png",
    "Guía legal para rebajar la pensión de alimentos.png",
    "Landing legal_ Aumento de pensión de alimentos.png",
    "Landing legal_ Divorcio por culpa.png",
    "Landing page de divorcio unilateral.png",
    "Landing page elegante de ALBAR Abogados.png",
    "Pensión de alimentos en Chile.png"
  ],
  "entries": [
    {
      "key": "home",
      "kind": "page",
      "path": "/",
      "parent": null,
      "title": "Asesoría jurídica para decidir con claridad",
      "excerpt": "ALBAR Abogados: orientación y representación para personas y empresas, con una estrategia construida a partir de los hechos de cada caso.",
      "template_key": "home",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Cuando enfrento un problema familiar o financiero, quiero identificar una vía y saber quién me acompañará para poder decidir con menor incertidumbre.",
        "attention": "Situación y progreso deseado, antes que la disciplina jurídica.",
        "interest": "Rutas por problemas y explicación del proceso.",
        "desire": "Responsable visible, estrategia fundada, alcance acordado.",
        "action": "Solicitar evaluación del caso."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "ALBAR Abogados · Personas y empresas",
            "heading": "Cuando una decisión cambia tu vida, necesitas una estrategia diseñada a tu medida.",
            "body": "¿Enfrentas un sobreendeudamiento, una separación, un asunto de alimentos u otro problema legal y no sabes por dónde empezar? En Albar revisamos tu situación, te explicamos tus opciones y definimos contigo los próximos pasos a partir de los antecedentes de tu caso, con un trato cercano y honesto.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          },
          "asset_key": "claudia-perfil"
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Empieza por lo que necesitas lograr",
            "heading": "¿Qué necesitas resolver hoy?",
            "items": [
              {
                "heading": "Mis deudas superan mi capacidad de pago",
                "body": "Comprende qué alternativas pueden corresponderte y qué efectos tendrían sobre tus bienes y obligaciones.",
                "href": "/personas/insolvencia-y-reemprendimiento",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "Necesito asegurar o ajustar la pensión de mis hijos",
                "body": "Revisa cómo solicitar, modificar o exigir el cumplimiento de los alimentos según tu situación.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "Quiero ordenar mi separación",
                "body": "Conoce las alternativas de divorcio y las decisiones familiares y patrimoniales que conviene anticipar.",
                "href": "/personas/derecho-de-familia/divorcios",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "Necesito decidir el futuro de mi empresa",
                "body": "Evalúa la situación del negocio y las alternativas concursales antes de comprometer otra decisión.",
                "href": "/empresas/insolvencia-y-reemprendimiento",
                "link_label": "Conocer mis opciones"
              }
            ]
          }
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Conoce a ALBAR",
            "heading": "Una estrategia empieza por escuchar tu realidad.",
            "body": "Somos ALBAR Abogados. Asesoramos y representamos a personas y empresas con una estrategia construida a partir de los hechos de cada caso. Nuestra fundadora, Claudia Albiña Aros, combina el análisis de los antecedentes con una explicación clara de las alternativas. Trabajamos para que comprendas tus opciones y puedas decidir cómo avanzar."
          },
          "asset_key": "claudia-perfil"
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Lo que puedes esperar del acompañamiento de ALBAR",
            "items": [
              {
                "heading": "Tu situación, antes que una fórmula",
                "body": "Revisamos tus prioridades, los antecedentes disponibles y aquello que necesitas resolver."
              },
              {
                "heading": "Una explicación comprensible",
                "body": "Conocerás las alternativas, sus requisitos, riesgos y preguntas pendientes antes de decidir."
              },
              {
                "heading": "Una estrategia fundada",
                "body": "La recomendación se construye a partir de los hechos y documentos de tu caso."
              },
              {
                "heading": "Alcance y honorarios claros",
                "body": "Las gestiones que se propongan y sus condiciones se acuerdan antes de asumir el encargo."
              }
            ]
          }
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Información para empezar",
            "heading": "Lecturas que ayudan a ordenar tus preguntas",
            "source": "posts"
          }
        },
        {
          "type": "testimonials",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Testimonios",
            "heading": "Experiencias con ALBAR"
          }
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "No necesitas tener todas las respuestas para consultar.",
            "body": "Basta una descripción general de lo que ocurre. El siguiente paso es conocer el contexto y acordar cómo evaluar tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        }
      ]
    },
    {
      "key": "about",
      "kind": "page",
      "path": "/sobre-albar",
      "parent": null,
      "title": "Conoce a ALBAR Abogados y Claudia",
      "excerpt": "Somos ALBAR Abogados: asesoramos y representamos a personas y empresas con una estrategia fundada en los hechos, un trato cercano y claridad para decidir.",
      "template_key": "default",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Somos ALBAR Abogados: asesoramos y representamos a personas y empresas con una estrategia fundada en los hechos, un trato cercano y claridad para decidir.",
        "attention": "Conoce a ALBAR Abogados y Claudia",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Nuestro estudio",
            "heading": "El origen de ALBAR Abogados",
            "body": "Somos un estudio jurídico que nace de una convicción: cada persona y cada empresa merecen una estrategia diseñada para su realidad. Detrás de una consulta hay decisiones que pueden cambiar una vida, una familia o el futuro de un negocio. Por eso, nuestro trabajo comienza por escuchar y comprender el contexto de cada caso.\n\nEn ALBAR basamos nuestras recomendaciones en los hechos y en los antecedentes disponibles. Explicamos las alternativas con honestidad y acordamos los próximos pasos con un trato cercano, tanto en la asesoría preventiva como en la representación judicial.\n\nNuestro nombre surge del de nuestra fundadora, Claudia Albiña Aros. Expresa una forma de ejercer el Derecho en la que la confianza, el estudio riguroso y el acompañamiento forman parte de cada asesoría."
          }
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-left",
          "data": {
            "eyebrow": "Nuestra fundadora",
            "heading": "Conoce a Claudia Albiña Aros",
            "body": "ALBAR fue fundado por Claudia Albiña Aros, abogada formada en la Pontificia Universidad Católica de Chile. Su trayectoria incluye experiencia en estudios jurídicos y en materias del sector público y privado, una práctica profesional en la Fiscalía Metropolitana Sur y participación, a través de un estudio externo, en asesoría laboral para una empresa del sector retail.\n\nCon esa experiencia como base, en ALBAR asesoramos y representamos a personas y empresas en asuntos de familia, laborales, civiles, de insolvencia, corporativos y de contratación pública. Combinamos la revisión de antecedentes con una planificación jurídica ajustada a las necesidades de cada cliente."
          },
          "asset_key": "claudia-perfil"
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "metrics",
          "data": {
            "aria_label": "Experiencia y enfoque de ALBAR",
            "columns": "4",
            "tone": "primary",
            "items": [
              {
                "icon": "users",
                "heading": "+100",
                "body": "Clientes asesorados y representados por nuestra fundadora durante su trayectoria."
              },
              {
                "icon": "heart-handshake",
                "heading": "Personas y empresas",
                "body": "Asesoría jurídica integral y estrategias adaptadas a cada realidad."
              },
              {
                "icon": "scale",
                "heading": "Litigación y asesoría jurídica",
                "body": "Acompañamiento preventivo y representación en controversias."
              },
              {
                "icon": "book-open-check",
                "heading": "Abogada PUC",
                "body": "Formación de nuestra fundadora y compromiso con la actualización profesional."
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "credentials",
          "data": {
            "eyebrow": "La preparación detrás de cada estrategia",
            "heading": "Formación y actualización profesional",
            "body": "La formación de nuestra fundadora y el estudio permanente respaldan nuestra forma de abordar cada caso.",
            "columns": "4",
            "items": [
              {
                "icon": "book-open-check",
                "heading": "Abogada",
                "body": "Pontificia Universidad Católica de Chile",
                "detail": "Título profesional obtenido en 2023."
              },
              {
                "icon": "file-check",
                "heading": "Licenciada en Ciencias Sociales",
                "body": "Pontificia Universidad Católica de Chile",
                "detail": "Major en Derecho. Minor en Relaciones Internacionales."
              },
              {
                "icon": "scale",
                "heading": "Diplomado en Derecho Penal Económico",
                "body": "Pontificia Universidad Católica de Chile",
                "detail": "2025."
              },
              {
                "icon": "file-text",
                "heading": "Formación continua",
                "body": "Actualización jurídica permanente",
                "detail": "Participamos en diplomados, seminarios y programas de actualización en distintas áreas del Derecho."
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Nuestra forma de trabajar",
            "heading": "Una estrategia empieza por escuchar",
            "columns": "4",
            "items": [
              {
                "icon": "message-circle",
                "heading": "Escuchamos antes de recomendar",
                "body": "Comprendemos el contexto y las prioridades de cada cliente antes de proponer una vía."
              },
              {
                "icon": "book-open-check",
                "heading": "Trabajamos con antecedentes",
                "body": "Distinguimos los hechos acreditados, la información pendiente y las decisiones que dependen de ella."
              },
              {
                "icon": "heart-handshake",
                "heading": "Explicamos con claridad",
                "body": "Presentamos las alternativas, sus condiciones y sus posibles efectos para que puedas decidir con información."
              },
              {
                "icon": "wallet-cards",
                "heading": "Acordamos cómo avanzar",
                "body": "Definimos el alcance del encargo, las actuaciones y los honorarios antes de iniciar las gestiones."
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "practice",
          "data": {
            "eyebrow": "Cómo podemos ayudarte",
            "heading": "Áreas de práctica",
            "columns": "4",
            "body": "Asesoramos y representamos en distintas materias. El primer paso es revisar la situación y determinar qué vía corresponde.",
            "items": [
              {
                "icon": "users",
                "heading": "Derecho de familia",
                "body": "Asesoramos en divorcios, alimentos, cuidado personal, relación directa y regular, compensación económica y medidas de protección.",
                "href": "/personas/derecho-de-familia",
                "link_label": "Conocer el área"
              },
              {
                "icon": "wallet-cards",
                "heading": "Derecho laboral",
                "body": "Asesoramos y representamos ante despidos, conflictos laborales, vulneraciones de derechos y accidentes del trabajo.",
                "href": "/personas/derecho-laboral",
                "link_label": "Conocer el área"
              },
              {
                "icon": "file-text",
                "heading": "Derecho civil",
                "body": "Revisamos contratos, arrendamientos, responsabilidad civil y cumplimiento de obligaciones, y representamos en litigios.",
                "href": "/personas/derecho-civil",
                "link_label": "Conocer el área"
              },
              {
                "icon": "coins",
                "heading": "Insolvencia y reemprendimiento",
                "body": "Evaluamos alternativas de reorganización o liquidación para personas y empresas según sus antecedentes y los requisitos aplicables.",
                "href": "/liquidacion-concursal",
                "link_label": "Conocer el área"
              }
            ]
          }
        },
        {
          "type": "testimonials",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Testimonios",
            "heading": "Experiencias con ALBAR"
          }
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Conversemos sobre tu situación",
            "heading": "Cada caso merece una estrategia diseñada para su realidad.",
            "body": "En ALBAR revisamos los antecedentes, explicamos las alternativas y definimos contigo los próximos pasos. Cuéntanos qué necesitas resolver para comenzar.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "style": "primary",
                "icon": "arrow-up-right"
              }
            ]
          }
        }
      ]
    },
    {
      "key": "personas",
      "kind": "page",
      "path": "/personas",
      "parent": null,
      "title": "Soluciones legales para personas",
      "excerpt": "Encuentra una orientación según la situación que necesitas resolver.",
      "template_key": "default",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Encuentra una orientación según la situación que necesitas resolver.",
        "attention": "Soluciones legales para personas",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Personas",
            "heading": "Una situación difícil se enfrenta mejor con un camino claro.",
            "body": "Empieza por el cambio que necesitas lograr. Revisaremos tu situación familiar o financiera y las alternativas que podrían corresponderte.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "¿Cuál es tu situación?",
            "items": [
              {
                "heading": "No puedo seguir pagando mis deudas",
                "body": "Evalúa tu situación antes de iniciar un procedimiento concursal.",
                "href": "/personas/insolvencia-y-reemprendimiento",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "Quiero poner término a mi matrimonio",
                "body": "Identifica qué alternativa de divorcio puede ajustarse a tus antecedentes.",
                "href": "/personas/derecho-de-familia/divorcios",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "Necesito regular o modificar los alimentos",
                "body": "Ordena las necesidades, los aportes y los cambios que conviene acreditar.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "La pensión no se está pagando",
                "body": "Conoce las vías para solicitar el cumplimiento de una pensión fijada.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos/cobro",
                "link_label": "Conocer mis opciones"
              }
            ]
          }
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "¿Cómo trabajamos?",
            "items": [
              {
                "heading": "Conocemos tu caso",
                "body": "Escuchamos tu situación y reunimos los antecedentes para entender tu caso."
              },
              {
                "heading": "Diseñamos la estrategia",
                "body": "Analizamos las alternativas legales y diseñamos una estrategia ajustada a tu situación."
              },
              {
                "heading": "Te acompañamos",
                "body": "Te representamos y asesoramos durante el proceso, con una comunicación cercana y constante."
              },
              {
                "heading": "Buscamos la mejor solución posible",
                "body": "Trabajamos para proteger tus intereses y buscar la solución más favorable que permitan los antecedentes de tu caso."
              }
            ]
          }
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Empecemos por tu principal preocupación.",
            "body": "Cuéntanos de forma general qué ocurre y qué necesitas resolver.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        }
      ]
    },
    {
      "key": "empresas",
      "kind": "page",
      "path": "/empresas",
      "parent": null,
      "title": "Orientación jurídica para decisiones de empresa",
      "excerpt": "Evalúa la situación financiera de tu empresa y los pasos que conviene analizar antes de actuar.",
      "template_key": "default",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Evalúa la situación financiera de tu empresa y los pasos que conviene analizar antes de actuar.",
        "attention": "Orientación jurídica para decisiones de empresa",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Empresas",
            "heading": "Antes de decidir el futuro del negocio, entiende tus alternativas.",
            "body": "Cuando las obligaciones comprometen la continuidad de la empresa, una evaluación de sus antecedentes permite distinguir entre dificultades transitorias y una situación que requiere una salida concursal.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Ordena la decisión que necesitas tomar",
            "items": [
              {
                "heading": "Evaluar la insolvencia del negocio",
                "body": "Revisa deudas, activos, operación y procesos pendientes.",
                "href": "/empresas/insolvencia-y-reemprendimiento",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "Comprender qué procedimiento corresponde",
                "body": "Distingue entre persona y empresa deudora y entre las vías que podrían ser aplicables.",
                "href": "/liquidacion-concursal",
                "link_label": "Conocer mis opciones"
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Antecedentes para una evaluación inicial",
            "items": [
              {
                "text": "Actividad de la empresa y situación tributaria."
              },
              {
                "text": "Relación de obligaciones, acreedores y vencimientos."
              },
              {
                "text": "Activos, garantías y flujo de ingresos."
              },
              {
                "text": "Juicios, cobranzas y obligaciones laborales, cuando existan."
              }
            ],
            "hidden": true
          }
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          }
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Decide con una visión completa de la situación.",
            "body": "Revisemos los antecedentes del negocio antes de elegir una vía.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        }
      ]
    },
    {
      "key": "familia",
      "kind": "page",
      "path": "/personas/derecho-de-familia",
      "parent": "personas",
      "title": "Derecho de familia: decisiones con claridad",
      "excerpt": "Orientación para ordenar una separación y las obligaciones de alimentos.",
      "template_key": "default",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Orientación para ordenar una separación y las obligaciones de alimentos.",
        "attention": "Derecho de familia: decisiones con claridad",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Derecho de familia",
            "heading": "Protege lo importante mientras ordenas el siguiente paso.",
            "body": "Una separación o un desacuerdo económico puede traer preguntas sobre tus hijos, tus ingresos y tu futuro. Identifiquemos qué necesitas resolver y qué vías pueden ayudarte.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Empieza por tu necesidad",
            "items": [
              {
                "heading": "Quiero divorciarme",
                "body": "Revisa acuerdo, cese de convivencia y antecedentes antes de demandar.",
                "href": "/personas/derecho-de-familia/divorcios",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "Necesito una pensión de alimentos",
                "body": "Ordena gastos, aportes y necesidades para evaluar la solicitud.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos/solicitar",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "La pensión ya no refleja la realidad",
                "body": "Evalúa aumento, rebaja o cese sin alterar por tu cuenta una obligación vigente.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos",
                "link_label": "Conocer mis opciones"
              },
              {
                "heading": "La pensión está impaga",
                "body": "Distingue el incumplimiento del monto pendiente y las medidas de cobro.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos/cobro",
                "link_label": "Conocer mis opciones"
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Lo que puedes esperar del acompañamiento de ALBAR",
            "items": [
              {
                "heading": "Tu situación, antes que una fórmula",
                "body": "Revisamos tus prioridades, los antecedentes disponibles y aquello que necesitas resolver."
              },
              {
                "heading": "Una explicación comprensible",
                "body": "Conocerás las alternativas, sus requisitos, riesgos y preguntas pendientes antes de decidir."
              },
              {
                "heading": "Una estrategia fundada",
                "body": "La recomendación se construye a partir de los hechos y documentos de tu caso."
              },
              {
                "heading": "Alcance y honorarios claros",
                "body": "Las gestiones que se propongan y sus condiciones se acuerdan antes de asumir el encargo."
              }
            ]
          }
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Hablemos de la decisión que necesitas tomar.",
            "body": "Revisaremos los antecedentes y las preguntas que conviene resolver primero.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        }
      ]
    },
    {
      "key": "divorcios",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/divorcios",
      "parent": "familia",
      "title": "Divorcio en Chile",
      "excerpt": "Compara las alternativas de divorcio y comprende las decisiones que conviene revisar antes de iniciar el proceso.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "mutuo",
        "unilateral",
        "culpa"
      ],
      "captures": [
        12
      ],
      "strategy": {
        "job": "Cuando quiero terminar mi matrimonio, necesito comprender qué vía es viable y qué debo preparar para poder avanzar sin decisiones improvisadas.",
        "attention": "Un nuevo comienzo también necesita decisiones claras.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Divorcio en Chile",
            "body": "Si estás pensando en divorciarte, te ayudaremos a distinguir qué vía puede corresponder a tu situación y qué materias familiares o económicas conviene abordar.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Un nuevo comienzo también necesita decisiones claras.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Antes de iniciar",
            "heading": "¿Qué necesitas ordenar para divorciarte?",
            "body": "No todas las separaciones parten del mismo punto. Revisamos si existe acuerdo, cómo se acredita el cese de convivencia y si hay decisiones pendientes respecto de hijos, alimentos, compensación económica o bienes.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Conoce las alternativas",
            "items": [
              {
                "heading": "Divorcio de mutuo acuerdo",
                "body": "Ambos cónyuges solicitan el divorcio y presentan un acuerdo completo y suficiente.",
                "href": "/personas/derecho-de-familia/divorcios/mutuo-acuerdo",
                "link_label": "Conocer mis opciones",
                "icon": "file-text"
              },
              {
                "heading": "Divorcio unilateral",
                "body": "Uno de los cónyuges solicita el divorcio por cese efectivo de convivencia, sujeto a sus requisitos.",
                "href": "/personas/derecho-de-familia/divorcios/unilateral",
                "link_label": "Conocer mis opciones",
                "icon": "scale"
              },
              {
                "heading": "Divorcio por culpa",
                "body": "Se analizan hechos graves y la prueba que podría sustentar esta causal.",
                "href": "/personas/derecho-de-familia/divorcios/por-culpa",
                "link_label": "Conocer mis opciones",
                "icon": "scale"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Preguntas que vale la pena resolver",
            "items": [
              {
                "text": "¿Existe disposición de ambos para solicitar el divorcio?"
              },
              {
                "text": "¿Desde cuándo cesó la convivencia y cómo puede acreditarse?"
              },
              {
                "text": "¿Hay hijos o una pensión vigente?"
              },
              {
                "text": "¿Puede corresponder compensación económica?"
              },
              {
                "text": "¿Qué régimen patrimonial existe y qué gestiones adicionales requiere?"
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Qué requisitos hay para divorciarse?",
                "answer": "Dependen de la causal. La evaluación distingue el mutuo acuerdo, el cese de convivencia para una solicitud unilateral y los hechos que podrían sustentar un divorcio por culpa."
              },
              {
                "question": "¿Cuánto demora?",
                "answer": "La duración depende de la vía, las notificaciones, la prueba, las incidencias y la agenda del tribunal. No ofrecemos un plazo fijo de resultado."
              },
              {
                "question": "¿Qué pasa con los hijos y los bienes?",
                "answer": "El divorcio no elimina las obligaciones respecto de los hijos. Cuidado personal, alimentos, relación directa y regular, compensación y gestiones patrimoniales requieren un análisis propio; no todo se resuelve automáticamente en la sentencia."
              },
              {
                "question": "¿Cuánto cuesta?",
                "answer": "Los honorarios dependen del alcance y de las actuaciones necesarias. Se informan y acuerdan antes del encargo."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "mutuo",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/divorcios/mutuo-acuerdo",
      "parent": "divorcios",
      "title": "Divorcio de mutuo acuerdo",
      "excerpt": "Evalúa los requisitos y el contenido de un acuerdo completo y suficiente para solicitar el divorcio conjuntamente.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "divorcios",
        "unilateral",
        "alimentos"
      ],
      "captures": [
        7
      ],
      "strategy": {
        "job": "Cuando ambos queremos divorciarnos, quiero transformar ese acuerdo inicial en una propuesta jurídicamente suficiente para cerrar esta etapa con claridad.",
        "attention": "Si ambos quieren cerrar esta etapa, construyamos un acuerdo que les permita avanzar.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Divorcio de mutuo acuerdo",
            "body": "Te acompañamos a revisar los requisitos y a ordenar las materias del acuerdo, con una explicación clara de lo que se propone y de lo que aún debe resolverse.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Si ambos quieren cerrar esta etapa, construyamos un acuerdo que les permita avanzar.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Una decisión compartida",
            "heading": "Estar de acuerdo en divorciarse es el punto de partida.",
            "body": "La solicitud conjunta exige revisar también las relaciones entre los cónyuges y con sus hijos cuando corresponda. Trabajamos para identificar acuerdos posibles y puntos que necesitan una decisión antes de presentar la solicitud.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Qué debemos revisar",
            "items": [
              {
                "text": "Voluntad de ambos de solicitar el divorcio."
              },
              {
                "text": "Cese de convivencia durante un lapso mayor de un año y antecedentes para acreditarlo."
              },
              {
                "text": "Acuerdo completo y suficiente conforme a la ley."
              },
              {
                "text": "Materias familiares y económicas que deban regularse según el caso."
              },
              {
                "text": "Documentación y representación jurídica para la solicitud."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Materias que pueden requerir un acuerdo",
            "items": [
              {
                "heading": "Cuidado y relación con los hijos",
                "body": "Se revisa la organización familiar y la regulación existente.",
                "icon": "users"
              },
              {
                "heading": "Aportes de alimentos",
                "body": "Se precisan obligaciones, montos y formas de cumplimiento que correspondan.",
                "icon": "coins"
              },
              {
                "heading": "Compensación económica",
                "body": "Se evalúa su procedencia y cómo debe plantearse oportunamente.",
                "icon": "coins"
              },
              {
                "heading": "Bienes y régimen patrimonial",
                "body": "Se distingue lo que puede acordarse de las gestiones patrimoniales adicionales.",
                "icon": "house"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Evaluación de ambos antecedentes",
                "body": "Revisamos la situación, el cese de convivencia y los acuerdos vigentes."
              },
              {
                "heading": "Preparación del acuerdo",
                "body": "Trabajamos sobre sus materias y detectamos lo que falta resolver."
              },
              {
                "heading": "Solicitud judicial",
                "body": "Se presenta la solicitud y los antecedentes necesarios."
              },
              {
                "heading": "Resolución y actuaciones posteriores",
                "body": "Se atiende lo que disponga el tribunal y las gestiones acordadas que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Es más rápido que otras vías?",
                "answer": "Un acuerdo suficiente puede reducir los puntos controvertidos, pero no permite garantizar una fecha de sentencia."
              },
              {
                "question": "¿Es necesario tener hijos?",
                "answer": "No. La solicitud puede existir sin hijos; el acuerdo debe cubrir las materias aplicables a cada caso."
              },
              {
                "question": "¿Qué pasa si falta acuerdo sobre compensación?",
                "answer": "Es un punto que debe analizarse antes de la solicitud. No conviene omitir una materia relevante solo para presentar el trámite."
              },
              {
                "question": "¿Puede hacerse sin abogado?",
                "answer": "La solicitud judicial requiere patrocinio y representación conforme a las reglas aplicables."
              },
              {
                "question": "¿Cuánto cuesta?",
                "answer": "Se define según el alcance del acuerdo, los antecedentes y las actuaciones que se encarguen."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "unilateral",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/divorcios/unilateral",
      "parent": "divorcios",
      "title": "Divorcio unilateral",
      "excerpt": "Revisa el cese de convivencia y los antecedentes necesarios cuando no existe acuerdo para divorciarse.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "divorcios",
        "mutuo",
        "culpa"
      ],
      "captures": [
        11
      ],
      "strategy": {
        "job": "Cuando quiero divorciarme y no hay acuerdo, necesito saber si puedo iniciar una vía unilateral y cómo prepararme.",
        "attention": "Si tu cónyuge no quiere divorciarse, conoce qué opciones puedes tener.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Divorcio unilateral",
            "body": "Analicemos si se cumplen los requisitos de una solicitud unilateral y qué debes acreditar antes de tomar la decisión de demandar.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Si tu cónyuge no quiere divorciarse, conoce qué opciones puedes tener.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Cuándo evaluar esta alternativa",
            "heading": "La falta de acuerdo no resuelve por sí sola cuál es la vía.",
            "body": "La solicitud unilateral por cese efectivo de convivencia exige, entre otros antecedentes, un período de a lo menos tres años. También se deben revisar la prueba disponible y las circunstancias relevantes del caso.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Antecedentes que conviene revisar",
            "items": [
              {
                "text": "Fecha del cese efectivo de convivencia y eventuales reanudaciones."
              },
              {
                "text": "Medios de acreditación según la fecha del matrimonio y las reglas aplicables."
              },
              {
                "text": "Certificados, acuerdos o resoluciones familiares existentes."
              },
              {
                "text": "Cumplimiento de obligaciones de alimentos que puedan ser relevantes."
              },
              {
                "text": "Situación de compensación económica y del régimen patrimonial."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Revisamos la viabilidad",
                "body": "Ordenamos fechas, antecedentes y asuntos pendientes."
              },
              {
                "heading": "Preparamos la demanda y prueba",
                "body": "Definimos lo que debe acreditarse y los documentos necesarios."
              },
              {
                "heading": "Tramitamos el proceso",
                "body": "Se atienden notificaciones, audiencias e incidencias que correspondan."
              },
              {
                "heading": "Revisamos la resolución",
                "body": "Te explicamos los efectos de lo decidido y las actuaciones posteriores acordadas."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Basta con llevar tres años separados?",
                "answer": "El tiempo debe acreditarse y no reemplaza los demás requisitos. También se revisa si existen circunstancias que puedan afectar la solicitud."
              },
              {
                "question": "¿Mi cónyuge puede oponerse?",
                "answer": "Puede ejercer las defensas que permita la ley. El incumplimiento reiterado de alimentos por el demandante, pudiendo cumplir, es un antecedente que puede ser relevante a solicitud de la contraparte."
              },
              {
                "question": "¿Cómo se acredita el cese?",
                "answer": "Depende de la fecha del matrimonio y los antecedentes. La evaluación determina los documentos y medios de prueba adecuados."
              },
              {
                "question": "¿Se resuelve todo lo relativo a hijos y bienes?",
                "answer": "No de forma automática. Es necesario distinguir cada materia y la vía que corresponda."
              },
              {
                "question": "¿Cuánto cuesta y cuánto tarda?",
                "answer": "El valor se acuerda según el encargo. Los tiempos dependen de la tramitación y no se garantizan por anticipado."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "culpa",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/divorcios/por-culpa",
      "parent": "divorcios",
      "title": "Divorcio por culpa",
      "excerpt": "Evalúa si los hechos y la prueba permiten sostener una solicitud de divorcio por falta imputable al otro cónyuge.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "divorcios",
        "unilateral"
      ],
      "captures": [
        10
      ],
      "strategy": {
        "job": "Cuando he vivido incumplimientos graves en el matrimonio, necesito entender si existe una vía y qué prueba requiere para decidir sin falsas expectativas.",
        "attention": "Cuando la convivencia se vuelve intolerable, el primer paso es evaluar los hechos.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Divorcio por culpa",
            "body": "Te ayudamos a comprender si esta causal puede corresponder a tu situación y qué antecedentes se necesitan, con un trato reservado y una estrategia fundada.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Cuando la convivencia se vuelve intolerable, el primer paso es evaluar los hechos.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Cuándo puede corresponder",
            "heading": "Una causal que exige hechos graves y prueba.",
            "body": "No toda discusión, infidelidad o separación configura automáticamente esta causal. Debe analizarse la gravedad de la infracción y cómo torna intolerable la vida en común, conforme a la ley.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Qué se evalúa",
            "items": [
              {
                "text": "Hechos concretos, su contexto y antecedentes disponibles."
              },
              {
                "text": "Malos tratamientos graves o transgresiones graves y reiteradas de deberes matrimoniales, cuando corresponda."
              },
              {
                "text": "Relación de los hechos con la imposibilidad de continuar la vida en común."
              },
              {
                "text": "Legitimación para solicitar esta causal."
              },
              {
                "text": "Prueba obtenida lícitamente y materias familiares o económicas relacionadas."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Decisiones que requieren un análisis separado",
            "items": [
              {
                "heading": "Protección y contexto familiar",
                "body": "Se revisan las necesidades de protección y las vías que correspondan.",
                "icon": "users"
              },
              {
                "heading": "Situación de los hijos",
                "body": "Sus derechos y obligaciones no desaparecen por el divorcio.",
                "icon": "users"
              },
              {
                "heading": "Compensación económica",
                "body": "Se analiza su procedencia y el efecto que la causal pueda tener según la ley.",
                "icon": "coins"
              },
              {
                "heading": "Patrimonio",
                "body": "Las consecuencias dependen del régimen y de las gestiones que correspondan.",
                "icon": "house"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Toda infidelidad basta para obtener el divorcio por culpa?",
                "answer": "No se debe prometer ese resultado. La calificación depende de la gravedad, reiteración y demás circunstancias exigidas por la causal, además de la prueba."
              },
              {
                "question": "¿Necesito esperar los plazos del divorcio por cese?",
                "answer": "Esta causal se analiza por los hechos que la sustentan; no debe confundirse con las vías fundadas en el tiempo de cese de convivencia."
              },
              {
                "question": "¿Qué pruebas necesito?",
                "answer": "Depende de los hechos. No obtengas antecedentes accediendo sin permiso a cuentas o dispositivos; la evaluación considera medios lícitos."
              },
              {
                "question": "¿Qué pasa con la compensación y los hijos?",
                "answer": "Deben revisarse sus reglas y circunstancias propias. No se promete una sanción económica ni una decisión familiar automática."
              },
              {
                "question": "¿Cuánto dura?",
                "answer": "La controversia, la prueba y las actuaciones judiciales influyen. No se ofrece un plazo de resultado."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "alimentos",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/pension-de-alimentos",
      "parent": "familia",
      "title": "Pensión de alimentos en Chile",
      "excerpt": "Solicitar, modificar y exigir el cumplimiento de una pensión según las necesidades y circunstancias del caso.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "solicitar",
        "aumento",
        "rebaja",
        "cese",
        "cobro"
      ],
      "captures": [
        13
      ],
      "strategy": {
        "job": "Cuando necesito que los aportes familiares respondan a la realidad, quiero saber qué vía corresponde y cómo respaldarla.",
        "attention": "Las necesidades de tus hijos merecen un aporte claro y una estrategia para hacerlo cumplir.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Pensión de alimentos en Chile",
            "body": "Si necesitas fijar una pensión, ajustarla o cobrar lo pendiente, revisemos qué existe hoy y qué cambio necesitas lograr.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Las necesidades de tus hijos merecen un aporte claro y una estrategia para hacerlo cumplir.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Información para decidir",
            "heading": "Empieza por identificar qué necesitas cambiar.",
            "body": "No es lo mismo fijar una pensión por primera vez que modificar una vigente o cobrar una deuda. La evaluación ordena el objetivo, la resolución o acuerdo existente y los antecedentes que lo respaldan.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Te acompañamos según tu situación",
            "items": [
              {
                "heading": "Solicitar una pensión",
                "body": "Organiza necesidades, gastos y antecedentes para una regulación inicial.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos/solicitar",
                "link_label": "Conocer mis opciones",
                "icon": "scale"
              },
              {
                "heading": "Pedir un aumento",
                "body": "Revisa cambios en necesidades y capacidad económica.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos/aumento",
                "link_label": "Conocer mis opciones",
                "icon": "scale"
              },
              {
                "heading": "Evaluar una rebaja",
                "body": "Analiza una variación de circunstancias sin dejar de cumplir por tu cuenta.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos/rebaja",
                "link_label": "Conocer mis opciones",
                "icon": "scale"
              },
              {
                "heading": "Solicitar el cese",
                "body": "Comprende cuándo puede dejar de corresponder la obligación y qué debe acreditarse.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos/cese",
                "link_label": "Conocer mis opciones",
                "icon": "scale"
              },
              {
                "heading": "Exigir el pago",
                "body": "Ordena incumplimientos, liquidación y medidas de cumplimiento.",
                "href": "/personas/derecho-de-familia/pension-de-alimentos/cobro",
                "link_label": "Conocer mis opciones",
                "icon": "coins"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Gastos y antecedentes que puede ser útil ordenar",
            "items": [
              {
                "text": "Alimentación, vivienda y vestuario."
              },
              {
                "text": "Educación, materiales y gastos asociados."
              },
              {
                "text": "Salud, tratamientos y necesidades particulares."
              },
              {
                "text": "Recreación y otras necesidades de desarrollo."
              },
              {
                "text": "Distribución del cuidado y aportes de cada progenitor."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "El análisis considera la situación completa",
            "items": [
              {
                "heading": "Necesidades de los hijos",
                "body": "Edad, salud, educación y necesidades acreditables.",
                "icon": "users"
              },
              {
                "heading": "Capacidad económica",
                "body": "Ingresos, antecedentes patrimoniales y otras circunstancias relevantes.",
                "icon": "coins"
              },
              {
                "heading": "Cuidado y aportes",
                "body": "La organización familiar y las contribuciones existentes.",
                "icon": "users"
              },
              {
                "heading": "Acuerdos y resoluciones",
                "body": "Lo que ya está regulado y lo que se pide modificar o cumplir.",
                "icon": "file-text"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Evaluamos la situación",
                "body": "Diferenciamos regulación, modificación y cumplimiento."
              },
              {
                "heading": "Revisamos la vía previa",
                "body": "Se evalúa la mediación previa cuando corresponde y sus excepciones legales."
              },
              {
                "heading": "Preparamos los antecedentes",
                "body": "Ordenamos necesidades, capacidad económica y documentación."
              },
              {
                "heading": "Seguimos la vía acordada",
                "body": "Se realizan las gestiones y actuaciones que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Cómo se calcula la pensión?",
                "answer": "La fijación depende de las reglas aplicables y de los antecedentes de necesidades y capacidad económica. No se ofrece una calculadora como sustituto del análisis."
              },
              {
                "question": "¿Puede aumentar o bajar?",
                "answer": "Puede solicitarse una modificación si existen circunstancias relevantes que la justifiquen y puedan acreditarse."
              },
              {
                "question": "¿Termina cuando mi hijo cumple 18 años?",
                "answer": "No automáticamente. En alimentos a descendientes son relevantes las reglas de 21 y 28 años, sus condiciones y excepciones, además de la resolución vigente."
              },
              {
                "question": "¿Qué pasa si no se paga?",
                "answer": "El cumplimiento tiene vías propias. Revisa la página de cobro para identificar lo que necesitas ordenar."
              },
              {
                "question": "¿La pensión incluye solo comida?",
                "answer": "No. La evaluación de necesidades puede comprender distintos gastos de subsistencia y desarrollo."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "solicitar",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/pension-de-alimentos/solicitar",
      "parent": "alimentos",
      "title": "Solicitar una pensión de alimentos",
      "excerpt": "Ordena los gastos, aportes y necesidades para evaluar una primera regulación de alimentos.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "alimentos",
        "aumento",
        "cobro"
      ],
      "captures": [],
      "strategy": {
        "job": "Cuando no existe un aporte regulado, quiero saber qué preparar para buscar una contribución adecuada y exigible.",
        "attention": "Si hoy los aportes son inciertos, empecemos por darles una base clara.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Solicitar una pensión de alimentos",
            "body": "Te ayudamos a organizar las necesidades de tus hijos y los antecedentes para evaluar una solicitud de alimentos y las etapas que correspondan.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Si hoy los aportes son inciertos, empecemos por darles una base clara.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Lo que revisamos contigo",
            "items": [
              {
                "text": "Necesidades actuales y gastos que puedas respaldar."
              },
              {
                "text": "Situación de ingresos y aportes disponibles."
              },
              {
                "text": "Distribución del cuidado y acuerdos informales existentes."
              },
              {
                "text": "Identificación de las partes y antecedentes de filiación."
              },
              {
                "text": "Procedencia de mediación previa y certificados o excepciones aplicables."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Debo pasar por mediación antes de demandar?",
                "answer": "En las materias sujetas a mediación previa se revisa esa etapa y las excepciones legales. Si no hay acuerdo, se evalúan los antecedentes necesarios para la vía judicial."
              },
              {
                "question": "¿Necesito tener todos los gastos documentados para consultar?",
                "answer": "No para un primer contacto. La evaluación identifica qué documentación será útil reunir."
              },
              {
                "question": "¿Se garantiza un monto?",
                "answer": "No. La propuesta se fundamenta en los antecedentes y la decisión corresponde al tribunal o al acuerdo aprobado que proceda."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "aumento",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/pension-de-alimentos/aumento",
      "parent": "alimentos",
      "title": "Aumento de pensión de alimentos",
      "excerpt": "Evalúa si los cambios en las necesidades de tus hijos o en las circunstancias económicas justifican solicitar un aumento.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "alimentos",
        "rebaja",
        "cobro"
      ],
      "captures": [
        9
      ],
      "strategy": {
        "job": "Cuando la pensión ya no cubre las necesidades actuales, quiero demostrar qué cambió para pedir una revisión fundada.",
        "attention": "Si las necesidades de tus hijos cambiaron, revisemos si la pensión necesita cambiar también.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Aumento de pensión de alimentos",
            "body": "Te acompañamos a ordenar los nuevos gastos y antecedentes para evaluar una solicitud fundada, sin dar por hecho un monto ni un resultado.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Si las necesidades de tus hijos cambiaron, revisemos si la pensión necesita cambiar también.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Una modificación con antecedentes",
            "heading": "No se trata solo de pedir más: necesitamos explicar qué cambió.",
            "body": "La evaluación compara la regulación vigente con la situación actual y determina qué necesidades o cambios económicos pueden respaldarse.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Situaciones que conviene revisar",
            "items": [
              {
                "text": "Nuevos gastos de educación o de una etapa de desarrollo."
              },
              {
                "text": "Tratamientos de salud o necesidades especiales."
              },
              {
                "text": "Cambios en vivienda, alimentación u otros gastos relevantes."
              },
              {
                "text": "Variaciones en la capacidad económica que deban acreditarse."
              },
              {
                "text": "Modificaciones en la distribución del cuidado y aportes."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Cómo construimos el análisis",
            "items": [
              {
                "heading": "Necesidades actuales",
                "body": "Organizamos gastos nuevos y su respaldo.",
                "icon": "scale"
              },
              {
                "heading": "Situación económica",
                "body": "Revisamos los antecedentes disponibles sobre capacidad de aporte.",
                "icon": "coins"
              },
              {
                "heading": "Regulación vigente",
                "body": "Identificamos qué se fijó y bajo qué contexto.",
                "icon": "scale"
              },
              {
                "heading": "Cambio acreditable",
                "body": "Distinguimos hechos relevantes de suposiciones.",
                "icon": "scale"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Qué necesito para evaluar un aumento?",
                "answer": "La regulación vigente y una descripción de los cambios. Luego se determina qué documentos conviene reunir."
              },
              {
                "question": "¿Se puede solicitar si mi hijo ya es mayor de edad?",
                "answer": "La mayoría de edad no descarta por sí sola el análisis. Deben revisarse la titularidad, los requisitos y las circunstancias de la obligación."
              },
              {
                "question": "¿Desde cuándo se aplicaría el aumento?",
                "answer": "Se debe revisar la solicitud y lo que resuelva el tribunal. No se promete una fecha retroactiva o un monto antes del análisis."
              },
              {
                "question": "¿Qué pasa si la otra parte se opone?",
                "answer": "Será necesario evaluar los hechos controvertidos y su prueba. La oposición no permite anticipar por sí sola la decisión."
              },
              {
                "question": "¿Cuánto tarda?",
                "answer": "Depende de las etapas previas, la prueba y la tramitación. No se garantiza un plazo de sentencia."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "rebaja",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/pension-de-alimentos/rebaja",
      "parent": "alimentos",
      "title": "Rebaja de pensión de alimentos",
      "excerpt": "Evalúa un cambio acreditable en las circunstancias económicas y las necesidades que deben resguardarse.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "alimentos",
        "aumento",
        "cese"
      ],
      "captures": [
        8
      ],
      "strategy": {
        "job": "Cuando no puedo sostener el monto vigente por un cambio real, quiero saber cómo solicitar una revisión sin agravar el incumplimiento.",
        "attention": "Si tu realidad económica cambió, revisemos cómo plantearlo por la vía correspondiente.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Rebaja de pensión de alimentos",
            "body": "Una caída de ingresos puede generar incertidumbre. Te ayudamos a revisar los antecedentes para evaluar una solicitud de rebaja sin desconocer las necesidades de tus hijos.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Si tu realidad económica cambió, revisemos cómo plantearlo por la vía correspondiente.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Antes de modificar tus pagos",
            "heading": "La rebaja no ocurre por decisión unilateral.",
            "body": "Quedar sin trabajo o asumir nuevos gastos no reduce automáticamente una pensión vigente. Conviene evaluar qué cambió, cómo se acredita y qué vía corresponde antes de alterar el cumplimiento.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Cambios que pueden ser relevantes",
            "items": [
              {
                "text": "Pérdida o disminución de ingresos con antecedentes verificables."
              },
              {
                "text": "Enfermedad o gastos médicos de relevancia."
              },
              {
                "text": "Nuevas cargas familiares y su contexto."
              },
              {
                "text": "Variaciones en necesidades o situación económica de quienes intervienen."
              },
              {
                "text": "Documentos de la regulación vigente y del cambio que se plantea."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Una revisión de ambas realidades",
            "items": [
              {
                "heading": "Ingresos y capacidad económica",
                "body": "Se consideran los antecedentes actuales y su estabilidad.",
                "icon": "coins"
              },
              {
                "heading": "Cargas y gastos",
                "body": "Se analiza su relevancia y respaldo.",
                "icon": "scale"
              },
              {
                "heading": "Necesidades de los hijos",
                "body": "Sus necesidades siguen siendo parte central del análisis.",
                "icon": "users"
              },
              {
                "heading": "Variación de circunstancias",
                "body": "Debe explicarse qué diferencia la situación actual de la que se tuvo en cuenta.",
                "icon": "scale"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Puedo bajar el pago si quedo cesante?",
                "answer": "No por tu sola decisión. Debe revisarse la vía correspondiente; una dificultad económica no modifica automáticamente la resolución vigente."
              },
              {
                "question": "¿Tener otro hijo garantiza una rebaja?",
                "answer": "No. Es un antecedente que debe analizarse junto con la capacidad económica y las necesidades involucradas."
              },
              {
                "question": "¿Qué pasa con una deuda ya acumulada?",
                "answer": "Una solicitud de modificación no equivale a borrar deudas. Su situación debe revisarse por separado."
              },
              {
                "question": "¿Desde cuándo podría regir?",
                "answer": "Depende de la resolución y de las reglas aplicables. La evaluación no sustituye esa decisión."
              },
              {
                "question": "¿Qué documentos conviene reunir?",
                "answer": "La regulación vigente, antecedentes de ingresos y los que respalden el cambio que se invoca."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "cese",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/pension-de-alimentos/cese",
      "parent": "alimentos",
      "title": "Cese de pensión de alimentos",
      "excerpt": "Analiza si cambiaron las condiciones que justifican la obligación y qué debe acreditarse para solicitar su cese.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "alimentos",
        "rebaja",
        "guia_cese"
      ],
      "captures": [
        1
      ],
      "strategy": {
        "job": "Cuando creo que la pensión podría dejar de corresponder, quiero confirmar los requisitos y pedir una decisión formal sin acumular incumplimientos.",
        "attention": "Cuando cambia la situación de tu hijo, conviene revisar la obligación antes de dejar de pagar.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Cese de pensión de alimentos",
            "body": "Te ayudamos a evaluar edad, estudios, autonomía y demás antecedentes relevantes para saber si corresponde solicitar el cese y cómo plantearlo.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Cuando cambia la situación de tu hijo, conviene revisar la obligación antes de dejar de pagar.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Una precisión importante",
            "heading": "Cumplir 18 años no termina automáticamente la pensión.",
            "body": "La edad por sí sola no permite desconocer una obligación vigente. Para descendientes deben revisarse las reglas de 21 años, la continuidad de estudios que puede extenderla hasta los 28 y las excepciones legales, además de las necesidades y antecedentes del caso.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Situaciones que merecen una evaluación",
            "items": [
              {
                "text": "Edad y etapa de formación del hijo o hija."
              },
              {
                "text": "Continuidad o término de estudios y antecedentes que lo acrediten."
              },
              {
                "text": "Medios de subsistencia y situación económica actual."
              },
              {
                "text": "Circunstancias de incapacidad o excepciones que puedan mantener la obligación."
              },
              {
                "text": "Contenido de la resolución vigente y cambios posteriores relevantes."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Qué se revisa antes de recomendar una solicitud",
            "items": [
              {
                "heading": "Edad y condiciones legales",
                "body": "Se consideran las condiciones y excepciones, no solo una fecha de cumpleaños.",
                "icon": "scale"
              },
              {
                "heading": "Estudios",
                "body": "Importan los antecedentes concretos de formación.",
                "icon": "scale"
              },
              {
                "heading": "Autonomía y necesidades",
                "body": "Se revisa si existen medios suficientes y qué necesidades continúan.",
                "icon": "scale"
              },
              {
                "heading": "Prueba del cambio",
                "body": "La solicitud debe estar sustentada en antecedentes pertinentes.",
                "icon": "scale"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Evaluación de las condiciones",
                "body": "Revisamos la obligación vigente y la situación actual."
              },
              {
                "heading": "Vía previa cuando corresponda",
                "body": "Se analiza la mediación y sus excepciones legales."
              },
              {
                "heading": "Preparación y presentación",
                "body": "Se ordenan la solicitud y sus antecedentes por la vía aplicable."
              },
              {
                "heading": "Resolución y cumplimiento",
                "body": "Se revisa lo decidido antes de alterar las obligaciones."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Desde qué edad se puede solicitar el cese?",
                "answer": "No existe una respuesta automática basada solo en cumplir 18 años. Deben analizarse las reglas de edad, los estudios y las excepciones legales que correspondan."
              },
              {
                "question": "¿Si sigue estudiando todavía puede corresponder pensión?",
                "answer": "Sí puede ser relevante. Se revisan las condiciones legales y los antecedentes del caso."
              },
              {
                "question": "¿Casarse o convivir termina el derecho automáticamente?",
                "answer": "No debe asumirse así. Es necesario analizar necesidades, medios de subsistencia y las reglas aplicables."
              },
              {
                "question": "¿Puedo dejar de pagar mientras se tramita?",
                "answer": "No se recomienda alterar una obligación vigente por decisión propia. Debe atenderse a lo que resuelva la autoridad competente."
              },
              {
                "question": "¿Qué pasa si el tribunal rechaza el cese?",
                "answer": "La obligación no desaparece por haber presentado la solicitud. Se revisan la resolución y las opciones que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "cobro",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/pension-de-alimentos/cobro",
      "parent": "alimentos",
      "title": "Cobro de pensión de alimentos",
      "excerpt": "Ordena el incumplimiento de una pensión ya fijada y conoce las vías para solicitar su pago.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "deuda",
        "alimentos",
        "guia_afp"
      ],
      "captures": [
        5
      ],
      "strategy": {
        "job": "Cuando no recibo la pensión fijada, quiero saber cómo acreditar lo impago y solicitar medidas de cumplimiento.",
        "attention": "Si la pensión no se está pagando, empecemos por una estrategia de cumplimiento.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Cobro de pensión de alimentos",
            "body": "Te acompañamos a revisar la resolución o acuerdo, los pagos registrados y el estado del procedimiento para determinar qué gestiones pueden corresponder.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Si la pensión no se está pagando, empecemos por una estrategia de cumplimiento.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Distinguir el objetivo",
            "heading": "Cobrar una pensión fijada no es lo mismo que pedirla por primera vez.",
            "body": "Antes de iniciar actuaciones se revisa si hay un título vigente, cómo se registran los pagos y cuál es el estado de la liquidación de deuda. La estrategia depende de esa base.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Situaciones que conviene ordenar",
            "items": [
              {
                "text": "Mensualidades impagas o pagos parciales."
              },
              {
                "text": "Diferencias entre lo pagado y lo fijado."
              },
              {
                "text": "Resolución, acuerdo aprobado y antecedentes de la causa."
              },
              {
                "text": "Liquidación, notificaciones y actuaciones pendientes."
              },
              {
                "text": "Información disponible sobre ingresos o recursos, sin acceder ilegítimamente a datos."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Revisión de antecedentes",
                "body": "Identificamos la regulación vigente y los incumplimientos."
              },
              {
                "heading": "Determinación de la deuda",
                "body": "Revisamos el estado de la liquidación y lo que deba solicitarse."
              },
              {
                "heading": "Solicitud de medidas",
                "body": "Se evalúan las medidas de cumplimiento y sus requisitos."
              },
              {
                "heading": "Seguimiento de actuaciones",
                "body": "Se controla lo resuelto y el cumplimiento que corresponda."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Debo esperar varios meses para consultar?",
                "answer": "No necesitas esperar para revisar la situación. Las medidas específicas tienen requisitos propios y dependen del estado de la causa."
              },
              {
                "question": "¿Se presenta una demanda nueva cada vez?",
                "answer": "No debe asumirse. Si existe una pensión fijada, se revisa la causa y la vía de cumplimiento que corresponda."
              },
              {
                "question": "¿Se puede pedir arresto?",
                "answer": "Los apremios están sujetos a requisitos y a una decisión judicial. No se ofrecen como consecuencia automática."
              },
              {
                "question": "¿Qué pasa si el alimentante no tiene trabajo?",
                "answer": "La falta de trabajo no acredita por sí sola que no existan recursos ni extingue la obligación. Se evalúan los antecedentes y las vías aplicables."
              },
              {
                "question": "¿Se garantiza recuperar el dinero?",
                "answer": "No. La estrategia y el seguimiento no permiten prometer recursos disponibles ni un resultado judicial."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "deuda",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/pension-de-alimentos/cobro-deuda",
      "parent": "alimentos",
      "title": "Cobro de deuda de alimentos y fondos AFP",
      "excerpt": "Evalúa la liquidación de deuda, la búsqueda de recursos y los requisitos de las vías de pago efectivo.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [
        "cobro",
        "guia_afp"
      ],
      "captures": [
        6
      ],
      "strategy": {
        "job": "Cuando se acumula una deuda y el cobro habitual no basta, quiero entender qué mecanismos adicionales pueden servir en mi caso.",
        "attention": "Si la deuda se acumula, revisemos qué herramientas de cobro pueden corresponder.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Cobro de deuda de alimentos y fondos AFP",
            "body": "Te ayudamos a entender el estado de la deuda y a evaluar medidas sobre recursos del deudor, incluido el mecanismo sobre fondos previsionales cuando se cumplan sus condiciones.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Si la deuda se acumula, revisemos qué herramientas de cobro pueden corresponder.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Antes de pedir una medida",
            "heading": "Una herramienta adecuada empieza por una deuda bien determinada.",
            "body": "La evaluación revisa el título, la liquidación y el estado del cumplimiento. No todos los recursos ni todas las deudas se persiguen de la misma manera.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Herramientas que deben evaluarse caso a caso",
            "items": [
              {
                "heading": "Investigación y retención de recursos",
                "body": "Se analizan cuentas e instrumentos por los procedimientos autorizados.",
                "icon": "scale"
              },
              {
                "heading": "Fondos previsionales",
                "body": "El mecanismo sobre cotizaciones obligatorias tiene requisitos específicos; no es un retiro libre solicitado por la persona acreedora.",
                "icon": "scale"
              },
              {
                "heading": "Medidas sobre bienes",
                "body": "Se revisa si pueden solicitarse medidas de ejecución según los antecedentes.",
                "icon": "house"
              },
              {
                "heading": "Apremios y otras actuaciones",
                "body": "Su procedencia depende de los presupuestos legales y de lo que resuelva el tribunal.",
                "icon": "scale"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Sobre la vía extraordinaria de pago con AFP",
            "items": [
              {
                "text": "Se revisa la existencia de la deuda liquidada y los antecedentes judiciales."
              },
              {
                "text": "Para perseguir cotizaciones obligatorias son relevantes tres mensualidades adeudadas, continuas o discontinuas, y la inexistencia o insuficiencia de otros fondos, entre las condiciones aplicables."
              },
              {
                "text": "La investigación y la orden de pago corresponden al tribunal."
              },
              {
                "text": "Los límites y eventuales exclusiones deben analizarse; no se promete recuperar la totalidad."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Puedo pedir directamente a la AFP que pague?",
                "answer": "No es una solicitud de retiro libre. Las gestiones y órdenes de pago se tramitan por la vía judicial que corresponda."
              },
              {
                "question": "¿Basta con una mensualidad para cobrar desde cotizaciones obligatorias?",
                "answer": "No debe confundirse la investigación de recursos con la vía extraordinaria sobre cotizaciones obligatorias. Esta última exige condiciones adicionales, que se revisan con la causa."
              },
              {
                "question": "¿Puedo cobrar si el hijo ya es mayor de edad?",
                "answer": "La mayoría de edad no borra por sí sola una deuda. Se deben revisar titularidad, representación, períodos y demás antecedentes."
              },
              {
                "question": "¿Se pueden cobrar reajustes e intereses?",
                "answer": "Se revisa cómo debe determinarse la deuda conforme al título y las reglas aplicables."
              },
              {
                "question": "¿Cuánto puede recuperarse?",
                "answer": "Depende de la deuda, los recursos y las condiciones legales. No se garantiza un monto o fecha de pago."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "liquidacion",
      "kind": "landing",
      "path": "/liquidacion-concursal",
      "parent": null,
      "title": "Liquidación concursal en Chile",
      "excerpt": "Distingue las vías concursales para personas y empresas y sus consecuencias antes de iniciar un procedimiento.",
      "template_key": "service-landing",
      "terms": [
        "insolvencia"
      ],
      "relations": [
        "liquidacion_persona",
        "liquidacion_empresa"
      ],
      "captures": [
        2,
        3,
        4
      ],
      "strategy": {
        "job": "Cuando las deudas superan mi capacidad real de pago, quiero comprender las vías y sus consecuencias para decidir sin seguir acumulando incertidumbre.",
        "attention": "¿Tus deudas superan lo que puedes pagar? Primero, conoce tus opciones.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Liquidación concursal en Chile",
            "body": "Antes de elegir una liquidación, revisemos qué calidad de deudor tienes, qué bienes y obligaciones existen y si hay una alternativa que se ajuste mejor a tu situación.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "¿Tus deudas superan lo que puedes pagar? Primero, conoce tus opciones.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "asset_key": "claudia-perfil",
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Encuentra el punto de partida",
            "items": [
              {
                "heading": "Soy persona",
                "body": "Revisemos tu actividad, obligaciones y situación para evaluar la vía que podría corresponder.",
                "href": "/personas/insolvencia-y-reemprendimiento",
                "link_label": "Conocer mis opciones",
                "icon": "users"
              },
              {
                "heading": "Tengo una empresa",
                "body": "Analicemos la operación del negocio y la alternativa concursal aplicable.",
                "href": "/empresas/insolvencia-y-reemprendimiento",
                "link_label": "Conocer mis opciones",
                "icon": "scale"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Qué significa liquidar",
            "heading": "Una decisión con efectos sobre los bienes y las obligaciones.",
            "body": "La liquidación es un procedimiento judicial orientado a realizar los bienes que legalmente correspondan para pagar a acreedores. Sus efectos y las eventuales consecuencias sobre saldos pendientes exigen un análisis individual; no equivale a una promesa de borrar todas las deudas.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "La clasificación importa",
            "items": [
              {
                "heading": "Persona Deudora",
                "body": "No basta llamarse persona natural: se debe revisar la actividad y la definición legal que corresponde.",
                "icon": "users"
              },
              {
                "heading": "Empresa Deudora",
                "body": "La categoría puede incluir sociedades y determinadas personas naturales; la actividad y la situación tributaria son relevantes.",
                "icon": "scale"
              },
              {
                "heading": "Vía simplificada",
                "body": "Se analiza la procedencia del régimen para las categorías habilitadas.",
                "icon": "scale"
              },
              {
                "heading": "Vía ordinaria u otra alternativa",
                "body": "La elección no debe hacerse solo por el monto de las deudas o la rapidez esperada.",
                "icon": "scale"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Antes de iniciar, revisamos",
            "items": [
              {
                "text": "Bienes, ingresos y capacidad real de pago."
              },
              {
                "text": "Deudas, acreedores, garantías y obligaciones con tratamiento especial."
              },
              {
                "text": "Juicios, embargos y otras actuaciones existentes."
              },
              {
                "text": "Actividad, antecedentes tributarios y calidad legal del deudor."
              },
              {
                "text": "Posibilidad de evaluar renegociación o reorganización cuando corresponda."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Dudas que deben resolverse antes de decidir",
            "items": [
              {
                "heading": "¿Qué ocurre con mis bienes?",
                "body": "Debe analizarse qué bienes pueden formar parte del procedimiento y cuáles están legalmente excluidos.",
                "icon": "house"
              },
              {
                "heading": "¿Qué ocurre con las deudas?",
                "body": "Existen condiciones y exclusiones. Los alimentos y otras obligaciones no deben presentarse como deudas que siempre se extinguen.",
                "icon": "coins"
              },
              {
                "heading": "¿Qué pasa con las cobranzas?",
                "body": "Los efectos dependen de las resoluciones y del procedimiento. No se promete detener toda actuación desde la consulta.",
                "icon": "scale"
              },
              {
                "heading": "¿Liquidar es siempre conveniente?",
                "body": "No. La evaluación debe considerar también alternativas y sus requisitos.",
                "icon": "scale"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Cómo evaluamos la alternativa concursal",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Necesito un abogado?",
                "answer": "Las vías judiciales requieren el patrocinio y representación que corresponda. La asesoría permite evaluar requisitos y consecuencias antes de presentar una solicitud."
              },
              {
                "question": "¿Una demanda o embargo impide analizar una liquidación?",
                "answer": "No permite descartar ni recomendar automáticamente una vía. Deben revisarse el procedimiento, su estado y los efectos aplicables."
              },
              {
                "question": "¿Puedo conservar todos mis bienes?",
                "answer": "No se puede prometer. Se determina cuáles pueden integrar el procedimiento y cuáles tienen protección legal."
              },
              {
                "question": "¿Se extinguen todas las obligaciones?",
                "answer": "No. Deben revisarse las exclusiones y los efectos de la resolución de término; ocultar bienes o actuar de mala fe puede tener consecuencias."
              },
              {
                "question": "¿Es una solución siempre mejor que renegociar?",
                "answer": "No. La recomendación depende de la situación y de los requisitos de cada alternativa."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2,
      "variants": [
        {
          "key": "liquidacion-propuesta-1",
          "capture": 2,
          "title": "Liquidación concursal: conocer antes de decidir",
          "blocks": [
            {
              "type": "hero",
              "schema_version": 1,
              "variant": "image-right",
              "data": {
                "eyebrow": "Liquidación concursal",
                "heading": "¿No puedes seguir pagando tus deudas?",
                "body": "Conoce qué alternativas pueden corresponder a tu situación. Revisemos tus obligaciones, patrimonio e ingresos antes de elegir un procedimiento.",
                "actions": [
                  {
                    "label": "Solicitar evaluación de mi caso",
                    "href": "/contacto"
                  }
                ]
              },
              "asset_key": "claudia-perfil"
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "Encuentra el punto de partida",
                "items": [
                  {
                    "heading": "Soy persona",
                    "body": "Revisemos tu actividad, obligaciones y situación para evaluar la vía que podría corresponder.",
                    "href": "/personas/insolvencia-y-reemprendimiento",
                    "link_label": "Conocer mis opciones",
                    "icon": "users"
                  },
                  {
                    "heading": "Tengo una empresa",
                    "body": "Analicemos la operación del negocio y la alternativa concursal aplicable.",
                    "href": "/empresas/insolvencia-y-reemprendimiento",
                    "link_label": "Conocer mis opciones",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "split_content",
              "schema_version": 1,
              "variant": "image-right",
              "data": {
                "eyebrow": "Qué significa liquidar",
                "heading": "Una decisión con efectos sobre los bienes y las obligaciones.",
                "body": "La liquidación es un procedimiento judicial orientado a realizar los bienes que legalmente correspondan para pagar a acreedores. Sus efectos y las eventuales consecuencias sobre saldos pendientes exigen un análisis individual; no equivale a una promesa de borrar todas las deudas.",
                "visual": "brand"
              },
              "assets": []
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "benefits",
              "assets": [],
              "data": {
                "aria_label": "Nuestro acompañamiento",
                "tone": "sage",
                "columns": "4",
                "items": [
                  {
                    "icon": "heart-handshake",
                    "heading": "Tu situación primero",
                    "body": "Escuchamos tu contexto y lo que necesitas resolver."
                  },
                  {
                    "icon": "message-circle",
                    "heading": "Alternativas claras",
                    "body": "Te explicamos las opciones y las preguntas pendientes."
                  },
                  {
                    "icon": "book-open-check",
                    "heading": "Una estrategia fundada",
                    "body": "Revisamos los hechos y antecedentes de tu caso."
                  },
                  {
                    "icon": "wallet-cards",
                    "heading": "Un alcance acordado",
                    "body": "Definimos las gestiones y los honorarios antes de avanzar."
                  }
                ]
              }
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "La clasificación importa",
                "items": [
                  {
                    "heading": "Persona Deudora",
                    "body": "No basta llamarse persona natural: se debe revisar la actividad y la definición legal que corresponde.",
                    "icon": "users"
                  },
                  {
                    "heading": "Empresa Deudora",
                    "body": "La categoría puede incluir sociedades y determinadas personas naturales; la actividad y la situación tributaria son relevantes.",
                    "icon": "scale"
                  },
                  {
                    "heading": "Vía simplificada",
                    "body": "Se analiza la procedencia del régimen para las categorías habilitadas.",
                    "icon": "scale"
                  },
                  {
                    "heading": "Vía ordinaria u otra alternativa",
                    "body": "La elección no debe hacerse solo por el monto de las deudas o la rapidez esperada.",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "checklist",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "Antes de iniciar, revisamos",
                "items": [
                  {
                    "text": "Bienes, ingresos y capacidad real de pago."
                  },
                  {
                    "text": "Deudas, acreedores, garantías y obligaciones con tratamiento especial."
                  },
                  {
                    "text": "Juicios, embargos y otras actuaciones existentes."
                  },
                  {
                    "text": "Actividad, antecedentes tributarios y calidad legal del deudor."
                  },
                  {
                    "text": "Posibilidad de evaluar renegociación o reorganización cuando corresponda."
                  }
                ],
                "visual": "requirements"
              },
              "assets": []
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "Dudas que deben resolverse antes de decidir",
                "items": [
                  {
                    "heading": "¿Qué ocurre con mis bienes?",
                    "body": "Debe analizarse qué bienes pueden formar parte del procedimiento y cuáles están legalmente excluidos.",
                    "icon": "house"
                  },
                  {
                    "heading": "¿Qué ocurre con las deudas?",
                    "body": "Existen condiciones y exclusiones. Los alimentos y otras obligaciones no deben presentarse como deudas que siempre se extinguen.",
                    "icon": "coins"
                  },
                  {
                    "heading": "¿Qué pasa con las cobranzas?",
                    "body": "Los efectos dependen de las resoluciones y del procedimiento. No se promete detener toda actuación desde la consulta.",
                    "icon": "scale"
                  },
                  {
                    "heading": "¿Liquidar es siempre conveniente?",
                    "body": "No. La evaluación debe considerar también alternativas y sus requisitos.",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "steps",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "Cómo evaluamos la alternativa concursal",
                "items": [
                  {
                    "heading": "Ordenamos el caso",
                    "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
                  },
                  {
                    "heading": "Definimos las alternativas",
                    "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
                  },
                  {
                    "heading": "Acordamos el encargo",
                    "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
                  },
                  {
                    "heading": "Te acompañamos",
                    "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "related_content",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "También puede ayudarte",
                "source": "related"
              },
              "assets": []
            },
            {
              "type": "faq",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Preguntas frecuentes",
                "heading": "Respuestas para decidir con más claridad",
                "items": [
                  {
                    "question": "¿Necesito un abogado?",
                    "answer": "Las vías judiciales requieren el patrocinio y representación que corresponda. La asesoría permite evaluar requisitos y consecuencias antes de presentar una solicitud."
                  },
                  {
                    "question": "¿Una demanda o embargo impide analizar una liquidación?",
                    "answer": "No permite descartar ni recomendar automáticamente una vía. Deben revisarse el procedimiento, su estado y los efectos aplicables."
                  },
                  {
                    "question": "¿Puedo conservar todos mis bienes?",
                    "answer": "No se puede prometer. Se determina cuáles pueden integrar el procedimiento y cuáles tienen protección legal."
                  },
                  {
                    "question": "¿Se extinguen todas las obligaciones?",
                    "answer": "No. Deben revisarse las exclusiones y los efectos de la resolución de término; ocultar bienes o actuar de mala fe puede tener consecuencias."
                  },
                  {
                    "question": "¿Es una solución siempre mejor que renegociar?",
                    "answer": "No. La recomendación depende de la situación y de los requisitos de cada alternativa."
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "cta",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "El primer paso es conocer tus opciones",
                "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
                "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
                "actions": [
                  {
                    "label": "Solicitar evaluación de mi caso",
                    "href": "/contacto",
                    "icon": "arrow-up-right",
                    "style": "primary"
                  },
                  {
                    "label": "Escríbenos por WhatsApp",
                    "href": "https://wa.me/{{whatsapp}}",
                    "icon": "message-circle",
                    "style": "text"
                  }
                ]
              },
              "assets": []
            }
          ]
        },
        {
          "key": "liquidacion-propuesta-2",
          "capture": 3,
          "title": "Liquidación concursal: una decisión informada",
          "blocks": [
            {
              "type": "hero",
              "schema_version": 1,
              "variant": "image-right",
              "data": {
                "eyebrow": "Liquidación concursal",
                "heading": "Cuando las deudas superan tu capacidad de pago, conoce las alternativas legales.",
                "body": "Te acompañamos a determinar qué vía podría corresponder y qué consecuencias debes comprender antes de avanzar.",
                "actions": [
                  {
                    "label": "Solicitar evaluación de mi caso",
                    "href": "/contacto"
                  }
                ]
              },
              "asset_key": "claudia-perfil"
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "Encuentra el punto de partida",
                "items": [
                  {
                    "heading": "Soy persona",
                    "body": "Revisemos tu actividad, obligaciones y situación para evaluar la vía que podría corresponder.",
                    "href": "/personas/insolvencia-y-reemprendimiento",
                    "link_label": "Conocer mis opciones",
                    "icon": "users"
                  },
                  {
                    "heading": "Tengo una empresa",
                    "body": "Analicemos la operación del negocio y la alternativa concursal aplicable.",
                    "href": "/empresas/insolvencia-y-reemprendimiento",
                    "link_label": "Conocer mis opciones",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "split_content",
              "schema_version": 1,
              "variant": "image-right",
              "data": {
                "eyebrow": "Qué significa liquidar",
                "heading": "Una decisión con efectos sobre los bienes y las obligaciones.",
                "body": "La liquidación es un procedimiento judicial orientado a realizar los bienes que legalmente correspondan para pagar a acreedores. Sus efectos y las eventuales consecuencias sobre saldos pendientes exigen un análisis individual; no equivale a una promesa de borrar todas las deudas.",
                "visual": "brand"
              },
              "assets": []
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "benefits",
              "assets": [],
              "data": {
                "aria_label": "Nuestro acompañamiento",
                "tone": "sage",
                "columns": "4",
                "items": [
                  {
                    "icon": "heart-handshake",
                    "heading": "Tu situación primero",
                    "body": "Escuchamos tu contexto y lo que necesitas resolver."
                  },
                  {
                    "icon": "message-circle",
                    "heading": "Alternativas claras",
                    "body": "Te explicamos las opciones y las preguntas pendientes."
                  },
                  {
                    "icon": "book-open-check",
                    "heading": "Una estrategia fundada",
                    "body": "Revisamos los hechos y antecedentes de tu caso."
                  },
                  {
                    "icon": "wallet-cards",
                    "heading": "Un alcance acordado",
                    "body": "Definimos las gestiones y los honorarios antes de avanzar."
                  }
                ]
              }
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "La clasificación importa",
                "items": [
                  {
                    "heading": "Persona Deudora",
                    "body": "No basta llamarse persona natural: se debe revisar la actividad y la definición legal que corresponde.",
                    "icon": "users"
                  },
                  {
                    "heading": "Empresa Deudora",
                    "body": "La categoría puede incluir sociedades y determinadas personas naturales; la actividad y la situación tributaria son relevantes.",
                    "icon": "scale"
                  },
                  {
                    "heading": "Vía simplificada",
                    "body": "Se analiza la procedencia del régimen para las categorías habilitadas.",
                    "icon": "scale"
                  },
                  {
                    "heading": "Vía ordinaria u otra alternativa",
                    "body": "La elección no debe hacerse solo por el monto de las deudas o la rapidez esperada.",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "checklist",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "Antes de iniciar, revisamos",
                "items": [
                  {
                    "text": "Bienes, ingresos y capacidad real de pago."
                  },
                  {
                    "text": "Deudas, acreedores, garantías y obligaciones con tratamiento especial."
                  },
                  {
                    "text": "Juicios, embargos y otras actuaciones existentes."
                  },
                  {
                    "text": "Actividad, antecedentes tributarios y calidad legal del deudor."
                  },
                  {
                    "text": "Posibilidad de evaluar renegociación o reorganización cuando corresponda."
                  }
                ],
                "visual": "requirements"
              },
              "assets": []
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "Dudas que deben resolverse antes de decidir",
                "items": [
                  {
                    "heading": "¿Qué ocurre con mis bienes?",
                    "body": "Debe analizarse qué bienes pueden formar parte del procedimiento y cuáles están legalmente excluidos.",
                    "icon": "house"
                  },
                  {
                    "heading": "¿Qué ocurre con las deudas?",
                    "body": "Existen condiciones y exclusiones. Los alimentos y otras obligaciones no deben presentarse como deudas que siempre se extinguen.",
                    "icon": "coins"
                  },
                  {
                    "heading": "¿Qué pasa con las cobranzas?",
                    "body": "Los efectos dependen de las resoluciones y del procedimiento. No se promete detener toda actuación desde la consulta.",
                    "icon": "scale"
                  },
                  {
                    "heading": "¿Liquidar es siempre conveniente?",
                    "body": "No. La evaluación debe considerar también alternativas y sus requisitos.",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "steps",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "Cómo evaluamos la alternativa concursal",
                "items": [
                  {
                    "heading": "Ordenamos el caso",
                    "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
                  },
                  {
                    "heading": "Definimos las alternativas",
                    "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
                  },
                  {
                    "heading": "Acordamos el encargo",
                    "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
                  },
                  {
                    "heading": "Te acompañamos",
                    "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "related_content",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "También puede ayudarte",
                "source": "related"
              },
              "assets": []
            },
            {
              "type": "faq",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Preguntas frecuentes",
                "heading": "Respuestas para decidir con más claridad",
                "items": [
                  {
                    "question": "¿Necesito un abogado?",
                    "answer": "Las vías judiciales requieren el patrocinio y representación que corresponda. La asesoría permite evaluar requisitos y consecuencias antes de presentar una solicitud."
                  },
                  {
                    "question": "¿Una demanda o embargo impide analizar una liquidación?",
                    "answer": "No permite descartar ni recomendar automáticamente una vía. Deben revisarse el procedimiento, su estado y los efectos aplicables."
                  },
                  {
                    "question": "¿Puedo conservar todos mis bienes?",
                    "answer": "No se puede prometer. Se determina cuáles pueden integrar el procedimiento y cuáles tienen protección legal."
                  },
                  {
                    "question": "¿Se extinguen todas las obligaciones?",
                    "answer": "No. Deben revisarse las exclusiones y los efectos de la resolución de término; ocultar bienes o actuar de mala fe puede tener consecuencias."
                  },
                  {
                    "question": "¿Es una solución siempre mejor que renegociar?",
                    "answer": "No. La recomendación depende de la situación y de los requisitos de cada alternativa."
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "cta",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "El primer paso es conocer tus opciones",
                "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
                "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
                "actions": [
                  {
                    "label": "Solicitar evaluación de mi caso",
                    "href": "/contacto",
                    "icon": "arrow-up-right",
                    "style": "primary"
                  },
                  {
                    "label": "Escríbenos por WhatsApp",
                    "href": "https://wa.me/{{whatsapp}}",
                    "icon": "message-circle",
                    "style": "text"
                  }
                ]
              },
              "assets": []
            }
          ]
        },
        {
          "key": "liquidacion-propuesta-3",
          "capture": 4,
          "title": "Liquidación concursal: preguntas antes del primer paso",
          "blocks": [
            {
              "type": "hero",
              "schema_version": 1,
              "variant": "image-right",
              "data": {
                "eyebrow": "Liquidación concursal",
                "heading": "¿No puedes seguir pagando tus deudas? Empecemos por ordenar la situación.",
                "body": "Una evaluación debe explicar requisitos, bienes, obligaciones, cobranzas y alternativas. La liquidación no es una respuesta automática para todos los casos.",
                "actions": [
                  {
                    "label": "Solicitar evaluación de mi caso",
                    "href": "/contacto"
                  }
                ]
              },
              "asset_key": "claudia-perfil"
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "Encuentra el punto de partida",
                "items": [
                  {
                    "heading": "Soy persona",
                    "body": "Revisemos tu actividad, obligaciones y situación para evaluar la vía que podría corresponder.",
                    "href": "/personas/insolvencia-y-reemprendimiento",
                    "link_label": "Conocer mis opciones",
                    "icon": "users"
                  },
                  {
                    "heading": "Tengo una empresa",
                    "body": "Analicemos la operación del negocio y la alternativa concursal aplicable.",
                    "href": "/empresas/insolvencia-y-reemprendimiento",
                    "link_label": "Conocer mis opciones",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "split_content",
              "schema_version": 1,
              "variant": "image-right",
              "data": {
                "eyebrow": "Qué significa liquidar",
                "heading": "Una decisión con efectos sobre los bienes y las obligaciones.",
                "body": "La liquidación es un procedimiento judicial orientado a realizar los bienes que legalmente correspondan para pagar a acreedores. Sus efectos y las eventuales consecuencias sobre saldos pendientes exigen un análisis individual; no equivale a una promesa de borrar todas las deudas.",
                "visual": "brand"
              },
              "assets": []
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "benefits",
              "assets": [],
              "data": {
                "aria_label": "Nuestro acompañamiento",
                "tone": "sage",
                "columns": "4",
                "items": [
                  {
                    "icon": "heart-handshake",
                    "heading": "Tu situación primero",
                    "body": "Escuchamos tu contexto y lo que necesitas resolver."
                  },
                  {
                    "icon": "message-circle",
                    "heading": "Alternativas claras",
                    "body": "Te explicamos las opciones y las preguntas pendientes."
                  },
                  {
                    "icon": "book-open-check",
                    "heading": "Una estrategia fundada",
                    "body": "Revisamos los hechos y antecedentes de tu caso."
                  },
                  {
                    "icon": "wallet-cards",
                    "heading": "Un alcance acordado",
                    "body": "Definimos las gestiones y los honorarios antes de avanzar."
                  }
                ]
              }
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "La clasificación importa",
                "items": [
                  {
                    "heading": "Persona Deudora",
                    "body": "No basta llamarse persona natural: se debe revisar la actividad y la definición legal que corresponde.",
                    "icon": "users"
                  },
                  {
                    "heading": "Empresa Deudora",
                    "body": "La categoría puede incluir sociedades y determinadas personas naturales; la actividad y la situación tributaria son relevantes.",
                    "icon": "scale"
                  },
                  {
                    "heading": "Vía simplificada",
                    "body": "Se analiza la procedencia del régimen para las categorías habilitadas.",
                    "icon": "scale"
                  },
                  {
                    "heading": "Vía ordinaria u otra alternativa",
                    "body": "La elección no debe hacerse solo por el monto de las deudas o la rapidez esperada.",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "checklist",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "Antes de iniciar, revisamos",
                "items": [
                  {
                    "text": "Bienes, ingresos y capacidad real de pago."
                  },
                  {
                    "text": "Deudas, acreedores, garantías y obligaciones con tratamiento especial."
                  },
                  {
                    "text": "Juicios, embargos y otras actuaciones existentes."
                  },
                  {
                    "text": "Actividad, antecedentes tributarios y calidad legal del deudor."
                  },
                  {
                    "text": "Posibilidad de evaluar renegociación o reorganización cuando corresponda."
                  }
                ],
                "visual": "requirements"
              },
              "assets": []
            },
            {
              "type": "card_grid",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Una estrategia para tu situación",
                "heading": "Dudas que deben resolverse antes de decidir",
                "items": [
                  {
                    "heading": "¿Qué ocurre con mis bienes?",
                    "body": "Debe analizarse qué bienes pueden formar parte del procedimiento y cuáles están legalmente excluidos.",
                    "icon": "house"
                  },
                  {
                    "heading": "¿Qué ocurre con las deudas?",
                    "body": "Existen condiciones y exclusiones. Los alimentos y otras obligaciones no deben presentarse como deudas que siempre se extinguen.",
                    "icon": "coins"
                  },
                  {
                    "heading": "¿Qué pasa con las cobranzas?",
                    "body": "Los efectos dependen de las resoluciones y del procedimiento. No se promete detener toda actuación desde la consulta.",
                    "icon": "scale"
                  },
                  {
                    "heading": "¿Liquidar es siempre conveniente?",
                    "body": "No. La evaluación debe considerar también alternativas y sus requisitos.",
                    "icon": "scale"
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "steps",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "Cómo evaluamos la alternativa concursal",
                "items": [
                  {
                    "heading": "Ordenamos el caso",
                    "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
                  },
                  {
                    "heading": "Definimos las alternativas",
                    "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
                  },
                  {
                    "heading": "Acordamos el encargo",
                    "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
                  },
                  {
                    "heading": "Te acompañamos",
                    "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "related_content",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "heading": "También puede ayudarte",
                "source": "related"
              },
              "assets": []
            },
            {
              "type": "faq",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "Preguntas frecuentes",
                "heading": "Respuestas para decidir con más claridad",
                "items": [
                  {
                    "question": "¿Necesito un abogado?",
                    "answer": "Las vías judiciales requieren el patrocinio y representación que corresponda. La asesoría permite evaluar requisitos y consecuencias antes de presentar una solicitud."
                  },
                  {
                    "question": "¿Una demanda o embargo impide analizar una liquidación?",
                    "answer": "No permite descartar ni recomendar automáticamente una vía. Deben revisarse el procedimiento, su estado y los efectos aplicables."
                  },
                  {
                    "question": "¿Puedo conservar todos mis bienes?",
                    "answer": "No se puede prometer. Se determina cuáles pueden integrar el procedimiento y cuáles tienen protección legal."
                  },
                  {
                    "question": "¿Se extinguen todas las obligaciones?",
                    "answer": "No. Deben revisarse las exclusiones y los efectos de la resolución de término; ocultar bienes o actuar de mala fe puede tener consecuencias."
                  },
                  {
                    "question": "¿Es una solución siempre mejor que renegociar?",
                    "answer": "No. La recomendación depende de la situación y de los requisitos de cada alternativa."
                  }
                ]
              },
              "assets": []
            },
            {
              "type": "cta",
              "schema_version": 1,
              "variant": "default",
              "data": {
                "eyebrow": "El primer paso es conocer tus opciones",
                "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
                "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
                "actions": [
                  {
                    "label": "Solicitar evaluación de mi caso",
                    "href": "/contacto",
                    "icon": "arrow-up-right",
                    "style": "primary"
                  },
                  {
                    "label": "Escríbenos por WhatsApp",
                    "href": "https://wa.me/{{whatsapp}}",
                    "icon": "message-circle",
                    "style": "text"
                  }
                ]
              },
              "assets": []
            }
          ]
        }
      ]
    },
    {
      "key": "liquidacion_persona",
      "kind": "landing",
      "path": "/personas/insolvencia-y-reemprendimiento",
      "parent": "personas",
      "title": "Insolvencia y liquidación para personas",
      "excerpt": "Evalúa la situación de tus deudas, bienes e ingresos antes de elegir un procedimiento.",
      "template_key": "service-landing",
      "terms": [
        "insolvencia"
      ],
      "relations": [
        "liquidacion",
        "liquidacion_empresa"
      ],
      "captures": [],
      "strategy": {
        "job": "Cuando los pagos me sobrepasan, quiero saber qué alternativa es viable y cómo afectaría mi patrimonio y mis obligaciones.",
        "attention": "Si ya no puedes sostener tus deudas, necesitas una evaluación antes que otra promesa.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Insolvencia y liquidación para personas",
            "body": "Revisemos el origen de tus obligaciones, tus ingresos y tu actividad para distinguir qué alternativas pueden corresponderte y qué implicaría cada una.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Si ya no puedes sostener tus deudas, necesitas una evaluación antes que otra promesa.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "split_content",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Primero, la calificación",
            "heading": "Ser persona natural no define por sí solo el procedimiento.",
            "body": "Se revisan la actividad y los antecedentes tributarios, además de la deuda y el patrimonio. Esa información permite analizar si corresponde una vía para Persona Deudora o para Empresa Deudora y evaluar sus requisitos.",
            "visual": "brand"
          },
          "assets": []
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Prepara una visión completa",
            "items": [
              {
                "text": "Relación de deudas y acreedores."
              },
              {
                "text": "Ingresos y antecedentes de actividad."
              },
              {
                "text": "Bienes, garantías y derechos patrimoniales."
              },
              {
                "text": "Juicios y cobranzas existentes."
              },
              {
                "text": "Obligaciones familiares u otras con tratamiento especial."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿La liquidación simplificada es para toda persona natural?",
                "answer": "No se debe asumir. La calidad del deudor y las condiciones legales requieren revisión."
              },
              {
                "question": "¿La renegociación es lo mismo?",
                "answer": "No. Es una alternativa con sus propios requisitos y efectos, que debe distinguirse de una liquidación judicial."
              },
              {
                "question": "¿Dejaré de deber una pensión de alimentos?",
                "answer": "No se ofrece ese resultado. Las obligaciones de alimentos tienen un tratamiento especial y no deben presentarse como deudas que se eliminan sin más."
              },
              {
                "question": "¿Necesito tener todo documentado para consultar?",
                "answer": "Una descripción inicial permite comenzar; luego se indica qué antecedentes son necesarios para una evaluación fundada."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "liquidacion_empresa",
      "kind": "landing",
      "path": "/empresas/insolvencia-y-reemprendimiento",
      "parent": "empresas",
      "title": "Insolvencia y liquidación para empresas",
      "excerpt": "Analiza si tu empresa requiere una vía de continuidad, reorganización o liquidación según sus antecedentes.",
      "template_key": "service-landing",
      "terms": [
        "insolvencia"
      ],
      "relations": [
        "liquidacion",
        "liquidacion_persona"
      ],
      "captures": [],
      "strategy": {
        "job": "Cuando mi empresa enfrenta insolvencia, quiero distinguir si es viable continuar o si debo evaluar una salida concursal y sus consecuencias.",
        "attention": "Cuando el negocio deja de sostener sus obligaciones, decide con una visión completa.",
        "interest": "Comprender requisitos y alternativas antes de tomar una decisión.",
        "desire": "Contar con un plan fundado y un acompañamiento con alcance claro.",
        "action": "Solicitar evaluación del caso, sin prometer una cita, gratuidad ni resultado."
      },
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "image-right",
          "data": {
            "eyebrow": "Asesoría y representación",
            "heading": "Insolvencia y liquidación para empresas",
            "body": "Te ayudamos a ordenar la situación financiera, patrimonial y procesal de la empresa antes de recomendar una vía, con atención a sus obligaciones y efectos.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "lead": "Cuando el negocio deja de sostener sus obligaciones, decide con una visión completa.",
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "benefits",
          "assets": [],
          "data": {
            "aria_label": "Nuestro acompañamiento",
            "tone": "sage",
            "columns": "4",
            "items": [
              {
                "icon": "heart-handshake",
                "heading": "Tu situación primero",
                "body": "Escuchamos tu contexto y lo que necesitas resolver."
              },
              {
                "icon": "message-circle",
                "heading": "Alternativas claras",
                "body": "Te explicamos las opciones y las preguntas pendientes."
              },
              {
                "icon": "book-open-check",
                "heading": "Una estrategia fundada",
                "body": "Revisamos los hechos y antecedentes de tu caso."
              },
              {
                "icon": "wallet-cards",
                "heading": "Un alcance acordado",
                "body": "Definimos las gestiones y los honorarios antes de avanzar."
              }
            ]
          }
        },
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Una estrategia para tu situación",
            "heading": "Qué revisamos antes de elegir",
            "items": [
              {
                "heading": "Actividad y situación tributaria",
                "body": "La clasificación y los requisitos del procedimiento deben comprobarse.",
                "icon": "scale"
              },
              {
                "heading": "Viabilidad del negocio",
                "body": "Se consideran la operación, los compromisos y los antecedentes financieros.",
                "icon": "scale"
              },
              {
                "heading": "Activos y garantías",
                "body": "Se identifica el patrimonio y la situación de las garantías.",
                "icon": "scale"
              },
              {
                "heading": "Obligaciones y personas afectadas",
                "body": "Se revisan acreedores, procesos pendientes y antecedentes laborales cuando existan.",
                "icon": "users"
              }
            ]
          },
          "assets": []
        },
        {
          "type": "checklist",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Antecedentes para preparar la evaluación",
            "items": [
              {
                "text": "Estado de deudas y acreedores."
              },
              {
                "text": "Activos y documentación de dominio."
              },
              {
                "text": "Información contable y tributaria disponible."
              },
              {
                "text": "Juicios pendientes y garantías."
              },
              {
                "text": "Situación de trabajadores y obligaciones relacionadas, cuando corresponda."
              }
            ],
            "visual": "requirements"
          },
          "assets": []
        },
        {
          "type": "steps",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Así podemos acompañarte",
            "items": [
              {
                "heading": "Ordenamos el caso",
                "body": "Identificamos qué necesitas resolver y revisamos los antecedentes relevantes."
              },
              {
                "heading": "Definimos las alternativas",
                "body": "Te explicamos las vías disponibles, sus condiciones y los puntos que requieren prueba."
              },
              {
                "heading": "Acordamos el encargo",
                "body": "Si decides avanzar, delimitamos las actuaciones y los honorarios antes de iniciar gestiones."
              },
              {
                "heading": "Te acompañamos",
                "body": "Realizamos las gestiones acordadas y te informamos sobre los hitos que correspondan."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          },
          "assets": []
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿Toda empresa debe usar liquidación ordinaria?",
                "answer": "No debe asumirse. Se revisa si reúne condiciones para un régimen simplificado u otra alternativa."
              },
              {
                "question": "¿Una persona natural puede ser Empresa Deudora?",
                "answer": "Sí puede corresponder esa clasificación según su actividad y las reglas legales. No se decide únicamente por tener o no una sociedad."
              },
              {
                "question": "¿Qué ocurre con la administración de bienes?",
                "answer": "Las resoluciones concursales pueden producir efectos relevantes. Deben explicarse antes de iniciar el procedimiento y atendiendo a su tipo."
              },
              {
                "question": "¿Se garantiza continuidad o liberación de todas las obligaciones?",
                "answer": "No. Cada alternativa tiene condiciones, exclusiones y consecuencias que requieren análisis individual."
              }
            ]
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Conozcamos tu situación antes de dar el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver. Revisaremos cómo puede ayudarte una evaluación de tu caso.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              },
              {
                "label": "Escríbenos por WhatsApp",
                "href": "https://wa.me/{{whatsapp}}",
                "icon": "message-circle",
                "style": "text"
              }
            ]
          },
          "assets": []
        }
      ],
      "template_version": 2
    },
    {
      "key": "contacto",
      "kind": "page",
      "path": "/contacto",
      "parent": null,
      "title": "Solicita una evaluación de tu caso",
      "excerpt": "Un primer contacto para comprender qué necesitas resolver y coordinar el siguiente paso.",
      "template_key": "contact",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Un primer contacto para comprender qué necesitas resolver y coordinar el siguiente paso.",
        "attention": "Solicita una evaluación de tu caso",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuéntanos de manera general qué ocurre y qué necesitas resolver. No es necesario incluir toda la historia ni adjuntar documentos para este primer contacto."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Enviar una consulta no confirma una cita ni crea por sí solo una relación de representación. Las condiciones de la evaluación y de un eventual encargo se acuerdan posteriormente."
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puedes escribir por correo.",
            "body": "Si prefieres este canal, comparte una descripción general y un medio de respuesta. No envíes documentos sensibles sin acordar antes cómo hacerlo.",
            "actions": [
              {
                "label": "Escribir a ALBAR",
                "href": "mailto:contacto@abogadaclaudia.com"
              }
            ]
          }
        },
        {
          "type": "faq",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Preguntas frecuentes",
            "heading": "Respuestas para decidir con más claridad",
            "items": [
              {
                "question": "¿La primera consulta es gratuita?",
                "answer": "No se ofrece gratuidad por defecto. Consulta las condiciones y el valor de la evaluación antes de contratar."
              },
              {
                "question": "¿Puedo enviar documentos por este formulario?",
                "answer": "Este formulario es un primer contacto. Comparte solo una descripción general; no adjuntes documentos, contraseñas, RUT ni información sensible innecesaria."
              },
              {
                "question": "¿Enviar el formulario agenda una reunión?",
                "answer": "El envío registra una solicitud de contacto. La disponibilidad y las condiciones de una reunión se coordinan posteriormente; no se reserva automáticamente una hora."
              }
            ]
          }
        }
      ]
    },
    {
      "key": "blog",
      "kind": "page",
      "path": "/blog",
      "parent": null,
      "title": "Información para tomar decisiones",
      "excerpt": "Guías iniciales sobre familia y obligaciones, con enlaces a las áreas de asesoría.",
      "template_key": "blog-index",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Guías iniciales sobre familia y obligaciones, con enlaces a las áreas de asesoría.",
        "attention": "Información para tomar decisiones",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": []
    },
    {
      "key": "privacidad",
      "kind": "page",
      "path": "/privacidad",
      "parent": null,
      "title": "Privacidad y consultas del sitio",
      "excerpt": "Información sobre el tratamiento de datos del formulario de primer contacto.",
      "template_key": "legal",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Información sobre el tratamiento de datos del formulario de primer contacto.",
        "attention": "Privacidad y consultas del sitio",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Responsable del tratamiento: {{privacy_controller}}. Contacto para asuntos de privacidad: {{privacy_email}}."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El formulario solicita nombre, correo electrónico, teléfono opcional, motivo y mensaje. Registra también el origen, el idioma y la versión de la política aceptada. Se utiliza para recibir y gestionar solicitudes de contacto y responder por los medios acordados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "No adjuntes documentos ni incluyas datos sensibles innecesarios. El envío no constituye un mandato ni una relación de representación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las consultas se almacenan de forma privada en la infraestructura utilizada por el sitio y son accesibles a las personas con permisos de gestión. Proveedores y ubicación de tratamiento informados por el responsable: {{privacy_processors}}."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las consultas sin encargo se conservan hasta {{retention_days}} días, salvo que exista una obligación que justifique su conservación. El responsable gestiona su revisión y eliminación; el envío no activa un expediente profesional. Puedes solicitar información, corrección o eliminación escribiendo al contacto de privacidad; se evaluará la solicitud según las obligaciones aplicables."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El sitio utiliza preferencias técnicas de apariencia. Para prevenir abuso se calcula un identificador temporal de la IP y se aplican límites de envío; la dirección IP original no se guarda en los contadores de consultas. Los contadores vencidos se eliminan mediante el proceso autorizado del sitio."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Esta versión no afirma el uso de publicidad ni analítica opcional. Si se incorporan nuevas herramientas o finalidades, debe actualizarse la información y habilitar los controles que correspondan."
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    },
    {
      "key": "aviso",
      "kind": "page",
      "path": "/aviso-legal",
      "parent": null,
      "title": "Aviso legal del sitio",
      "excerpt": "Alcance de la información y condiciones del primer contacto con ALBAR Abogados.",
      "template_key": "legal",
      "terms": [],
      "relations": [],
      "captures": [],
      "strategy": {
        "job": "Alcance de la información y condiciones del primer contacto con ALBAR Abogados.",
        "attention": "Aviso legal del sitio",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El sitio presenta información general de ALBAR Abogados y de sus áreas de asesoría. No reemplaza una evaluación individual ni una resolución de la autoridad competente."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Los requisitos, vías y resultados dependen de los hechos y de la normativa aplicable. No se garantizan resultados judiciales, montos de recuperación ni plazos de sentencia."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Enviar un formulario o un correo no confirma una cita ni formaliza por sí solo un encargo profesional. El alcance, las condiciones y los honorarios se acuerdan antes de asumir representación o gestiones."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Responsable del sitio: {{privacy_controller}}. Para consultas sobre el sitio o su información, utiliza {{privacy_email}}."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La fotografía de Claudia que se utilice debe corresponder al material autorizado del estudio. Las imágenes conceptuales no deben atribuirse a clientes, resultados ni integrantes reales del equipo."
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    },
    {
      "key": "guia_cese",
      "kind": "post",
      "path": "/blog/pension-de-alimentos-mayoria-de-edad",
      "parent": null,
      "title": "¿La pensión de alimentos termina al cumplir 18 años?",
      "excerpt": "La mayoría de edad no es una autorización automática para dejar de cumplir una pensión vigente.",
      "template_key": "article",
      "terms": [
        "familia"
      ],
      "relations": [
        "cese",
        "alimentos"
      ],
      "captures": [],
      "strategy": {
        "job": "La mayoría de edad no es una autorización automática para dejar de cumplir una pensión vigente.",
        "attention": "¿La pensión de alimentos termina al cumplir 18 años?",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cumplir 18 años puede traer nuevas preguntas sobre una pensión, pero no permite concluir por sí solo que la obligación haya terminado. Antes de cambiar un pago conviene revisar la resolución vigente y las circunstancias actuales."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "En alimentos a descendientes son relevantes las reglas de 21 años, la continuidad de estudios que puede extenderla hasta los 28 y las excepciones legales. El cese requiere analizar requisitos y antecedentes, no solo una fecha."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Para una evaluación inicial, reúne la regulación vigente y una descripción de la situación de estudios, necesidades y autonomía. No es necesario enviar documentos sensibles por el formulario público."
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "¿Necesitas revisar si corresponde solicitar el cese?",
            "body": "Podemos evaluar los antecedentes y la vía que corresponda sin alterar una obligación por decisión unilateral.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          }
        }
      ]
    },
    {
      "key": "guia_afp",
      "kind": "post",
      "path": "/blog/cobro-alimentos-fondos-afp",
      "parent": null,
      "title": "Cobro de alimentos con fondos AFP: qué conviene revisar primero",
      "excerpt": "La búsqueda de recursos y el pago con cotizaciones obligatorias son mecanismos sujetos a condiciones y resolución judicial.",
      "template_key": "article",
      "terms": [
        "familia"
      ],
      "relations": [
        "deuda",
        "cobro"
      ],
      "captures": [],
      "strategy": {
        "job": "La búsqueda de recursos y el pago con cotizaciones obligatorias son mecanismos sujetos a condiciones y resolución judicial.",
        "attention": "Cobro de alimentos con fondos AFP: qué conviene revisar primero",
        "interest": "Ordenar las preguntas del visitante.",
        "desire": "Entender el siguiente paso.",
        "action": "Solicitar evaluación."
      },
      "blocks": [
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Antes de evaluar una medida de cobro, es necesario revisar la pensión fijada, los pagos y el estado de la liquidación de deuda. Una referencia genérica a “cobrar en la AFP” no distingue todos los requisitos."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La investigación de recursos financieros y el mecanismo extraordinario sobre cotizaciones obligatorias deben diferenciarse. Para este último son relevantes las mensualidades adeudadas y la inexistencia o insuficiencia de otros fondos, además de las demás condiciones legales."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las órdenes se tramitan ante el tribunal; no se trata de un retiro libre solicitado directamente por quien recibe la pensión. La evaluación debe considerar límites, situación de la causa y recursos disponibles."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "No se puede garantizar recuperar la totalidad ni una fecha de pago. Conocer el procedimiento permite formular una solicitud fundada y mantener expectativas realistas."
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "El primer paso es conocer tus opciones",
            "heading": "Ordenemos los antecedentes del cobro.",
            "body": "Revisemos la situación de tu causa y qué medidas pueden corresponder.",
            "actions": [
              {
                "label": "Solicitar evaluación de mi caso",
                "href": "/contacto"
              }
            ]
          }
        },
        {
          "type": "related_content",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "También puede ayudarte",
            "source": "related"
          }
        }
      ]
    }
  ]
}$ALBAR_PAYLOAD$::jsonb);

-- All helpers are session-local, invoker-security, and disappear on disconnect.
create or replace function pg_temp.albar_hash(value jsonb) returns text language sql immutable as $$
 select encode(sha256(convert_to(value::text,'UTF8')),'hex');
$$;
create or replace function pg_temp.albar_content(source jsonb, entries jsonb,terms jsonb,author uuid,assets jsonb,config jsonb)
returns jsonb language plpgsql as $$
declare result jsonb; b jsonb; blocks jsonb:='[]'; a uuid; asset_name text; replacements jsonb; pair record;
begin
 for b in select value from jsonb_array_elements(source->'blocks') loop
  asset_name:=b->>'asset_key';
  b:=(b-'asset_key')||jsonb_build_object('assets','[]'::jsonb);
  if asset_name is not null and nullif(assets->>asset_name,'') is not null then
   a:=(assets->>asset_name)::uuid;
   b:=b||jsonb_build_object('assets',jsonb_build_array(jsonb_build_object('asset_id',a,'slot','image','alt_text',case when asset_name like 'claudia%' then 'Claudia Albiña Aros, abogada y fundadora de ALBAR Abogados.' else 'Recurso autorizado de ALBAR Abogados.' end,'focal_point',jsonb_build_object('x',0.5,'y',0.5))));
  end if;
  blocks:=blocks||jsonb_build_array(b);
 end loop;
 result:=jsonb_build_object('title',source->>'title','excerpt',source->>'excerpt','path',source->>'path',
  'cover_asset_id',case when source->>'template_key' in ('home','service-landing') then assets->>(source#>>'{blocks,0,asset_key}') else null end,'template_key',source->>'template_key','template_version',coalesce((source->>'template_version')::integer,1),
  'seo',jsonb_build_object('title',source->>'title','description',source->>'excerpt','noindex',false),
  'blocks',blocks,'authors',jsonb_build_array(author),
  'terms',coalesce((select jsonb_agg(terms->>value) from jsonb_array_elements_text(coalesce(source->'terms','[]'))),'[]'::jsonb),
  'relations',coalesce((select jsonb_agg(jsonb_build_object('entry_id',entries->>value,'type','related')) from jsonb_array_elements_text(coalesce(source->'relations','[]'))),'[]'::jsonb));
 -- Safe JSON substitutions, never SQL string interpolation or executable HTML.
 replacements:=jsonb_build_object('{{privacy_controller}}',coalesce(nullif(config->>'privacy_controller',''),'[Responsable pendiente de validación]'),
  '{{privacy_email}}',coalesce(config->>'privacy_email','contacto@abogadaclaudia.com'),
  '{{privacy_processors}}',coalesce(nullif(config->>'privacy_processors',''),'[Proveedores, región y encargados pendientes de validación]'),
  '{{whatsapp}}',coalesce(config->>'whatsapp','56946978661'),
  '{{retention_days}}',coalesce(config->>'retention_days','[Plazo pendiente de validación]'));
 for pair in select key,value from jsonb_each_text(replacements) loop
  -- Replacing JSON-encoded strings preserves quotes, newlines and backslashes in config values.
  result:=replace(result::text,pair.key,substring(to_jsonb(pair.value)::text from 2 for length(to_jsonb(pair.value)::text)-2))::jsonb;
 end loop;
 return result;
end;
$$;
create or replace function pg_temp.albar_menu_items(items jsonb,site uuid,menu uuid,entry_ids jsonb,parent uuid default null)
returns void language plpgsql as $$
declare item jsonb; item_id uuid; pos integer:=0;
begin
 for item in select value from jsonb_array_elements(items) loop
  insert into public.menu_items(site_id,menu_id,parent_id,label,position,entry_id,external_url)
  values(site,menu,parent,item->>'label',pos,(entry_ids->>(item->>'entry'))::uuid,item->>'external_url') returning id into item_id;
  if item ? 'children' then perform pg_temp.albar_menu_items(item->'children',site,menu,entry_ids,item_id);end if;
  pos:=pos+1;
 end loop;
end;
$$;
create or replace function pg_temp.albar_menu_snapshot(menu uuid) returns jsonb language sql stable as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'parent_id',parent_id,'label',label,'position',position,'entry_id',entry_id,'external_url',external_url) order by id),'[]') from public.menu_items where menu_id=menu;
$$;

do $ALBAR_IMPORT$
<<albar_seed>>
declare
 cfg jsonb; src jsonb; actor uuid; site uuid; author uuid; tx uuid; entry uuid; menu uuid; admin_user uuid;
 state jsonb:='{}'; e_state jsonb:='{}'; entry_ids jsonb:='{}'; term_ids jsonb:='{}'; node jsonb; item jsonb; v_variant jsonb; variants jsonb;
 snapshot jsonb; expected uuid; revision uuid; previous_published uuid; current_published uuid; archived timestamptz;
 fingerprint text; current_hash text; site_status text; v_revision_state text; old_entry jsonb; known boolean;
 publish boolean; activate boolean; n_created integer:=0; n_saved integer:=0; n_published integer:=0; n_skipped integer:=0;
 row_menu record; old_claims text; old_sub text;
begin
 select config into cfg from albar_seed_config;
 select payload into src from albar_seed_source;
 if to_regprocedure('public.save_content_revision(uuid,uuid,jsonb)') is null or to_regprocedure('public.public_section_available(uuid,text,text)') is null then
  raise exception 'Aplica primero las migraciones de Leyer 001–016';end if;
 select p.id into actor from auth.users u join public.profiles p on p.id=u.id
  where lower(u.email)=lower(nullif(cfg->>'actor_email','')) and p.status='active' and p.is_admin;
 if actor is null then raise exception 'Configura actor_email con una cuenta Auth existente y administrador activo. No se crean cuentas ni accesos administrativos.';end if;
 old_claims:=current_setting('request.jwt.claims',true);old_sub:=current_setting('request.jwt.claim.sub',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
 perform set_config('request.jwt.claim.sub',actor::text,true);
 if not private.is_admin() then raise insufficient_privilege;end if;
 publish:=coalesce((cfg->>'publish')::boolean,false);activate:=coalesce((cfg->>'activate_site')::boolean,false);
 if activate and not publish then raise exception 'activate_site requiere publish=true y las revisiones confirmadas';end if;
 if publish and (cfg->>'legal_review_confirmed' is distinct from 'true' or cfg->>'privacy_review_confirmed' is distinct from 'true'
   or nullif(cfg->>'privacy_controller','') is null or nullif(cfg->>'privacy_processors','') is null
   or coalesce((cfg->>'retention_days')::integer,0) not between 1 and 3650) then
  raise exception 'Antes de publicar confirma revisión jurídica y privacidad, responsable, proveedores/región y plazo efectivo de conservación';end if;
 if coalesce(cfg->>'privacy_email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Correo de privacidad inválido';end if;
 if nullif(cfg->>'whatsapp','') is not null and cfg->>'whatsapp' !~ '^[0-9]{8,15}$' then raise exception 'whatsapp debe contener solo dígitos, incluido el código de país';end if;
 perform pg_advisory_xact_lock(hashtextextended(src->>'seed_key',0));
 -- Private import state is not public presentation metadata and has no Data API grants.
 create table if not exists private.cms_seed_registry(
  seed_key text primary key,
  site_id uuid not null unique references public.sites(id),state jsonb not null default '{}',updated_at timestamptz not null default now());
 alter table private.cms_seed_registry enable row level security;
 revoke all on private.cms_seed_registry from public,anon,authenticated,service_role;
 select id into site from public.sites for update;
 if site is null then raise exception 'Falta la configuración del sitio único. Ejecuta las migraciones.';end if;
 select r.state into state from private.cms_seed_registry r where r.seed_key=src->>'seed_key' and r.site_id=site for update;
 known:=found;
 select s.status into site_status from public.sites s where s.id=site;
 if site_status not in ('draft','active') then raise exception 'El sitio fue retirado: el seed no lo reactiva';end if;
 if known then
  if coalesce(state->'extensions','{}'::jsonb)<>'{}'::jsonb then
   raise exception 'ALBAR ya tiene un complemento editorial. Usa su seed complementario; repetir el inicial restauraría el menú anterior.';
  end if;
 else
  if exists(select 1 from public.content_entries where site_id=site) then
   raise exception 'El sitio ya tiene contenido ajeno al seed. No se sobrescribe automáticamente.';
  end if;
  insert into private.cms_seed_registry(seed_key,site_id) values(src->>'seed_key',site);
  state:='{}';
 end if;
 -- Resolve only public, physically present assets belonging to this exact site.
 for row_menu in select key,value from jsonb_each_text(coalesce(cfg->'assets','{}')) loop
  if row_menu.key not in ('claudia-perfil','claudia-hero','logo') then raise exception 'Clave de recurso no reconocida: %',row_menu.key;end if;
  if not exists(select 1 from public.media_assets m join storage.objects o on o.bucket_id=m.bucket_id and o.name=m.storage_path
    where m.id=row_menu.value::uuid and m.site_id=site and m.bucket_id='cms-public' and m.mime_type='image/webp') then
   raise exception 'El recurso % debe estar optimizado, existir en cms-public y pertenecer a ALBAR',row_menu.key;end if;
 end loop;
 snapshot:=jsonb_strip_nulls(jsonb_build_object('public_name','ALBAR Abogados','description','Asesoría jurídica para personas y empresas, con claridad, estrategia y acompañamiento cercano.',
  'email','contacto@abogadaclaudia.com','phone',cfg->'phone','address',cfg->'address','demo',coalesce((cfg->>'demo')::boolean,false),
  'contact_enabled',coalesce((cfg->>'contact_enabled')::boolean,false),'contact_on_landings',coalesce((cfg->>'contact_enabled')::boolean,false),
  'privacy_path','/privacidad','contact_path','/contacto','blog_path','/blog','team_path','/equipo','services_path','/servicios'));
 if known then
  select pg_temp.albar_hash(jsonb_build_object('settings',s.settings,'domain',s.domain,'name',s.name,'default_locale',s.default_locale)) into current_hash from public.sites s where s.id=site;
  if current_hash is distinct from state->>'site_hash' then raise exception 'Conflicto: la configuración del sitio fue editada fuera del seed' using errcode='40001';end if;
 end if;
 update public.sites set settings=snapshot,domain=nullif(cfg->>'domain',''),name=src->'site'->>'name',default_locale='es-CL' where id=site
  and (settings,domain,name,default_locale) is distinct from (snapshot,nullif(cfg->>'domain',''),src->'site'->>'name','es-CL');
 select pg_temp.albar_hash(jsonb_build_object('settings',s.settings,'domain',s.domain,'name',s.name,'default_locale',s.default_locale)) into current_hash from public.sites s where s.id=site;
 state:=state||jsonb_build_object('site_hash',current_hash);
 author:=nullif(state->>'author_id','')::uuid;
 if author is null then
  if exists(select 1 from public.authors where site_id=site and slug=src->'author'->>'slug') then raise exception 'Autor existente fuera del registro del seed';end if;
  insert into public.authors(site_id,display_name,slug) values(site,src->'author'->>'display_name',src->'author'->>'slug') returning id into author;
 else
  perform 1 from public.authors where id=author and site_id=site for update;
  select pg_temp.albar_hash(to_jsonb(a)-'id'-'site_id') into current_hash from public.authors a where a.id=author and a.site_id=site;
  if current_hash is distinct from state->>'author_hash' then raise exception 'Conflicto: el perfil de Claudia fue editado fuera del seed' using errcode='40001';end if;
 end if;
 update public.authors set display_name=src->'author'->>'display_name',slug=src->'author'->>'slug',biography=src->'author'->>'biography',professional_title=src->'author'->>'professional_title',
  avatar_asset_id=nullif(cfg->'assets'->>'claudia-perfil','')::uuid,is_public=is_public or publish where id=author and site_id=site
  and (display_name,slug,biography,professional_title,avatar_asset_id,is_public) is distinct from
   (src->'author'->>'display_name',src->'author'->>'slug',src->'author'->>'biography',src->'author'->>'professional_title',nullif(cfg->'assets'->>'claudia-perfil','')::uuid,is_public or publish);
 select pg_temp.albar_hash(to_jsonb(a)-'id'-'site_id') into current_hash from public.authors a where a.id=author;
 state:=state||jsonb_build_object('author_id',author,'author_hash',current_hash);
 tx:=nullif(state->>'taxonomy_id','')::uuid;
 if tx is null then
  if exists(select 1 from public.taxonomies where site_id=site and code='category') then raise exception 'Taxonomía existente fuera del registro del seed';end if;
  insert into public.taxonomies(site_id,code,name) values(site,'category','Áreas de práctica') returning id into tx;
  state:=state||jsonb_build_object('taxonomy_id',tx);
 elsif not exists(select 1 from public.taxonomies where id=tx and site_id=site and code='category' and name='Áreas de práctica') then raise exception 'Conflicto: taxonomía editada fuera del seed';end if;
 for node in select value from jsonb_array_elements(src->'terms') loop
  entry:=nullif(state->'terms'->>(node->>'key'),'')::uuid;
  if entry is null then
   insert into public.terms(site_id,taxonomy_id,name,slug) values(site,tx,node->>'name',node->>'slug') returning id into entry;
  elsif not exists(select 1 from public.terms where id=entry and site_id=site and taxonomy_id=tx and name=node->>'name' and slug=node->>'slug') then raise exception 'Conflicto: término editado fuera del seed';end if;
  term_ids:=term_ids||jsonb_build_object(node->>'key',entry);
 end loop;
 state:=state||jsonb_build_object('terms',term_ids);
 e_state:=coalesce(state->'entries','{}');
 -- Create all stable identities before resolving parents, relations and menus.
 for node in select value from jsonb_array_elements(src->'entries') loop
  entry:=nullif(e_state->(node->>'key')->>'id','')::uuid;
  if entry is null then
   if exists(select 1 from public.content_revisions where site_id=site and path=node->>'path') then raise exception 'Ruta editorial existente fuera del seed: %',node->>'path';end if;
   insert into public.content_entries(site_id,kind,locale,internal_name) values(site,node->>'kind','es-CL','ALBAR · '||(node->>'title')) returning id into entry;
   e_state:=e_state||jsonb_build_object(node->>'key',jsonb_build_object('id',entry));n_created:=n_created+1;
  end if;
  entry_ids:=entry_ids||jsonb_build_object(node->>'key',entry);
 end loop;
 for node in select value from jsonb_array_elements(src->'entries') loop
  entry:=(entry_ids->>(node->>'key'))::uuid;old_entry:=e_state->(node->>'key');
  perform 1 from public.content_entries where id=entry and site_id=site for update;
  if not exists(select 1 from public.content_entries where id=entry and site_id=site and kind=node->>'kind' and locale='es-CL') then raise exception 'Identidad editorial inválida: %',node->>'key';end if;
 select r.id,r.editorial_state into expected,v_revision_state from public.content_revisions r where r.entry_id=entry order by r.revision_number desc limit 1;
  select e.published_revision_id,e.archived_at into current_published,archived from public.content_entries e where e.id=entry;
  if archived is not null then raise exception 'El contenido fue archivado: el seed no lo recupera: %',node->>'key';end if;
  if expected is distinct from nullif(old_entry->>'last_revision_id','')::uuid or current_published is distinct from nullif(old_entry->>'published_revision_id','')::uuid then
   raise exception 'Conflicto editorial en %. Se conserva el trabajo ajeno y se revierte toda la importación.',node->>'key' using errcode='40001';end if;
  if old_entry ? 'editorial_state' and v_revision_state is distinct from old_entry->>'editorial_state' then
   raise exception 'Conflicto editorial: el estado de revisión cambió en %',node->>'key' using errcode='40001';end if;
  if exists(select 1 from public.scheduled_publications where entry_id=entry and status='pending') then
   raise exception 'Hay una publicación programada en %; el seed no altera su programación',node->>'key' using errcode='40001';end if;
  if old_entry ? 'identity_hash' and (select pg_temp.albar_hash(jsonb_build_object('internal_name',internal_name,'parent_id',parent_id)) from public.content_entries where id=entry) is distinct from old_entry->>'identity_hash' then
   raise exception 'Conflicto en la jerarquía/nombre interno de %',node->>'key' using errcode='40001';end if;
  update public.content_entries set parent_id=(entry_ids->>(node->>'parent'))::uuid,internal_name='ALBAR · '||(node->>'title') where id=entry
   and (parent_id,internal_name) is distinct from ((entry_ids->>(node->>'parent'))::uuid,'ALBAR · '||(node->>'title'));
  snapshot:=pg_temp.albar_content(node,entry_ids,term_ids,author,coalesce(cfg->'assets','{}'),cfg);
  fingerprint:=pg_temp.albar_hash(jsonb_build_object('snapshot',snapshot,'variants',node->'variants'));
  if expected is null or fingerprint is distinct from old_entry->>'fingerprint' then
   variants:='[]';
   for v_variant in select value from jsonb_array_elements(coalesce(node->'variants','[]')) loop
    revision:=public.save_content_revision(entry,expected,pg_temp.albar_content(node||v_variant,entry_ids,term_ids,author,coalesce(cfg->'assets','{}'),cfg));
    expected:=revision;variants:=variants||jsonb_build_array(jsonb_build_object('key',v_variant->>'key','capture',v_variant->'capture','revision_id',revision));n_saved:=n_saved+1;
   end loop;
   revision:=public.save_content_revision(entry,expected,snapshot);expected:=revision;
   perform public.set_revision_state(revision,'in_review');n_saved:=n_saved+1;
   old_entry:=old_entry||jsonb_build_object('variants',variants);
  else n_skipped:=n_skipped+1;end if;
  if publish and current_published is distinct from expected then
   if snapshot::text ~ '\[Responsable pendiente|\[Proveedores|\[Plazo pendiente|\{\{' then raise exception 'Hay campos sin completar en %',node->>'key';end if;
   if exists(select 1 from public.content_revisions where id=expected and locked_at is null) then perform public.set_revision_state(expected,'approved');end if;
   perform public.publish_content_revision(expected);current_published:=expected;n_published:=n_published+1;
  end if;
  select pg_temp.albar_hash(jsonb_build_object('internal_name',internal_name,'parent_id',parent_id)) into current_hash from public.content_entries where id=entry;
  select editorial_state into v_revision_state from public.content_revisions where id=expected;
  e_state:=e_state||jsonb_build_object(node->>'key',old_entry||jsonb_build_object('last_revision_id',expected,'published_revision_id',current_published,'editorial_state',v_revision_state,'fingerprint',fingerprint,'identity_hash',current_hash));
 end loop;
 state:=state||jsonb_build_object('entries',e_state);
 for node in select value from jsonb_array_elements(src->'menus') loop
  menu:=nullif(state->'menus'->(node->>'code')->>'id','')::uuid;
  if menu is null then
   insert into public.menus(site_id,code,name,locale,is_public) values(site,node->>'code',node->>'name','es-CL',publish) returning id into menu;
  else
   perform 1 from public.menus where id=menu and site_id=site for update;
   perform 1 from public.menu_items where menu_id=menu order by id for update;
   select pg_temp.albar_hash(jsonb_build_object('items',pg_temp.albar_menu_snapshot(menu),'menu',(select to_jsonb(m)-'id'-'site_id' from public.menus m where m.id=menu and m.site_id=site))) into current_hash;
   if current_hash is distinct from state->'menus'->(node->>'code')->>'hash' then raise exception 'Conflicto: menú % editado fuera del seed',node->>'code' using errcode='40001';end if;
  end if;
  item:=node->'items';
  if node->>'code'='primary' and nullif(cfg->>'whatsapp','') is not null then item:=item||jsonb_build_array(jsonb_build_object('label','WhatsApp','external_url','https://wa.me/'||(cfg->>'whatsapp')));end if;
  fingerprint:=pg_temp.albar_hash(item);
  if fingerprint is distinct from state->'menus'->(node->>'code')->>'source_hash' then
   -- Delete descendants first, preserving restrictive hierarchy FKs and all other menus.
   for row_menu in with recursive tree as(select id,0 as depth from public.menu_items where menu_id=menu and parent_id is null union all select m.id,t.depth+1 from public.menu_items m join tree t on m.parent_id=t.id where m.menu_id=menu) select id from tree order by depth desc loop
    delete from public.menu_items where id=row_menu.id and menu_id=menu;
   end loop;
   perform pg_temp.albar_menu_items(item,site,menu,entry_ids);
  end if;
  update public.menus set is_public=true where id=menu and publish and not is_public;
  select pg_temp.albar_hash(jsonb_build_object('items',pg_temp.albar_menu_snapshot(menu),'menu',(select to_jsonb(m)-'id'-'site_id' from public.menus m where m.id=menu))) into current_hash;
  state:=jsonb_set(state,'{menus}',coalesce(state->'menus','{}')||jsonb_build_object(node->>'code',jsonb_build_object('id',menu,'hash',current_hash,'source_hash',fingerprint)));
 end loop;
 for node in select value from jsonb_array_elements(src->'redirects') loop
  entry:=(entry_ids->>(node->>'entry'))::uuid;
  if exists(select 1 from public.redirects where site_id=site and locale='es-CL' and from_path=node->>'from' and (target_entry_id<>entry or status_code<>301)) then raise exception 'Redirección existente incompatible: %',node->>'from';end if;
  if not exists(select 1 from public.redirects where site_id=site and locale='es-CL' and from_path=node->>'from') then
   perform public.manage_cms_redirect(site,null,'es-CL',node->>'from',entry,301);
  end if;
 end loop;
 if nullif(cfg->>'admin_email','') is not null then
  select p.id into admin_user from auth.users u join public.profiles p on p.id=u.id where lower(u.email)=lower(cfg->>'admin_email') and p.status='active';
  if admin_user is null then raise exception 'admin_email debe ser una cuenta Auth existente y activa. Invítala mediante Auth, no insertando auth.users por SQL.';end if;
  update public.profiles set is_admin=true where id=admin_user;
 end if;
 if activate then update public.sites set status='active' where id=site and status<>'active';end if;
 update private.cms_seed_registry r set state=albar_seed.state,updated_at=now() where r.seed_key=src->>'seed_key';
 perform set_config('request.jwt.claims',coalesce(old_claims,''),true);perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);
 raise notice 'ALBAR: sitio %, contenidos nuevos %, revisiones nuevas %, publicados %, sin nueva revisión %',site,n_created,n_saved,n_published,n_skipped;
end;
$ALBAR_IMPORT$;
select r.site_id,s.status,
 (select count(*) from public.content_entries e where e.site_id=s.id) as contents,
 (select count(*) from public.content_entries e where e.site_id=s.id and e.published_revision_id is not null) as published
from private.cms_seed_registry r join public.sites s on s.id=r.site_id
where r.seed_key='albar-abogados-editorial-v1';
commit;
