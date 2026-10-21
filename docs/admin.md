# Administración de Leyer

El panel usa Supabase Auth, PostgreSQL con RLS y Storage del proyecto local de
Leyer. No hay datos ficticios en componentes productivos. Los registros de prueba
son filas reales y están identificados como locales. `Mi estudio` / `Sitio
principal` se conserva vacío para empezar a trabajar con contenido propio.

## Rutas

| Ruta                                        | Función y acceso                                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/admin`                                    | Dashboard del estudio y sitio seleccionados; cuenta pendiente o acceso de abogado cuando no hay permisos CMS.        |
| `/admin/content`                            | Páginas, landings y artículos; búsqueda, tipo, estado, orden y paginación de servidor.                               |
| `/admin/content/new`                        | Creación de identidad editorial con tipo e idioma estables.                                                          |
| `/admin/content/[id]`                       | Editor, bloques, recursos, autores, taxonomías, SEO, revisiones y flujo editorial.                                   |
| `/admin/content/[id]/preview?revision=UUID` | Previsualización privada de una revisión concreta, con permisos comprobados.                                         |
| `/admin/media`                              | Biblioteca por sitio, filtros y paginación, imágenes, PDF, metadatos, eliminación protegida y copias públicas.       |
| `/admin/settings`                           | Sitio, datos públicos de contacto y creación de sitios.                                                              |
| `/admin/navigation`                         | Menús, jerarquía, destinos y posición de elementos.                                                                  |
| `/admin/catalogs`                           | Autores, imágenes de autor, taxonomías, categorías y etiquetas.                                                      |
| `/admin/routes`                             | Rutas canónicas reservadas y redirecciones 301/308 validadas.                                                        |
| `/admin/audit`                              | Auditoría del estudio; el superadministrador puede consultar toda la plataforma.                                     |
| `/admin/platform`                           | Solo superadministradores: estudios, invitaciones Auth, cuentas, membresías, cero o varios roles y estado de acceso. |
| `/admin/profile`                            | Perfil propio, preferencia de tema, cambio de contraseña y accesos actuales.                                         |
| `/design-system`                            | Galería pública original con sus demostraciones.                                                                     |
| `/protected`                                | Compatibilidad: redirige a `/admin`.                                                                                 |

La navegación usa el `AdminShell` compartido. Los selectores guardan preferencias
con cookies HTTP-only y cada petición vuelve a comprobar sus identificadores. Un
sitio público visible por RLS no se considera por ello un sitio editorial
autorizado: el contexto se calcula con los permisos actuales del usuario.

## Inicio local

Requiere Docker, Supabase CLI y Node.js 22 o posterior.

```sh
supabase start
supabase migration up --local
npm ci
npm run dev
# Otra terminal:
npm run worker
```

Configurar `.env.local` a partir de `.env.example` usando los valores del proyecto
local, sin incorporar claves al repositorio. `SUPABASE_SERVICE_ROLE_KEY` solo se
usa en módulos de servidor después de comprobar autorización. `APP_URL` debe
coincidir con el origen del panel. `WORKER_SECRET` debe tener al menos 32
caracteres aleatorios y ser igual en el servidor y el proceso programado.

Para probar la versión compilada, detener primero el servidor de desarrollo:

```sh
npm run build
npm run start
```

No ejecutar desarrollo y compilación simultáneamente sobre el mismo `.next`.

`npm run local:setup` prepara cuentas locales con credenciales aleatorias,
dos estudios de verificación y contenido persistido. Es idempotente, solo admite
`http://127.0.0.1:57321` o `http://localhost:57321` y no actúa sobre proyectos
remotos. Guarda sus credenciales en `.local/admin-accounts.json`, con permisos
0600 y fuera de Git. No usar estas cuentas en producción.

El primer superadministrador se crea por una conexión SQL de confianza con
`private.bootstrap_super_admin`, tal como se describe en `supabase/README.md`.
Las cuentas siguientes se invitan desde el panel; su rol global se concede en
la sección de superadministradores. La invitación aceptada por Auth no asigna
roles automáticamente. El servidor muestra el error real si Auth la rechaza.

El correo local se captura en [buzón de desarrollo](http://127.0.0.1:57324).
No llega a iCloud ni a otros proveedores. Abrir allí la invitación y elegir una
contraseña. La URL de invitación contiene un token temporal: no compartirla ni
incorporarla a documentación o capturas. La entrega real requiere SMTP de
producción y las URLs de redirección correspondientes en Supabase Auth.

## Edición y conflictos

El editor conserva una copia local por cuenta, sitio y contenido mientras haya
cambios. Esta copia usa almacenamiento del navegador: no editar desde un equipo
compartido si no es apropiado dejar una copia local. Puede descargarse o
descartarse. El guardado explícito crea un snapshot; no se guardan revisiones
por pulsación. `save_cms_entry` llama a `save_content_revision` y guarda nombre y
jerarquía en la misma transacción, con `expected_revision_id`.

Un conflicto SQLSTATE 40001 conserva la copia del editor. El diálogo consulta
la última revisión directamente al servidor, muestra ambas copias y permite
continuar después de compararlas o cargar la versión remota y descargar la
propia. Un segundo cambio concurrente vuelve a producir conflicto. Recuperar
una revisión histórica carga su contenido en el editor: guardar crea otra
revisión, sin modificar ni eliminar el historial o la versión publicada.

Los bloques se validan en el formulario, servidor y funciones SQL. El documento
estructurado se renderiza como elementos React permitidos; no se ejecuta HTML
guardado. El editor de texto enriquecido conserva el documento estructurado y permite
encabezados, negrita, cursiva, subrayado, listas, citas, enlaces seguros y deshacer.
Los datos avanzados permanecen disponibles para integraciones. La plantilla admite su clave y
versión; no presupone un catálogo de plantillas que el modelo no contiene.

## Archivos

Las imágenes de archivo, arrastre y URL pasan por `/api/media/images` y el
optimizador WebP sin pérdida. Los PDF usan `/api/media/files`, conservan sus
bytes y requieren firma PDF, tamaño válido, sesión y `media.manage`.

Los recursos privados usan enlaces firmados de 60 segundos y se renuevan cada
45 segundos, al volver a la ventana y al reintentar. Cada renovación consulta
los permisos actuales. Un enlace ya emitido puede funcionar hasta su expiración;
la suspensión impide emitir otros. Los destinos públicos son accesibles por URL
incluso antes de publicarse, y la interfaz lo advierte.

Crear una copia pública pide confirmación, verifica otra vez los permisos tras
la descarga, optimiza las imágenes y crea un recurso nuevo. El original privado
se conserva. Publicar requiere seleccionar la copia pública en la revisión.
Los archivos publicados están protegidos por las funciones y triggers originales;
no se permiten sobrescrituras. La biblioteca comprueba referencias antes de
borrar el objeto mediante Storage API y luego sus metadatos.

Los recursos CMS no son documentos de expedientes. La gestión documental y los
expedientes quedan fuera del panel y tendrán almacenamiento y permisos separados.

## Programación e invalidación

`npm run worker` es un proceso independiente, con intervalo de 30 segundos.
`npm run worker -- --once` es apropiado para cron. El proceso solo necesita
`APP_URL` y `WORKER_SECRET`; la clave de servicio permanece en el servidor Next.

También puede programarse un POST cada minuto a
`https://DOMINIO/api/workers/publications`, con `Authorization: Bearer` seguido
del secreto configurado. Este endpoint no admite GET ni ejecución anónima.
Configurar los secretos en el gestor del proveedor, sin ponerlos en la URL.

Ejemplo para un host con Node 22 y variables de entorno ya configuradas:

```cron
* * * * * cd /ruta/leyer && /ruta/node scripts/publication-worker.mjs --once >> /ruta/logs/leyer-worker.log 2>&1
```

La función SQL vuelve a comprobar los permisos y el estado del programador. Un
trabajo con permiso revocado termina en `failed`, con el error real guardado.
Solo los pendientes aparecen como próximas publicaciones en el dashboard;
el editor también muestra los completados, cancelados y fallidos.

Los eventos de publicación se procesan después de la transacción editorial.
El endpoint invalida las rutas canónicas, sus redirecciones y las etiquetas
`cms-site:<UUID>` / `cms-entry:<UUID>`. Solo marca `processed_at` después de la
invalidación. Si falla, la ejecución siguiente puede repetir la invalidación
sin perder el evento. Varias ejecuciones son seguras: el procesamiento SQL usa
bloqueo y `SKIP LOCKED`; invalidar un mismo evento es idempotente.

El futuro sitio público debe leer `published_content` y usar esas etiquetas si
incorpora caché. La implementación actual incluye el panel y su previsualizador
privado, sin reemplazar la galería pública por un sitio de ejemplo.

## Verificación

Preparar el entorno con `npm run local:setup`, mantener el servidor activo para
las pruebas de integración y ejecutar las suites de base de datos por separado:

```sh
npm run lint
npm run build
npm run test:media
npm run db:lint
npm run db:test
npm run test:admin
npx playwright install chromium
npm run test:browser
```

Las pruebas de integración usan solicitudes reales a Auth, REST, Storage y el
panel. Verifican superadministrador, administrador, abogado, cuenta sin roles,
metadatos falsificados, dos estudios aislados, suspensión/revocación con el mismo
JWT, snapshots, conflicto, aprobación, publicación, programación, recuperación,
archivo privado, PDF, URL de imagen y protección del binario publicado.

Las pruebas de navegador cubren navegación, formularios, previsualización,
publicación, historial, conflicto entre dos sesiones y tamaños de escritorio,
tablet y móvil. Las capturas y trazas se guardan fuera de Git.

## Resultado de la validación local

Verificado el 21 de octubre de 2026 con el stack local completo y la versión
compilada de la aplicación:

- Compilación de producción y lint: aprobados.
- Lint de base de datos: sin errores de esquema.
- pgTAP: 158 comprobaciones aprobadas en cuatro suites, incluida la ampliación pública.
- Medios: 13 pruebas aprobadas.
- Integración con Auth, REST, Storage, worker y sitio público: diez recorridos aprobados.
- Navegador: diez recorridos aprobados, incluidos sitio público, formularios, texto enriquecido, conflicto
  entre dos editores, biblioteca, escritorio/tablet/móvil y aceptación de una
  invitación con elección de contraseña.

Para producción quedan por configurar el dominio y las URLs de Auth, SMTP real
y la ejecución supervisada o cron del worker. No se modificó un proyecto remoto.


## Sitios públicos y consultas

El sitio público ya consume las publicaciones reales del panel. Ver
[guía de sitios públicos](public-site.md) para plantillas, bloques, rutas, dominios,
idiomas, programación y comprobación con dos estudios.

`/admin/contacts` agrega una bandeja privada por sitio con búsqueda, filtro de
estado, paginación, detalle y seguimiento. Requiere `contacts.read` y, para editar
estado/notas, `contacts.manage`; esos permisos se conceden a administradores y
superadministradores. Un abogado no obtiene acceso al CMS por tener su membresía.
Los mensajes originales y el consentimiento no se pueden reescribir.

La configuración del sitio permite editar rutas de secciones y formularios. Los
catálogos permiten publicar perfiles independientes y su presentación profesional.
Todos los cambios públicos generan eventos de invalidación para el worker.
