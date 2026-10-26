import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { manifest, source, originalEntries } from '../supabase/seeds/albar/complement/content.mjs';
import { manifest as initial } from '../supabase/seeds/albar/content.mjs';

if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:57321') throw Error('Solo Supabase local.');
const accounts = JSON.parse(readFileSync('.local/admin-accounts.json', 'utf8'));
const seedKey = 'albar-complement-verification-v1';
const rewrite = sql => sql.replaceAll('albar-abogados-editorial-v1', seedKey).replaceAll('"albar-abogados"', '"albar-complement-verification"');
const body = sql => rewrite(sql).replace(/^begin;$/m, '').replace(/commit;\s*$/i, '');
const base = body(readFileSync('supabase/seeds/albar/seed.sql', 'utf8'));
const complement = body(readFileSync('supabase/seeds/albar/complement/seed.sql', 'utf8'));
const args = ['exec', '-i', 'supabase_db_leyer', 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'];
const run = sql => execFileSync('docker', args, { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 3e6 });
function reject(sql, pattern) {
  const result = spawnSync('docker', args, { input: sql, encoding: 'utf8', maxBuffer: 3e6 });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, pattern);
}
const config = (name, value) => `select set_config('${name}',$CFG$${JSON.stringify(value)}$CFG$,true);`;
const setup = (publish = false) => "begin;truncate public.sites cascade;insert into public.sites(name) values('ALBAR Abogados');" + config('leyer.albar_config', {
  actor_email: accounts.admin.email, domain: 'albar-complement.test', publish, activate_site: publish,
  legal_review_confirmed: publish, privacy_review_confirmed: publish, privacy_controller: 'Prueba local',
  privacy_processors: 'Supabase local', retention_days: 90,
}) + base + config('leyer.albar_complement_config', { actor_email: accounts.admin.email });
const context = `select set_config('leyer.complement_site',(select site_id::text from private.cms_seed_registry where seed_key='${seedKey}'),true);`;
const site = `current_setting('leyer.complement_site')::uuid`;
const ext = `(select state->'extensions'->'original-web-v1' from private.cms_seed_registry where seed_key='${seedKey}')`;
const entry = key => `(${ext}->'entries'->'${key}'->>'id')::uuid`;
const check = (condition, message) => `do $ASSERT$ begin if not (${condition}) then raise exception '${message}';end if;end;$ASSERT$;`;
const repeat = 'drop table albar_complement_source,albar_complement_config;' + complement;
const actor = `select set_config('request.jwt.claims','{"sub":"${accounts.admin.id}","role":"authenticated"}',true);select set_config('request.jwt.claim.sub','${accounts.admin.id}',true);`;

const sourceText = n => typeof n === 'string' ? n : n.children.map(sourceText).join('');
const richText = n => n.type === 'text' ? n.text : (n.content || []).map(richText).join('');
const blockText = b => b.type === 'rich_text' ? richText(b.data.document) : [b.data.eyebrow, b.data.heading, b.data.body, ...(b.data.actions || []).map(a => a.label)].filter(Boolean).join('');
const compact = s => s.replace(/\s/g, '');

test('12 contenidos completos conservan el copy original, sin HTML ejecutable ni enlaces internos rotos', () => {
  assert.equal(manifest.entries.length, 12);
  assert.equal(manifest.entries.filter(e => e.kind === 'landing').length, 11);
  const paths = new Set([...initial.entries, ...manifest.entries].map(e => e.path));
  assert.equal(paths.size, 37);
  for (const e of manifest.entries) {
    const original = source.pages.find(p => p.key === e.key);
    const editorial = originalEntries.find(entry => entry.key === e.key);
    assert.equal(compact(editorial.blocks.map(blockText).join('')), compact(original.sections.map(sourceText).join('')), e.key);
    const composed = compact(e.blocks.map(blockText).join(''));
    for (const block of editorial.blocks) assert(composed.includes(compact(blockText(block))), e.key + ': copy original conservado');
    assert.match(e.source_html_sha256, /^[a-f0-9]{64}$/);
    assert.match(e.source_url, /^https:\/\/www\.albarabogados\.cl\//);
  }
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
      if (key === 'href' && typeof item === 'string') assert(paths.has(item) || item === 'https://wa.me/{{whatsapp}}' || /^https:\/\/wa\.me\/\d{8,15}$/.test(item), item);
      walk(item);
    }
  }
  walk(manifest);
  assert.equal(manifest.entries.find(e => e.key === 'despido').published_date, '2026-07-08');
});

test('crea 37 entradas y 43 revisiones, con jerarquía, autoría y fecha originales; todo en revisión', () => {
  run(setup() + complement + context +
    check(`(select count(*)=37 from public.content_entries where site_id=${site})`, '37 entradas') +
    check(`(select count(*)=43 from public.content_revisions where site_id=${site})`, '43 revisiones') +
    check(`not exists(select 1 from public.content_entries where site_id=${site} and published_revision_id is not null)`, 'No publicación implícita') +
    check(`exists(select 1 from public.content_entries e join public.content_revisions r on r.entry_id=e.id join public.revision_authors ra on ra.revision_id=r.id join public.authors a on a.id=ra.author_id where e.id=${entry('despido')} and a.display_name='Jorge' and (e.first_published_at at time zone 'America/Santiago')::date='2026-07-08')`, 'Autor y fecha') +
    check(`exists(select 1 from public.menu_items child join public.menu_items parent on parent.id=child.parent_id where child.entry_id=${entry('compensacion')} and parent.entry_id=(select parent_id from public.content_entries where id=${entry('compensacion')}))`, 'Submenú familia') +
    check(`(select pg_temp.albar_hash(jsonb_build_object('settings',s.settings,'domain',s.domain,'name',s.name,'default_locale',s.default_locale))=r.state->>'site_hash' from public.sites s join private.cms_seed_registry r on r.site_id=s.id where s.id=${site})`, 'Configuración intacta') +
    `set local role anon;` + check(`not exists(select 1 from public.content_entries where site_id=${site})`, 'Borradores aislados') + 'reset role;rollback;');
});

test('repetir no duplica entradas, revisiones, categorías ni elementos del menú', () => {
  run(setup() + complement + context + `select set_config('leyer.complement_menu_hash',${ext}->>'menu_hash',true);` + repeat +
    check(`(select count(*)=43 from public.content_revisions where site_id=${site})`, 'Idempotencia') +
    check(`${ext}->>'menu_hash'=current_setting('leyer.complement_menu_hash')`, 'Menú estable') +
    check(`(select count(*)=7 from public.terms where site_id=${site})`, '7 categorías') + 'rollback;');
});

test('sobre un sitio publicado conserva sus versiones públicas y crea nuevas revisiones privadas', () => {
  run(setup(true) + complement + context +
    check(`(select count(*)=25 from public.content_entries where site_id=${site} and published_revision_id is not null)`, 'Conservar 25 publicaciones') +
    check(`not exists(select 1 from public.content_entries where site_id=${site} and kind='landing' and id in (select (value->>'id')::uuid from jsonb_each(${ext}->'entries')) and published_revision_id is not null)`, 'Nuevas landings privadas') +
    `set local role anon;` + check(`(select count(*)=25 from public.content_entries where site_id=${site})`, 'Solo versiones públicas') + 'reset role;rollback;');
});

test('publicación explícita, fecha histórica y redirección real; repetir no crea revisiones', () => {
  run(setup(true) + config('leyer.albar_complement_config', { actor_email: accounts.admin.email, publish: true, content_review_confirmed: true }) + complement + context + repeat +
    check(`(select count(*)=37 from public.content_entries where site_id=${site} and published_revision_id is not null)`, '37 publicaciones') +
    check(`(select count(*)=43 from public.content_revisions where site_id=${site})`, 'Sin nuevas revisiones') +
    check(`exists(select 1 from public.redirects where site_id=${site} and from_path='/empresas/derecho-corporativo-comercial' and target_entry_id=${entry('corporativo')} and status_code=301)`, 'Redirección corporativo') + 'rollback;');
});

test('un editor conserva su revisión y bloquea la repetición del complemento', () => {
  reject(setup() + complement + context + actor +
    `select public.save_content_revision(${entry('civil')},(${ext}->'entries'->'civil'->>'last_revision_id')::uuid,public.get_cms_snapshot((${ext}->'entries'->'civil'->>'last_revision_id')::uuid)||'{"title":"Edición posterior del cliente"}');` + repeat, /Conflicto editorial/);
});

test('conserva cambios manuales de menú, estado editorial y programación', () => {
  const start = setup() + complement + context;
  reject(start + `update public.menu_items set label='Menú editado' where site_id=${site};` + repeat, /menú editado/);
  reject(start + `update public.content_revisions set editorial_state='draft' where id=(${ext}->'entries'->'civil'->>'last_revision_id')::uuid;` + repeat, /Conflicto editorial/);
  reject(start + `insert into public.scheduled_publications(site_id,entry_id,revision_id,run_at,requested_by) select site_id,id,(${ext}->'entries'->'civil'->>'last_revision_id')::uuid,now()+interval '30 days','${accounts.admin.id}' from public.content_entries where id=${entry('civil')};` + repeat, /publicación programada/);
});

test('bloquea actores sin roles, publicación no revisada e identidades inexistentes', () => {
  reject(setup() + config('leyer.albar_complement_config', { actor_email: accounts.pending.email }) + complement, /administrador activo/);
  reject(setup() + config('leyer.albar_complement_config', { actor_email: accounts.admin.email, publish: true }) + complement, /revisión del contenido/);
  reject(setup() + complement + context + `update private.cms_seed_registry set state=jsonb_set(state,'{extensions,original-web-v1,entries,civil,id}',to_jsonb(gen_random_uuid()::text)) where seed_key='${seedKey}';` + repeat, /Identidad ajena/);
});

test('el seed inicial no puede revertir el menú después de añadir el complemento', () => {
  reject(setup() + complement + 'drop table albar_seed_config,albar_seed_source;' + base, /complemento editorial/);
});
