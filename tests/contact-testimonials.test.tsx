import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentBlocks } from "../components/public/content-blocks";
import type { Block } from "../lib/admin/types";

const block = (key: string, type: string, data: Block["data"]): Block => ({ key, type, data, assets: [], variant: "default", schema_version: 1 });
const faq = (key: string, hidden = false) => block(key, "faq", { hidden, heading: `FAQ ${key}`, items: [{ question: "Pregunta", answer: "Respuesta" }] });
const render = (blocks: Block[], extra = {}) => renderToStaticMarkup(createElement(ContentBlocks, { blocks, link: () => null, image: () => null, ...extra }));

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
