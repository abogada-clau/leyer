# Base de datos de Leyer

Migraciones para un SaaS de estudios jurídicos. Una identidad puede pertenecer a
varios estudios y tener cero o varios roles. No se crean cuentas, contraseñas,
estudios reales ni privilegios administrativos automáticamente.

## Migraciones

| Archivo | Contenido |
| --- | --- |
| `20261021000100_identity_and_rbac.sql` | Perfiles, organizaciones, membresías, roles, permisos, auditoría y protección del último superadministrador. |
| `20261021000200_cms_schema.sql` | Sitios, contenidos, revisiones, bloques, archivos, autores, taxonomías, navegación, programación y eventos de publicación. |
| `20261021000300_cms_workflows.sql` | Guardado con control de concurrencia, revisión, publicación, redirecciones, inmutabilidad y procesamiento de publicaciones programadas. |
| `20261021000400_cms_access_and_storage.sql` | Permisos explícitos, políticas RLS, proyección pública y almacenamiento. |
| `20261021000500_optimized_media_uploads.sql` | Carga de imágenes mediante el optimizador del servidor, WebP obligatorio y contexto autorizado por sitio. |

`super_admin` se asigna globalmente mediante `platform_role_assignments`. `admin`
y `lawyer` se asignan por estudio mediante `membership_roles`. Las claves foráneas
impiden mezclar ambos alcances. La ausencia de asignaciones representa cero roles.
Solo `super_admin` administra cuentas, estudios y roles. Un `lawyer` necesita
también `admin` para gestionar contenido.

El perfil y la membresía deben estar activos para ejercer permisos internos.
Las políticas consultan la base de datos; suspenderlos o revocar roles no depende
de que el navegador renueve su JWT. El estado de aplicación no sustituye la
gestión de sesiones y credenciales de Supabase Auth.

## Desarrollo y comprobación

Requiere Supabase CLI y Docker. Desde la raíz del repositorio:

```sh
npm run db:start
npm run db:reset
npm run db:lint
npm run db:test
```

`db:start` inicia únicamente PostgreSQL y aplica las migraciones pendientes en una
base nueva. `supabase start` inicia además Auth, Storage y los demás servicios
para trabajar con la aplicación. Los puertos locales usan el rango `5732x` para
convivir con otros proyectos. No se necesita una conexión al proyecto remoto.

Los tests pgTAP crean dos estudios y distintas cuentas dentro de una transacción
que se revierte. Comprueban RLS, autoasignación de roles, aislamiento entre
estudios, snapshots, URLs, publicación y archivos. `db:reset` elimina únicamente
los datos del entorno local de Leyer, nunca los de un proyecto remoto.

Para desplegar, vincular explícitamente el proyecto correcto y revisar primero:

```sh
supabase link --project-ref TU_PROJECT_REF
supabase db push --dry-run
supabase db push
```

Las migraciones esperan un proyecto Supabase con los esquemas administrados
`auth` y `storage`. Se usa PostgreSQL 17 localmente. No se ha vinculado ni
modificado un proyecto remoto con estos archivos.

## Primer superadministrador y primer estudio

1. Crear y confirmar la cuenta mediante Supabase Auth.
2. Desde SQL Editor o una conexión SQL de confianza, ejecutar reemplazando el correo:

```sql
select private.bootstrap_super_admin(id)
from auth.users
where email = 'correo-del-superadministrador@example.com';
```

La función no está disponible para `anon`, `authenticated` ni `service_role` y
solo admite el bootstrap inicial. Después, un superadministrador activo puede
asignar nuevos roles desde una sesión autenticada; `granted_by` debe ser su UUID.
No se puede eliminar ni suspender al último superadministrador activo, incluso
con operaciones concurrentes. Para suspender una cuenta desde la aplicación,
usar `set_user_status(user_id, 'suspended')`.

3. Crear la organización y el sitio con el usuario superadministrador. El sitio
   comienza en `draft`; pasar a `active` cuando deba ser público.
4. Crear las membresías y asignar `admin` y/o `lawyer`. Una membresía activa sin
   roles no concede acceso al CMS.

## Contrato de edición y publicación

Crear primero `content_entries` con `kind` igual a `page`, `landing` o `post`.
La identidad, el sitio, el idioma y el tipo de contenido son estables.
`parent_id` es una jerarquía editorial independiente de la URL.

`save_content_revision(entry_id, expected_revision_id, content)` recibe el snapshot
completo y devuelve el UUID de la nueva revisión. En la primera llamada,
`expected_revision_id` es `null`; después debe ser la última revisión guardada.
Si otro editor guardó antes, se obtiene SQLSTATE `40001` y se debe recargar y
resolver el conflicto, sin sobrescribir el contenido del otro editor.

Ejemplo de `content`:

```json
{
  "title": "Divorcio de mutuo acuerdo",
  "excerpt": "Información sobre el servicio",
  "path": "/personas/divorcio/mutuo-acuerdo",
  "template_key": "service-landing",
  "template_version": 1,
  "seo": { "title": "Divorcio de mutuo acuerdo", "noindex": false },
  "authors": [],
  "terms": [],
  "relations": [],
  "blocks": [
    {
      "type": "hero",
      "schema_version": 1,
      "variant": "image-right",
      "data": {
        "heading": "Un nuevo comienzo",
        "actions": [{ "label": "Evaluar mi caso", "href": "/contacto" }]
      },
      "assets": []
    },
    {
      "type": "faq",
      "data": {
        "items": [{ "question": "¿Cómo comenzar?", "answer": "Agenda una consulta." }]
      }
    }
  ]
}
```

- `authors` y `terms` son listas de UUID del mismo sitio.
- `relations` contiene objetos `{ "entry_id": "UUID", "type": "related" }`.
- `assets` contiene objetos `{ "asset_id": "UUID", "slot": "image", "alt_text": "Descripción" }`.
- `key` es un UUID opcional por bloque para conservar su identidad entre revisiones.
- El orden de los bloques es el orden del array. No se admiten escrituras directas
  de revisiones, bloques o asociaciones desde el cliente.
- Se validan el catálogo y versión de bloque, campos obligatorios, tipos básicos,
  ítems y protocolos de los botones. El futuro editor/renderizador debe validar
  sus propiedades visuales y procesar el documento enriquecido sin ejecutar HTML
  o scripts. `rich_text` recibe `document: { "type": "doc", "content": [] }`.
- Las imágenes y destinos relacionados usan las tablas de referencias; no poner
  UUID de archivos o contenidos dentro de `data` como sustituto de esas relaciones.

Después del guardado:

```sql
select public.set_revision_state('UUID_REVISION', 'in_review');
select public.set_revision_state('UUID_REVISION', 'approved');
select public.publish_content_revision('UUID_REVISION');
```

La publicación fija `published_revision_id`, reserva la URL canónica, crea una
redirección si cambió la ruta y escribe un evento de invalidación de caché en una
misma transacción. Las revisiones publicadas y sus bloques/asociaciones no se
pueden modificar ni borrar. Un nuevo guardado no altera lo publicado.

Para restaurar una revisión publicada, publicar nuevamente su UUID; no se
sobrescribe ni se elimina su historial. Para retirarla o archivarla, usar
`unpublish_content(entry_id, false)` o `unpublish_content(entry_id, true)`.
Las rutas retiradas permanecen reservadas para evitar apropiación accidental.

El sitio público debe consultar `published_content` y sus bloques/asociaciones.
Para los registros internos completos del panel, usar `get_cms_entries(site_id)`,
`get_cms_revisions(entry_id)` y `get_cms_media(site_id)`. Estas funciones verifican
los permisos vigentes y devuelven cero filas fuera del estudio autorizado.
Las columnas internas no se conceden directamente a `anon` ni a `authenticated`;
registrar una cuenta sin roles no permite verlas. No usar `select *` sobre
`content_entries`, `content_revisions` o `media_assets` desde la parte pública.
Los perfiles de autor y las taxonomías son catálogos compartidos: sus cambios
actualizan esos datos compartidos en las páginas que los usan.

## Archivos

Para imágenes, usar `ImageUploader` con un destino o el cliente compartido
`lib/media/client.ts`. `POST /api/media/images` verifica sesión y `media.manage`,
descarga o recibe la imagen, la convierte a WebP sin pérdida y registra primero
`media_assets` antes de guardar por Storage API. La ruta tiene la forma
`organization_id/site_id/asset_id/nombre.webp`.

Configurar `SUPABASE_SERVICE_ROLE_KEY` únicamente en el servidor, además de las
dos variables públicas de `.env.example`. La migración 005 retira INSERT directo
del navegador y restringe ambos buckets a `image/webp` y `application/pdf`.
Los PDF conservan su formato para la futura gestión documental. Los recursos
existentes no se convierten ni se alteran; nuevos archivos de imagen requieren
la marca del optimizador, tamaño original, dimensiones y checksum.

`POST /api/media/prepare` alimenta el preview público: devuelve el WebP para
descarga sin insertar recursos ni objetos. Ver `docs/design-system.md` para los
límites, estados y contrato de los componentes.

- `cms-private`: archivos de borrador, accesibles solo al CMS autorizado.
- `cms-public`: archivos destinados expresamente a difusión pública. Cualquier
  persona que conozca su URL puede descargarlos, aunque aún no estén en una página.

Para publicar un archivo privado, copiarlo a un nuevo recurso en `cms-public` y
actualizar las referencias del nuevo snapshot. La publicación exige que todos
los archivos utilizados estén subidos en `cms-public`. Nunca usar ese bucket
para documentos confidenciales.

No se permiten sobrescrituras, renombrados ni movimientos de archivos por parte
del cliente. Un recurso usado por un snapshot publicado tampoco puede borrarse.
Para eliminar uno que nunca fue publicado, borrar primero el objeto por Storage
API y después su registro; las claves foráneas impiden eliminar recursos aún
referenciados. No manipular `storage.objects` directamente desde la aplicación.

## Trabajos pendientes de integración en la aplicación

- Un worker con `service_role` debe invocar periódicamente
  `process_scheduled_publications(25)`. Revalida los permisos actuales del usuario
  que programó cada publicación; una revocación o suspensión impide ejecutarla.
- Otro worker debe consumir `publication_events`, invalidar las rutas/etiquetas
  de caché de Next.js y marcar `processed_at` al terminar. No exponer la clave de
  servicio en el navegador. Los workers y el cron no se despliegan aquí.
- El panel productivo debe conectar formularios de edición y biblioteca a sus
  sitios reales. La galería pública mantiene sus datos de ejemplo.

El gestor documental se implementará en una etapa posterior con expedientes,
miembros del expediente, versiones y permisos explícitos. Los permisos
`documents.*` aquí son capacidades reservadas: por sí solos no conceden acceso
a ningún documento. Su almacenamiento será privado y separado del CMS.
