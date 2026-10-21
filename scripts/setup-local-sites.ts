import { createServerClient } from "@supabase/ssr";
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { Snapshot, Block } from "../lib/admin/types";
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!/^http:\/\/(127\.0\.0\.1|localhost):57321$/.test(url))
    throw new Error(
      "Este comando solo prepara los estudios de prueba de Supabase local.",
    );
  const accounts = JSON.parse(
    await readFile(".local/admin-accounts.json", "utf8"),
  );
  const fixtures = JSON.parse(
    await readFile(".local/admin-fixtures.json", "utf8"),
  );
  const jar = new Map<string, string>();
  const db = createServerClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
        setAll: (values) => values.forEach((c) => jar.set(c.name, c.value)),
      },
    },
  );
  function check<T>(r: { data: T; error: { message: string } | null }): T {
    if (r.error) throw new Error(r.error.message);
    return r.data;
  }
  const login = await db.auth.signInWithPassword(accounts.super);
  if (login.error) throw login.error;
  const b = (
    type: string,
    data: Block["data"],
    assetId?: string,
    variant = "default",
  ): Block => ({
    key: randomUUID(),
    type,
    schema_version: 1,
    variant,
    data,
    assets: assetId
      ? [
          {
            asset_id: assetId,
            slot: "image",
            alt_text:
              "Ilustración de un arco y una balanza en colores pino y arena.",
          },
        ]
      : [],
  });
  const rich = (paragraphs: string[]) =>
    b("rich_text", {
      document: {
        type: "doc",
        content: paragraphs.map((text) => ({
          type: "paragraph",
          content: [{ type: "text", text }],
        })),
      },
    });
  const output: Record<string, unknown> = {};
  for (const key of ["A", "B"]) {
    const { id: orgId, siteId } = fixtures.organizations[key];
    const tenant = { organization_id: orgId, site_id: siteId };
    const org = check(
      await db.from("organizations").select("slug").eq("id", orgId).single(),
    );
    if (org?.slug !== `estudio-local-${key.toLowerCase()}`)
      throw new Error(
        "Se rechazó modificar un estudio que no es de verificación.",
      );
    const site = check(
      await db.from("sites").select("*").eq("id", siteId).single(),
    );
    if (!site) throw new Error("Falta el sitio local.");
    check(
      await db
        .from("sites")
        .update({
          status: "active",
          domain: `estudio-${key.toLowerCase()}.test`,
          settings: {
            ...site.settings,
            demo: true,
            public_name: `Estudio ${key} · demostración`,
            description:
              "Un espacio de demostración para explorar una forma más clara y cercana de presentar un estudio jurídico.",
            contact_enabled: true,
            contact_on_landings: true,
            privacy_path: "/privacidad",
            contact_path: "/contacto",
            blog_path: "/articulos",
            team_path: "/equipo",
            services_path: "/servicios",
          },
        })
        .eq("id", siteId),
    );
    const existingMedia = check(
      await db
        .rpc("get_cms_media", { p_site_id: siteId })
        .eq("filename", "demostracion-editorial.webp")
        .eq("bucket_id", "cms-public"),
    );
    let imageId: string = existingMedia?.[0]?.id;
    if (!imageId) {
      const form = new FormData();
      form.set("siteId", siteId);
      form.set("bucket", "cms-public");
      form.set("alt", "Ilustración editorial de un arco y una balanza.");
      form.set(
        "file",
        new File(
          [
            new Uint8Array(
              await readFile("public/images/design-system-sample.webp"),
            ),
          ],
          "demostracion-editorial.webp",
          { type: "image/webp" },
        ),
      );
      const response = await fetch(
        `${process.env.APP_URL || "http://localhost:3000"}/api/media/images`,
        {
          method: "POST",
          headers: {
            origin: process.env.APP_URL || "http://localhost:3000",
            cookie: Array.from(jar, ([name, value]) => `${name}=${value}`).join(
              "; ",
            ),
          },
          body: form,
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      imageId = payload.assetId;
    }
    let author = check(
      await db
        .from("authors")
        .select("*")
        .eq("site_id", siteId)
        .eq("slug", "equipo-demo")
        .maybeSingle(),
    );
    if (!author)
      author = check(
        await db
          .from("authors")
          .insert({
            ...tenant,
            slug: "equipo-demo",
            display_name: `Equipo de demostración ${key}`,
            professional_title: "Perfil de prueba",
            biography:
              "Este perfil ilustra la presentación pública del equipo. No representa a una persona ni acredita experiencia profesional.",
            is_public: true,
          })
          .select("*")
          .single(),
      );
    if (!author) throw new Error("No se creó el perfil.");
    let taxonomy = check(
      await db
        .from("taxonomies")
        .select("id")
        .eq("site_id", siteId)
        .eq("code", "category")
        .maybeSingle(),
    );
    if (!taxonomy)
      taxonomy = check(
        await db
          .from("taxonomies")
          .insert({ ...tenant, code: "category", name: "Áreas de interés" })
          .select("id")
          .single(),
      );
    if (!taxonomy) throw new Error("Falta la taxonomía.");
    let term = check(
      await db
        .from("terms")
        .select("id")
        .eq("site_id", siteId)
        .eq("taxonomy_id", taxonomy.id)
        .eq("slug", "orientacion")
        .maybeSingle(),
    );
    if (!term)
      term = check(
        await db
          .from("terms")
          .insert({
            ...tenant,
            taxonomy_id: taxonomy.id,
            name: "Orientación inicial",
            slug: "orientacion",
          })
          .select("id")
          .single(),
      );
    if (!term) throw new Error("Falta el término.");
    const ids: Record<string, string> = {};
    async function publish(
      path: string,
      title: string,
      kind: string,
      template: string,
      blocks: Block[],
      extra: Partial<Snapshot> = {},
      locale = "es-CL",
    ) {
      const all = check(await db.rpc("get_cms_entries", { p_site_id: siteId }));
      let entry = all?.find(
        (e: { internal_name: string; locale: string }) =>
          e.internal_name === `Demo público ${path}` && e.locale === locale,
      );
      if (!entry && path === "/" && locale === "es-CL") {
        const root = check(
          await db
            .from("content_routes")
            .select("entry_id")
            .eq("site_id", siteId)
            .eq("locale", locale)
            .eq("path", "/")
            .maybeSingle(),
        );
        if (root)
          entry = all.find((e: { id: string }) => e.id === root.entry_id);
      }
      if (!entry)
        entry = check(
          await db
            .from("content_entries")
            .insert({
              ...tenant,
              kind,
              locale,
              internal_name: `Demo público ${path}`,
            })
            .select("id")
            .single(),
        );
      if (!entry) throw new Error("No se creó el contenido.");
      const revisions = check(
        await db
          .rpc("get_cms_revisions", { p_entry_id: entry.id })
          .order("revision_number", { ascending: false })
          .limit(1),
      );
      const payload = {
        title,
        excerpt:
          "Contenido de demostración guardado y publicado en Supabase local.",
        path,
        template_key: template,
        template_version: 1,
        seo: {
          title,
          description:
            "Sitio de demostración local de Leyer, con contenido persistido y aislado por estudio.",
        },
        blocks,
        ...extra,
      };
      const rev = check(
        await db.rpc("save_cms_entry", {
          p_entry_id: entry.id,
          p_expected_revision_id: revisions?.[0]?.id || null,
          p_internal_name: `Demo público ${path}`,
          p_parent_id: null,
          p_content: payload,
        }),
      );
      check(
        await db.rpc("set_revision_state", {
          p_revision_id: rev,
          p_state: "approved",
        }),
      );
      check(await db.rpc("publish_content_revision", { p_revision_id: rev }));
      ids[`${locale}:${path}`] = entry.id;
      return entry.id;
    }
    await publish(
      "/privacidad",
      "Privacidad de este entorno de demostración",
      "page",
      "legal",
      [
        rich([
          "Este sitio es un entorno local de demostración. Este texto explica únicamente el funcionamiento de sus formularios de prueba y no es una política lista para uso en producción.",
          "Las consultas enviadas se guardan en el estudio seleccionado, junto con el consentimiento y la versión de este texto. Las personas con permisos de consultas pueden revisarlas. No se envían notificaciones por correo.",
          "No incluyas datos sensibles ni documentos. Antes de utilizar el sitio con personas reales, el responsable debe definir y publicar su política, sus datos de contacto y sus plazos de conservación.",
        ]),
      ],
    );
    await publish(
      "/terminos",
      "Condiciones del entorno de demostración",
      "page",
      "legal",
      [
        rich([
          "Este entorno permite explorar el CMS de Leyer con datos de prueba. No ofrece asesoramiento jurídico ni representa un servicio profesional real.",
          "Enviar el formulario no constituye una relación de representación. Los contenidos y perfiles están identificados como demostración.",
        ]),
      ],
    );
    const landing = await publish(
      "/servicios/acompanamiento-familiar",
      "Acompañamiento en decisiones de familia",
      "landing",
      "service-landing",
      [
        b(
          "hero",
          {
            eyebrow: "Un primer espacio para ordenar tus preguntas",
            heading: "Los cambios importantes merecen claridad.",
            body: "Una landing de demostración sobre cómo presentar un servicio, explicar sus etapas y facilitar una primera consulta.",
            actions: [{ label: "Cuéntanos tu consulta", href: "#consulta" }],
          },
          imageId,
          "image-right",
        ),
        b("checklist", {
          heading: "Empezar por lo que necesitas.",
          items: [
            {
              text: "Comprender tu situación y las preguntas que quieres resolver.",
            },
            {
              text: "Identificar la información relevante para una primera conversación.",
            },
            {
              text: "Conocer los siguientes pasos antes de tomar una decisión.",
            },
            { text: "Acordar expectativas claras sobre el acompañamiento." },
          ],
        }),
        b("steps", {
          heading: "Un proceso que puedes comprender.",
          items: [
            {
              heading: "Escuchar",
              body: "Una conversación inicial para conocer tu consulta de forma general.",
            },
            {
              heading: "Orientar",
              body: "Identificar los temas que requieren revisión y la información necesaria.",
            },
            {
              heading: "Definir el siguiente paso",
              body: "Conversar sobre las alternativas de acompañamiento disponibles.",
            },
          ],
        }),
        b("faq", {
          heading: "Preguntas para empezar.",
          items: [
            {
              question: "¿Qué debo escribir en el primer contacto?",
              answer:
                "Una descripción general. Evita incluir documentos y datos sensibles innecesarios.",
            },
            {
              question: "¿El formulario envía documentos?",
              answer:
                "No. Esta primera etapa está destinada únicamente a consultas de texto.",
            },
            {
              question: "¿Este contenido corresponde a un estudio real?",
              answer:
                "No. Es contenido de demostración para verificar el sitio y el CMS.",
            },
          ],
        }),
      ],
      {
        excerpt:
          "Ordena tus preguntas, comprende el proceso y encuentra un siguiente paso.",
        cover_asset_id: imageId,
      },
    );
    await publish(
      "/servicios/asesoria-empresas",
      "Claridad para los acuerdos de tu empresa",
      "landing",
      "service-landing",
      [
        b(
          "hero",
          {
            eyebrow: "Una mirada práctica",
            heading: "Construir acuerdos empieza por entenderlos.",
            body: "Ejemplo de un servicio presentado de forma comprensible, sin promesas de resultados ni cifras inventadas.",
            actions: [{ label: "Hablemos de tu consulta", href: "#consulta" }],
          },
          imageId,
          "image-left",
        ),
        rich([
          "Esta landing demuestra cómo explicar un servicio con lenguaje claro y facilitar una consulta inicial. Su contenido no es asesoramiento jurídico.",
        ]),
      ],
      {
        excerpt:
          "Una presentación de servicios pensada para decisiones informadas.",
      },
    );
    const post = await publish(
      "/articulos/primera-consulta",
      "Cómo preparar una primera conversación con tu estudio",
      "post",
      "article",
      [
        rich([
          "Llegar con preguntas claras puede ayudarte a aprovechar una primera conversación. Este artículo de demostración muestra la experiencia editorial del sitio, no ofrece recomendaciones jurídicas sobre un caso.",
          "Anota qué necesitas comprender, qué plazos conoces y cuál es el objetivo de tu consulta. El formulario público permite un primer contacto sin adjuntar documentos.",
        ]),
        b("quote", {
          text: "Una conversación clara comienza con una pregunta bien planteada.",
          attribution: "Nota editorial de demostración",
        }),
        b(
          "image",
          { caption: "Ilustración del sistema visual de Leyer." },
          imageId,
        ),
        b("related_content", { heading: "Explora este servicio" }),
      ],
      {
        cover_asset_id: imageId,
        authors: [author.id],
        terms: [term.id],
        relations: [{ entry_id: landing, type: "related" }],
        excerpt:
          "Un punto de partida para ordenar tus preguntas y conocer la experiencia editorial.",
      },
    );
    await publish(
      "/articulos/acuerdos-claros",
      "El valor de explicar los siguientes pasos",
      "post",
      "article",
      [
        rich([
          "La claridad también se expresa en cómo se presenta la información. Un sitio puede ayudar a comprender qué ofrece un estudio, cómo iniciar una conversación y dónde encontrar contenido de interés.",
          "Este texto forma parte de los datos de verificación del proyecto.",
        ]),
      ],
      {
        authors: [author.id],
        terms: [term.id],
        excerpt: "Una lectura de demostración sobre comunicación y claridad.",
        relations: [{ entry_id: post, type: "related" }],
      },
    );
    await publish(
      "/el-estudio",
      "Una forma cercana de presentar el estudio",
      "page",
      "default",
      [
        b(
          "split_content",
          {
            eyebrow: "El estudio",
            heading: "Personas antes que trámites.",
            body: "Una página institucional puede explicar la forma de trabajo del estudio con un lenguaje sencillo. Este texto es de demostración y no atribuye cualificaciones ni resultados a personas reales.",
          },
          imageId,
          "image-left",
        ),
        b("related_content", { heading: "Conoce al equipo.", source: "team" }),
      ],
    );
    await publish(
      "/contacto",
      "Conversemos sobre lo que necesitas",
      "page",
      "contact",
      [],
      {
        excerpt:
          "Un primer contacto para orientar tu consulta, sin enviar documentos ni información sensible.",
      },
    );
    await publish("/equipo", "Personas que te acompañan", "page", "team", [], {
      excerpt:
        "Perfiles públicos del estudio. En este entorno se muestran perfiles de demostración.",
    });
    await publish(
      "/articulos",
      "Ideas para comprender mejor.",
      "page",
      "blog-index",
      [],
      {
        excerpt: "Lecturas y publicaciones del estudio, organizadas por temas.",
      },
    );
    await publish(
      "/servicios",
      "Orientación según tu momento.",
      "page",
      "services-index",
      [],
      {
        excerpt:
          "Explora las áreas de práctica y conoce cómo iniciar una conversación.",
      },
    );
    await publish(
      "/",
      key === "A"
        ? "Claridad para decidir. Cercanía para avanzar."
        : "Un siguiente paso, con más claridad.",
      "page",
      "home",
      [
        b(
          "hero",
          {
            eyebrow: `Estudio ${key} · entorno de demostración`,
            heading:
              key === "A"
                ? "Claridad para decidir. Cercanía para avanzar."
                : "Un siguiente paso, con más claridad.",
            body: "Un espacio para comprender lo que necesitas, ordenar tus preguntas y encontrar una forma de avanzar.",
            actions: [
              { label: "Conversemos", href: "/contacto" },
              { label: "Explorar servicios", href: "/servicios" },
            ],
          },
          imageId,
          "image-right",
        ),
        b("card_grid", {
          eyebrow: "Cómo podemos acompañarte",
          heading: "Cada momento tiene sus propias preguntas.",
          items: [
            {
              heading: "Familia y nuevos comienzos",
              body: "Un ejemplo de cómo presentar un servicio con claridad y cercanía.",
              href: "/servicios/acompanamiento-familiar",
            },
            {
              heading: "Acuerdos para tu empresa",
              body: "Una landing de demostración para explorar servicios orientados a empresas.",
              href: "/servicios/asesoria-empresas",
            },
            {
              heading: "Una primera orientación",
              body: "Cuéntanos tu consulta de forma general para conocer el siguiente paso.",
              href: "/contacto",
            },
          ],
        }),
        b(
          "split_content",
          {
            eyebrow: "Nuestra manera de conversar",
            heading: "Lo complejo también puede explicarse con sencillez.",
            body: "Este sitio demuestra cómo un estudio puede presentar sus servicios, compartir sus publicaciones y recibir consultas desde una misma base de contenido.",
            actions: [{ label: "Conocer el estudio", href: "/el-estudio" }],
          },
          imageId,
          "image-left",
        ),
        b("related_content", {
          eyebrow: "El equipo",
          heading: "Un trabajo que empieza por las personas.",
          source: "team",
        }),
        b("related_content", {
          eyebrow: "Para leer con calma",
          heading: "Ideas que ayudan a comprender.",
          source: "posts",
        }),
        b("cta", {
          heading: "El primer paso puede ser una conversación.",
          body: "Cuéntanos qué necesitas y encuentra un punto de partida.",
          actions: [{ label: "Iniciar una consulta", href: "/contacto" }],
        }),
      ],
      {
        excerpt: "Presentación pública del estudio de demostración.",
        cover_asset_id: imageId,
      },
    );
    await publish(
      "/",
      "A clearer next step.",
      "page",
      "home",
      [
        b(
          "hero",
          {
            eyebrow: `Studio ${key} · demonstration`,
            heading: "A clearer next step.",
            body: "A published English version, isolated from the Spanish editorial content.",
            actions: [{ label: "Contact the studio", href: "/contacto" }],
          },
          imageId,
        ),
      ],
      { excerpt: "English content for local language verification." },
      "en",
    );
    await publish(
      "/privacidad",
      "Privacy in this demonstration environment",
      "page",
      "legal",
      [
        rich([
          "This is a local demonstration. Submitted enquiries are stored privately for verification. Do not include sensitive information. A production privacy policy must be prepared by the responsible organization.",
        ]),
      ],
      {},
      "en",
    );
    for (const [locale, code, items] of [
      [
        "es-CL",
        "primary",
        [
          ["El estudio", "/el-estudio"],
          ["Servicios", "/servicios"],
          ["Equipo", "/equipo"],
          ["Artículos", "/articulos"],
        ],
      ],
      [
        "es-CL",
        "footer",
        [
          ["Contacto", "/contacto"],
          ["Privacidad", "/privacidad"],
          ["Condiciones", "/terminos"],
        ],
      ],
      [
        "en",
        "primary",
        [
          ["Home", "/"],
          ["Privacy", "/privacidad"],
        ],
      ],
    ] as [string, string, string[][]][]) {
      let menu = check(
        await db
          .from("menus")
          .select("id")
          .eq("site_id", siteId)
          .eq("locale", locale)
          .eq("code", code)
          .maybeSingle(),
      );
      if (!menu)
        menu = check(
          await db
            .from("menus")
            .insert({
              ...tenant,
              code,
              locale,
              name:
                code === "primary" ? "Navegación principal" : "Pie de página",
              is_public: true,
            })
            .select("id")
            .single(),
        );
      if (!menu) throw new Error("No se creó el menú.");
      for (const [position, [label, path]] of items.entries()) {
        const existing = check(
          await db
            .from("menu_items")
            .select("id")
            .eq("menu_id", menu.id)
            .eq("label", label)
            .maybeSingle(),
        );
        const row = {
          ...tenant,
          menu_id: menu.id,
          label,
          position,
          entry_id: ids[`${locale}:${path}`],
        };
        if (existing)
          check(await db.from("menu_items").update(row).eq("id", existing.id));
        else check(await db.from("menu_items").insert(row));
      }
    }
    output[key] = {
      organizationId: orgId,
      siteId,
      imageId,
      authorId: author.id,
      termId: term.id,
      entries: ids,
      basePath: `/sitios/${org.slug}/principal`,
    };
  }
  await writeFile(
    ".local/public-fixtures.json",
    JSON.stringify(output, null, 2),
    { mode: 0o600 },
  );
  console.log(
    "Dos sitios de demostración preparados con páginas, landings, artículos, equipo, menús, idiomas y políticas de prueba. El estudio principal no se modificó.",
  );
}
main().catch((e) => {
  console.error(
    e instanceof Error ? e.message : "No se pudo preparar el entorno.",
  );
  process.exitCode = 1;
});
