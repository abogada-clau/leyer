# Colección editorial ALBAR — 30 de octubre de 2026

23 imágenes temáticas generadas con la herramienta integrada `image_gen` y publicadas en la biblioteca del CMS de producción. Se aplicaron mediante 32 nuevas revisiones de contenido, conservando el historial anterior.

La dirección toma los colores del sistema de diseño de ALBAR: pino, marfil, arena, salvia y terracota. Fotografía editorial realista, luz natural, texturas cotidianas, profundidad de campo amplia y poco bokeh. Las escenas son ilustrativas; no representan clientes ni integrantes reales del estudio. El crédito y los textos alternativos identifican su origen generado con IA.

- `prompts.json`: instrucciones de generación por tema.
- `manifest.json`: archivos locales, URL pública, identificador del recurso, texto alternativo, dimensiones y SHA-256.
- `assignments.json`: correspondencia entre página, tema y recurso publicado.
- Los archivos WebP reproducen los bytes de producción y conservan los 1536 × 1024 píxeles originales, con compresión sin pérdida.

Se verificaron los 37 contenidos publicados. Las referencias a retratos de Claudia permanecen únicamente en `/` y `/sobre-albar`; sus revisiones no se modificaron. Se conservaron los textos, rutas, SEO y autoría de los artículos. Los 23 archivos públicos respondieron HTTP 200 con tipo `image/webp` y tamaño correcto.

El respaldo de contenido, los originales PNG y el registro de publicación están en `.local/editorial-images-20261030/` dentro del espacio de trabajo, excluidos de Git.
