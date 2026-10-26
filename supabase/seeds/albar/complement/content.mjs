import { readFileSync } from 'node:fs';
import { editableService } from '../service-content.mjs';
import { manifest as base } from '../content.mjs';

export const source = JSON.parse(readFileSync(new URL('./source.json', import.meta.url), 'utf8'));
const labels = {
  compensacion: 'Compensación económica', cuidado: 'Cuidado personal', relacion: 'Relación directa y regular',
  laboral_personas: 'Derecho laboral', civil: 'Derecho civil', escrituras: 'Escrituras públicas',
  laboral_empresas: 'Derecho laboral', corporativo: 'Derecho corporativo y comercial',
  propiedad: 'Propiedad intelectual', contratacion: 'Contratación pública', preventiva: 'Asesoría preventiva empresarial',
};
const allPaths = new Set([...base.entries, ...source.pages].map(p => p.path));
const text = node => typeof node === 'string' ? node : node.children.map(text).join('');
const normalized = node => text(node).replace(/\s+/g, ' ').trim();
function findAll(node, tag) {
  return typeof node === 'string' ? [] : [...(node.tag === tag ? [node] : []), ...node.children.flatMap(c => findAll(c, tag))];
}
function href(value) {
  if (!value) return null;
  if (value === '#contacto' || value === '#contact') return '/contacto';
  if (value === '/empresas/derecho-corporativo-comercial') return '/empresas/derecho-corporativo-y-comercial';
  if (value.startsWith('https://www.albarabogados.cl/')) value = new URL(value).pathname;
  return allPaths.has(value) || /^https:\/\/wa\.me\/\d{8,15}$/.test(value) ? value : null;
}
const inlineTags = new Set(['a', 'span', 'strong', 'b', 'em', 'i', 'u', 'br', 'small']);
function inline(node, marks = []) {
  if (typeof node === 'string') return node ? [{ type: 'text', text: node.replace(/\s+/g, ' '), ...(marks.length ? { marks } : {}) }] : [];
  if (node.tag === 'br') return [{ type: 'hardBreak' }];
  const mark = ['b', 'strong'].includes(node.tag) ? { type: 'bold' } : ['em', 'i'].includes(node.tag) ? { type: 'italic' }
    : node.tag === 'u' ? { type: 'underline' } : node.tag === 'a' && href(node.attrs.href) ? { type: 'link', attrs: { href: href(node.attrs.href) } } : null;
  return node.children.flatMap(c => inline(c, mark ? [...marks, mark] : marks));
}
function children(nodes) {
  const result = [];
  let pending = [];
  function flush() {
    if (pending.some(n => n.type === 'text' && n.text.trim())) result.push({ type: 'paragraph', content: pending });
    pending = [];
  }
  for (const node of nodes) {
    if (typeof node === 'string' || inlineTags.has(node.tag)) pending.push(...inline(node));
    else { flush(); result.push(...blocks(node)); }
  }
  flush();
  return result;
}
function blocks(node) {
  if (typeof node === 'string') return children([node]);
  if (/^h[1-6]$/.test(node.tag)) return [{ type: 'heading', attrs: { level: Math.min(4, Math.max(2, Number(node.tag[1]))) }, content: inline(node) }];
  if (node.tag === 'ul' || node.tag === 'ol') return [{ type: node.tag === 'ul' ? 'bulletList' : 'orderedList', content: node.children.filter(c => typeof c !== 'string' && c.tag === 'li').map(c => ({ type: 'listItem', content: children(c.children) })) }];
  if (node.tag === 'blockquote') return [{ type: 'blockquote', content: children(node.children) }];
  if (node.tag === 'hr') return [{ type: 'horizontalRule' }];
  return children(node.children);
}
const block = (type, data) => ({ type, schema_version: 1, variant: 'default', data });
export const originalEntries = source.pages.map(page => {
  const article = page.key === 'despido';
  const first = page.sections[0];
  const paragraphs = findAll(first, 'p');
  const intro = article ? paragraphs : paragraphs.slice(1);
  if (!intro.length) throw Error('Falta introducción original: ' + page.key);
  const entryBlocks = article ? [] : [block('hero', {
    eyebrow: normalized(paragraphs[0]), heading: page.title, body: intro.map(normalized).join('\n\n'),
    actions: findAll(first, 'a').flatMap(a => href(a.attrs.href) ? [{ label: normalized(a), href: href(a.attrs.href) }] : []),
  })];
  for (const section of page.sections.slice(article ? 0 : 1)) {
    const actions = findAll(section, 'a').flatMap(a => href(a.attrs.href) ? [{ label: normalized(a), href: href(a.attrs.href) }] : []);
    const headings = findAll(section, 'h2');
    if (actions.length && headings.length === 1 && !findAll(section, 'h3').length) entryBlocks.push(block('cta', {
      heading: normalized(headings[0]), body: findAll(section, 'p').map(normalized).join('\n\n'), actions,
    }));
    else entryBlocks.push(block('rich_text', { document: { type: 'doc', content: children(section.children) } }));
  }
  return {
    key: page.key, kind: article ? 'post' : 'landing', path: page.path, parent: page.parent,
    title: page.title, label: labels[page.key] || page.title, excerpt: normalized(intro[0]),
    template_key: article ? 'article' : 'service-landing', terms: [page.term],
    relations: article ? ['laboral_personas'] : page.key === 'laboral_personas' ? ['despido'] : [],
    author: article ? 'jorge' : 'claudia', published_date: page.published_date || null,
    source_url: page.source_url, source_html_sha256: page.html_sha256, blocks: entryBlocks,
  };
});
export const entries = originalEntries.map(editableService);
const byKey = new Map([...base.entries, ...entries].map(e => [e.key, e]));
const menuItem = key => ({ entry: key, label: entries.find(e => e.key === key)?.label || ({ familia: 'Derecho de familia', divorcios: 'Divorcios', alimentos: 'Pensión de alimentos', liquidacion_persona: 'Insolvencia y reemprendimiento', liquidacion_empresa: 'Insolvencia y reemprendimiento' })[key] });
const primary = structuredClone(base.menus.find(m => m.code === 'primary'));
primary.items.find(i => i.entry === 'personas').children = [
  { ...menuItem('familia'), children: ['divorcios', 'compensacion', 'alimentos', 'cuidado', 'relacion'].map(menuItem) },
  ...['laboral_personas', 'liquidacion_persona', 'civil', 'escrituras'].map(menuItem),
];
primary.items.find(i => i.entry === 'empresas').children = ['liquidacion_empresa', 'laboral_empresas', 'corporativo', 'propiedad', 'contratacion', 'preventiva'].map(menuItem);
const patches = ['personas', 'empresas', 'familia'].map(key => ({ key, blocks: [block('card_grid', {
  heading: 'Más áreas en las que podemos ayudarte',
  items: entries.filter(e => e.parent === key).map(e => ({ heading: e.label, body: e.excerpt, href: e.path, link_label: 'Conocer el servicio' })),
})] }));
export const manifest = {
  extension_key: 'original-web-v1', base_seed_key: base.seed_key,
  captured_at: source.captured_at,
  author: { slug: 'jorge', display_name: 'Jorge', biography: '', professional_title: '' },
  terms: [
    { key: 'laboral', name: 'Derecho laboral', slug: 'derecho-laboral' },
    { key: 'civil', name: 'Derecho civil y escrituras', slug: 'derecho-civil' },
    { key: 'corporativo', name: 'Derecho corporativo y comercial', slug: 'derecho-corporativo-y-comercial' },
    { key: 'propiedad', name: 'Propiedad intelectual', slug: 'propiedad-intelectual' },
    { key: 'contratacion', name: 'Contratación pública', slug: 'contratacion-publica' },
  ], entries, patches, menu: primary,
  redirects: [{ from: '/empresas/derecho-corporativo-comercial', entry: 'corporativo' }],
};
// Fail at generation rather than creating broken cross-references in SQL.
for (const e of entries) for (const key of [e.parent, ...e.relations]) if (!byKey.has(key)) throw Error('Referencia inexistente: ' + key);
