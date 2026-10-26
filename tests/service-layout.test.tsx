import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentBlocks } from "../components/public/content-blocks";
import { manifest as base } from "../supabase/seeds/albar/content.mjs";
import { manifest as complement } from "../supabase/seeds/albar/complement/content.mjs";
import type { Block } from "../lib/admin/types";

function textContent(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

test("service composition preserves all existing paragraphs and links across the service catalog", () => {
  for (const entry of [...base.entries, ...complement.entries].filter(entry => entry.template_key === "service-landing")) {
    const blocks = entry.blocks.map((block: Block, index: number) => ({ ...block, key: String(index), assets: [] }));
    const props = { blocks, firstHeroAsTitle: true, link: (href: unknown) => typeof href === "string" ? href : null, image: () => null };
    const original = renderToStaticMarkup(createElement(ContentBlocks, props));
    const composed = renderToStaticMarkup(createElement(ContentBlocks, { ...props, serviceLayout: true }));
    const composedText = textContent(composed);
    for (const match of original.matchAll(/<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
      const text = textContent(match[2]);
      // Step markers and reflowed rich-text groups may introduce whitespace only.
      if (text) assert(composedText.includes(text), `${entry.key}: missing ${text.slice(0, 90)}`);
    }
    const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]).sort();
    assert.deepEqual(hrefs(composed), hrefs(original), entry.key);
    assert.equal((composed.match(/<h1\b/g) || []).length, 1, entry.key);
    assert(!/<p[^>]*>\s*<(?:ul|ol|div|h[1-6])/.test(composed), entry.key);
  }
});
