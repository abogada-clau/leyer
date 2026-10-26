# Panel de ALBAR

El panel administra el único sitio de esta instalación. No hay selección de
estudio, creación de sitios, membresías ni administración de plataforma.

| Ruta | Función |
| --- | --- |
| `/admin` | Indicadores, publicaciones programadas y actividad reciente. |
| `/admin/content` | Páginas, servicios y artículos. |
| `/admin/content/new` | Crear contenido. |
| `/admin/content/[id]` | Editor, revisiones, aprobación, publicación e historial. |
| `/admin/content/[id]/preview` | Previsualización privada. |
| `/admin/media` | Biblioteca de imágenes y PDF. |
| `/admin/catalogs` | Autores, categorías y etiquetas. |
| `/admin/navigation` | Menús y enlaces. |
| `/admin/routes` | Rutas y redirecciones. |
| `/admin/settings` | Configuración y datos públicos. |
| `/admin/contacts` | Consultas privadas del formulario público. |
| `/admin/audit` | Registro de cambios. |
| `/admin/profile` | Nombre, apariencia y contraseña. |

## Acceso

Supabase Auth identifica a la persona. `profiles.is_admin` habilita el panel y
`profiles.status='active'` mantiene el acceso vigente. Las políticas SQL y las
operaciones del servidor verifican ambos valores. Una cuenta autenticada sin
acceso administrativo solo puede consultar su perfil. Los metadatos de Auth no
conceden acceso.

Las cuentas se preparan desde Supabase Auth y se habilitan mediante una conexión
SQL de confianza, según [la guía de base de datos](../supabase/README.md). No hay
registro público ni formulario para conceder privilegios en la aplicación.

## Edición y publicación

Cada guardado crea una revisión con control de concurrencia. Si otro editor
guarda antes, el panel conserva el borrador local y permite comparar y recuperar
los cambios. El borrador se identifica por usuario y contenido.

La publicación requiere aprobación. Los snapshots publicados quedan bloqueados;
para modificarlos se crea otra revisión. El sitio público sigue leyendo la
última versión publicada, aunque exista un borrador posterior. Despublicar o
archivar retira la página del acceso público.

El editor permite ordenar bloques, editar texto, iconos y acciones, seleccionar
imágenes y configurar la presentación de servicios. La previsualización privada
usa el mismo renderizador del sitio público.

## Recursos

Las imágenes pasan por el servicio de optimización y se almacenan como WebP sin
pérdida. Los PDF conservan su formato. `cms-private` requiere sesión y enlaces
firmados; `cms-public` contiene recursos públicos. Para publicar un recurso
privado se crea una copia pública y se selecciona en otra revisión.

Las cargas y los formularios administrativos no aceptan un sitio seleccionado
por el navegador: el servidor resuelve la configuración única. Los recursos ya
publicados no pueden sobrescribirse ni eliminarse mientras estén referenciados.

## Consultas y auditoría

El buzón permite cambiar estado y notas internas de las consultas. Su contenido
no es público. La auditoría guarda operación, persona, fecha y nombres de campos
modificados; no registra contraseñas ni el cuerpo del contenido editado.

## Operación

`npm run local:setup` prepara un administrador y una cuenta sin acceso solo en
Supabase local, sin crear estudios adicionales. Las credenciales permanecen en
`.local/`. `npm run worker` procesa la programación y la invalidación de caché.
En producción se debe mantener el worker activo o programar el endpoint
`/api/workers/publications` con `WORKER_SECRET`.
