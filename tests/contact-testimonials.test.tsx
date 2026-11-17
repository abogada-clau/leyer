import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentBlocks } from "../components/public/content-blocks";
import type { Block } from "../lib/admin/types";
import { contentLink } from "../lib/public/paths";
import type { PublicContext } from "../lib/public/types";

const block = (key: string, type: string, data: Block["data"]): Block => ({ key, type, data, assets: [], variant: "default", schema_version: 1 });
const faq = (key: string, hidden = false) => block(key, "faq", { hidden, heading: `FAQ ${key}`, items: [{ question: "Pregunta", answer: "Respuesta" }] });
const render = (blocks: Block[], extra = {}) => renderToStaticMarkup(createElement(ContentBlocks, { blocks, link: () => null, image: () => null, ...extra }));

test("WhatsApp links use the current section and retain custom text", () => {
  const site = { id: "site", name: "ALBAR Abogados", domain: "albar.example", default_locale: "es-CL", settings: { contact_path: "/consulta" } };
  const context = (path: string): PublicContext => ({ site, path, requestPath: path, locale: "es-CL", origin: "https://albar.example", local: false });
  const href = "https://wa.me/56926044751";
  const text = (path: string, target = href) => new URL(contentLink(context(path), target)!).searchParams.get("text");
  assert.equal(text("/"), "Hola, visité el sitio de ALBAR Abogados y quisiera orientación sobre mi caso.");
  assert.equal(text("/consulta"), "Hola, quisiera coordinar una consulta con ALBAR Abogados.");
  assert.equal(text("/empresas", "https://api.whatsapp.com/send?phone=56926044751"), "Hola, quisiera recibir asesoría legal para mi empresa.");
  assert.equal(contentLink(context("/"), href + "?text=Mensaje%20del%20CMS"), href + "?text=Mensaje%20del%20CMS");
  assert.equal(contentLink(context("/"), "https://wa.me.example/56926044751"), "https://wa.me.example/56926044751");
});

test("contact form appears once before the first visible FAQ, or at the end when FAQs are hidden", () => {
  const form = createElement("section", { id: "contact-proof" }, "Formulario real");
  const intro = block("intro", "split_content", { heading: "Introducción", body: "Texto inicial" });
  const html = render([intro, faq("hidden", true), faq("first"), faq("second")], { beforeFaq: form });
  assert(html.indexOf("Introducción") < html.indexOf("contact-proof"));
  assert(html.indexOf("contact-proof") < html.indexOf("FAQ first"));
  assert.equal((html.match(/id="contact-proof"/g) || []).length, 1);
  assert.doesNotMatch(html, /FAQ hidden/);
  const noFaq = render([intro, faq("hidden", true)], { beforeFaq: form });
  assert(noFaq.indexOf("Introducción") < noFaq.indexOf("contact-proof"));
  assert.equal((noFaq.match(/id="contact-proof"/g) || []).length, 1);
});

test("empty testimonials produce no public section; populated quotes are escaped and initially readable", () => {
  const testimonials = block("testimonials", "testimonials", { heading: "Experiencias compartidas" });
  assert.doesNotMatch(render([testimonials]), /Experiencias compartidas|carrusel/);
  assert.match(render([testimonials], { preview: true }), /admin\/testimonials/);
  const html = render([testimonials], { testimonialItems: [{ id: "example", author_name: "Ejemplo privado", quote: '<script>alert("x")</script> Texto de prueba', context: "Prueba" }] });
  assert.match(html, /Experiencias compartidas/);
  assert.match(html, /Ejemplo privado/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|Testimonio siguiente/);
});
