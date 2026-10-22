# ALBAR Abogados: diagnóstico y propuesta editorial

Revisión del sitio público y de 13 capturas facilitadas por el cliente. Fecha: 21 de octubre de 2026. El análisis es cualitativo: no se dispuso de datos de tráfico, consultas ni contratación para medir conversión.

## Lo que funciona

La [home actual](https://www.albarabogados.cl/) presenta una identidad reconocible: verde profundo, tonos cálidos, tipografía editorial y una fotografía real de Claudia. Identificar a la profesional responsable ayuda a reducir la incertidumbre de quien busca asesoría. La separación entre personas y empresas ofrece una primera orientación y el acceso a contacto es visible.

El posicionamiento de cercanía, explicación y estrategia es coherente con una práctica jurídica personal. Conviene mantener esa voz, evitando convertir el sitio en un catálogo impersonal de procedimientos.

## Problemas concretos observados

| Hallazgo | Efecto probable | Propuesta incluida en el seed |
| --- | --- | --- |
| El titular «Toda decisión importante merece una estrategia a su medida» no identifica situaciones concretas. | Una visita desde una búsqueda sobre divorcio, alimentos o deudas debe interpretar si llegó al lugar adecuado. | Mencionar esos problemas en la presentación y ofrecer rutas por lo que la persona necesita resolver. |
| El primer recorrido distingue principalmente «persona» y «empresa»; varias tarjetas usan «Ver más». | Se reconoce el público, pero no necesariamente el progreso que busca. | Tarjetas como «Quiero ordenar mi separación» y «Mis deudas superan mi capacidad de pago», con enlaces a soluciones específicas. |
| El enlace «Conocer más» sobre Claudia apunta a [/sobre-mi](https://www.albarabogados.cl/sobre-mi), que devolvió 404; [/sobre-albar](https://www.albarabogados.cl/sobre-albar) respondió correctamente. | Se interrumpe el recorrido de confianza. | Página de presentación y redirección 301 desde `/sobre-mi`. |
| [/aviso-legal](https://www.albarabogados.cl/aviso-legal), enlazado desde el pie, devolvió 404. | La información legal prometida no está disponible. | Aviso legal y privacidad editables, pendientes de completar y revisar antes de publicar. |
| La sección de contacto muestra +56 9 2604 4751 y Victoria Subercaseaux 69, oficina 604; el pie muestra +56 9 4697 8661 y Av. Corrientes 1234, piso 5, Quinta Normal. WhatsApp usa el segundo teléfono. | Genera dudas sobre cuál es el canal y la ubicación vigentes. | El cliente confirmó +56 9 4697 8661 para teléfono y WhatsApp, y Av. Corrientes 1234, piso 5, Quinta Normal, Chile. Incorporados al seed; correo observado consistente: `contacto@abogadaclaudia.com`. |
| Hay un artículo con ruta [/blog/post-de-prueba](https://www.albarabogados.cl/blog/post-de-prueba). | La dirección comunica provisionalidad aunque el contenido esté disponible. | Nuevos artículos con rutas descriptivas. No se redirige el artículo existente a otro asunto sin correspondencia temática. |
| El formulario visible no explica con suficiente precisión si se solicita contacto o se confirma una cita. | El visitante puede esperar una reserva automática o condiciones no ofrecidas. | CTA «Solicitar evaluación de mi caso» y explicación de que las condiciones y disponibilidad se coordinan después. |

Los errores 404 se comprobaron mediante solicitudes HTTP. Se inspeccionaron la home, la presentación y las páginas de personas, empresas, divorcio y alimentos. No se enviaron formularios ni mensajes a la web del cliente. No se concluye que el formulario actual falle: no se ensayó su recepción.

## Home propuesta: jobs to be done y AIDA

**Trabajo principal:** «Cuando enfrento un problema familiar o financiero, quiero identificar una vía y saber quién me acompañará, para poder decidir con menor incertidumbre».

1. **Atención:** «Cuando una decisión cambia tu vida, necesitas saber cómo avanzar». El párrafo inmediato explicita separación, pensión de alimentos y deudas; evita dejar la propuesta en una frase genérica.
2. **Interés:** rutas por situaciones: ordenar una separación, asegurar o ajustar alimentos, enfrentar deudas personales y evaluar la insolvencia del negocio.
3. **Deseo:** presentación de Claudia, revisión de antecedentes, explicación de alternativas y riesgos, acuerdo del alcance y honorarios. Son señales de cómo se trabaja, sin cifras, testimonios ni resultados inventados.
4. **Acción:** solicitar evaluación con una descripción general. No se promete gratuidad, una fecha de respuesta, una reserva ni un resultado judicial.

La home distribuye tráfico; las landings profundizan en una necesidad. Cada landing desarrolla contexto, supuestos que deben revisarse, alternativas, proceso, preguntas frecuentes con respuestas y una acción siguiente. El catálogo conserva contenidos informativos para quien todavía no está preparado para consultar.

## Tratamiento de las capturas

Las 13 imágenes representan 11 temas únicos. Las tres versiones de liquidación concursal se conservan como revisiones históricas de una sola entrada y una propuesta consolidada queda como última revisión. La tabla de [contenidos](../../supabase/seeds/albar/contenidos.md) identifica cada captura y su destino.

La redacción es una adaptación comercial y jurídica, no una transcripción literal. Se mantiene la intención de las capturas y se corrigen afirmaciones que podrían generar expectativas equivocadas. Se agregan home, presentación, páginas de entrada, contacto, blog, privacidad, aviso y dos guías para que la navegación tenga destinos reales.

El seed utiliza las plantillas y bloques que Leyer ya puede renderizar. No implementa una réplica visual de las capturas: tipografías, composición, logotipo en encabezado y personalización de marca siguen las capacidades del frontend actual. Los mockups contienen una mujer distinta de la fotografía real del sitio; no se usa ese retrato conceptual como identidad de Claudia. Se incluyen originales públicos del sitio convertidos a WebP sin pérdida y se documenta su carga autorizada.

## Ajustes jurídicos aplicados

La revisión de fuentes ayuda a redactar una propuesta prudente; la publicación requiere que la profesional revise los textos y complete los datos de su práctica.

| Tema | Criterio editorial y fuente primaria |
| --- | --- |
| Divorcio | Se distinguen causal, prueba, acuerdo y efectos. Mutuo acuerdo exige cese superior a un año; unilateral, al menos tres años, con los demás requisitos y defensas legales. No toda infracción basta para divorcio por culpa. [Ley 19.947, artículos 54 y 55](https://www.bcn.cl/leychile/navegar?idNorma=225128&idParte=8650922), [orientación CAJ / ChileAtiende](https://www.chileatiende.gob.cl/fichas/316/1/pdf). |
| Cese de alimentos | Cumplir 18 años no extingue automáticamente la obligación. Se consideran las reglas de 21 y 28 años y sus excepciones; no se presenta matrimonio o convivencia como cese automático. [Código Civil, artículo 332](https://www.bcn.cl/leychile/navegar?idNorma=172986&idParte=8717776&idVersion=2024-06-14). |
| Modificación de alimentos | Aumento, rebaja y cese requieren revisar circunstancias y antecedentes; se contempla la mediación previa cuando corresponda, con sus excepciones. [Ministerio de Justicia, preguntas sobre mediación](https://www.mediacionchile.gob.cl/preguntas-frecuentes/). |
| Deuda y AFP | Se distinguen la investigación de fondos y el mecanismo extraordinario con cotizaciones obligatorias. La intervención judicial, las condiciones y los límites importan; no se ofrece un retiro libre ni recuperación asegurada. [ChileAtiende: pago efectivo de alimentos](https://www.chileatiende.gob.cl/fichas/109566-ley-de-responsabilidad-parental-y-pago-efectivo-de-pensiones-de-alimentos), [Ley 21.484](https://www.bcn.cl/leychile/navegar?idNorma=1181003&tipoVersion=0). |
| Insolvencia | Se explica que la calificación de persona o empresa deudora no depende solo de ser persona natural. Se consideran vías simplificadas y ordinarias, bienes, garantías, obligaciones excluidas y otras alternativas. No se garantiza conservar bienes ni extinguir toda deuda. [Superir: liquidación simplificada](https://www.superir.gob.cl/preguntas-frecuentes/preguntas-frecuentes-liquidacion-simplificada/), [Superir: liquidación ordinaria](https://www.superir.gob.cl/preguntas-frecuentes/preguntas-frecuentes-liquidacion-ordinaria/), [Ley 20.720](https://www.bcn.cl/leychile/navegar?idNorma=1058072). |

Contacto resuelto: el cliente confirmó +56 9 4697 8661 y Av. Corrientes 1234, piso 5, Quinta Normal, Chile. El seed y la demostración local usan estos datos.

## Decisiones pendientes del cliente

- Confirmar responsable legal, proveedores y región de tratamiento, plazo de conservación y procedimiento efectivo de atención/eliminación de consultas.
- Revisar contenido jurídico, alcance de los servicios y condiciones de evaluación.
- Confirmar el uso autorizado de los recursos del sitio actual; sustituirlos si las licencias o la disponibilidad han cambiado.

No se añadieron puntuaciones, premios, casos ganados, credenciales adicionales ni métricas comerciales que no hayan sido verificadas.
