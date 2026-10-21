# Sitios públicos de Leyer

El frontend consume Supabase local como visitante anónimo, incluso si el navegador
mantiene una sesión de administración. Solo renderiza `published_content` y el
snapshot de su `revision_id`; nunca la última revisión editorial. El estudio y el
sitio deben estar activos. El panel y `/design-system` siguen separados.

## Visitar los dos sitios locales

Con el stack de Supabase y la aplicación iniciados:

- Sitio A: `http://localhost:3000/sitios/estudio-local-a/principal`
- Sitio B: `http://localhost:3000/sitios/estudio-local-b/principal`
- Panel: `http://localhost:3000/admin`
- Consultas: `http://localhost:3000/admin/contacts` (seleccionar el estudio y sitio).
- Galería: `http://localhost:3000/design-system`

Las dos organizaciones comparten el slug de sitio `principal`: el prefijo incluye
la organización para evitar ambigüedad. Solo se habilita en hosts loopback con
`ENABLE_LOCAL_SITES=true`. `LOCAL_PUBLIC_SITE=estudio-local-a/principal` selecciona
el sitio de `/`; no se usa como fallback para dominios de producción desconocidos.
Los dominios de prueba guardados son `estudio-a.test` y `estudio-b.test`; se pueden
comprobar enviando el encabezado Host a localhost. No necesitan DNS para usar los
prefijos anteriores. Un dominio desconocido responde 404.

Para preparar nuevamente un entorno local:

```sh
supabase start
supabase migration up --local
# Configurar .env.local desde .env.example con los valores del proyecto local.
npm run dev
# En otra terminal, después de que la aplicación esté lista:
npm run local:setup
npm run local:sites
npm run worker
```

`local:setup` genera cuentas y organizaciones de prueba; las credenciales aleatorias
quedan exclusivamente en `.local/`. `local:sites` exige Supabase loopback en el
puerto 57321 y modifica solo `estudio-local-a` y `estudio-local-b`. Publica contenido
de demostración identificado, sin personas, resultados ni credenciales
profesionales ficticias. Reutiliza la ilustración local, subida por el optimizador.
No publica ejemplos en el estudio principal del usuario. Volver a ejecutarlo
restaura los ejemplos mediante nuevas revisiones; no debe usarse para conservar
ediciones manuales hechas sobre esos ejemplos.

## Rutas y edición

En cada sitio se encuentran estos ejemplos persistidos:

| Ruta relativa | Contenido |
| --- | --- |
| `/` | Home con presentación, servicios, equipo, lecturas y CTA |
| `/servicios` | Listado de landings |
| `/servicios/acompanamiento-familiar` | Servicio con requisitos, etapas, FAQ y formulario |
| `/servicios/asesoria-empresas` | Segunda landing |
| `/el-estudio` | Página institucional |
| `/equipo` | Perfiles públicos del sitio |
| `/autores/equipo-demo` | Perfil y artículos del autor de prueba |
| `/articulos` | Artículos con búsqueda, tema y paginación |
| `/articulos/primera-consulta` | Artículo con portada, autor, tema y contenido relacionado |
| `/articulos/acuerdos-claros` | Segundo artículo |
| `/taxonomias/category/orientacion` | Artículos del tema |
| `/contacto` | Consulta privada con consentimiento |
| `/privacidad`, `/terminos` | Textos legales de demostración, identificados como tales |
| `/idioma/en` | Home publicada en inglés |
| `/sitemap.xml` | URLs de este sitio, incluidos sus idiomas |

Los textos legales de demostración deben reemplazarse por las políticas reales
antes de producción. No describen un servicio jurídico en operación.

En `/admin/content`, las plantillas de versión 1 son `default`, `home`,
`service-landing`, `article`, `contact`, `team`, `blog-index`, `services-index` y
`legal`. Una clave o versión desconocida utiliza la composición predeterminada y
muestra una advertencia en la previsualización privada. Los once bloques existentes
comparten renderizador entre la previsualización y el sitio. Los bloques
incompatibles se omiten públicamente y se identifican en la previsualización.
`related_content.source` permite relacionados explícitos, artículos, servicios o
equipo; las fuentes automáticas usan publicaciones actuales del mismo idioma y sitio.

Los enlaces relativos del CMS conservan el sitio y el idioma. Se admiten anclas,
HTTPS, correo y teléfono; se descartan protocolos ejecutables. El texto enriquecido
se convierte a elementos permitidos sin ejecutar HTML arbitrario. Las imágenes
usan `MediaImage`; el visitante nunca firma ni recibe recursos de `cms-private`.

En `/admin/settings` se gestionan los datos públicos, el dominio, el idioma, las
rutas de las secciones y los formularios. Las secciones sin página CMS tienen una
vista incorporada; publicar una página en esa ruta permite componer su cabecera.
Si esa página se retira, su ruta reservada responde 404 y no reaparece como vista
incorporada. En `/admin/catalogs`, activar «Mostrar en el equipo público» publica
un perfil independiente de sus artículos. Su retrato debe existir en `cms-public`.
Los autores de artículos publicados mantienen sus perfiles accesibles según RLS.

Los menús `primary` (o `main`) y `footer` son públicos y por idioma. Respetan orden,
jerarquía y destinos del CMS. Los breadcrumbs solo enlazan ancestros publicados del
mismo sitio e idioma. Las rutas admiten UTF-8 y las redirecciones conservan 301/308
y parámetros de consulta. Los prefijos de infraestructura y catálogos están
protegidos también en SQL al publicar o crear redirecciones.

## Consultas y prevención de abuso

El servidor emite un formulario firmado, válido una hora, vinculado al sitio,
idioma, origen, página y revisión publicada de la política de privacidad.
`POST /api/contact` comprueba el origen, tamaño, firma y campos. La base revalida
el estado del sitio, la ubicación habilitada del formulario, la política vigente y
la publicación de origen. Los identificadores enviados por un visitante no eligen
el estudio ni el destinatario.

El éxito se muestra después de persistir `contact_submissions`. Un reintento del
mismo formulario y contenido devuelve la misma referencia. Un cambio de política
exige actualizar el formulario y aceptar de nuevo; se conserva el texto escrito.
Una conexión fallida permite reintentar sin borrar el trabajo. No se admiten
archivos adjuntos ni se solicitan documentos confidenciales.

Hay un honeypot y límites transaccionales compartidos en PostgreSQL: tres consultas
por cliente y sitio en una ventana de diez minutos, y veinte globales por hora.
Las ventanas son fijas; las solicitudes rechazadas no agregan mensajes. Se guarda
un HMAC diario de la IP, nunca la dirección original. El worker elimina los
contadores con más de dos días. En loopback se usa un cliente local compartido;
por eso todos los navegadores locales comparten el límite.

Variables adicionales, exclusivamente de servidor:

- `CONTACT_FORM_SECRET`: secreto aleatorio independiente de al menos 32 caracteres.
- `CONTACT_IP_HEADER`: en producción, nombre de un encabezado de IP que el proxy
  confiable sobrescribe usando la conexión real. El servidor debe recibir tráfico
  solo a través de ese proxy; no se debe confiar en encabezados que pueda fijar el
  visitante. Sin configuración o IP válida, el envío falla de forma explícita.

En producción se requiere HTTPS y el dominio correcto en `sites.domain`. Los
prefijos locales permanecen deshabilitados fuera de loopback. Las variables
públicas de Supabase deben corresponder al proyecto de producción; la clave de
servicio nunca se entrega al navegador.

`/admin/contacts` ofrece filtros, paginación, detalle, estado y notas internas.
`contacts.read` y `contacts.manage` se asignan a `admin` y `super_admin`; `lawyer`
no recibe acceso automáticamente. Cada lectura y mutación aplica autorización de
servidor y RLS. El mensaje original, origen y consentimiento no son editables.
La auditoría registra cambios de campos, sin copiar el contenido de las consultas.

**No se envían notificaciones por correo.** El formulario y la bandeja lo indican.
La recepción guardada funciona sin SMTP. Las invitaciones de Auth siguen su flujo
real y requieren el SMTP del proyecto fuera del buzón local.

## Publicación, caché y operación

Las rutas se comprueban en vivo antes de consultar un snapshot en caché. Esto
impide que una revisión previamente almacenada reaparezca tras despublicar o
suspender un sitio o estudio. Snapshot y menús usan `cms-site:<UUID>` y
`cms-entry:<UUID>`; las revisiones publicadas permanecen inmutables.

El worker existente procesa publicaciones programadas y `publication_events`.
También consume `site_cache_events` para cambios en navegación, catálogos y datos
públicos, y limpia los contadores de abuso vencidos. Invalida antes de marcar los
eventos completados. Se puede ejecutar de forma independiente:

```sh
npm run worker
# Una sola pasada, útil para cron o verificación:
npm run worker -- --once
```

Para producción, supervisar ese proceso o programar un POST cada minuto a
`/api/workers/publications` con `Authorization: Bearer <WORKER_SECRET>` obtenido de
un almacén de secretos. La URL debe ser la aplicación que sirve los sitios y
`WORKER_SECRET` debe coincidir. En despliegues con cachés aisladas por instancia,
configurar una caché compartida o distribuir la invalidación a cada instancia;
un único proceso local ya usa la caché de la aplicación local. Los fallos de jobs
se registran como fallos reales y los eventos incompletos se conservan para reintento.
No se necesita mantener una página abierta.

Metadatos, canonical, Open Graph, JSON-LD y sitemap usan datos públicos. Una URL
canónica personalizada se limita al sitio/idioma resuelto. Las páginas con
`seo.noindex` se excluyen del sitemap; el desarrollo local siempre solicita no
indexar. `/robots.txt` excluye la infraestructura privada y anuncia el sitemap del
dominio activo. La respuesta 404 se entrega completa desde Proxy para conservar
el estado HTTP antes del streaming de metadatos de esta versión de Next.js.

## Migraciones nuevas

Se aplicaron sin reiniciar ni borrar la base existente:

- **009**: proyección pública, perfiles optativos, rutas reservadas y outbox de sitio.
- **010**: consultas privadas, permisos y recepción transaccional con límites compartidos.
- **011**: anclas seguras y validación de retratos públicos.
- **012**: validación de idioma y rutas/opciones públicas del sitio.
- **013**: reserva de la ruta de indisponibilidad.
- **014**: listado público paginado en SQL y protección de retratos independientes.
- **015**: retirada de secciones y limpieza autorizada de contadores vencidos.
- **016**: revalidación de ubicaciones de formulario después de emitir su firma.

## Comprobación

Con Supabase y la aplicación de producción en ejecución:

```sh
npm run lint
npm run build
npm run test:media
npm run db:lint
npm run db:test
# Ejecutar después de terminar pgTAP, sin pruebas mutantes concurrentes:
npm run test:admin
npm run test:public
npm run test:browser
```

Primero preparar `local:setup` y `local:sites`. Las pruebas usan solamente el stack
local de Leyer; sus credenciales y capturas quedan fuera de Git. La suite pgTAP de
bootstrap vacía datos dentro de una transacción que se revierte; no debe ejecutarse
simultáneamente con las pruebas de integración mutantes. Las pruebas de formularios
reinician solo los contadores efímeros locales; no borran las consultas recibidas.
Las publicaciones temporales de integración se archivan al terminar.

Los recorridos cubren dos dominios y prefijos locales, UTF-8, once bloques,
idiomas, SEO, 404, búsqueda/paginación, revisión publicada frente a borrador,
conflictos, rutas/redirecciones, programación, retirada, suspensión, caché,
recepción real e idempotencia, consentimiento, abuso, bandejas aisladas, archivos
privados, teclado, diálogos, escritorio/tablet/móvil y ambos temas.

La gestión documental y los expedientes siguen fuera de este frontend y del
almacenamiento público del CMS.


Resultado local del 21 de octubre de 2026: compilación, lint y lint SQL aprobados;
158 comprobaciones pgTAP, 13 pruebas de medios, 10 recorridos de integración
(4 de administración y 6 públicos) y 10 recorridos de navegador aprobados.
Aplicación de producción en el puerto 3000 y worker independiente activos.
