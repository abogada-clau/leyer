# Complemento ALBAR: navegación y copys originales

Archivo ejecutable: **[seed.sql](./seed.sql)**. Es SQL autocontenido para Supabase
SQL Editor o una conexión SQL de confianza. No necesita Node, Python ni acceso
al sitio original en producción. Requiere todas las migraciones, incluida `20261026000100_single_client.sql`, y el
[seed inicial de ALBAR](../seed.sql) importado en ese mismo entorno.

## Qué añade

| Área | Rutas nuevas |
| --- | --- |
| Familia | `/personas/derecho-de-familia/compensacion-economica`, `/personas/derecho-de-familia/cuidado-personal`, `/personas/derecho-de-familia/relacion-directa-y-regular` |
| Personas | `/personas/derecho-laboral`, `/personas/derecho-civil`, `/personas/escrituras-publicas` |
| Empresas | `/empresas/derecho-laboral`, `/empresas/derecho-corporativo-y-comercial`, `/empresas/propiedad-intelectual`, `/empresas/contratacion-publica`, `/empresas/asesoria-preventiva-empresarial` |
| Blog | `/blog/post-de-prueba` |

Son **11 landings y 1 artículo**: el catálogo inicial pasa de 25 a **37 entradas**.
Los dos artículos complementarios del seed inicial se conservan. No se duplica
el artículo original bajo un slug distinto.

Se añaden tarjetas hacia las nuevas áreas al final de Personas, Empresas y
Derecho de familia. Cada ampliación crea una **nueva revisión** y conserva todos
los bloques originales, sus imágenes, metadatos y versiones publicadas. En una
importación nueva sin revisiones adicionales se crean 15 revisiones: 12 nuevas
entradas y 3 ampliaciones; sumadas a las 28 iniciales, son 43 revisiones.

El menú principal reproduce las áreas del sitio de origen, con Familia y sus
cinco subáreas anidadas bajo Personas. Conserva el enlace externo de WhatsApp que
ya tuviera el menú registrado. El pie y la configuración del sitio no cambian.
Si el menú ya era público, su organización cambia al ejecutar el SQL; los enlaces
a contenidos en revisión aparecen en el sitio público cuando se publiquen.

El enlace defectuoso `/empresas/derecho-corporativo-comercial` recibe una
redirección 301 hacia la ruta válida con `-y-`. La redirección no desplaza
contenido existente y solo tiene destino público cuando se publique su landing.

## Fidelidad y procedencia

[source.json](./source.json) conserva el contenido editorial capturado de las
12 URLs públicas originales, la fecha de captura y una huella SHA-256 de cada
respuesta HTML. [content.mjs](./content.mjs) lo transforma a los bloques ya
implementados: `hero`, `rich_text` y `cta`. Se conservan párrafos, encabezados,
listas, énfasis y etiquetas de las acciones; solo se normaliza el espacio blanco.

No se copian scripts, estilos, formularios, navegación, pie ni listados derivados
de artículos relacionados. Los enlaces internos se limitan a destinos existentes
en el catálogo; se corrige la URL corporativa y los anclajes de contacto llevan
al formulario de Leyer. Los textos no se reescriben con nuevas promesas ni se
presentan como una nueva revisión jurídica.

El artículo figura como **Jorge**, publicado el **8 de julio de 2026**. Se crea
un perfil editorial con ese nombre, sin inventar apellido, credenciales ni una
cuenta Auth. La fecha original se conserva en `first_published_at`, normalizada
al inicio del día en `America/Santiago`, porque el origen solo muestra el día.
La URL y fecha de origen también quedan en el JSON SEO como procedencia; no
reemplazan la URL canónica de Leyer.

Este complemento importa copys; no descarga ni registra imágenes nuevas. Los
recursos que ya existan en las páginas ampliadas permanecen referenciados. Si se
necesita una portada para el artículo, se carga posteriormente desde la biblioteca
con el optimizador y se guarda una nueva revisión desde el panel.

## Ejecución

1. Importa primero el seed inicial si ALBAR todavía no existe. Si el estudio o
   los contenidos se crearon manualmente con esos slugs, no se adoptan por fuerza.
2. Abre **seed.sql de esta carpeta** y completa `actor_email` en el JSON
   `$ALBAR_COMPLEMENT_CONFIG$` con una cuenta Auth existente que tenga perfil
   activo y `is_admin=true`.
3. Conserva `publish: false` y `content_review_confirmed: false`. Ejecuta el
   archivo completo, incluidos `begin` y `commit`.
4. Revisa los 12 contenidos nuevos y las revisiones de Personas, Empresas y
   Familia desde `/admin`. Por defecto quedan **en revisión**. Lo que ya estuviera
   publicado mantiene su versión anterior.
5. Publica desde el panel. Alternativamente, tras revisar los textos, repite este
   mismo SQL con `publish: true` y `content_review_confirmed: true`; publicará las
   15 revisiones gestionadas por el complemento usando aprobación y publicación
   del CMS. Esta opción **no activa el sitio** ni publica el resto del seed inicial.

En un sitio nuevo, las otras páginas pueden revisarse, publicarse y activarse
desde el panel. Una vez instalado el complemento, no vuelvas a ejecutar el SQL
inicial: incluye una protección que aborta para evitar restaurar el menú reducido.
Las cargas posteriores del complemento usan exclusivamente este archivo.

No se modifican dominio, teléfono, dirección, privacidad, accesos,
cuentas Auth ni programación. Conserva el worker de publicación e invalidación
funcionando según [supabase/README.md](../../../README.md).

## Repetición y conflictos

El registro de esta ampliación se guarda dentro de
`private.cms_seed_registry.state.extensions.original-web-v1`; mantiene RLS y no
concede acceso a los roles de la API. El importador comparte el bloqueo de
transacción del seed inicial y utiliza IDs propios del entorno.

Repetir el mismo archivo no duplica contenidos, revisiones, categorías ni menús.
Se comprueban la última revisión, el estado editorial, la publicación, la
jerarquía, la fecha, la autoría y los elementos del menú. Una edición posterior,
retiro, archivo, cambio incompatible de ruta o publicación programada aborta
la transacción completa. No cambies ni borres los identificadores del registro
para forzar la carga; integra esas diferencias desde el panel.

## Desarrollo y verificación

```sh
npm run seed:albar:complement
npm run seed:albar:complement:check
npm run test:albar:complement
npm run test:albar
```

Las pruebas SQL exigen Supabase local, usan un estudio temporal independiente y
finalizan con `ROLLBACK`. Comprueban carga, publicación explícita, aislamiento,
repetición, conflictos, menús, fecha y autoría. También se verifica que todos los
textos capturados se conserven y se rendericen con los componentes del proyecto.
No aplican el complemento de forma persistente al estudio ALBAR local ni a prod.

Para volver a capturar el origen, ejecuta explícitamente
`python3 scripts/capture-albar-complement.py`, revisa el diff de `source.json` y
regenera el SQL. No se descarga contenido durante la generación normal. El
extractor se detiene si cambian la estructura esperada o la autoría/fecha del
artículo, para que se revise antes de migrar metadatos incorrectos.
