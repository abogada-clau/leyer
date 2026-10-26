import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContentBlocks } from '../components/public/content-blocks';
import type { Block } from '../lib/admin/types';
// The editorial catalog is build input, not part of the client bundle.
import { manifest } from '../supabase/seeds/albar/complement/content.mjs';

test('todos los copys nuevos se renderizan con los componentes reales, sin HTML anidado inválido', () => {
  for (const entry of manifest.entries) {
    const blocks: Block[] = entry.blocks.map((block: Block, index: number) => ({ ...block, key: String(index), assets: [] }));
    const html = renderToStaticMarkup(createElement(ContentBlocks, {
      blocks, firstHeroAsTitle: entry.kind === 'landing', link: (href: unknown) => typeof href === 'string' ? href : null,
      image: () => null,
    }));
    assert.equal((html.match(/<h1\b/g) || []).length, entry.kind === 'landing' ? 1 : 0, entry.key);
    assert(!/<p[^>]*>\s*<(?:ul|ol|div|h[1-6])/.test(html), entry.key);
    assert(!/<script\b|javascript:|onerror=/.test(html), entry.key);
    if (entry.kind === 'post') {
      assert.match(html, /¿Cuándo un despido puede considerarse injustificado\?/);
      assert.match(html, /Indemnización por años de servicio/);
    }
  }
});
