# Base de datos de ALBAR

Una instalación para un cliente. El esquema final conserva una sola fila de
configuración en `public.sites`; un índice único impide crear otra. `site_id`
permanece como referencia interna de integridad del contenido y las revisiones,
sin selección de cliente en la interfaz ni en las acciones del navegador.

## Migraciones

```sh
supabase start
supabase migration up --local
npm run db:lint
npm run db:test
```

Las migraciones anteriores a `20261026000100_single_client.sql` son historial.
La última retira las tablas de organizaciones, membresías, roles y permisos
genéricos, sus RPC y las columnas `organization_id`. Sustituye la autorización
por acceso administrativo directo y crea la configuración única si está vacía.

En una base existente reconoce ALBAR mediante su registro de importación. Antes
de retirar los otros sitios, guarda sus filas y el modelo de acceso anterior en
`private.retired_installation_records`. Esta tabla tiene RLS y ningún permiso
para `anon`, `authenticated` o `service_role`; solo una conexión SQL de confianza
puede recuperar el archivo. Los archivos de Storage no se eliminan y las URLs
públicas existentes se conservan. Si hay varios sitios sin un ALBAR registrado,
la migración aborta y revierte la transacción.

## Habilitar el acceso

Crear o invitar a la cuenta de la propietaria desde Supabase Auth. Después, desde
el SQL Editor o una conexión de confianza:

```sql
update public.profiles p
set is_admin = true, status = 'active'
from auth.users u
where u.id = p.id and lower(u.email) = lower('correo-de-la-propietaria@example.com');
```

La aplicación solo permite editar el nombre y las preferencias del perfil; no
puede conceder `is_admin` ni cambiar `status`. Los metadatos del registro no
habilitan permisos. Para revocar acceso, cambiar `is_admin=false` o suspender la
cuenta con `status='suspended'`; las operaciones consultan esos valores incluso
con un token que siga vigente. En producción deshabilitar el registro público
en Supabase Auth. `supabase/config.toml` ya lo deshabilita en local.

`npm run local:setup` prepara cuentas de verificación únicamente para el proyecto
loopback de Leyer. No modifica proyectos remotos. Sus credenciales se guardan en
`.local/admin-accounts.json`, fuera de Git.

## Contenido y archivos

El modelo conserva entradas, revisiones, bloques, relaciones, autores,
taxonomías, rutas, menús, programación y auditoría. Las funciones editoriales
mantienen el control de concurrencia y la inmutabilidad de los snapshots
publicados. Los vínculos se validan con claves foráneas.

Las lecturas internas usan `get_cms_entries`, `get_cms_revisions`,
`get_cms_listing`, `get_cms_snapshot` y `get_cms_media`; las públicas usan
`published_content`, `get_public_site()` y `get_public_snapshot`. Todas verifican
el acceso o el estado de publicación correspondiente.

Las cargas nuevas usan `site_id/asset_id/nombre.webp`, o `.pdf`. Los archivos
históricos conservan su ruta física. Las imágenes se optimizan en el servidor y
las inserciones directas desde el navegador están revocadas. Los recursos
privados usan enlaces firmados y los recursos publicados no se sobrescriben.

`SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor después de verificar el
permiso actual. No debe tener prefijo `NEXT_PUBLIC_`.

## Publicaciones y consultas

`process_scheduled_publications` comprueba el estado actual del administrador que
solicitó cada publicación. Los eventos de publicación y configuración invalidan
la caché mediante el worker autorizado por `WORKER_SECRET`.

`submit_contact` se ejecuta desde el servidor con un formulario firmado y
validación de origen, consentimiento, política de privacidad, idempotencia y
límites de envío. Las consultas son privadas y el buzón requiere acceso
administrativo.

## Catálogo ALBAR

Los importadores inicial y complementario están en `seeds/albar/`. Requieren un
administrador activo y conservan el trabajo editorial posterior mediante hashes
y control de revisiones. El registro de importación es privado y no configura la
entrega de correos ni publica contenido sin una indicación explícita.

Las pruebas SQL y de importación trabajan dentro de transacciones con ROLLBACK.
No ejecutar `db:reset` para actualizar una base que contiene trabajo: aplicar las
migraciones pendientes con `supabase migration up --local`.
