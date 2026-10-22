# Validación del seed ALBAR

Fecha: 21 de octubre de 2026. Entorno: Next.js 16.4.2 y Supabase local del proyecto. No se ejecutó el importador contra producción ni se enviaron consultas a la web del cliente.

| Comprobación | Resultado |
| --- | --- |
| `npm run seed:albar:check` | SQL e inventario coinciden con las fuentes editoriales. |
| `npm run test:albar` | 11 pruebas aprobadas, sin omisiones en el entorno preparado. |
| `npm run test:media` | 13 pruebas aprobadas. |
| `npm run db:test` | 158 pruebas aprobadas en cuatro archivos. |
| `npm run db:lint` | Sin errores de esquema. |
| `npm run lint` | Sin errores. |
| `npm run build` | Compilación y TypeScript correctos. |
| Comprobación HTTP | Las 25 rutas del catálogo devuelven 200 y tienen un único h1; contacto muestra campos reales y enlace a privacidad. |
| Inspección visual | Home local renderizada con datos de Supabase y fotografía real de Claudia. |

Las pruebas específicas comprueban cobertura de las 13 capturas, enlaces internos, respuestas de FAQ, 25 entradas y 28 revisiones iniciales, estado de revisión y aislamiento anónimo. Verifican además repetición sin duplicados, rechazo de actores sin rol global, publicación explícita, controles de privacidad y membresía administrativa limitada a ALBAR.

Se simularon cambios posteriores de configuración, contenido, estado editorial, menús y programación. Todos bloquearon la reimportación y revirtieron su transacción. Un recurso público de otro sitio fue rechazado y el registro privado carece de permisos para los roles de la API. Las transacciones de estas pruebas usan un estudio temporal y se revierten.

La demostración persistente está en `http://localhost:3000/sitios/albar-abogados/principal`, identificada como demostración local. Tiene 25 entradas publicadas y tres imágenes cargadas mediante `/api/media/images`; la preparación y las vinculaciones generan revisiones adicionales a las 28 iniciales. Repetir la configuración final conserva esas revisiones sin añadir duplicados.

La publicación local usa datos de privacidad expresamente de demostración. El archivo distribuido para producción conserva los valores de publicación y activación en `false` y los campos de privacidad pendientes. Los datos oficiales confirmados por el cliente ya están incorporados: +56 9 4697 8661 (teléfono y WhatsApp) y Av. Corrientes 1234, piso 5, Quinta Normal, Chile. Las imágenes se transportan por separado y necesitan UUID del entorno de destino; los binarios no se simulan en SQL.
