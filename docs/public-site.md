# Sitio público ALBAR

La instalación sirve un único sitio en `/`. En producción el host debe coincidir
con el dominio configurado en `/admin/settings`; en localhost no se necesita
selección adicional. Las antiguas rutas `/sitios/...` ya no existen.

## Entorno local

```sh
supabase start
supabase migration up --local
npm run local:setup
npm run dev
# Solo para una instalación vacía, en otra terminal:
npm run local:albar -- --publish-demo
```

La configuración del servidor está en `.env.example`. No se requieren variables
para elegir un estudio o sitio local. El importador no reemplaza contenido
existente ni repite el seed inicial sobre un catálogo ya editado.

## Contenido público

Las páginas, servicios y artículos se resuelven desde las rutas publicadas del
CMS. Los borradores y los snapshots privados no se exponen al visitante. Se
conservan las páginas de equipo, autores, taxonomías, listados y sus filtros.

El idioma predeterminado se configura en el panel; otros idiomas publicados usan
`/idioma/<locale>/...`. Las URLs canónicas y el sitemap utilizan el dominio
configurado. Los hosts desconocidos y las rutas inexistentes devuelven 404.
`robots.txt` evita la indexación local.

Los menús y el pie se editan en el panel. Las redirecciones conservan sus códigos
301 o 308. La galería `/design-system` usa ejemplos independientes del contenido
real.

## Formularios de consulta

Se habilitan en `/admin/settings`. Requieren una política de privacidad publicada
y `CONTACT_FORM_SECRET`, de al menos 32 caracteres. En producción también se
configura `CONTACT_IP_HEADER` con un encabezado de IP sobrescrito por un proxy de
confianza.

El servidor firma el origen, la página y la versión de privacidad aceptada;
verifica consentimiento, vencimiento, repetición y límites de envío. Las
consultas se guardan de forma privada en `contact_submissions` y se gestionan en
`/admin/contacts`. La clave del servicio nunca se expone al navegador.

## Publicación y caché

El sitio consulta el estado público vigente antes de usar un snapshot cacheado.
Las modificaciones de contenido, menús y configuración generan eventos de
invalidación. Ejecutar `npm run worker` o configurar el endpoint de publicaciones
con `WORKER_SECRET`. El worker comprueba de nuevo el acceso del administrador que
programó la publicación.

## Verificación

Con el sitio local publicado y la aplicación encendida:

```sh
npm run test:public
npm run test:admin
npm run test:albar
npm run test:albar:complement
npm run test:browser
```

Las pruebas de importación vacían temporalmente la configuración y el contenido
dentro de una transacción que termina en ROLLBACK; conservan todos los datos al
finalizar. Ejecutarlas sin otras operaciones de escritura concurrentes.
