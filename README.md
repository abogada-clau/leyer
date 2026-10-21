# Leyer

SaaS para estudios jurídicos con identidad global, membresías por estudio y CMS
con revisiones inmutables. Construido sobre Next.js, el sistema de diseño de
Leyer y Supabase Auth, PostgreSQL y Storage.

- [Sitios públicos, formularios y operación](docs/public-site.md)
- [Panel de administración: rutas, ejecución y workers](docs/admin.md)
- [Base de datos, permisos y primer superadministrador](supabase/README.md)
- [Sistema de diseño y componentes compartidos](docs/design-system.md)

## Desarrollo local

Requiere Node.js 22+, Docker y Supabase CLI. Configura `.env.local` siguiendo
`.env.example`, con las claves del proyecto local de Leyer.

```sh
npm ci
supabase start
supabase migration up --local
npm run dev
```

El sitio público está en `/` según su dominio o selección local.
El panel está en `http://localhost:3000/admin`. La galería pública continúa en
`/design-system`. El buzón de correo local está en `http://127.0.0.1:57324`.

En otra terminal, inicia el procesamiento independiente de publicaciones:

```sh
npm run worker
```

Para generar datos locales de verificación y cuentas con credenciales
aleatorias: `npm run local:setup`. Este comando no admite proyectos remotos.
Sus archivos privados quedan en `.local/`, fuera de Git. Para preparar los dos sitios de demostración aislados, ejecuta después
`npm run local:sites` y sigue `docs/public-site.md`. El panel consulta
siempre los datos persistidos; no usa las demostraciones de la galería.

## Comprobación

```sh
npm run lint
npm run build
npm run test:media
npm run db:lint
npm run db:test
# Con la aplicación en ejecución:
npm run test:admin
npm run test:public
npm run test:browser
```

La primera ejecución de pruebas de navegador requiere
`npx playwright install chromium`. Consulta `docs/admin.md` para las condiciones
de ejecución, el correo de invitaciones, el almacenamiento y el cron de producción.

La gestión documental y los expedientes se incorporarán posteriormente, con
almacenamiento y autorización separados de los recursos públicos del CMS.
