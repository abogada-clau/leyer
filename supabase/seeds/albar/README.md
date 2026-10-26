# Seed editorial de ALBAR ABOGADOS

`seed.sql` es un SQL autocontenido para ejecutar una vez en Supabase SQL Editor o mediante una conexión SQL de confianza. No necesita Node en producción. Requiere todas las migraciones del proyecto, incluida `20261026000100_single_client.sql`, y una cuenta Auth existente con perfil activo y `is_admin=true`.

## Qué crea

- Organización `ALBAR ABOGADOS` (`albar-abogados`) y sitio `principal`.
- 25 contenidos con título, extracto, idioma, jerarquía, plantillas, bloques, SEO, autoría, categorías y relaciones. Incluye home, servicios, contacto, dos artículos y textos legales por completar.
- Las 13 capturas se corresponden con 11 temas. Las tres propuestas de liquidación son revisiones de una entrada; hay 28 revisiones iniciales, no 13 landings duplicadas.
- Autor Claudia Albiña Aros, dos categorías, menús principal y pie, tres redirecciones compatibles.
- Registro privado de importación `private.cms_seed_registry`, sin acceso de los roles de la API. No es una tabla de contenido público.

Consulta [contenidos.md](./contenidos.md) y el [análisis de la home](../../../docs/albar/analisis-home.md).

## Ampliación con el contenido original del sitio

Después del seed inicial, ejecuta el [seed complementario](./complement/seed.sql)
siguiendo su [guía](./complement/README.md). Añade las 11 páginas de servicios
faltantes y el artículo original sobre despido injustificado, conservando los
copys capturados en el sitio de ALBAR. El catálogo resultante tiene 37 entradas.
También amplía Personas, Empresas y Familia mediante nuevas revisiones y completa
el menú. El SQL inicial conserva su catálogo de 25 entradas.

Una vez importado el complemento, este importador inicial aborta si se intenta
repetir: así evita restaurar el menú reducido anterior. Usa únicamente el seed del
complemento para repetir su carga; las ediciones posteriores se realizan desde
el panel y se respetan mediante controles de concurrencia.

## Importar mediante SQL en producción

1. Abre [seed.sql](./seed.sql). Edita únicamente el JSON inicial delimitado por `$ALBAR_CONFIG$` para la primera importación.
2. Completa `actor_email` con el correo de un administrador existente. El SQL verifica su estado actual y usa las funciones editoriales ya implementadas. No crea usuarios ni contraseñas.
3. Mantén `publish: false`, `activate_site: false` y `contact_enabled: false` para cargar y revisar desde `/admin`. Ejecuta **el archivo completo**, incluidos `begin` y `commit`.
4. El resultado muestra identificadores, 25 contenidos y cero publicaciones. El sitio queda en borrador y los últimos snapshots en revisión. El SQL falla sin datos parciales si el actor o la configuración no son válidos.
5. Opcionalmente indica `admin_email` de una cuenta Auth activa ya existente para habilitar su acceso administrativo al sitio. Las cuentas se crean mediante Supabase Auth.

Los datos confirmados por el cliente son teléfono y WhatsApp **+56 9 4697 8661** y dirección **Av. Corrientes 1234, piso 5, Quinta Normal, Chile**. El seed los incorpora en `phone`, `address` y `whatsapp`; este último usa solo dígitos con código de país (`56946978661`). El correo público observado es `contacto@abogadaclaudia.com`. No se inventan enlaces sociales.

El dominio predeterminado es `www.albarabogados.cl`. Esto configura la resolución del sitio en Leyer; no cambia DNS, certificados, hosting ni despliega la aplicación. Revisa el dominio que atenderá el despliegue antes de activar el sitio.

## Imágenes: carga y vinculación

El SQL no contiene binarios ni escribe filas ficticias en `storage.objects`. Con `assets: {}` funciona como contenido de texto y no genera URLs de imágenes rotas. Para incorporar las fotografías:

1. Tras la primera importación, selecciona ALBAR y su sitio `principal` en `/admin`, abre la biblioteca y carga los WebP de `assets/` en destino **público** mediante `ImageUploader` (`/api/media/images`). El flujo existente vuelve a verificar permisos y optimiza sin pérdida. También puedes usar la importación por URL con las fuentes de `assets/manifest.json`.
2. Copia los UUID reales de los recursos creados **en ese sitio y entorno**. No reutilices IDs locales en producción.
3. Completa el mapa y vuelve a ejecutar el SQL, conservando el resto de la configuración:

```json
"assets": {
  "claudia-perfil": "UUID-DEL-RETRATO-PUBLICO-EN-ESTE-SITIO"
}
```

`claudia-perfil` se usa en la home, la presentación, la liquidación y el perfil de autora. `claudia-hero` y `logo` son recursos adicionales preparados para composiciones futuras; el frontend actual no sustituye automáticamente su marca del encabezado por el logo. Los recursos deben existir físicamente, ser WebP públicos y pertenecer a ALBAR; un ID de otro estudio o privado hace abortar la transacción.

El manifiesto conserva fuente, dimensiones, peso y huella SHA-256. Las imágenes provienen del sitio público actual, no del retrato conceptual de los mockups. La conversión conserva dimensiones, utiliza el optimizador del proyecto y elimina EXIF. Para regenerarlas: `npm run seed:albar:assets`.

## Publicación y privacidad

La carga predeterminada permite revisar; no publica. Puedes completar y publicar desde el panel. También puedes usar una segunda ejecución SQL con `publish: true` y `activate_site: true` después de revisar el catálogo completo. Esa opción requiere:

- `legal_review_confirmed: true` y `privacy_review_confirmed: true`.
- `privacy_controller`, `privacy_email`, `privacy_processors` con proveedores/región y `retention_days` con un plazo efectivo de 1 a 3650 días.
- Comprobar que los compromisos del texto de privacidad reflejen la operación real. El plazo del texto no configura por sí mismo una eliminación automática de consultas.

`contact_enabled: true` habilita el formulario existente cuando su política está publicada. El servidor necesita `CONTACT_FORM_SECRET` y, en producción, la cabecera IP fiable configurada según la documentación del sitio público. El formulario guarda consultas privadas; no envía una cita automática ni confirma un correo de notificación. No activa gestión documental ni expedientes.

Para ver las publicaciones y sus cambios de catálogo sin caché obsoleta, mantén funcionando el [worker del proyecto](../../README.md). La importación utiliza el flujo editorial y sus eventos; no sustituye el proceso de invalidación.

## Repetición y recuperación

La importación toma un bloqueo de transacción y asigna UUID propios del entorno. Repetir el mismo archivo y configuración no duplica revisiones ni menús. Guarda snapshots mediante `save_content_revision` y el último `expected_revision_id`; una actualización del catálogo genera una nueva revisión y conserva las anteriores publicadas.

Si alguien editó una página, su jerarquía, estado editorial, configuración, autora, menús o categorías, o existe una publicación programada, el SQL aborta y conserva ese trabajo. También se detiene si el contenido fue archivado, retirado o publicado fuera del seed. Una organización preexistente con el mismo slug y sin registro de importación no se adopta automáticamente.

En caso de conflicto, revisa los cambios desde el panel y decide cómo integrarlos. No borres el registro ni cambies los identificadores de control para forzar la importación. El seed es para carga inicial y actualizaciones controladas, no para sobrescribir la edición diaria. `publish: false` no despublica páginas que ya estén públicas.

## Desarrollo y verificación local

```sh
npm run seed:albar:build
npm run seed:albar:check
npm run test:albar
npm run local:albar -- --publish-demo
```

`local:albar` exige Supabase en `127.0.0.1:57321`, una aplicación local y las cuentas de prueba existentes. Carga las imágenes mediante el endpoint autorizado. `--publish-demo` utiliza datos de privacidad expresamente locales y muestra la banda de demostración; no es configuración de producción. La URL resultante es `http://localhost:3000/sitios/albar-abogados/principal` con las rutas locales habilitadas.

La fuente editorial es `content.mjs`; el importador es `import.template.sql`. Regenera `seed.sql` y `contenidos.md` después de cambiarlos. Las pruebas de importación usan una organización temporal diferente y revierten sus transacciones. La comprobación HTTP adicional consulta las 25 páginas de la demostración local, si existe; no modifica contenido.

## Servicios completamente editables

El seed genera `service-landing` versión 2: los beneficios, notas, imágenes,
ilustraciones e iconos se guardan en los bloques, junto con sus acciones y opciones
visuales. Se editan desde Contenidos; quitar u ocultar un bloque se respeta al
publicar. No hay contenido editorial añadido por el renderizador.

Para actualizar un sitio existente sin repetir los importadores:

```sh
npm run content:upgrade-services -- --site-id UUID_DEL_SITIO
```

El comando requiere `CMS_MIGRATION_EMAIL` y `CMS_MIGRATION_PASSWORD` de una cuenta
con permisos sobre el sitio. En el entorno local usa la cuenta de verificación
y el sitio de `.local/albar-fixtures.json`. Por defecto crea revisiones en revisión.
Con `--publish` publica las nuevas revisiones solo de servicios que ya estaban
publicados y no tienen cambios pendientes; los conflictos se conservan y se informan.
Repetir no duplica contenido ni restaura elementos eliminados de la versión 2.
La conversión también está disponible por servicio en el editor. No se debe volver
a ejecutar el seed original sobre un catálogo ya editado para aplicar esta mejora.

Verificación: `npm run test:services` y las pruebas de navegador
`tests/browser/service-cms.spec.ts` y `tests/browser/service-layout.spec.ts`.
