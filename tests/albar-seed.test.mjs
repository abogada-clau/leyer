import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {manifest} from '../supabase/seeds/albar/content.mjs';

if(process.env.NEXT_PUBLIC_SUPABASE_URL!=='http://127.0.0.1:57321') throw Error('Solo se admiten pruebas con Supabase local.');
const accounts=JSON.parse(readFileSync('.local/admin-accounts.json','utf8'));
const original=readFileSync('supabase/seeds/albar/seed.sql','utf8');
const sql=original.replaceAll('albar-abogados-editorial-v1','albar-seed-verification-v1').replaceAll('"slug": "albar-abogados"','"slug": "albar-seed-verification"');
const defaults={actor_email:accounts.super.email,domain:'albar-verification.test'};
function config(extra={}){return `do $cfg$ begin perform set_config('leyer.albar_config',$json$${JSON.stringify({...defaults,...extra})}$json$,false);end;$cfg$;\n`;}
function run(input){return execFileSync('docker',['exec','-i','supabase_db_leyer','psql','-X','-q','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres'],{input,encoding:'utf8',maxBuffer:2*1024*1024,stdio:['pipe','pipe','pipe']});}
function reject(input,pattern){const r=spawnSync('docker',['exec','-i','supabase_db_leyer','psql','-X','-q','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres'],{input,encoding:'utf8',maxBuffer:2*1024*1024});assert.notEqual(r.status,0);assert.match(r.stderr,pattern);}
const finish=sql.replace(/commit;\s*$/i,'');
const body=finish.replace(/^begin;$/m,'');
const context=`select set_config('leyer.test_site',(select site_id::text from private.cms_seed_registry where seed_key='albar-seed-verification-v1'),true);`;
const check=(condition,message)=>`do $assert$ begin if not (${condition}) then raise exception '${message}';end if;end;$assert$;`;

test('el catálogo cubre las 13 capturas, rutas únicas y enlaces internos existentes',()=>{
  const paths=new Set(manifest.entries.map(e=>e.path));
  assert.equal(paths.size,25);
  const covered=new Set(manifest.entries.flatMap(e=>e.captures));
  assert.deepEqual([...covered].sort((a,b)=>a-b),Array.from({length:13},(_,i)=>i+1));
  function walk(value){if(!value||typeof value!=='object')return;for(const [key,v]of Object.entries(value)){if(key==='href'&&typeof v==='string'&&v.startsWith('/'))assert(paths.has(v),`Enlace inexistente: ${v}`);walk(v);}}
  walk(manifest);
  for(const e of manifest.entries){assert(e.title&&e.excerpt&&e.strategy.job);for(const b of e.blocks)if(b.type==='faq')for(const item of b.data.items)assert(item.question&&item.answer.length>25);}
  assert.equal(manifest.entries.find(e=>e.key==='liquidacion').variants.length,3);
});
test('primera importación, jerarquías, revisiones y aislamiento anónimo',()=>{
  const output=run(config()+finish+context+
    check(`(select count(*)=25 from public.content_entries where site_id=current_setting('leyer.test_site')::uuid)`,'25 contenidos')+
    check(`(select count(*)=28 from public.content_revisions where site_id=current_setting('leyer.test_site')::uuid)`,'28 revisiones')+
    check(`not exists(select 1 from public.content_entries where site_id=current_setting('leyer.test_site')::uuid and published_revision_id is not null)`,'No publicar por defecto')+
    check(`(select count(*)=25 from public.content_entries e join public.content_revisions r on r.entry_id=e.id where e.site_id=current_setting('leyer.test_site')::uuid and r.editorial_state='in_review')`,'Revisión editorial')+
    `set local role anon;`+check(`not exists(select 1 from public.content_entries where site_id=current_setting('leyer.test_site')::uuid)`,'RLS protege borradores')+`reset role;rollback;`);
  assert.match(output,/albar-seed-verification/);
});
test('repetir el SQL en una sesión no duplica revisiones ni menús',()=>{
  run(config()+finish+`drop table albar_seed_config,albar_seed_source;`+body+context+
    check(`(select count(*)=28 from public.content_revisions where site_id=current_setting('leyer.test_site')::uuid)`,'Idempotencia de revisiones')+
    check(`(select count(*)=2 from public.menus where site_id=current_setting('leyer.test_site')::uuid)`,'Idempotencia de menús')+`rollback;`);
});
test('rehúsa actores sin rol y publicación sin revisión confirmada',()=>{
  reject(config({actor_email:accounts.pending.email})+sql,/super_admin activo/);
  reject(config({publish:true,activate_site:true})+sql,/confirma revisión jurídica/);
});
test('una edición posterior del sitio aborta toda la reimportación',()=>{
  reject(config()+finish+context+`update public.sites set settings=settings||'{"public_name":"Edición manual"}' where id=current_setting('leyer.test_site')::uuid;drop table albar_seed_config,albar_seed_source;`+body,/configuración del sitio fue editada/);
});
test('una nueva revisión ajena se conserva y bloquea la reimportación',()=>{
  reject(config()+finish+context+`do $edit$ declare entry uuid;latest uuid;data jsonb;actor uuid;begin
    select id into actor from public.profiles where id='${accounts.super.id}'::uuid;
    perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
    select e.id,r.id into entry,latest from public.content_entries e join public.content_revisions r on r.entry_id=e.id where e.site_id=current_setting('leyer.test_site')::uuid and r.path='/' order by r.revision_number desc limit 1;
    select pg_temp.albar_content(value,(select jsonb_object_agg(key,value->>'id') from private.cms_seed_registry r,jsonb_each(r.state->'entries') where r.seed_key='albar-seed-verification-v1'),(select state->'terms' from private.cms_seed_registry where seed_key='albar-seed-verification-v1'),(select (state->>'author_id')::uuid from private.cms_seed_registry where seed_key='albar-seed-verification-v1'),'{}',(select config from albar_seed_config)) into data from albar_seed_source,jsonb_array_elements(payload->'entries') where value->>'key'='home';
    perform public.save_content_revision(entry,latest,data||'{"title":"Trabajo posterior del editor"}');end;$edit$;
    drop table albar_seed_config,albar_seed_source;`+body,/Conflicto editorial en home/);
});
test('respeta cambios de estado editorial, menús y programación posteriores',()=>{
  const prepare=config()+finish+context;
  const next=`drop table albar_seed_config,albar_seed_source;`+body;
  reject(prepare+`update public.content_revisions set editorial_state='draft' where site_id=current_setting('leyer.test_site')::uuid and path='/';`+next,/estado de revisión cambió/);
  reject(prepare+`update public.menu_items set label='Etiqueta editada' where site_id=current_setting('leyer.test_site')::uuid;`+next,/menú primary editado/);
  reject(prepare+`insert into public.scheduled_publications(organization_id,site_id,entry_id,revision_id,run_at,requested_by) select e.organization_id,e.site_id,e.id,r.id,now()+interval '30 days','${accounts.super.id}' from public.content_entries e join public.content_revisions r on r.entry_id=e.id where e.site_id=current_setting('leyer.test_site')::uuid and r.path='/';`+next,/publicación programada/);
});
test('rechaza recursos públicos de otro sitio y protege el registro privado',()=>{
  const foreign=execFileSync('docker',['exec','supabase_db_leyer','psql','-X','-At','-U','postgres','-d','postgres','-c',"select id from public.media_assets where bucket_id='cms-public' limit 1"],{encoding:'utf8'}).trim();
  assert(foreign);
  reject(config({assets:{'claudia-perfil':foreign}})+sql,/pertenecer a ALBAR/);
  run(config()+finish+check(`not has_table_privilege('anon','private.cms_seed_registry','SELECT') and not has_table_privilege('authenticated','private.cms_seed_registry','SELECT') and not has_table_privilege('service_role','private.cms_seed_registry','SELECT')`,'Registro privado sin permisos API')+`rollback;`);
});
test('una membresía opcional es local al estudio y no concede roles globales',()=>{
  run(config({admin_email:accounts.pending.email})+finish+context+
    check(`exists(select 1 from public.organization_memberships m join public.membership_roles r on r.membership_id=m.id where m.user_id='${accounts.pending.id}' and m.organization_id=(select organization_id from public.sites where id=current_setting('leyer.test_site')::uuid) and r.role_code='admin')`,'Admin solo en ALBAR')+
    check(`not exists(select 1 from public.platform_role_assignments where user_id='${accounts.pending.id}')`,'Sin ascenso global')+`rollback;`);
});
test('publicación explícita crea rutas reales y es repetible sin nuevas revisiones',()=>{
  run(config({publish:true,activate_site:true,legal_review_confirmed:true,privacy_review_confirmed:true,privacy_controller:'Responsable de prueba local',privacy_processors:'Supabase local; aplicación de prueba local',retention_days:90})+finish+context+
    check(`(select count(*)=25 from public.content_entries where site_id=current_setting('leyer.test_site')::uuid and published_revision_id is not null)`,'Publicar 25 contenidos')+
    check(`(select status='active' from public.sites where id=current_setting('leyer.test_site')::uuid)`,'Sitio activo')+
    `drop table albar_seed_config,albar_seed_source;`+body+context+
    check(`(select count(*)=28 from public.content_revisions where site_id=current_setting('leyer.test_site')::uuid)`,'Publicar no duplica revisiones')+
    `set local role anon;`+check(`(select count(*)=25 from public.content_entries where site_id=current_setting('leyer.test_site')::uuid)`,'RLS deja ver publicaciones activas')+`reset role;rollback;`);
});
test('las 25 páginas locales y el formulario renderizan datos reales del seed',{skip:!existsSync('.local/albar-fixtures.json')},async()=>{
  const fixture=JSON.parse(readFileSync('.local/albar-fixtures.json','utf8'));
  if(!fixture.published)return;
  const origin=process.env.APP_URL||'http://localhost:3000';
  assert.match(origin,/^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
  for(const e of manifest.entries){
    const response=await fetch(origin+fixture.basePath+(e.path==='/'?'':e.path));
    assert.equal(response.status,200,e.path);
    const html=await response.text();
    assert.equal((html.match(/<h1\b/g)||[]).length,1,e.path+' debe tener un h1');
    if(e.key==='contacto'){
      assert.match(html,/name="email"/);assert.match(html,/name="consent"/);
      assert.match(html,/\/privacidad/);assert.match(html,/solicitud/i);
    }
    if(e.key==='privacidad')assert(!html.includes('[Responsable pendiente'));
  }
});
