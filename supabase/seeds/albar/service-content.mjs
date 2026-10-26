import { materializeServiceContent } from '../../../lib/content/service-template.ts';

// Build-time materialization: the generated SQL stores every editorial element.
export function editableService(entry) {
  if (entry.template_key !== 'service-landing') return entry;
  const snapshot = materializeServiceContent({
    ...entry, template_version: 1, cover_asset_id: null, seo: {}, authors: [], terms: [], relations: [],
    blocks: entry.blocks.map((block, index) => ({ ...block, key: String(index), assets: [] })),
  }, { contactPath: '/contacto', whatsappHref: 'https://wa.me/{{whatsapp}}' });
  return { ...entry, template_version: 2, blocks: snapshot.blocks.map(source => { const block = { ...source }; delete block.key; return ({
    ...block,
    ...(block.type === 'hero' ? { asset_key: block.asset_key || 'claudia-perfil', data: { ...block.data, visual: 'image' } } : {}),
  }); }) };
}
