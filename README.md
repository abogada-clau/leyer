# Leyer · ALBAR Abogados

Desarrollo a medida para ALBAR Abogados: un sitio público y un panel privado para
editar contenido, imágenes, navegación y consultas. Next.js, Supabase Auth,
PostgreSQL y Storage. La instalación admite un único sitio.

- [Sitio público y operación](docs/public-site.md)
- [Panel de administración](docs/admin.md)
- [Base de datos y habilitación de acceso](supabase/README.md)
- [Sistema de diseño](docs/design-system.md)

## Desarrollo local

Requiere Node.js 22+, Docker y Supabase CLI. Configura `.env.local` según
`.env.example` con las claves del proyecto local.

```sh
npm ci
supabase start
supabase migration up --local
npm run local:setup
npm run dev
```

El sitio público se abre en `http://localhost:3000/`, el panel en `/admin` y la
galería de componentes en `/design-system`. Las credenciales de verificación se
guardan en `.local/admin-accounts.json`, fuera de Git. El correo local está en
`http://127.0.0.1:57324`.

Para cargar el catálogo inicial en una instalación vacía, con la aplicación
encendida: `npm run local:albar`. `-- --publish-demo` publica únicamente la
presentación local de demostración. El importador conserva los sitios que ya
contienen trabajo editorial; no vuelve a ejecutar el seed inicial sobre ellos.

En otra terminal, ejecutar `npm run worker` para procesar publicaciones
programadas e invalidar las cachés.

## Verificación

```sh
npm run lint
npm run build
npm run db:lint
npm run db:test
npm run test:media
npm run test:services
# Con la aplicación en ejecución y el catálogo local publicado:
npm run test:admin
npm run test:public
npm run test:albar
npm run test:albar:complement
npm run test:browser
```

La primera ejecución de navegador requiere `npx playwright install chromium`.

## Actualización de una instalación existente

La migración `20261026000100_single_client.sql` conserva el sitio ALBAR
registrado, su contenido, revisiones, archivos, consultas y accesos vigentes.
Los registros de los antiguos sitios de prueba y las asignaciones de acceso
retiradas se archivan en `private.retired_installation_records`, sin permisos de
lectura para la API. Los archivos existentes conservan sus URLs.

Si hay varios sitios y ninguno corresponde al registro ALBAR, la migración
aborta sin elegir uno automáticamente. Las migraciones anteriores permanecen
como historial; el esquema final elimina organizaciones, membresías y roles de
plataforma, e impide crear un segundo sitio.
