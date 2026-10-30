-- Complemento editorial ALBAR: ejecutar DESPUÉS de ../seed.sql.
-- SQL autocontenido; no crea cuentas ni modifica configuración del sitio.
begin;
create temporary table albar_complement_config(config jsonb) on commit drop;
insert into albar_complement_config values (
 $ALBAR_COMPLEMENT_CONFIG${"actor_email":"","publish":false,"content_review_confirmed":false}$ALBAR_COMPLEMENT_CONFIG$::jsonb
 || coalesce(nullif(current_setting('leyer.albar_complement_config',true),'')::jsonb,'{}'::jsonb)
);
create temporary table albar_complement_source(payload jsonb) on commit drop;
insert into albar_complement_source values ($ALBAR_COMPLEMENT${
  "extension_key": "original-web-v1",
  "base_seed_key": "albar-abogados-editorial-v1",
  "captured_at": "2026-10-22T18:03:09.231787+00:00",
  "author": {
    "slug": "jorge",
    "display_name": "Jorge",
    "biography": "",
    "professional_title": ""
  },
  "terms": [
    {
      "key": "laboral",
      "name": "Derecho laboral",
      "slug": "derecho-laboral"
    },
    {
      "key": "civil",
      "name": "Derecho civil y escrituras",
      "slug": "derecho-civil"
    },
    {
      "key": "corporativo",
      "name": "Derecho corporativo y comercial",
      "slug": "derecho-corporativo-y-comercial"
    },
    {
      "key": "propiedad",
      "name": "Propiedad intelectual",
      "slug": "propiedad-intelectual"
    },
    {
      "key": "contratacion",
      "name": "Contratación pública",
      "slug": "contratacion-publica"
    }
  ],
  "entries": [
    {
      "key": "compensacion",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/compensacion-economica",
      "parent": "familia",
      "title": "Asesoría legal para solicitar una compensación económica",
      "label": "Compensación económica",
      "excerpt": "Si durante el matrimonio dejaste de trabajar, trabajaste en menor medida o postergaste tu desarrollo profesional para dedicarte al cuidado de tus hijos o del hogar, puedes tener derecho a solicitar una compensación económica al momento del divorcio.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/personas/derecho-de-familia/compensacion-economica",
      "source_html_sha256": "e8c1f34045738d51aae15ee933a90c6139cc355c4b8dd6db9362a202356b7d40",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Compensación Económica",
            "heading": "Asesoría legal para solicitar una compensación económica",
            "body": "Si durante el matrimonio dejaste de trabajar, trabajaste en menor medida o postergaste tu desarrollo profesional para dedicarte al cuidado de tus hijos o del hogar, puedes tener derecho a solicitar una compensación económica al momento del divorcio.\n\nRecibirás asesoría para evaluar tu situación, determinar el menoscabo económico y solicitar la compensación que corresponda según las circunstancias de tu caso.",
            "actions": [
              {
                "label": "Evaluar mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "El término del matrimonio también puede tener consecuencias económicas"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Durante un matrimonio, es común que uno de los cónyuges asuma una mayor responsabilidad en el cuidado de los hijos o del hogar, dejando de trabajar o reduciendo sus posibilidades de desarrollo laboral y profesional."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Al momento del divorcio, esta situación puede haber generado un desequilibrio económico que debe ser evaluado. La compensación económica busca reconocer el menoscabo sufrido por quien no pudo desarrollar una actividad remunerada, o lo hizo en menor medida de lo que podía y quería, debido a su dedicación a la familia."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada situación requiere un análisis particular para determinar si se cumplen los requisitos y cuál es la mejor forma de solicitarla."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Qué es la compensación económica?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La compensación económica es un derecho que puede solicitar uno de los cónyuges cuando, como consecuencia de haberse dedicado al cuidado de los hijos o a las labores propias del hogar común, no pudo desarrollar una actividad remunerada o lucrativa durante el matrimonio, o lo hizo en menor medida de lo que podía y quería."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Su finalidad es compensar el menoscabo económico que esta situación pudo generar y que se manifiesta con ocasión del divorcio."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Para determinar si corresponde y establecer su cuantía, es necesario analizar las circunstancias particulares del matrimonio y la situación económica de ambos cónyuges."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Qué se considera para determinar la compensación económica?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Dedicación al cuidado de los hijos y del hogar"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Se analiza el tiempo y las responsabilidades asumidas durante el matrimonio en relación con el cuidado de los hijos y las labores del hogar, especialmente cuando estas circunstancias limitaron las posibilidades de trabajar o desarrollarse profesionalmente."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Situación laboral y desarrollo profesional"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "También se considera cómo la dedicación a la familia pudo afectar la trayectoria laboral, las oportunidades profesionales o la capacidad de generar ingresos de quien solicita la compensación."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Situación económica de los cónyuges"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Para determinar la existencia del menoscabo económico y la compensación que eventualmente corresponda, deben evaluarse distintos antecedentes personales, patrimoniales y económicos de ambos cónyuges."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Cuándo se solicita la compensación económica?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La compensación económica se encuentra directamente relacionada con el término del matrimonio y debe solicitarse dentro del proceso correspondiente."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por esta razón, es importante evaluar su procedencia antes o durante la tramitación del divorcio, reuniendo los antecedentes necesarios para acreditar las circunstancias que dieron origen al menoscabo económico."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Contar con asesoría jurídica desde el inicio permite analizar tu situación, determinar si puedes solicitar una compensación económica y preparar adecuadamente su reclamación."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "assets": [],
          "data": {
            "eyebrow": "Conversemos sobre tu caso",
            "heading": "Demos el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver y revisemos cómo podemos ayudarte.",
            "actions": [
              {
                "label": "Evaluar mi caso",
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
          }
        }
      ],
      "template_version": 2
    },
    {
      "key": "cuidado",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/cuidado-personal",
      "parent": "familia",
      "title": "Asesoría legal para establecer o modificar el cuidado personal de tus hijos",
      "label": "Cuidado personal",
      "excerpt": "El bienestar de tus hijos e hijas es lo más importante. Si necesitas establecer quién ejercerá su cuidado personal o solicitar una modificación, recibirás asesoría y representación para proteger sus intereses y tus derechos durante todo el proceso.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/personas/derecho-de-familia/cuidado-personal",
      "source_html_sha256": "e77da378abe2484bf668587b677a27e8d9655eb98edff932c3c4b1a213c6db0f",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Cuidado Personal",
            "heading": "Asesoría legal para establecer o modificar el cuidado personal de tus hijos",
            "body": "El bienestar de tus hijos e hijas es lo más importante. Si necesitas establecer quién ejercerá su cuidado personal o solicitar una modificación, recibirás asesoría y representación para proteger sus intereses y tus derechos durante todo el proceso.",
            "actions": [
              {
                "label": "Evaluar mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Decisiones importantes para el bienestar de tus hijos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando los padres no viven juntos, determinar quién ejercerá el cuidado personal de los hijos es una decisión fundamental para su vida cotidiana, estabilidad y desarrollo."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada familia tiene circunstancias diferentes. Por eso, establecer o modificar el cuidado personal requiere analizar la situación de los hijos, las condiciones familiares existentes y los antecedentes particulares de cada progenitor."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Recibirás orientación jurídica para comprender tus alternativas y buscar una solución que proteja principalmente el bienestar e interés de tus hijos e hijas."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Qué es el cuidado personal?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El cuidado personal se refiere a los derechos y deberes relacionados con el cuidado, crianza y educación de los hijos e hijas cuando sus padres se encuentran separados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Dependiendo de las circunstancias familiares, puede ser necesario determinar quién ejercerá este cuidado o modificar una situación previamente establecida cuando hayan cambiado las condiciones que se tuvieron en consideración."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "En cualquier decisión relacionada con el cuidado personal, el interés superior de los niños, niñas y adolescentes constituye un elemento fundamental."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué situaciones puedes necesitar asesoría?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Determinación del cuidado personal"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando los padres se encuentran separados y existe un conflicto respecto de quién ejercerá el cuidado personal de sus hijos, puede ser necesario regular esta situación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos para analizar los antecedentes de tu caso, preparar una estrategia y buscar una solución que resguarde adecuadamente los intereses de tus hijos e hijas."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Modificación del cuidado personal"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las circunstancias familiares pueden cambiar con el tiempo. Cuando existen nuevos antecedentes relevantes para el bienestar de los hijos, puede ser necesario evaluar una modificación del cuidado personal previamente establecido."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada situación debe analizarse individualmente para determinar las alternativas disponibles y los antecedentes necesarios para fundamentar la solicitud."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Acuerdos entre los padres"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "No todos los conflictos relacionados con el cuidado personal necesariamente deben resolverse mediante un juicio."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando las circunstancias lo permiten, es posible buscar acuerdos entre los progenitores que permitan establecer una solución adecuada para los hijos. Recibir asesoría durante este proceso ayuda a comprender sus consecuencias jurídicas y resguardar adecuadamente los derechos de todas las personas involucradas."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Mediación y cuidado personal"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "En materias de cuidado personal, la mediación familiar constituye, por regla general, una instancia previa antes de recurrir al Tribunal de Familia."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una preparación adecuada permite llegar a esta instancia con claridad respecto de tus objetivos, los antecedentes relevantes y las alternativas que pueden discutirse con el otro progenitor."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si no es posible alcanzar un acuerdo mediante mediación o negociación directa, recibirás representación ante el Tribunal de Familia correspondiente, presentando los antecedentes y argumentos necesarios para defender los intereses de tus hijos e hijas y tus derechos."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "assets": [],
          "data": {
            "eyebrow": "Conversemos sobre tu caso",
            "heading": "Demos el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver y revisemos cómo podemos ayudarte.",
            "actions": [
              {
                "label": "Evaluar mi caso",
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
          }
        }
      ],
      "template_version": 2
    },
    {
      "key": "relacion",
      "kind": "landing",
      "path": "/personas/derecho-de-familia/relacion-directa-y-regular",
      "parent": "familia",
      "title": "Asesoría legal para regular el régimen de relación directa y regular con tus hijos",
      "label": "Relación directa y regular",
      "excerpt": "Mantener el vínculo entre padres e hijos es un derecho y un deber. Si tienes dificultades para ver a tus hijos o necesitas establecer o modificar un régimen de relación directa y regular, recibirás asesoría y representación para buscar una solución que proteja su bienestar y permita fortalecer el vínculo familiar.",
      "template_key": "service-landing",
      "terms": [
        "familia"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/personas/derecho-de-familia/relacion-directa-y-regular",
      "source_html_sha256": "33f057094c9e8c909438b6f1f9aca42054f9020ab708f69549c81544d703a3b6",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Relación Directa y Regular",
            "heading": "Asesoría legal para regular el régimen de relación directa y regular con tus hijos",
            "body": "Mantener el vínculo entre padres e hijos es un derecho y un deber. Si tienes dificultades para ver a tus hijos o necesitas establecer o modificar un régimen de relación directa y regular, recibirás asesoría y representación para buscar una solución que proteja su bienestar y permita fortalecer el vínculo familiar.",
            "actions": [
              {
                "label": "Evaluar mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Protege y fortalece el vínculo con tus hijos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando los padres no viven juntos, es importante que los hijos puedan mantener una relación estable y periódica con el padre o madre que no ejerce su cuidado personal, siempre considerando su bienestar e interés superior."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Sin embargo, pueden surgir dificultades para acordar cuándo y cómo se desarrollarán estos encuentros, o conflictos respecto de un régimen que ya se encuentra establecido."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Contar con asesoría jurídica permite conocer tus alternativas, buscar acuerdos y, cuando sea necesario, recurrir al Tribunal de Familia para regular adecuadamente esta relación."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Qué es la relación directa y regular?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La relación directa y regular, conocida comúnmente como régimen de visitas, busca mantener una relación periódica y estable entre los hijos y el padre o madre que no ejerce su cuidado personal."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Este régimen puede establecer la forma y condiciones en que se desarrollará el contacto, considerando las circunstancias particulares de cada familia y procurando siempre proteger el interés superior de los niños, niñas y adolescentes."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada situación es diferente, por lo que el régimen debe ajustarse a las necesidades de los hijos y a las circunstancias familiares existentes."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué situaciones puedes necesitar asesoría?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Establecer un régimen de relación directa y regular"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando no existe un acuerdo respecto de cómo se mantendrá el vínculo entre los hijos y el padre o madre que no ejerce su cuidado personal, puede ser necesario establecer formalmente un régimen de relación directa y regular."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos para evaluar tu situación, preparar los antecedentes necesarios y buscar una solución que permita mantener y fortalecer el vínculo con tus hijos."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Modificar un régimen existente"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las necesidades de los hijos y las circunstancias de los padres pueden cambiar con el tiempo."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando un régimen previamente establecido deja de ajustarse adecuadamente a la realidad familiar, es posible evaluar su modificación para adaptarlo a las nuevas circunstancias, siempre teniendo como consideración principal el bienestar de los hijos."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Incumplimiento del régimen de visitas"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando existe un régimen de relación directa y regular establecido y este no se está respetando, pueden existir alternativas legales para solicitar su cumplimiento."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada situación debe analizarse de manera particular para determinar las acciones que pueden realizarse y proteger adecuadamente el vínculo entre padres e hijos."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Mediación y relación directa y regular"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "En materias de relación directa y regular, la mediación familiar constituye, por regla general, una instancia previa antes de presentar una demanda ante el Tribunal de Familia."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Durante esta etapa se busca que los padres puedan alcanzar un acuerdo respecto de la forma en que se desarrollará el régimen, considerando las necesidades y el bienestar de sus hijos."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si no es posible alcanzar un acuerdo, recibirás representación ante el Tribunal de Familia correspondiente para solicitar que se establezca o modifique un régimen adecuado, mediante argumentos sólidos y una estrategia jurídica adaptada a las circunstancias de tu caso."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "assets": [],
          "data": {
            "eyebrow": "Conversemos sobre tu caso",
            "heading": "Demos el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver y revisemos cómo podemos ayudarte.",
            "actions": [
              {
                "label": "Evaluar mi caso",
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
          }
        }
      ],
      "template_version": 2
    },
    {
      "key": "laboral_personas",
      "kind": "landing",
      "path": "/personas/derecho-laboral",
      "parent": "personas",
      "title": "Asesoría y representación legal para trabajadores",
      "label": "Derecho laboral",
      "excerpt": "Si consideras que tus derechos como trabajador fueron vulnerados, recibirás asesoría para evaluar tu situación y ejercer las acciones legales que correspondan. Te representamos frente a despidos, incumplimientos del empleador, vulneraciones de derechos fundamentales, accidentes laborales y otras situaciones que puedan afectar tus derechos en el trabajo.",
      "template_key": "service-landing",
      "terms": [
        "laboral"
      ],
      "relations": [
        "despido"
      ],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/personas/derecho-laboral",
      "source_html_sha256": "753d2159e159cb4b4e6c4a923491bfa1a62d1696f126ecac252012899ce2fdca",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Derecho Laboral",
            "heading": "Asesoría y representación legal para trabajadores",
            "body": "Si consideras que tus derechos como trabajador fueron vulnerados, recibirás asesoría para evaluar tu situación y ejercer las acciones legales que correspondan. Te representamos frente a despidos, incumplimientos del empleador, vulneraciones de derechos fundamentales, accidentes laborales y otras situaciones que puedan afectar tus derechos en el trabajo.",
            "actions": [
              {
                "label": "Evaluar mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Defiende tus derechos frente a un conflicto laboral"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Los problemas laborales pueden afectar directamente tu estabilidad económica y personal. Un despido, un incumplimiento del empleador, una situación de acoso o un accidente en el trabajo pueden requerir actuar oportunamente para proteger tus derechos."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Contar con asesoría jurídica permite analizar los antecedentes de tu caso, conocer las alternativas disponibles y determinar las acciones que pueden ejercerse de acuerdo con tu situación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada conflicto laboral es diferente, por lo que recibirás orientación personalizada y representación durante el proceso cuando sea necesario."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué materias de Derecho Laboral podemos ayudarte?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Despido injustificado"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si fuiste despedido y consideras que la causal indicada por tu empleador no corresponde o no se encuentra debidamente justificada, es importante revisar los antecedentes y la carta de despido para determinar las acciones que puedes ejercer."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Analizaremos tu situación y, cuando corresponda, ejerceremos las acciones judiciales necesarias para reclamar las indemnizaciones y prestaciones establecidas por la legislación laboral."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Autodespido"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando el empleador incurre en determinados incumplimientos graves de sus obligaciones, el trabajador puede poner término a la relación laboral y posteriormente solicitar judicialmente las indemnizaciones que correspondan."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El autodespido requiere evaluar cuidadosamente los hechos y antecedentes antes de tomar una decisión. Recibirás orientación jurídica para determinar si existen fundamentos para ejercer esta acción y realizar correctamente el procedimiento."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Tutela de Derechos Fundamentales"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Los derechos fundamentales de una persona también deben ser respetados dentro de su lugar de trabajo."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si durante la relación laboral consideras que han sido vulnerados derechos como tu dignidad, privacidad u otros derechos fundamentales protegidos por el ordenamiento jurídico, puede ser posible recurrir al procedimiento de tutela laboral."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos para analizar los hechos, determinar las acciones disponibles y representarte durante el procedimiento correspondiente."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Accidentes del trabajo y enfermedades profesionales"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si sufriste un accidente mientras realizabas tus funciones o desarrollaste una enfermedad relacionada con tu actividad laboral, pueden existir derechos y mecanismos de protección que deben ser evaluados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te acompañamos en las gestiones que correspondan y, cuando sea necesario, en las acciones ante los organismos competentes y Tribunales para buscar la protección y reparación que proceda de acuerdo con las circunstancias de tu caso."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Ley Karin, acoso laboral, acoso sexual y violencia en el trabajo"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La Ley N.º 21.643, conocida como Ley Karin, establece medidas destinadas a prevenir, investigar y sancionar situaciones de acoso laboral, acoso sexual y violencia en el trabajo."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si estás enfrentando alguna de estas situaciones, recibirás orientación para evaluar los hechos y determinar las acciones que puedes realizar, incluyendo las denuncias y procedimientos que correspondan ante la Inspección del Trabajo u otros organismos competentes."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te acompañamos durante el proceso para proteger tus derechos y enfrentar la situación con una estrategia jurídica adecuada."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada conflicto laboral requiere actuar de manera informada"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Frente a un problema laboral, las decisiones que tomes desde el comienzo pueden ser importantes para el desarrollo posterior de tu caso."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Documentos como el contrato de trabajo, liquidaciones de sueldo, comunicaciones con el empleador, carta de despido y otros antecedentes relacionados con la relación laboral pueden ser relevantes al momento de evaluar las acciones disponibles."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por esta razón, antes de tomar decisiones importantes o iniciar un procedimiento, es recomendable analizar los antecedentes y comprender sus posibles consecuencias jurídicas."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Asesoría laboral enfocada en proteger tus derechos como trabajador",
            "body": "Enfrentar un conflicto con tu empleador puede generar incertidumbre respecto de qué hacer, dónde acudir o qué derechos puedes exigir.\n\nNuestro objetivo es ayudarte a comprender tu situación de manera clara, evaluar las alternativas disponibles y representarte cuando sea necesario, buscando una protección efectiva de tus derechos laborales.\n\nSi estás enfrentando un despido, un incumplimiento contractual, una vulneración de tus derechos fundamentales, una situación de acoso o un accidente relacionado con tu trabajo, podemos revisar los antecedentes de tu caso y determinar los pasos a seguir.",
            "actions": [
              {
                "label": "Solicitar asesoría legal",
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
      "key": "civil",
      "kind": "landing",
      "path": "/personas/derecho-civil",
      "parent": "personas",
      "title": "Asesoría legal para proteger tus derechos y tu patrimonio",
      "label": "Derecho civil",
      "excerpt": "Muchas situaciones de la vida cotidiana pueden tener consecuencias jurídicas importantes. Recibir asesoría a tiempo permite proteger tus derechos, evitar conflictos futuros y tomar decisiones con mayor seguridad.",
      "template_key": "service-landing",
      "terms": [
        "civil"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/personas/derecho-civil",
      "source_html_sha256": "3988e7b7081d873eb67e09cf57b031ebeb95a608cd4d6a48bce5912995a5c5aa",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Derecho Civil",
            "heading": "Asesoría legal para proteger tus derechos y tu patrimonio",
            "body": "Muchas situaciones de la vida cotidiana pueden tener consecuencias jurídicas importantes. Recibir asesoría a tiempo permite proteger tus derechos, evitar conflictos futuros y tomar decisiones con mayor seguridad.\n\nTe acompañamos en distintas materias de Derecho Civil, entregándote orientación clara y representación jurídica cuando sea necesario.",
            "actions": [
              {
                "label": "Evaluar mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Soluciones jurídicas para situaciones que pueden afectar tu vida y tu patrimonio"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El Derecho Civil regula una gran cantidad de situaciones que forman parte de la vida cotidiana, desde conflictos patrimoniales y herencias hasta contratos, inmuebles, accidentes y modificaciones relacionadas con la identidad de una persona."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada caso requiere revisar cuidadosamente sus antecedentes y determinar cuál es la alternativa jurídica más adecuada."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Recibirás asesoría personalizada para comprender tu situación, conocer las opciones disponibles y avanzar con una estrategia clara y segura."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué materias de Derecho Civil podemos ayudarte?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Cambio de Nombre"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si tu nombre no te representa o te genera dificultades en tu vida cotidiana, puede ser posible solicitar su modificación mediante el procedimiento que corresponda."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos para evaluar tu situación, determinar la vía adecuada y preparar los antecedentes necesarios para realizar el cambio con respaldo jurídico."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Posesión Efectiva Judicial y Administrativa"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Tras el fallecimiento de una persona, sus herederos deben realizar los trámites necesarios para acceder legalmente a los bienes que forman parte de la herencia."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te acompañamos en la tramitación de la posesión efectiva, ya sea ante el Registro Civil o ante los Tribunales correspondientes, según las características de la sucesión."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El objetivo es que el proceso pueda desarrollarse de manera ordenada y que los herederos puedan regularizar correctamente su situación respecto de los bienes heredados."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Accidentes de Tránsito y Querella Infraccional"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si sufriste un accidente de tránsito causado por la imprudencia o negligencia de otro conductor, puede ser necesario ejercer acciones ante el Juzgado de Policía Local para determinar responsabilidades."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos y representamos durante el procedimiento, evaluando los antecedentes del accidente y las acciones que puedan corresponder para buscar la reparación de los daños ocasionados."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Prescripción Adquisitiva de Inmuebles"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando una persona ha poseído un inmueble durante un período prolongado y bajo determinadas condiciones, puede ser necesario evaluar si existen antecedentes que permitan solicitar judicialmente su adquisición por prescripción."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La procedencia de una prescripción adquisitiva ordinaria o extraordinaria depende de las circunstancias particulares de cada caso."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Analizamos tus antecedentes y, cuando corresponda, te representamos en el proceso judicial destinado a regularizar la situación jurídica del inmueble."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Indemnización de Perjuicios"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando una persona o entidad causa un daño a otra, puede existir la posibilidad de exigir una indemnización por los perjuicios ocasionados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Estos daños pueden tener consecuencias patrimoniales, físicas o morales y deben ser analizados de acuerdo con las circunstancias que dieron origen al conflicto."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos para determinar las responsabilidades existentes, evaluar los antecedentes disponibles y ejercer las acciones legales que correspondan para buscar una reparación adecuada."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Estudio de Títulos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Antes de comprar o invertir en un inmueble, es importante conocer su situación jurídica y verificar que los antecedentes de la propiedad se encuentren correctamente regularizados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Un estudio de títulos permite revisar el historial jurídico del inmueble y detectar posibles gravámenes, hipotecas, prohibiciones, litigios u otras circunstancias que puedan afectar una futura compraventa."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Realizamos una revisión detallada de los antecedentes para que puedas tomar una decisión informada y reducir riesgos antes de concretar tu inversión."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Contratos de Arriendo"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Un contrato de arriendo correctamente redactado permite establecer desde el comienzo los derechos y obligaciones tanto del arrendador como del arrendatario."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la elaboración y revisión de contratos de arrendamiento, procurando que sus condiciones sean claras y que los intereses de las partes queden adecuadamente resguardados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una buena regulación contractual puede ayudar a prevenir conflictos relacionados con pagos, uso del inmueble, garantías, duración del contrato y otras obligaciones derivadas del arrendamiento."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "La prevención jurídica también protege tu patrimonio"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "No todos los problemas civiles comienzan con un juicio. En muchas situaciones, revisar correctamente un contrato, estudiar los antecedentes de un inmueble o recibir orientación antes de tomar una decisión puede evitar conflictos posteriores."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por esta razón, la asesoría jurídica preventiva puede ser tan importante como la representación ante un Tribunal."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Analizar los antecedentes desde el inicio permite detectar riesgos, comprender las consecuencias jurídicas de cada alternativa y tomar decisiones con mayor seguridad."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Asesoría jurídica adaptada a cada situación",
            "body": "Los conflictos civiles pueden involucrar aspectos personales, familiares y patrimoniales importantes.\n\nNuestro trabajo es ayudarte a comprender tu situación, explicarte las alternativas disponibles y acompañarte durante las gestiones o procedimientos que sean necesarios.\n\nSi necesitas realizar un trámite, resolver un conflicto, proteger tu patrimonio o evaluar una posible acción judicial, podemos revisar los antecedentes de tu caso y determinar los pasos a seguir.",
            "actions": [
              {
                "label": "Solicitar asesoría",
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
      "key": "escrituras",
      "kind": "landing",
      "path": "/personas/escrituras-publicas",
      "parent": "personas",
      "title": "Asesoría y redacción de escrituras públicas",
      "label": "Escrituras públicas",
      "excerpt": "Algunos de los actos jurídicos más importantes de tu vida requieren documentos correctamente redactados y formalizados. Te asesoramos en la preparación y revisión de escrituras e instrumentos jurídicos, procurando que cada acuerdo resguarde adecuadamente tus intereses y te entregue la seguridad jurídica que necesitas.",
      "template_key": "service-landing",
      "terms": [
        "civil"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/personas/escrituras-publicas",
      "source_html_sha256": "1588bf807981b5b578ff45ac946c2a07fa3bcb30c7b33e24da092d498290487d",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Escrituras Públicas",
            "heading": "Asesoría y redacción de escrituras públicas",
            "body": "Algunos de los actos jurídicos más importantes de tu vida requieren documentos correctamente redactados y formalizados. Te asesoramos en la preparación y revisión de escrituras e instrumentos jurídicos, procurando que cada acuerdo resguarde adecuadamente tus intereses y te entregue la seguridad jurídica que necesitas.",
            "actions": [
              {
                "label": "Evaluar mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Seguridad jurídica para decisiones importantes"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La compra de una propiedad, la modificación de un régimen matrimonial, la división de bienes o la transferencia de determinados derechos son decisiones que pueden producir importantes consecuencias jurídicas y patrimoniales."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una correcta redacción permite establecer con claridad los acuerdos alcanzados, prevenir futuros conflictos y asegurar que cada acto cumpla con las formalidades que correspondan."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos desde la revisión de los antecedentes hasta la preparación del documento necesario, explicándote sus efectos jurídicos antes de su formalización."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué materias podemos ayudarte?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Compraventa de Inmuebles"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La compraventa de una propiedad es una de las decisiones patrimoniales más importantes que puede realizar una persona."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la preparación y redacción de la escritura de compraventa, revisando los antecedentes necesarios para que las condiciones de la operación queden claramente establecidas y tus intereses adecuadamente protegidos."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El objetivo es que puedas avanzar en la compraventa con claridad respecto de las obligaciones asumidas y las consecuencias jurídicas de la operación."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Promesa de Compraventa"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando una compraventa todavía no puede concretarse, un contrato de promesa permite establecer previamente las condiciones bajo las cuales las partes se obligarán a celebrar el contrato definitivo."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en su elaboración y revisión, procurando establecer de forma clara aspectos como las condiciones de la futura compraventa, los plazos, las obligaciones asumidas y las consecuencias de un eventual incumplimiento."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una promesa correctamente redactada permite reducir riesgos y entregar mayor seguridad a las partes antes de celebrar la compraventa definitiva."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Liquidación de Sociedad Conyugal"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando termina una sociedad conyugal, puede ser necesario determinar, distribuir y adjudicar los bienes que forman parte del patrimonio correspondiente."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos durante el proceso de liquidación y en la preparación de los instrumentos necesarios para formalizar los acuerdos alcanzados, procurando que la distribución quede correctamente establecida."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada situación patrimonial es diferente, por lo que es importante revisar previamente los bienes, antecedentes y acuerdos existentes entre las partes."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Separación de Bienes"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si necesitas modificar el régimen patrimonial de tu matrimonio y optar por una separación de bienes, es importante comprender previamente las consecuencias jurídicas que esta decisión puede producir."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos respecto de sus efectos y te acompañamos en la preparación y formalización de los instrumentos necesarios para realizar el cambio de régimen cuando corresponda."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Renuncia de Gananciales"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "En determinadas circunstancias relacionadas con la sociedad conyugal, puede ser necesario evaluar la renuncia a los gananciales y las consecuencias patrimoniales que esta decisión implica."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Antes de realizarla, es importante conocer sus efectos y analizar los antecedentes particulares de la situación patrimonial."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos para evaluar tu caso y preparar los instrumentos necesarios para formalizar la renuncia cuando corresponda."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Compensación Económica"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando existe un acuerdo entre las partes respecto de una compensación económica asociada al término del matrimonio, puede ser necesario formalizarlo jurídicamente."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la redacción del instrumento correspondiente, procurando que los términos del acuerdo queden establecidos con claridad y se cumplan las formalidades legales necesarias."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si todavía no existe un acuerdo o necesitas determinar si tienes derecho a solicitar una compensación económica dentro de un proceso de divorcio, también puedes revisar el servicio de Compensación Económica en Derecho de Familia."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Cesión de Derechos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La cesión de derechos permite transferir determinados derechos de una persona a otra y puede presentarse en distintas situaciones relacionadas con bienes, contratos o herencias."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos para determinar la forma adecuada de realizar la cesión, preparar el instrumento correspondiente y establecer claramente los derechos que se transfieren y las condiciones de la operación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una correcta formalización permite otorgar mayor seguridad jurídica a las partes involucradas."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Transacción"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando existe un conflicto, no siempre es necesario llegar hasta una sentencia judicial para encontrar una solución."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Mediante una transacción, las partes pueden alcanzar un acuerdo destinado a resolver o prevenir una controversia, estableciendo claramente las obligaciones y compromisos asumidos."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la negociación y redacción del acuerdo para que sus términos reflejen correctamente lo convenido y otorguen seguridad jurídica frente a eventuales incumplimientos."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Una correcta redacción puede prevenir futuros conflictos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una escritura o contrato no debe limitarse a formalizar un acuerdo. Su contenido debe reflejar correctamente la voluntad de las partes, establecer con claridad sus obligaciones y considerar las consecuencias jurídicas que pueden producirse posteriormente."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Errores, cláusulas ambiguas o antecedentes que no fueron considerados pueden generar dificultades y conflictos en el futuro."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por esta razón, recibir asesoría antes de firmar permite comprender el alcance del acto que estás realizando y proteger adecuadamente tus intereses."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Asesoría durante todo el proceso",
            "body": "Cada escritura responde a una situación diferente y puede involucrar importantes decisiones personales o patrimoniales.\n\nTe acompañamos desde la revisión inicial de los antecedentes y la elaboración del documento hasta su formalización, cuando corresponda, explicándote de manera clara cada etapa y sus efectos jurídicos.\n\nSi necesitas realizar una compraventa, una promesa, modificar tu régimen matrimonial, ceder derechos o formalizar otro acuerdo, podemos revisar tu situación y determinar el instrumento jurídico adecuado.",
            "actions": [
              {
                "label": "Solicitar asesoría",
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
      "key": "laboral_empresas",
      "kind": "landing",
      "path": "/empresas/derecho-laboral",
      "parent": "empresas",
      "title": "Defensa y asesoría laboral para empresas y empleadores",
      "label": "Derecho laboral",
      "excerpt": "Los conflictos laborales pueden generar importantes consecuencias económicas, operativas y reputacionales para una empresa. Si enfrentas una demanda o denuncia de un trabajador, recibirás asesoría y representación jurídica para evaluar los antecedentes, definir una estrategia y proteger los intereses de tu organización.",
      "template_key": "service-landing",
      "terms": [
        "laboral"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/empresas/derecho-laboral",
      "source_html_sha256": "ef2e21de7efedf53fa205e2a715e88b509dfce0ff169d63fa7c6f57a6b4923f6",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Derecho laboral",
            "heading": "Defensa y asesoría laboral para empresas y empleadores",
            "body": "Los conflictos laborales pueden generar importantes consecuencias económicas, operativas y reputacionales para una empresa. Si enfrentas una demanda o denuncia de un trabajador, recibirás asesoría y representación jurídica para evaluar los antecedentes, definir una estrategia y proteger los intereses de tu organización.",
            "actions": [
              {
                "label": "Evaluar el caso de mi empresa",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Protege a tu empresa frente a conflictos laborales"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una demanda laboral requiere actuar oportunamente, analizar los antecedentes disponibles y preparar una estrategia de defensa adecuada a las circunstancias del caso."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La documentación laboral, las actuaciones realizadas por la empresa, las comunicaciones con el trabajador y el cumplimiento de las obligaciones del empleador pueden resultar determinantes durante un procedimiento."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos y representamos frente a demandas y denuncias laborales, procurando reducir las contingencias legales y proteger los intereses de tu empresa durante todo el proceso."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué materias de Derecho Laboral podemos representar a tu empresa?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Defensa ante demandas por despido injustificado"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si un trabajador demanda a tu empresa argumentando que su despido fue injustificado, indebido o improcedente, es importante revisar cuidadosamente la causal invocada y los antecedentes que respaldaron la decisión."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Analizamos la carta de despido, la documentación laboral y las circunstancias que dieron origen al término de la relación para construir una estrategia de defensa acorde con el caso."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te representamos durante el procedimiento judicial procurando proteger los intereses de tu empresa y reducir las contingencias económicas derivadas de la demanda."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Defensa ante demandas por autodespido"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El autodespido permite que un trabajador ponga término a su contrato cuando atribuye al empleador determinados incumplimientos graves y posteriormente demande las indemnizaciones que correspondan."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si tu empresa enfrenta una demanda de este tipo, es fundamental analizar las imputaciones realizadas por el trabajador y contrastarlas con los antecedentes disponibles."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos y representamos ante el Juzgado del Trabajo, preparando una defensa destinada a controvertir los hechos alegados y resguardar los intereses legítimos de tu empresa."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Defensa ante demandas de tutela de derechos fundamentales"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las demandas por vulneración de derechos fundamentales pueden generar consecuencias económicas y reputacionales importantes para una organización."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando un trabajador sostiene que sus derechos fundamentales fueron vulnerados durante la relación laboral o con ocasión de su término, es necesario revisar detalladamente las actuaciones de la empresa y los antecedentes relacionados con los hechos denunciados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te representamos durante este procedimiento especial, desarrollando una estrategia jurídica basada en los antecedentes disponibles y orientada a proteger los intereses de tu organización."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Defensa ante demandas por accidentes del trabajo y enfermedades profesionales"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando un trabajador inicia acciones contra la empresa a raíz de un accidente del trabajo o una enfermedad de origen laboral, resulta fundamental revisar las circunstancias en que ocurrieron los hechos y las medidas adoptadas por el empleador."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Analizamos los antecedentes del siniestro, la documentación disponible y las medidas de seguridad y prevención implementadas por la empresa para determinar la estrategia de defensa adecuada."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos y representamos durante el procedimiento correspondiente, procurando reducir las contingencias jurídicas derivadas del conflicto."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Ley Karin: acoso laboral, acoso sexual y violencia en el trabajo"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La Ley N.º 21.643, conocida como Ley Karin, establece obligaciones para los empleadores en materia de prevención, investigación y actuación frente al acoso laboral, acoso sexual y violencia en el trabajo."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si tu empresa enfrenta una denuncia, es importante gestionar adecuadamente el procedimiento desde sus primeras etapas y cumplir con las obligaciones que correspondan."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos frente a denuncias realizadas dentro de la organización, investigaciones internas, procedimientos ante la Inspección del Trabajo y eventuales acciones judiciales, procurando reducir riesgos legales y reputacionales para tu empresa."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Una defensa laboral comienza con un análisis adecuado de los antecedentes"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Frente a una demanda o denuncia laboral, cada actuación realizada por la empresa puede tener importancia durante el procedimiento."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Contratos de trabajo, anexos, liquidaciones de remuneraciones, registros, comunicaciones, cartas de despido, protocolos internos y otros documentos pueden resultar relevantes para comprender los hechos y preparar una estrategia de defensa."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por esta razón, analizar tempranamente los antecedentes permite identificar riesgos, evaluar la posición jurídica de la empresa y definir cómo enfrentar el conflicto."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Asesoría y representación durante el conflicto laboral"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una demanda laboral puede afectar tanto económicamente a una empresa como su funcionamiento cotidiano y la relación con sus trabajadores."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Nuestro trabajo es ayudarte a comprender el conflicto, evaluar los riesgos existentes y construir una estrategia jurídica adecuada a las circunstancias de tu organización."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si tu empresa recibió una demanda por despido, autodespido, tutela de derechos fundamentales, accidente laboral o enfrenta una denuncia relacionada con la Ley Karin, podemos revisar los antecedentes y determinar los pasos a seguir."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Solicitar asesoría legal para mi empresa"
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "assets": [],
          "data": {
            "eyebrow": "Conversemos sobre tu caso",
            "heading": "Demos el siguiente paso.",
            "body": "Cuéntanos qué necesitas resolver y revisemos cómo podemos ayudarte.",
            "actions": [
              {
                "label": "Evaluar mi caso",
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
          }
        }
      ],
      "template_version": 2
    },
    {
      "key": "corporativo",
      "kind": "landing",
      "path": "/empresas/derecho-corporativo-y-comercial",
      "parent": "empresas",
      "title": "Asesoría legal para la creación, organización y desarrollo de tu empresa",
      "label": "Derecho corporativo y comercial",
      "excerpt": "Una estructura jurídica sólida permite que tu empresa pueda crecer y tomar decisiones con mayor seguridad. Te asesoramos en la constitución de sociedades, modificaciones societarias, incorporación o salida de socios y otros actos relevantes para la organización de tu negocio.",
      "template_key": "service-landing",
      "terms": [
        "corporativo"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/empresas/derecho-corporativo-y-comercial",
      "source_html_sha256": "0bb95a4b07464c6eb020eb84de14cffcf1f7075194bb5eaab6d2427a2e4933cf",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Derecho corporativo y comercial",
            "heading": "Asesoría legal para la creación, organización y desarrollo de tu empresa",
            "body": "Una estructura jurídica sólida permite que tu empresa pueda crecer y tomar decisiones con mayor seguridad. Te asesoramos en la constitución de sociedades, modificaciones societarias, incorporación o salida de socios y otros actos relevantes para la organización de tu negocio.",
            "actions": [
              {
                "label": "Evaluar el caso de mi empresa",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Una estructura jurídica adecuada para cada etapa de tu empresa"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las necesidades legales de una empresa cambian a medida que el negocio evoluciona. Desde elegir correctamente el tipo de sociedad al comenzar hasta incorporar nuevos socios, modificar el capital o adaptar su estructura a una nueva etapa de crecimiento."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Tomar estas decisiones sin considerar previamente sus efectos jurídicos puede generar conflictos entre socios, dificultades administrativas o problemas que afecten el funcionamiento futuro de la organización."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos para que cada modificación y decisión societaria se realice correctamente y sea coherente con las necesidades y objetivos de tu empresa."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué materias de Derecho Corporativo y Comercial podemos ayudarte?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Constitución de Sociedades y Empresas"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Constituir correctamente una sociedad es uno de los primeros pasos para desarrollar un negocio sobre una estructura jurídica adecuada."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la elección del tipo societario que mejor se adapte a las características y objetivos de tu proyecto, considerando alternativas como SpA, sociedades de responsabilidad limitada (Ltda.) y sociedades anónimas (S.A.), entre otras."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "También te acompañamos en la preparación de los estatutos y demás antecedentes necesarios, procurando que aspectos relevantes de la relación entre los socios y el funcionamiento de la empresa queden correctamente regulados desde el comienzo."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Modificaciones Societarias"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "A medida que una empresa crece o cambia, puede ser necesario modificar distintos aspectos de su estructura jurídica."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cambios en el giro, capital, domicilio, razón social u otras disposiciones societarias deben realizarse y formalizarse correctamente para que produzcan los efectos correspondientes."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la preparación y gestión de estas modificaciones, revisando los antecedentes de la sociedad y procurando que cada cambio se realice con seguridad jurídica."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Ingreso y Salida de Socios"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La incorporación de un nuevo socio o la salida de uno existente puede producir cambios importantes en la estructura y funcionamiento de una empresa."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Estas operaciones pueden involucrar negociaciones, transferencia o valorización de participaciones y modificaciones de los instrumentos societarios."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos durante el proceso para estructurar adecuadamente la operación, preparar la documentación necesaria y procurar que la transición se realice de manera ordenada, reduciendo posibles conflictos y protegiendo los intereses de la empresa y de las partes involucradas."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Transformaciones Societarias"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las necesidades de una empresa pueden hacer conveniente modificar el tipo de sociedad bajo el cual se encuentra organizada."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El crecimiento del negocio, la incorporación de inversionistas o una nueva estructura empresarial pueden hacer necesario evaluar una transformación societaria."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos durante este proceso, revisando las características de la sociedad actual y gestionando los actos jurídicos necesarios para realizar la transformación con la rigurosidad que requiere."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Actas de Juntas de Accionistas"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las decisiones adoptadas por los accionistas deben quedar correctamente documentadas y cumplir con las formalidades que correspondan."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la preparación y redacción de actas de juntas ordinarias y extraordinarias de accionistas, procurando que los acuerdos adoptados queden claramente establecidos y correctamente formalizados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando corresponda realizar actuaciones adicionales derivadas de estos acuerdos, te acompañamos también durante su formalización."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Una correcta estructura societaria ayuda a prevenir conflictos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las decisiones societarias no deberían evaluarse únicamente desde la perspectiva del trámite que debe realizarse."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La forma en que se regulan las facultades de administración, la participación de los socios, las modificaciones de capital o determinadas decisiones relevantes puede tener consecuencias importantes para el futuro de una empresa."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una adecuada asesoría permite anticipar posibles dificultades y estructurar jurídicamente las decisiones de acuerdo con la realidad y los objetivos del negocio."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Asesoría jurídica para acompañar el crecimiento de tu empresa",
            "body": "Una empresa puede necesitar asesoría jurídica desde su constitución y durante las distintas etapas de su desarrollo.\n\nNuestro trabajo es ayudarte a comprender las implicancias legales de las decisiones societarias, preparar correctamente los instrumentos necesarios y acompañarte en su formalización.\n\nSi necesitas constituir una sociedad, modificar la estructura de una empresa existente, incorporar o retirar socios, realizar una transformación societaria o formalizar decisiones de sus accionistas, podemos revisar las necesidades de tu organización y determinar los pasos a seguir.",
            "actions": [
              {
                "label": "Solicitar asesoría para mi empresa",
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
      "key": "propiedad",
      "kind": "landing",
      "path": "/empresas/propiedad-intelectual",
      "parent": "empresas",
      "title": "Registro y protección de marcas en Chile",
      "label": "Propiedad intelectual",
      "excerpt": "Tu marca representa la identidad de tu empresa y puede convertirse en uno de sus activos más importantes. Te asesoramos durante el proceso de registro de marca ante INAPI, desde la revisión inicial hasta la obtención del registro, para que puedas proteger jurídicamente la identidad de tu negocio.",
      "template_key": "service-landing",
      "terms": [
        "propiedad"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/empresas/propiedad-intelectual",
      "source_html_sha256": "8d50b58f089145e779dc44f2c46a38925af8d22782bc56da0d7f80b571d11228",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Propiedad intelectual",
            "heading": "Registro y protección de marcas en Chile",
            "body": "Tu marca representa la identidad de tu empresa y puede convertirse en uno de sus activos más importantes. Te asesoramos durante el proceso de registro de marca ante INAPI, desde la revisión inicial hasta la obtención del registro, para que puedas proteger jurídicamente la identidad de tu negocio.",
            "actions": [
              {
                "label": "Evaluar mi caso",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Protege la identidad que distingue a tu empresa"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Construir una marca requiere tiempo, inversión y esfuerzo. Su nombre e identidad permiten que clientes y consumidores reconozcan y diferencien tu negocio frente a otras alternativas del mercado."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por esta razón, protegerla jurídicamente es una decisión importante para cualquier empresa que busca desarrollar y consolidar su identidad comercial."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos durante el proceso de registro de tu marca en Chile, revisando los antecedentes y acompañándote en las distintas etapas necesarias para obtener su protección."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Por qué registrar una marca?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El registro de una marca permite obtener protección jurídica sobre los signos registrados para distinguir determinados productos o servicios, de acuerdo con los términos y categorías correspondientes."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Contar con una marca registrada permite fortalecer la protección de la identidad comercial de tu empresa y disponer de herramientas legales frente a determinados usos no autorizados por terceros."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Antes de presentar una solicitud, es importante evaluar correctamente qué se desea proteger y revisar los antecedentes disponibles para reducir posibles dificultades durante su tramitación."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Cómo podemos ayudarte a registrar tu marca?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Búsqueda y revisión de disponibilidad"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Antes de iniciar el registro, es recomendable revisar si existen marcas anteriores que puedan generar dificultades para la solicitud que deseas presentar."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en esta etapa inicial para evaluar los antecedentes disponibles y determinar la estrategia adecuada antes de comenzar la tramitación."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Preparación de la solicitud de registro"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una solicitud de marca debe identificar correctamente aquello que se busca proteger y los productos o servicios para los cuales se solicita el registro."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la preparación y presentación de la solicitud, procurando que sus antecedentes sean consistentes con la actividad y necesidades de tu empresa."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Tramitación ante INAPI"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una vez presentada la solicitud, comienza su tramitación ante el Instituto Nacional de Propiedad Industrial (INAPI)."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te acompañamos durante las distintas etapas del procedimiento y en las gestiones jurídicas que puedan ser necesarias hasta su resolución."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Obtención y protección de tu marca"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una vez completado favorablemente el procedimiento correspondiente, tu empresa podrá contar con una marca registrada para los productos o servicios comprendidos en su registro."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El objetivo es que la identidad comercial que has construido cuente con protección jurídica y puedas desarrollar tu negocio con mayor seguridad frente al uso de tu marca por terceros."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Registrar una marca es proteger un activo de tu empresa"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una marca puede adquirir cada vez más valor a medida que un negocio crece, obtiene clientes y desarrolla una reputación en el mercado."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por eso, esperar hasta que aparezca un conflicto para preocuparse por su protección puede generar dificultades que podrían haberse prevenido."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Evaluar el registro desde las primeras etapas de un proyecto permite incorporar la protección de la marca dentro del desarrollo y crecimiento de la empresa."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Asesoría durante todo el proceso de registro",
            "body": "Registrar una marca implica más que presentar una solicitud. Es importante evaluar previamente los antecedentes, determinar correctamente qué se busca proteger y realizar un seguimiento adecuado durante su tramitación.\n\nNuestro trabajo es acompañarte durante este proceso, explicarte cada etapa y realizar las gestiones necesarias para buscar la protección jurídica de la identidad comercial de tu negocio.\n\nSi tienes una empresa, estás desarrollando un nuevo proyecto o ya utilizas una marca que todavía no has registrado, podemos revisar tu situación y evaluar los pasos necesarios para iniciar su protección en Chile.",
            "actions": [
              {
                "label": "Solicitar asesoría para registrar mi marca",
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
      "key": "contratacion",
      "kind": "landing",
      "path": "/empresas/contratacion-publica",
      "parent": "empresas",
      "title": "Asesoría legal para empresas en licitaciones y contratación pública",
      "label": "Contratación pública",
      "excerpt": "Participar en procesos de contratación con organismos públicos requiere comprender las bases, cumplir correctamente sus exigencias y actuar oportunamente frente a decisiones que puedan afectar a tu empresa.",
      "template_key": "service-landing",
      "terms": [
        "contratacion"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/empresas/contratacion-publica",
      "source_html_sha256": "497b96ec5c21bbd4e5ecbfce648fbe530268459fe564364866977d648368e7d7",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Contratación publica",
            "heading": "Asesoría legal para empresas en licitaciones y contratación pública",
            "body": "Participar en procesos de contratación con organismos públicos requiere comprender las bases, cumplir correctamente sus exigencias y actuar oportunamente frente a decisiones que puedan afectar a tu empresa.\n\nTe asesoramos durante las distintas etapas de los procesos licitatorios, desde la revisión de antecedentes y ofertas hasta la presentación de recursos e impugnaciones cuando sea necesario.",
            "actions": [
              {
                "label": "Evaluar el caso de mi empresa",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Protege los intereses de tu empresa al contratar con el Estado"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las licitaciones públicas pueden representar importantes oportunidades comerciales para una empresa, pero también involucran procedimientos sujetos a requisitos, plazos y condiciones que deben ser cuidadosamente considerados."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una observación en la oferta, el incumplimiento de las bases o una decisión administrativa que afecte los intereses de tu empresa puede tener consecuencias durante el proceso de contratación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Contar con asesoría jurídica permite evaluar los antecedentes desde el inicio, prevenir errores y determinar las acciones disponibles cuando surgen controversias con un organismo público."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué materias de Contratación Pública podemos ayudarte?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Procesos Licitatorios"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Participar correctamente en una licitación comienza con una adecuada comprensión de las condiciones y exigencias establecidas para el proceso."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la revisión de las bases administrativas y técnicas y en los aspectos jurídicos relacionados con la preparación de la oferta, procurando que la participación de tu empresa se ajuste a los requisitos establecidos."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El objetivo es identificar oportunamente posibles riesgos, reducir errores durante la postulación y entregar mayor seguridad jurídica a tu empresa durante el proceso licitatorio."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Recursos Administrativos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si tu empresa se ha visto afectada por una decisión adoptada por un organismo público dentro de un proceso de licitación, puede ser necesario evaluar los mecanismos administrativos disponibles para controvertirla."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Analizamos los antecedentes de la decisión y el procedimiento para determinar las acciones que correspondan."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando resulte procedente, preparamos e interponemos los recursos administrativos necesarios, desarrollando los argumentos jurídicos y procurando actuar dentro de los plazos establecidos."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Impugnaciones ante el Tribunal de Contratación Pública"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Determinadas actuaciones u omisiones ocurridas durante procedimientos de contratación pública pueden requerir acudir al Tribunal de Contratación Pública para proteger los derechos e intereses de una empresa."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando existen antecedentes que permitan evaluar una impugnación, analizamos el procedimiento y las circunstancias que dieron origen al conflicto para determinar la estrategia jurídica adecuada."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te representamos ante el Tribunal de Contratación Pública durante la tramitación del procedimiento, defendiendo los intereses comerciales de tu empresa con una estrategia basada en los antecedentes del caso."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Asesoría desde la licitación hasta una eventual controversia"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Los conflictos relacionados con contratación pública no necesariamente comienzan después de una adjudicación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una adecuada revisión jurídica desde las primeras etapas de una licitación puede permitir detectar exigencias relevantes, comprender correctamente las bases y prevenir situaciones que posteriormente puedan afectar la participación de la empresa."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cuando el conflicto ya se ha producido, resulta especialmente importante revisar oportunamente los antecedentes y determinar qué mecanismos administrativos o judiciales se encuentran disponibles."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Los plazos pueden ser determinantes"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "En los procedimientos administrativos y en las controversias relacionadas con contratación pública existen actuaciones que deben realizarse dentro de determinados plazos."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por esta razón, si tu empresa considera que una decisión adoptada durante una licitación ha afectado sus derechos o intereses, es importante evaluar los antecedentes oportunamente."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una revisión temprana permite determinar las alternativas disponibles y preparar la estrategia jurídica correspondiente antes de que transcurran los plazos aplicables."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Asesoría jurídica para empresas que contratan con organismos públicos",
            "body": "Participar en procesos de contratación pública puede generar importantes oportunidades para una empresa, pero también exige desenvolverse dentro de procedimientos y reglas específicas.\n\nNuestro trabajo es acompañarte durante este proceso, ayudarte a comprender sus exigencias y defender los intereses de tu empresa cuando surjan controversias.\n\nSi tu organización participa o desea participar en una licitación pública, necesita revisar los antecedentes de una oferta o considera que una decisión de un organismo público la ha perjudicado, podemos analizar el caso y determinar los pasos a seguir.",
            "actions": [
              {
                "label": "Solicitar asesoría para mi empresa",
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
      "key": "preventiva",
      "kind": "landing",
      "path": "/empresas/asesoria-preventiva-empresarial",
      "parent": "empresas",
      "title": "Prevención legal y cumplimiento normativo para empresas",
      "label": "Asesoría preventiva empresarial",
      "excerpt": "La mejor forma de enfrentar muchos conflictos legales es prevenirlos. Te asesoramos para identificar riesgos, fortalecer el cumplimiento normativo de tu empresa y adoptar medidas que permitan reducir contingencias, fiscalizaciones, sanciones y futuros conflictos.",
      "template_key": "service-landing",
      "terms": [
        "corporativo"
      ],
      "relations": [],
      "author": "claudia",
      "published_date": null,
      "source_url": "https://www.albarabogados.cl/empresas/asesoria-preventiva-empresarial",
      "source_html_sha256": "06304303f59868bb366f3faa1f1b3852e71926b90d61327e89780257e5765fab",
      "blocks": [
        {
          "type": "hero",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "eyebrow": "Asesoría preventiva empresarial",
            "heading": "Prevención legal y cumplimiento normativo para empresas",
            "body": "La mejor forma de enfrentar muchos conflictos legales es prevenirlos. Te asesoramos para identificar riesgos, fortalecer el cumplimiento normativo de tu empresa y adoptar medidas que permitan reducir contingencias, fiscalizaciones, sanciones y futuros conflictos.",
            "actions": [
              {
                "label": "Evaluar el caso de mi empresa",
                "href": "/contacto",
                "icon": "arrow-up-right",
                "style": "primary"
              }
            ],
            "note": "El primer paso es contarnos qué necesitas resolver.",
            "note_icon": "message-circle",
            "visual": "image"
          },
          "assets": [],
          "asset_key": "claudia-perfil"
        },
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
                      "text": "Introducción"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Anticiparse a los problemas también es proteger tu empresa"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Muchos conflictos laborales, sanciones y contingencias legales pueden comenzar con situaciones que podrían haberse detectado o gestionado oportunamente."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Contratos desactualizados, protocolos incompletos, prácticas laborales que no se ajustan a la normativa o riesgos legales que no han sido identificados pueden generar consecuencias económicas y operativas para una organización."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La asesoría preventiva permite revisar cómo está funcionando jurídicamente tu empresa, detectar áreas de riesgo y adoptar medidas antes de que estas situaciones se conviertan en conflictos."
                    }
                  ]
                }
              ]
            },
            "layout": "intro",
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
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿En qué materias podemos ayudar a tu empresa?"
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Implementación y Cumplimiento de Ley Karin"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La Ley N.º 21.643, conocida como Ley Karin, establece obligaciones para los empleadores relacionadas con la prevención, investigación y actuación frente al acoso laboral, acoso sexual y violencia en el trabajo."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la revisión, diseño e implementación de protocolos y medidas necesarias para que tu empresa pueda adecuarse a las exigencias aplicables."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El objetivo es fortalecer el cumplimiento de las obligaciones de la organización, prevenir situaciones de acoso y violencia y reducir los riesgos asociados a una gestión inadecuada de estas materias."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Revisión de Contratos y Documentación Laboral"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La documentación laboral constituye una parte fundamental de la relación entre una empresa y sus trabajadores."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Contratos de trabajo, anexos, reglamentos internos, finiquitos y otros documentos deben encontrarse correctamente redactados y ajustados a la normativa aplicable."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Revisamos y actualizamos la documentación laboral de tu empresa para detectar posibles deficiencias, establecer con claridad los derechos y obligaciones de las partes y reducir el riesgo de conflictos futuros."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Cumplimiento Normativo Laboral"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las obligaciones de los empleadores pueden cambiar como consecuencia de modificaciones legales, nuevos criterios y exigencias aplicables a las relaciones laborales."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te acompañamos en la revisión de las prácticas internas de tu empresa para identificar posibles incumplimientos y determinar las medidas necesarias para adecuarlas a la normativa vigente."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una revisión preventiva permite reducir la exposición de la organización frente a fiscalizaciones, multas y demandas laborales."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Capacitación y Asesoría Preventiva para Empleadores"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Prevenir conflictos laborales también requiere que quienes toman decisiones dentro de una empresa conozcan sus responsabilidades y sepan cómo actuar frente a determinadas situaciones."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Realizamos capacitaciones y asesorías dirigidas a empleadores, jefaturas y equipos de Recursos Humanos en materias relacionadas con obligaciones laborales, prevención y manejo de conflictos y buenas prácticas dentro de la organización."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El objetivo es entregar herramientas que permitan tomar mejores decisiones, reducir riesgos y contribuir a una adecuada gestión de las relaciones laborales."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Prevención de Delitos Económicos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Las empresas pueden enfrentar responsabilidades y contingencias derivadas de determinados delitos cometidos en el contexto de sus actividades."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La Ley N.º 20.393 contempla un régimen de responsabilidad penal aplicable a las personas jurídicas y hace especialmente relevante que las organizaciones evalúen sus riesgos y adopten medidas de prevención adecuadas."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Te asesoramos en la revisión e implementación de modelos y medidas de prevención destinados a reducir la exposición de la empresa y de sus directivos frente a estas contingencias."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Gestión de Riesgos Corporativos"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Identificar un riesgo jurídico antes de que se transforme en un conflicto permite a una empresa tomar decisiones con mayor información y anticipación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Realizamos diagnósticos jurídicos destinados a detectar áreas de vulnerabilidad dentro de la organización y evaluar posibles contingencias asociadas a su funcionamiento."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "A partir de este análisis, desarrollamos estrategias preventivas adaptadas a las características, necesidades, industria y tamaño de tu empresa."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "rich_text",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "document": {
              "type": "doc",
              "content": [
                {
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Por qué contar con asesoría legal preventiva?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Buscar asesoría jurídica únicamente cuando aparece una demanda, fiscalización o conflicto puede limitar las alternativas disponibles para una empresa."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La prevención permite revisar anticipadamente aquellas áreas que pueden generar contingencias y corregirlas antes de que produzcan consecuencias mayores."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una estrategia preventiva puede ayudar a tu empresa a mantener su documentación actualizada, fortalecer sus procedimientos internos, cumplir sus obligaciones y tomar decisiones con mayor seguridad jurídica."
                    }
                  ]
                }
              ]
            },
            "layout": "columns",
            "visual": "none"
          },
          "assets": []
        },
        {
          "type": "cta",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Una estrategia preventiva adaptada a tu empresa",
            "body": "No todas las organizaciones enfrentan los mismos riesgos. El tamaño de la empresa, la cantidad de trabajadores, su estructura y la actividad que desarrolla pueden generar necesidades jurídicas diferentes.\n\nPor esta razón, la asesoría preventiva debe comenzar por comprender cómo funciona tu organización e identificar cuáles son sus principales áreas de exposición.\n\nNuestro trabajo es ayudarte a detectar estos riesgos y desarrollar medidas jurídicas que permitan fortalecer el funcionamiento de tu empresa y reducir futuras contingencias.\n\nSi quieres revisar el cumplimiento normativo de tu organización, actualizar documentación laboral, implementar medidas relacionadas con Ley Karin o identificar otros riesgos legales, podemos analizar las necesidades de tu empresa y definir los pasos a seguir.",
            "actions": [
              {
                "label": "Solicitar asesoría para mi empresa",
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
      "key": "despido",
      "kind": "post",
      "path": "/blog/post-de-prueba",
      "parent": "blog",
      "title": "¿Te despidieron injustificadamente? Qué hacer y cuáles son tus derechos como trabajador en Chile",
      "label": "¿Te despidieron injustificadamente? Qué hacer y cuáles son tus derechos como trabajador en Chile",
      "excerpt": "Perder el trabajo puede ser una situación difícil, especialmente cuando consideras que el despido no fue realizado correctamente o que la causa invocada por el empleador no corresponde a la realidad. En estos casos, es importante conocer tus derechos y actuar dentro de los plazos establecidos por la ley.",
      "template_key": "article",
      "terms": [
        "laboral"
      ],
      "relations": [
        "laboral_personas"
      ],
      "author": "jorge",
      "published_date": "2026-07-08",
      "source_url": "https://www.albarabogados.cl/blog/post-de-prueba",
      "source_html_sha256": "148c3c093b1351f6d9e43481cdb3dcd6cdf8a78eae6272cb1fc03c617a0cafe6",
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
                  "type": "heading",
                  "attrs": {
                    "level": 2
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Te despidieron injustificadamente? Qué hacer y cuáles son tus derechos como trabajador en Chile"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Por "
                    },
                    {
                      "type": "text",
                      "text": "Jorge"
                    },
                    {
                      "type": "text",
                      "text": "·"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "8 de julio de 2026"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Perder el trabajo puede ser una situación difícil, especialmente cuando consideras que el despido no fue realizado correctamente o que la causa invocada por el empleador no corresponde a la realidad. En estos casos, es importante conocer tus derechos y actuar dentro de los plazos establecidos por la ley."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Cuándo un despido puede considerarse injustificado?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Un despido puede ser considerado injustificado cuando el empleador pone término a la relación laboral utilizando una causal que no cumple con los requisitos legales, cuando los hechos indicados en la carta de despido no son efectivos o cuando no existe una adecuada fundamentación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "En Chile, el empleador debe entregar una carta de despido donde se indique claramente la causal aplicada y los hechos que la justifican. Esta información es fundamental para determinar si el término del contrato fue realizado conforme a derecho."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "Revisa cuidadosamente tu carta de despido"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Uno de los primeros pasos después de recibir un despido es analizar la carta entregada por el empleador."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Es importante revisar aspectos como:"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "La causal de despido utilizada."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Los hechos señalados por el empleador."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Si la carta fue entregada dentro del plazo correspondiente."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Si las razones indicadas pueden ser acreditadas en un eventual juicio laboral."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una carta de despido con errores, falta de fundamentos o hechos que no pueden ser demostrados puede ser determinante al momento de reclamar ante los Tribunales de Justicia."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Qué puedo reclamar si mi despido fue injustificado?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si un tribunal determina que el despido fue injustificado, el trabajador puede tener derecho a recibir las indemnizaciones que correspondan, dependiendo de cada caso."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Entre ellas pueden encontrarse:"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Indemnización por años de servicio."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Incremento legal sobre la indemnización por años de servicio."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Indemnización sustitutiva del aviso previo, cuando corresponda."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Otras prestaciones laborales adeudadas."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "El monto final dependerá de factores como la antigüedad laboral, remuneración y las circunstancias específicas del término del contrato."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Cuál es el plazo para demandar por despido injustificado?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Una de las situaciones más importantes es no dejar pasar el tiempo. La ley establece un plazo limitado para presentar una demanda laboral, por lo que actuar oportunamente permite preparar una mejor estrategia y reunir los antecedentes necesarios."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Esperar demasiado puede significar perder la posibilidad de ejercer acciones legales."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Necesito un abogado para reclamar un despido injustificado?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Aunque cada trabajador puede evaluar su situación, contar con asesoría jurídica permite analizar correctamente los antecedentes, determinar si existen fundamentos para demandar y enfrentar el proceso con una estrategia adecuada."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Un abogado laboral puede revisar la carta de despido, calcular las indemnizaciones correspondientes y representar tus intereses ante los Tribunales Laborales."
                    }
                  ]
                },
                {
                  "type": "heading",
                  "attrs": {
                    "level": 3
                  },
                  "content": [
                    {
                      "type": "text",
                      "text": "¿Qué hacer si te despidieron?"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Si consideras que tu despido fue injustificado:"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Guarda todos los documentos relacionados con tu relación laboral."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Conserva tu contrato de trabajo, liquidaciones de sueldo y carta de despido."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Evita firmar documentos sin comprender completamente sus efectos."
                    },
                    {
                      "type": "hardBreak"
                    },
                    {
                      "type": "text",
                      "text": "Busca asesoría legal lo antes posible para evaluar tu situación."
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Cada caso laboral tiene circunstancias particulares. Un análisis oportuno puede marcar una diferencia importante en la protección de tus derechos."
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    }
  ],
  "patches": [
    {
      "key": "personas",
      "blocks": [
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Más áreas en las que podemos ayudarte",
            "items": [
              {
                "heading": "Derecho laboral",
                "body": "Si consideras que tus derechos como trabajador fueron vulnerados, recibirás asesoría para evaluar tu situación y ejercer las acciones legales que correspondan. Te representamos frente a despidos, incumplimientos del empleador, vulneraciones de derechos fundamentales, accidentes laborales y otras situaciones que puedan afectar tus derechos en el trabajo.",
                "href": "/personas/derecho-laboral",
                "link_label": "Conocer el servicio"
              },
              {
                "heading": "Derecho civil",
                "body": "Muchas situaciones de la vida cotidiana pueden tener consecuencias jurídicas importantes. Recibir asesoría a tiempo permite proteger tus derechos, evitar conflictos futuros y tomar decisiones con mayor seguridad.",
                "href": "/personas/derecho-civil",
                "link_label": "Conocer el servicio"
              },
              {
                "heading": "Escrituras públicas",
                "body": "Algunos de los actos jurídicos más importantes de tu vida requieren documentos correctamente redactados y formalizados. Te asesoramos en la preparación y revisión de escrituras e instrumentos jurídicos, procurando que cada acuerdo resguarde adecuadamente tus intereses y te entregue la seguridad jurídica que necesitas.",
                "href": "/personas/escrituras-publicas",
                "link_label": "Conocer el servicio"
              }
            ]
          }
        }
      ]
    },
    {
      "key": "empresas",
      "blocks": [
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Más áreas en las que podemos ayudarte",
            "items": [
              {
                "heading": "Derecho laboral",
                "body": "Los conflictos laborales pueden generar importantes consecuencias económicas, operativas y reputacionales para una empresa. Si enfrentas una demanda o denuncia de un trabajador, recibirás asesoría y representación jurídica para evaluar los antecedentes, definir una estrategia y proteger los intereses de tu organización.",
                "href": "/empresas/derecho-laboral",
                "link_label": "Conocer el servicio"
              },
              {
                "heading": "Derecho corporativo y comercial",
                "body": "Una estructura jurídica sólida permite que tu empresa pueda crecer y tomar decisiones con mayor seguridad. Te asesoramos en la constitución de sociedades, modificaciones societarias, incorporación o salida de socios y otros actos relevantes para la organización de tu negocio.",
                "href": "/empresas/derecho-corporativo-y-comercial",
                "link_label": "Conocer el servicio"
              },
              {
                "heading": "Propiedad intelectual",
                "body": "Tu marca representa la identidad de tu empresa y puede convertirse en uno de sus activos más importantes. Te asesoramos durante el proceso de registro de marca ante INAPI, desde la revisión inicial hasta la obtención del registro, para que puedas proteger jurídicamente la identidad de tu negocio.",
                "href": "/empresas/propiedad-intelectual",
                "link_label": "Conocer el servicio"
              },
              {
                "heading": "Contratación pública",
                "body": "Participar en procesos de contratación con organismos públicos requiere comprender las bases, cumplir correctamente sus exigencias y actuar oportunamente frente a decisiones que puedan afectar a tu empresa.",
                "href": "/empresas/contratacion-publica",
                "link_label": "Conocer el servicio"
              },
              {
                "heading": "Asesoría preventiva empresarial",
                "body": "La mejor forma de enfrentar muchos conflictos legales es prevenirlos. Te asesoramos para identificar riesgos, fortalecer el cumplimiento normativo de tu empresa y adoptar medidas que permitan reducir contingencias, fiscalizaciones, sanciones y futuros conflictos.",
                "href": "/empresas/asesoria-preventiva-empresarial",
                "link_label": "Conocer el servicio"
              }
            ]
          }
        }
      ]
    },
    {
      "key": "familia",
      "blocks": [
        {
          "type": "card_grid",
          "schema_version": 1,
          "variant": "default",
          "data": {
            "heading": "Más áreas en las que podemos ayudarte",
            "items": [
              {
                "heading": "Compensación económica",
                "body": "Si durante el matrimonio dejaste de trabajar, trabajaste en menor medida o postergaste tu desarrollo profesional para dedicarte al cuidado de tus hijos o del hogar, puedes tener derecho a solicitar una compensación económica al momento del divorcio.",
                "href": "/personas/derecho-de-familia/compensacion-economica",
                "link_label": "Conocer el servicio"
              },
              {
                "heading": "Cuidado personal",
                "body": "El bienestar de tus hijos e hijas es lo más importante. Si necesitas establecer quién ejercerá su cuidado personal o solicitar una modificación, recibirás asesoría y representación para proteger sus intereses y tus derechos durante todo el proceso.",
                "href": "/personas/derecho-de-familia/cuidado-personal",
                "link_label": "Conocer el servicio"
              },
              {
                "heading": "Relación directa y regular",
                "body": "Mantener el vínculo entre padres e hijos es un derecho y un deber. Si tienes dificultades para ver a tus hijos o necesitas establecer o modificar un régimen de relación directa y regular, recibirás asesoría y representación para buscar una solución que proteja su bienestar y permita fortalecer el vínculo familiar.",
                "href": "/personas/derecho-de-familia/relacion-directa-y-regular",
                "link_label": "Conocer el servicio"
              }
            ]
          }
        }
      ]
    }
  ],
  "menu": {
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
            "entry": "familia",
            "label": "Derecho de familia",
            "children": [
              {
                "entry": "divorcios",
                "label": "Divorcios"
              },
              {
                "entry": "compensacion",
                "label": "Compensación económica"
              },
              {
                "entry": "alimentos",
                "label": "Pensión de alimentos"
              },
              {
                "entry": "cuidado",
                "label": "Cuidado personal"
              },
              {
                "entry": "relacion",
                "label": "Relación directa y regular"
              }
            ]
          },
          {
            "entry": "laboral_personas",
            "label": "Derecho laboral"
          },
          {
            "entry": "liquidacion_persona",
            "label": "Insolvencia y reemprendimiento"
          },
          {
            "entry": "civil",
            "label": "Derecho civil"
          },
          {
            "entry": "escrituras",
            "label": "Escrituras públicas"
          }
        ]
      },
      {
        "label": "Empresas",
        "entry": "empresas",
        "children": [
          {
            "entry": "liquidacion_empresa",
            "label": "Insolvencia y reemprendimiento"
          },
          {
            "entry": "laboral_empresas",
            "label": "Derecho laboral"
          },
          {
            "entry": "corporativo",
            "label": "Derecho corporativo y comercial"
          },
          {
            "entry": "propiedad",
            "label": "Propiedad intelectual"
          },
          {
            "entry": "contratacion",
            "label": "Contratación pública"
          },
          {
            "entry": "preventiva",
            "label": "Asesoría preventiva empresarial"
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
  "redirects": [
    {
      "from": "/empresas/derecho-corporativo-comercial",
      "entry": "corporativo"
    }
  ]
}$ALBAR_COMPLEMENT$::jsonb);

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


-- Check current identity, concurrency, publication state and scheduling together.
create or replace function pg_temp.albar_complement_guard(p_entry uuid,p_site uuid,previous jsonb)
returns uuid language plpgsql as $$
declare latest uuid; published uuid; archived timestamptz; revision_state text; identity text;
begin
 perform 1 from public.content_entries where id=p_entry and site_id=p_site for update;
 if not found then raise exception 'Identidad ajena al sitio ALBAR' using errcode='40001';end if;
 select r.id,r.editorial_state into latest,revision_state from public.content_revisions r where r.entry_id=p_entry order by r.revision_number desc limit 1;
 select e.published_revision_id,e.archived_at,pg_temp.albar_hash(jsonb_build_object('internal_name',e.internal_name,'parent_id',e.parent_id,'first_published_at',e.first_published_at))
 into published,archived,identity from public.content_entries e where e.id=p_entry;
 if archived is not null or latest is distinct from nullif(previous->>'last_revision_id','')::uuid
   or published is distinct from nullif(previous->>'published_revision_id','')::uuid
   or (previous ? 'editorial_state' and revision_state is distinct from previous->>'editorial_state')
   or (previous ? 'identity_hash' and identity is distinct from previous->>'identity_hash') then
  raise exception 'Conflicto editorial: se conserva la edición, publicación o jerarquía existente de %',p_entry using errcode='40001';
 end if;
 if exists(select 1 from public.scheduled_publications where entry_id=p_entry and status='pending') then
  raise exception 'Hay una publicación programada; el complemento no la modifica' using errcode='40001';end if;
 return latest;
end;
$$;

do $IMPORT$
<<complement>>
declare
 cfg jsonb; src jsonb; state jsonb; ext jsonb; node jsonb; old jsonb; snapshot jsonb; ids jsonb:='{}'; terms jsonb;
 actor uuid; site uuid; author uuid; entry uuid; expected uuid; revision uuid; menu uuid; term uuid;
 published uuid; revision_state text; hash text; fingerprint text; menu_input jsonb; old_claims text; old_sub text;
 record_item record; is_patch boolean; publish boolean; n_created integer:=0; n_saved integer:=0; n_published integer:=0;
begin
 select config into cfg from albar_complement_config;
 select payload into src from albar_complement_source;
 if to_regclass('private.cms_seed_registry') is null then raise exception 'Ejecuta primero el seed inicial de ALBAR';end if;
 select p.id into actor from auth.users u join public.profiles p on p.id=u.id
  where lower(u.email)=lower(nullif(cfg->>'actor_email','')) and p.status='active' and p.is_admin;
 if actor is null then raise exception 'Configura actor_email con un administrador activo existente';end if;
 old_claims:=current_setting('request.jwt.claims',true);old_sub:=current_setting('request.jwt.claim.sub',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
 perform set_config('request.jwt.claim.sub',actor::text,true);
 if not private.is_admin() then raise insufficient_privilege;end if;
 publish:=coalesce((cfg->>'publish')::boolean,false);
 if publish and cfg->>'content_review_confirmed' is distinct from 'true' then raise exception 'Confirma la revisión del contenido antes de publicar';end if;
 -- Serialize with both this extension and the initial importer.
 perform pg_advisory_xact_lock(hashtextextended(src->>'base_seed_key',0));
 select r.site_id,r.state into site,state from private.cms_seed_registry r
  join public.sites s on s.id=r.site_id
  where r.seed_key=src->>'base_seed_key' and s.status in ('draft','active') for update of r,s;
 if site is null then raise exception 'Falta el seed inicial de ALBAR o el estudio/sitio no está disponible';end if;
 ext:=coalesce(state->'extensions'->(src->>'extension_key'),'{}');
 for record_item in select key,value from jsonb_each(state->'entries') loop
  if not exists(select 1 from public.content_entries e where e.id=(record_item.value->>'id')::uuid and e.site_id=site and e.archived_at is null) then
   raise exception 'Referencia base inválida o archivada: %',record_item.key;end if;
  ids:=ids||jsonb_build_object(record_item.key,record_item.value->>'id');
 end loop;
 -- The article credits the original displayed author; no Auth identity is invented.
 author:=nullif(ext->>'author_id','')::uuid;
 if author is null then
  if exists(select 1 from public.authors where site_id=site and slug=src->'author'->>'slug') then raise exception 'Autor Jorge preexistente fuera del complemento';end if;
  insert into public.authors(site_id,display_name,slug,biography,professional_title,is_public)
   values(site,src->'author'->>'display_name',src->'author'->>'slug','','',publish) returning id into author;
 else
  perform 1 from public.authors where id=author and site_id=site for update;
  select pg_temp.albar_hash(to_jsonb(a)-'id'-'site_id') into hash from public.authors a where a.id=author and a.site_id=site;
  if hash is distinct from ext->>'author_hash' then raise exception 'Conflicto: autor original editado' using errcode='40001';end if;
  update public.authors set is_public=true where id=author and publish and not is_public;
 end if;
 select pg_temp.albar_hash(to_jsonb(a)-'id'-'site_id') into hash from public.authors a where a.id=author;
 ext:=ext||jsonb_build_object('author_id',author,'author_hash',hash);
 terms:=coalesce(state->'terms','{}')||coalesce(ext->'terms','{}');
 if not exists(select 1 from public.taxonomies t where t.id=(state->>'taxonomy_id')::uuid and t.site_id=site and t.code='category') then raise exception 'Taxonomía base inválida';end if;
 for node in select value from jsonb_array_elements(src->'terms') loop
  term:=nullif(terms->>(node->>'key'),'')::uuid;
  if term is null then
   if exists(select 1 from public.terms t where t.site_id=site and t.taxonomy_id=(state->>'taxonomy_id')::uuid and t.slug=node->>'slug') then raise exception 'Categoría preexistente fuera del complemento: %',node->>'slug';end if;
   insert into public.terms(site_id,taxonomy_id,name,slug) values(site,(state->>'taxonomy_id')::uuid,node->>'name',node->>'slug') returning id into term;
  elsif not exists(select 1 from public.terms t where t.id=term and t.site_id=site and t.taxonomy_id=(state->>'taxonomy_id')::uuid and t.name=node->>'name' and t.slug=node->>'slug' and t.parent_id is null) then
   raise exception 'Conflicto: categoría editada' using errcode='40001';end if;
  terms:=terms||jsonb_build_object(node->>'key',term);
 end loop;
 ext:=ext||jsonb_build_object('terms',terms);
 -- Allocate environment-specific IDs before building any snapshots or relations.
 for node in select value from jsonb_array_elements(src->'entries') loop
  entry:=nullif(ext->'entries'->(node->>'key')->>'id','')::uuid;
  if entry is null then
   if exists(select 1 from public.content_revisions where site_id=site and path=node->>'path')
    or exists(select 1 from public.content_routes where site_id=site and path=node->>'path')
    or exists(select 1 from public.redirects where site_id=site and from_path=node->>'path') then
    raise exception 'Ruta preexistente fuera del complemento: %',node->>'path';end if;
   insert into public.content_entries(site_id,kind,locale,internal_name,parent_id,first_published_at)
    values(site,node->>'kind','es-CL','ALBAR · '||(node->>'title'),(ids->>(node->>'parent'))::uuid,
     case when node->>'published_date' is not null then (node->>'published_date')::date::timestamp at time zone 'America/Santiago' else null end)
    returning id into entry;
   ext:=jsonb_set(ext,'{entries}',coalesce(ext->'entries','{}')||jsonb_build_object(node->>'key',jsonb_build_object('id',entry)));
   n_created:=n_created+1;
  end if;
  ids:=ids||jsonb_build_object(node->>'key',entry);
 end loop;
 for node in select value from jsonb_array_elements((src->'entries')||(src->'patches')) loop
  is_patch:=not (node ? 'kind');
  entry:=(ids->>(node->>'key'))::uuid;
  old:=coalesce(ext->'entries'->(node->>'key'),'{}');
  if is_patch and not (old ? 'last_revision_id') then
   old:=state->'entries'->(node->>'key');
   -- Initial importer predates the first_published_at identity fingerprint.
   if old->>'identity_hash' is distinct from (select pg_temp.albar_hash(jsonb_build_object('internal_name',internal_name,'parent_id',parent_id)) from public.content_entries where id=entry and site_id=site) then
    raise exception 'Conflicto en la página base: %',node->>'key' using errcode='40001';end if;
   old:=old-'identity_hash';
  end if;
  expected:=pg_temp.albar_complement_guard(entry,site,old);
  if is_patch then
   old:=old||jsonb_build_object('base_revision_id',coalesce(old->>'base_revision_id',expected::text));
   snapshot:=public.get_cms_snapshot((old->>'base_revision_id')::uuid);
   if snapshot is null then raise exception 'Snapshot base inaccesible';end if;
   snapshot:=snapshot||jsonb_build_object('blocks',(snapshot->'blocks')||(node->'blocks'));
  else
   if not exists(select 1 from public.content_entries e where e.id=entry and e.site_id=site and e.kind=node->>'kind' and e.locale='es-CL' and e.parent_id=(ids->>(node->>'parent'))::uuid) then raise exception 'Identidad o jerarquía inválida';end if;
   snapshot:=pg_temp.albar_content(node,ids,terms,case when node->>'author'='jorge' then author else (state->>'author_id')::uuid end,'{}','{}');
   snapshot:=snapshot||jsonb_build_object('seo',(snapshot->'seo')||jsonb_strip_nulls(jsonb_build_object('source_url',node->>'source_url','source_html_sha256',node->>'source_html_sha256','source_published_date',node->>'published_date')));
  end if;
  fingerprint:=pg_temp.albar_hash(snapshot);
  if expected is null or fingerprint is distinct from old->>'complement_fingerprint' then
   revision:=public.save_content_revision(entry,expected,snapshot);
   perform public.set_revision_state(revision,'in_review');expected:=revision;n_saved:=n_saved+1;
  end if;
  select e.published_revision_id into published from public.content_entries e where e.id=entry;
  if publish and published is distinct from expected then
   perform public.set_revision_state(expected,'approved');perform public.publish_content_revision(expected);published:=expected;n_published:=n_published+1;
  end if;
  select r.editorial_state into revision_state from public.content_revisions r where r.id=expected;
  select pg_temp.albar_hash(jsonb_build_object('internal_name',e.internal_name,'parent_id',e.parent_id,'first_published_at',e.first_published_at)) into hash from public.content_entries e where e.id=entry;
  ext:=jsonb_set(ext,'{entries}',coalesce(ext->'entries','{}')||jsonb_build_object(node->>'key',old||jsonb_build_object('id',entry,'last_revision_id',expected,'published_revision_id',published,'editorial_state',revision_state,'identity_hash',hash,'complement_fingerprint',fingerprint)));
 end loop;
 menu:=nullif(state->'menus'->'primary'->>'id','')::uuid;
 perform 1 from public.menus where id=menu and site_id=site for update;
 if not found then raise exception 'Menú base inválido';end if;
 perform 1 from public.menu_items where menu_id=menu order by id for update;
 select pg_temp.albar_hash(jsonb_build_object('items',pg_temp.albar_menu_snapshot(menu),'menu',(select to_jsonb(m)-'id'-'site_id' from public.menus m where m.id=menu))) into hash;
 if hash is distinct from coalesce(ext->>'menu_hash',state->'menus'->'primary'->>'hash') then raise exception 'Conflicto: menú editado fuera del seed' using errcode='40001';end if;
 menu_input:=(src->'menu'->'items')||coalesce((select jsonb_agg(jsonb_build_object('label',m.label,'external_url',m.external_url) order by m.position) from public.menu_items m where m.menu_id=menu and m.parent_id is null and m.external_url is not null),'[]'::jsonb);
 fingerprint:=pg_temp.albar_hash(menu_input);
 if fingerprint is distinct from ext->>'menu_source_hash' then
  for record_item in with recursive tree as(select id,0 as depth from public.menu_items where menu_id=menu and parent_id is null union all select m.id,t.depth+1 from public.menu_items m join tree t on m.parent_id=t.id where m.menu_id=menu) select id from tree order by depth desc loop
   delete from public.menu_items where id=record_item.id and menu_id=menu;
  end loop;
  perform pg_temp.albar_menu_items(menu_input,site,menu,ids);
 end if;
 update public.menus set is_public=true where id=menu and publish and not is_public;
 select pg_temp.albar_hash(jsonb_build_object('items',pg_temp.albar_menu_snapshot(menu),'menu',(select to_jsonb(m)-'id'-'site_id' from public.menus m where m.id=menu))) into hash;
 ext:=ext||jsonb_build_object('menu_hash',hash,'menu_source_hash',fingerprint);
 for node in select value from jsonb_array_elements(src->'redirects') loop
  entry:=(ids->>(node->>'entry'))::uuid;
  if exists(select 1 from public.redirects where site_id=site and locale='es-CL' and from_path=node->>'from' and (target_entry_id<>entry or status_code<>301)) then raise exception 'Redirección incompatible';end if;
  if exists(select 1 from public.content_routes where site_id=site and locale='es-CL' and path=node->>'from' and entry_id<>entry) then raise exception 'La redirección desplazaría contenido existente';end if;
  if not exists(select 1 from public.redirects where site_id=site and locale='es-CL' and from_path=node->>'from') then
   perform public.manage_cms_redirect(site,null,'es-CL',node->>'from',entry,301);
  end if;
 end loop;
 state:=jsonb_set(state,'{extensions}',coalesce(state->'extensions','{}')||jsonb_build_object(src->>'extension_key',ext));
 update private.cms_seed_registry r set state=complement.state,updated_at=now() where r.seed_key=src->>'base_seed_key';
 perform set_config('request.jwt.claims',coalesce(old_claims,''),true);perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);
 raise notice 'ALBAR complemento: % contenidos nuevos, % revisiones nuevas, % publicaciones',n_created,n_saved,n_published;
end;
$IMPORT$;
select s.name,count(e.id) as contents,count(e.published_revision_id) as published
 from private.cms_seed_registry r join public.sites s on s.id=r.site_id
 join public.content_entries e on e.site_id=s.id
 where r.seed_key=(select payload->>'base_seed_key' from albar_complement_source) group by s.name;
commit;
