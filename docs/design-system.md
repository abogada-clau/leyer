# Sistema de diseño de Leyer

Galería pública: `/design-system`. La raíz `/` muestra la misma galería hasta que
se implemente la home definitiva. Ambas funcionan sin Supabase ni sesión.
El panel real mantiene sus rutas `/admin` y `/protected` con autenticación.

## Dirección visual

La interfaz combina una base blanca con contraste pino, texto oscuro y superficies
salvia. El pino identifica la portada y la navegación; la terracota destaca las
acciones de contacto y el cierre del recorrido. Arena acompaña la orientación y
las lecturas; marfil enmarca la presentación del estudio y el pie de página.
Los beneficios usan una superficie salvia y los pasos tienen
marcadores sólidos, conservando la mayor parte de la página en blanco.
El estilo es minimalista con contraste: pocos recursos visuales, con presencia
suficiente para distinguir contenido, navegación y acciones. Hover y foco dan
una respuesta visible; los textos secundarios conservan contraste legible.
Las superficies arena y salvia se derivan de los tokens de marca, con menor
intensidad en oscuro. El terracota usa su pareja semántica de texto en ambos
temas; no se comunica una diferencia de servicio o un estado solo con color.
La home abre con una superficie pino y una acción principal en alto contraste.
El encabezado permanece accesible al desplazarse. En móvil, una barra de contacto
lleva al formulario del sitio y, si está publicado en su menú, a su WhatsApp.
La barra se oculta al entrar al formulario o abrir el menú para no tapar controles.
Después del primer grupo de servicios se ofrece ayuda para elegir el siguiente
paso. Estas salidas solo aparecen cuando el sitio tiene contacto habilitado.
Las entradas al desplazarse duran menos de medio segundo, se ejecutan una sola
vez por sección y respetan movimiento reducido. El contenido permanece visible
sin JavaScript. Los enlaces y tarjetas responden a hover y foco sin animaciones
continuas, carruseles automáticos ni mensajes de urgencia.
Una misma familia
sans serif mantiene la claridad de los títulos y la legibilidad del trabajo
diario. Los ejemplos del sitio y el panel comparten
los mismos componentes, colores semánticos y estados.

## Fuentes de verdad

| Archivo                       | Responsabilidad                                    |
| ----------------------------- | -------------------------------------------------- |
| `app/globals.css`             | Tokens de color y temas claro/oscuro.              |
| `tailwind.config.ts`          | Clases semánticas, fuentes, radios y sombras.      |
| `lib/design-system/tokens.ts` | Catálogo visible de marca, espaciado y radios.     |
| `app/design-system.css`       | Composición de la galería y patrones compartidos.  |
| `components/ui/`              | Primitivas accesibles y reutilizables.             |
| `components/patterns/`        | Patrones de contenido y estructura administrativa. |
| `components/design-system/`   | Identidad visual y demostraciones de la galería.   |

Usar clases semánticas como `bg-primary`, `text-muted-foreground`, `border-border`
y `bg-card`. Evitar colores hexadecimales nuevos dentro de componentes de producto.
Los tokens `--brand-*` mantienen la marca estable; los tokens semánticos se adaptan
al tema. Los colores de marca no son estados de error o éxito.

## Tipografía

- **Google Sans**: títulos del sitio, landings, artículos, panel, navegación,
  formularios, tablas y lectura. Normal 400, medio 500 y seminegrita 600.
- `font-editorial` se conserva como alias de compatibilidad para los títulos
  existentes; utiliza la misma familia que `font-sans`.
- Las fuentes se sirven mediante `next/font`. No se realizan peticiones a Google
  Fonts desde el navegador del visitante.

Mantener el cuerpo de las páginas públicas en 16–18 px y con interlineado amplio.
Usar títulos principales de 36–52 px, títulos de sección de 26–34 px y títulos
de tarjeta de 18–21 px. La mayoría de los títulos usa peso 500. Limitar el ancho
de lectura a unas 60–68 letras por línea; reservar las columnas estrechas para
metadatos, títulos de apoyo o navegación, no para párrafos extensos.
La galería incluye aplicaciones a escala reducida; sus tamaños compactos son para
el preview, no una recomendación de texto pequeño para la home real.

## Forma

El radio compartido es **8 px** (`--radius: 0.5rem`). Botones, campos, tarjetas,
diálogos, alertas, badges, menús y contenedores de imágenes utilizan ese token.
Los alias de Tailwind `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg`,
`rounded-xl`, `rounded-2xl` y `rounded-3xl` resuelven al mismo radio.
Los avatares, puntos de estado y figuras decorativas conservan su geometría
circular; no definen otro radio para componentes rectangulares.

## Componentes

| Componente                             | Uso                                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Button`                               | Principal, outline, ghost, secondary, terracotta, destructive y link. Tamaños 32, 40 y 48 px; icono con nombre accesible. |
| `Input`, `Textarea`, `Select`, `Label` | Formularios con etiqueta visible, ayuda, deshabilitado y `aria-invalid`.                                                  |
| `Checkbox`                             | Selección independiente y múltiples roles.                                                                                |
| `SegmentedControl`                     | Una vista activa entre varias; grupo de radios con teclado.                                                               |
| `Badge`                                | Estados de contenido con texto y color; success, warning, info y neutral.                                                 |
| `Alert`                                | Mensajes visibles con icono; success, warning, info y error.                                                              |
| `Dialog`                               | Diálogo modal nativo con foco contenido, Escape y restauración del foco.                                                  |
| `DataTable`                            | Tabla semántica con título, cabeceras y desplazamiento horizontal.                                                        |
| `Card`                                 | Superficie, borde y separación compartidos.                                                                               |
| `MediaImage` / `ImagePlaceholder`      | Imagen con espacio reservado, carga, vacío, error y reintento. Admite WebP público, URL firmada y vista previa local.     |
| `ImageUploader`                        | Archivo, arrastre o importación HTTPS; optimización WebP sin pérdida, progreso, cancelación, reintento y resultado.       |
| `Brand` / `LegalIllustration`          | Marca e ilustración vectorial, sin dependencias de imágenes externas.                                                     |

```tsx
<Button>Guardar cambios</Button>
<Button variant="outline">Cancelar</Button>
<Badge variant="success">Publicado</Badge>

<Label htmlFor="title">Título</Label>
<Input id="title" aria-describedby="title-help" />
<p id="title-help">Así aparecerá en el sitio.</p>
```

`Button asChild` permite conservar la semántica de un enlace. Las acciones usan
botones; la navegación usa enlaces. Una acción destructiva requiere una descripción
clara y confirmación cuando corresponda.

## Patrones

Las secciones tienen roles visuales distintos: presentación con imagen contenida,
tarjetas de navegación con enlaces claros, beneficios compactos sobre una superficie
tenue, pasos en una secuencia vertical y preguntas frecuentes en acordeón. Los bloques
de contenido agrupan etiqueta, título y explicación en una cabecera. Evitar una
sucesión de títulos grandes con el mismo peso y rejillas con una tarjeta huérfana.

`SectionHeading`, `ServiceCard`, `Checklist`, `FAQ` y `EmptyState` componen las
páginas públicas y los estados de la aplicación. `AdminShell` proporciona la
estructura de navegación, organización, usuario y contenido del panel.

Las tablas reciben columnas tipadas y celdas como funciones, sin atarlas a un
modelo de datos concreto. Las preguntas frecuentes usan `details/summary` nativos.
Los bloques del futuro renderizador del CMS pueden componerse con estos patrones.

## Imágenes y almacenamiento

Preview público e interactivo: `/design-system#images`. La biblioteca del panel de
ejemplo reutiliza el mismo componente.

```tsx
<MediaImage src={imageUrl} alt="Entrada del estudio" width={1600} height={900} />

// Conversión pública y descarga, sin persistencia.
<ImageUploader />

// Guardado real: requiere sesión, media.manage y configuración del servidor.
<ImageUploader
  target={{ siteId, bucket: "cms-private" }}
  onChange={(image) => setCoverAssetId(image?.assetId ?? null)}
/>
```

- `POST /api/media/prepare` devuelve el WebP optimizado sin guardarlo. El preview
  permite descargarlo y libera las URL temporales al cambiar de imagen o salir.
- `POST /api/media/images` registra y guarda el archivo optimizado en `cms-public`
  o `cms-private`. Comprueba la sesión y el permiso del sitio con el cliente del
  usuario antes de usar `SUPABASE_SERVICE_ROLE_KEY`, exclusiva del servidor.
- Configurar las tres variables de `.env.example` y ejecutar el stack de Supabase
  para probar persistencia. El preview público funciona sin estas credenciales.
- Ambos destinos usan `lib/media/client.ts` y el mismo optimizador del servidor.
  Los nuevos componentes que carguen imágenes deben usar esta entrada. No llamar
  directamente a `storage.upload` desde el navegador.
- La migración `20261021000500_optimized_media_uploads.sql` limita nuevas imágenes
  a WebP y retira la carga directa del cliente. Exige dimensiones, tamaño original,
  versión del optimizador y SHA-256. Los recursos existentes conservan su formato;
  los recursos publicados siguen protegidos contra sobrescritura y eliminación.
- La conversión usa Sharp con `lossless: true`, `effort: 6` y `exact: true`.
  Conserva dimensiones, transparencia y perfil de color, aplica orientación EXIF
  y elimina EXIF/GPS. No reduce resolución ni vuelve a codificar con pérdida.
  Un JPEG ya comprimido puede producir un WebP mayor; se informa el tamaño real.
- Admite JPG, PNG, WebP, AVIF y GIF estáticos de 8 bits, hasta 25 MiB y 24 MP.
  Rechaza archivos dañados, SVG y animaciones en lugar de descartar contenido.
  Los PDF conservan su formato; este componente está destinado a imágenes.
- Las importaciones requieren un enlace HTTPS directo y público. Cada redirección
  valida DNS y direcciones IP; la conexión se fija a la IP validada. No se envían
  cookies, credenciales ni cabeceras de autenticación al servidor remoto.
- Hay límites de cuerpo, píxeles, tiempo y concurrencia, además de 20 solicitudes
  por minuto por instancia. En despliegues con varias instancias, complementar
  con límites compartidos en el proxy de entrada.
- Los estados de envío muestran el porcentaje transferido. La descarga,
  conversión y persistencia muestran progreso indeterminado hasta recibir la
  respuesta; no se simulan porcentajes de procesamiento.
- Eliminar la selección solo desvincula la imagen del formulario. La eliminación
  de un recurso almacenado debe pasar por las políticas de la biblioteca. Las
  vistas privadas usan enlaces firmados de una hora, que deberán renovarse al
  abrir nuevamente el editor.

`MediaImage` sirve los WebP ya preparados sin recomprimirlos, reserva espacio con
sus dimensiones y ofrece reintento si la carga falla. Proporcionar `alt=""` solo
para imágenes decorativas. El texto alternativo se introduce antes de subir y se
guarda como metadato del recurso.

Validación: `npm run test:media`, `npm run db:test`, `npm run db:lint`,
`npm run lint` y `npm run build`.

## Accesibilidad y adaptación

- Contraste semántico en los dos temas. Estado acompañado de texto/icono.
- Foco visible y enlace para saltar al contenido.
- Campos conectados a su etiqueta y al texto de ayuda/error.
- Selecciones y diálogos utilizables con teclado; iconos decorativos sin nombres redundantes.
- Movimiento reducido respetando `prefers-reduced-motion`.
- Navegación lateral colapsable y rejillas adaptables. Las tablas se desplazan
  dentro de su contenedor en pantallas estrechas.

## Alcance de las demostraciones

Los ejemplos de home, landing, blog y administración son públicos y usan datos
ilustrativos en memoria. Buscar, filtrar, crear, cambiar estados o eliminar dentro
del preview no modifica Supabase ni roles reales. Los formularios no transmiten
datos. La demostración de imágenes sí envía el archivo al optimizador de este
proyecto, pero no lo almacena en Supabase. Recargar restaura los ejemplos.

El panel productivo deberá conectar estos componentes a las funciones y políticas
de Supabase, con autorización en el servidor y en la base de datos. La galería
no cambia ni sustituye esos controles.

## Panel productivo

`/admin` usa `AdminShell` con `production`, enlaces `href` por sección,
`workspaceControls`, `userControls` y breadcrumbs. Los props originales de la
galería siguen disponibles para las demostraciones. Los tamaños del panel real
se definen en `app/admin/panel.css`; no se trasladan los tamaños reducidos del
preview a las pantallas productivas. La biblioteca y el editor reutilizan
`MediaImage`, `ImageUploader`, tablas, diálogos y formularios compartidos.
