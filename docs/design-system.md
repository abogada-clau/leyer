# Sistema de diseño de Leyer

Galería pública: `/design-system`. La raíz `/` muestra la misma galería hasta que
se implemente la home definitiva. Ambas funcionan sin Supabase ni sesión.
El panel real mantiene sus rutas `/admin` y `/protected` con autenticación.

## Dirección visual

La identidad combina pino, marfil, arena, salvia y terracota. Una tipografía
editorial expresa cercanía; la tipografía de interfaz mantiene la precisión y
la legibilidad del trabajo diario. Los ejemplos del sitio y el panel comparten
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

- **Instrument Serif** (`font-editorial`): títulos del sitio, landings, artículos y
  acentos expresivos. Regular e itálica; no simular pesos no disponibles.
- **Geist Sans** (`font-sans`): panel, navegación, formularios, tablas y lectura.
  Normal 400, medio 500 y seminegrita 600.
- Las fuentes se sirven mediante `next/font`. No se realizan peticiones a Google
  Fonts desde el navegador del visitante.

Mantener el cuerpo de las páginas públicas en 16–18 px y con interlineado amplio.
La galería incluye aplicaciones a escala reducida; sus tamaños compactos son para
el preview, no una recomendación de texto pequeño para la home real.

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

`SectionHeading`, `ServiceCard`, `Checklist`, `FAQ` y `EmptyState` componen las
páginas públicas y los estados de la aplicación. `AdminShell` proporciona la
estructura de navegación, organización, usuario y contenido del panel.

Las tablas reciben columnas tipadas y celdas como funciones, sin atarlas a un
modelo de datos concreto. Las preguntas frecuentes usan `details/summary` nativos.
Los bloques del futuro renderizador del CMS pueden componerse con estos patrones.

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
datos y el selector de archivos no sube documentos. Recargar restaura los ejemplos.

El panel productivo deberá conectar estos componentes a las funciones y políticas
de Supabase, con autorización en el servidor y en la base de datos. La galería
no cambia ni sustituye esos controles.
