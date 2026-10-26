import { readFile, writeFile } from 'node:fs/promises';
import { manifest } from '../supabase/seeds/albar/complement/content.mjs';
const root = new URL('../supabase/seeds/albar/', import.meta.url);
const template = await readFile(new URL('complement/import.template.sql', root), 'utf8');
const baseTemplate = await readFile(new URL('import.template.sql', root), 'utf8');
const helpers = baseTemplate.slice(baseTemplate.indexOf('create or replace function pg_temp.albar_hash'), baseTemplate.indexOf('do $ALBAR_IMPORT$'));
const payload = JSON.stringify(manifest, null, 2);
if (payload.includes('$ALBAR_COMPLEMENT$')) throw Error('Delimitador SQL en el contenido.');
const output = template.replace('__HELPERS__', () => helpers).replace('__PAYLOAD__', () => payload);
const target = new URL('complement/seed.sql', root);
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== output) throw Error('Regenera el seed complementario.');
} else await writeFile(target, output);
console.log('Complemento ALBAR:', manifest.entries.length, 'contenidos,', manifest.patches.length, 'páginas ampliadas.');
