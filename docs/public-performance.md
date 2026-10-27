# Rendimiento del sitio público

Revisión del 27 de octubre de 2026. Alcance: home, landings, blog, equipo,
perfiles, taxonomías y contacto. Las métricas cuentan peticiones HTTP a
PostgREST/RPC durante Proxy, metadata y renderizado; no son el número de
sentencias internas ejecutadas por PostgreSQL.

## Gaps corregidos

- Cada relación disparaba una petición independiente a `published_content`.
  Ahora se resuelven con un único `IN`, conservando el orden y verificando
  en vivo que los destinos continúen publicados. Se eliminó además una lectura
  de relaciones del snapshot que no se utilizaba para renderizar.
- Cada nivel de breadcrumbs añadía una petición secuencial. Una consulta
  recursiva resuelve la jerarquía en la base de datos, con límite de ocho niveles,
  detección de ciclos y filtros de publicación.
- Proxy y renderizado consultaban por separado sitio, página, redirección,
  idiomas y traducciones. `get_public_page` agrupa esas lecturas: Proxy utiliza
  una respuesta mínima y metadata/renderizado comparten la respuesta detallada
  mediante la caché de React por petición. Los perfiles y términos también se
  resuelven allí.
- El selector de idioma descargaba una fila por publicación y dependía del
  límite de filas de PostgREST. Ahora los idiomas se obtienen con `DISTINCT`
  dentro de la RPC.
- Faltaba un índice para buscar `content_revisions.path`. `EXPLAIN ANALYZE`
  confirmó un scan secuencial antes del cambio y el uso del nuevo índice después.
- Header y contenido repetían la comprobación de contacto. Las lecturas de
  secciones, autores y conjuntos de imágenes se deduplican durante la petición.
  Las consultas independientes del documento, header y filtros del listado
  se ejecutan en paralelo. Los bloques ocultos no solicitan sus listados.
- La imagen del hero utilizaba lazy loading y todas las imágenes dependían de
  la hidratación para abandonar `opacity-0`. El hero usa `eager` y prioridad
  alta; las imágenes pueden pintarse desde el HTML sin esperar a los listeners
  de React. Las imágenes secundarias conservan lazy loading y los estados de
  carga, error y reintento siguen disponibles.

## Resultados

Dos builds de producción con Next.js 16.4.2, el mismo catálogo local y un proxy
HTTP que cuenta las peticiones a Supabase. Cuatro visitas secuenciales por ruta;
las cifras siguientes corresponden a caché caliente. Se excluyen prefetches de
navegador y descargas de imágenes. La reducción de llamadas es estable en las
tres visitas posteriores a la primera.

| Ruta | Peticiones antes | Peticiones después | Reducción |
| --- | ---: | ---: | ---: |
| `/` | 13 | 7 | 46% |
| `/personas/derecho-de-familia/divorcios` | 15 | 5 | 67% |
| `/personas/derecho-de-familia/pension-de-alimentos/cobro-deuda` | 15 | 5 | 67% |
| `/blog` | 11 | 5 | 55% |
| `/equipo` | 13 | 5 | 62% |
| `/contacto` | 10 | 3 | 70% |

En el primer recorrido, las landings pasaron de 21 a 10 peticiones; el home
pasó de 20 a 13. Esas cifras incluyen el llenado inicial de snapshots y menús.

Para observar el coste de las dependencias secuenciales se repitió la prueba
con **40 ms de demora añadida por petición a Supabase**. Mediana de las últimas
tres visitas, desde el inicio de `fetch` hasta recibir el HTML completo:

| Ruta | Antes | Después |
| --- | ---: | ---: |
| Home | 470 ms | 196 ms |
| Divorcios | 536 ms | 201 ms |
| Cobro de deuda | 565 ms | 209 ms |
| Blog | 431 ms | 208 ms |
| Equipo | 573 ms | 259 ms |
| Contacto | 386 ms | 154 ms |

Son resultados de laboratorio, no Core Web Vitals ni tiempos de producción.
Sin demora artificial, en loopback, las medianas del HTML fueron 33 → 32 ms
en home y 37 → 27 ms en divorcios. La mayor ganancia aparece cuando existe
latencia entre el servidor y Supabase. Los resultados brutos de esta ejecución
quedan en `.local/performance/{baseline,optimized,baseline-latency,optimized-latency}.json`.

## Publicación y validación

Aplicar `supabase/migrations/20261027000100_public_performance.sql` antes de
desplegar el código que utiliza la nueva RPC. La migración ya se aplicó y probó
en la base local; no se modificó una base remota.

La resolución de sitio, publicación, redirecciones, disponibilidad y relaciones
sigue siendo en vivo. La caché entre visitas continúa limitada a snapshots por
revisión y navegación, con las etiquetas e invalidaciones existentes. El worker
de publicaciones debe mantenerse activo como indica el README.

La suite SQL comprueba permisos anónimos, borradores, ancestros, idiomas,
perfiles públicos/privados, taxonomías, renombres, retiro de publicaciones y
desactivación del sitio. Las pruebas de navegador incluyen tamaños desktop y
móvil, contacto, navegación, CMS y visibilidad del hero con los scripts de
hidratación bloqueados. `APP_URL` permite ejecutar las pruebas de navegador
contra un servidor aislado.

```sh
npm run lint
npx tsc --noEmit
npm run build -- --webpack
npm run db:lint
npm run db:test
npm run test:media
npm run test:services
APP_URL=http://localhost:3102 npm run test:public
APP_URL=http://localhost:3102 npx playwright test tests/browser/public.spec.ts tests/browser/public-conversion.spec.ts tests/browser/service-layout.spec.ts tests/browser/service-cms.spec.ts
```

Para comparar despliegues, repetir las visitas con el mismo catálogo y caché,
medir por separado la primera visita y la mediana de las siguientes, y contar
PostgREST mediante un proxy local sin tráfico paralelo. Los archivos de prueba
y builds de esta auditoría se aislaron en `.local/performance` para conservar el
servidor que ya estaba ejecutándose en el puerto 3000.
