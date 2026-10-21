begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,email) values
 ('14000000-0000-0000-0000-000000000001','public-admin-a@example.test'),
 ('14000000-0000-0000-0000-000000000002','public-admin-b@example.test'),
 ('14000000-0000-0000-0000-000000000003','public-lawyer@example.test');
insert into public.organizations(id,name,slug) values ('24000000-0000-0000-0000-000000000001','Public A','public-a-test'),('24000000-0000-0000-0000-000000000002','Public B','public-b-test');
insert into public.sites(id,organization_id,name,slug,domain,status,settings) values
 ('35000000-0000-0000-0000-000000000001','24000000-0000-0000-0000-000000000001','Public A','principal','public-a.test','active','{"contact_enabled":true,"privacy_path":"/privacidad"}'),
 ('35000000-0000-0000-0000-000000000002','24000000-0000-0000-0000-000000000002','Public B','principal','public-b.test','active','{}');
insert into public.organization_memberships(id,organization_id,user_id) values
 ('46000000-0000-0000-0000-000000000001','24000000-0000-0000-0000-000000000001','14000000-0000-0000-0000-000000000001'),
 ('46000000-0000-0000-0000-000000000002','24000000-0000-0000-0000-000000000002','14000000-0000-0000-0000-000000000002'),
 ('46000000-0000-0000-0000-000000000003','24000000-0000-0000-0000-000000000001','14000000-0000-0000-0000-000000000003');
insert into public.membership_roles(membership_id,role_code) values ('46000000-0000-0000-0000-000000000001','admin'),('46000000-0000-0000-0000-000000000002','admin'),('46000000-0000-0000-0000-000000000003','lawyer');
insert into public.content_entries(id,organization_id,site_id,kind,internal_name) values
 ('57000000-0000-0000-0000-000000000001','24000000-0000-0000-0000-000000000001','35000000-0000-0000-0000-000000000001','page','Policy'),
 ('57000000-0000-0000-0000-000000000002','24000000-0000-0000-0000-000000000001','35000000-0000-0000-0000-000000000001','page','Private draft');
create temporary table public_test_values(key text primary key,id uuid);grant all on public_test_values to anon,authenticated,service_role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"14000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
insert into public_test_values values('privacy',public.save_content_revision('57000000-0000-0000-0000-000000000001',null,'{"title":"Política de prueba","path":"/privacidad","blocks":[{"type":"rich_text","data":{"document":{"type":"doc","content":[]}}}]}'));
select public.set_revision_state((select id from public_test_values where key='privacy'),'approved');
select public.publish_content_revision((select id from public_test_values where key='privacy'));
insert into public_test_values values('draft',public.save_content_revision('57000000-0000-0000-0000-000000000002',null,'{"title":"Privado","path":"/borrador","blocks":[]}'));
insert into public_test_values values('reserved',public.save_content_revision('57000000-0000-0000-0000-000000000002',(select id from public_test_values where key='draft'),'{"title":"Reservado","path":"/admin/robo","blocks":[]}'));
select public.set_revision_state((select id from public_test_values where key='reserved'),'approved');
select throws_ok($$select public.publish_content_revision((select id from public_test_values where key='reserved'))$$,'23514',null,'Publication cannot reserve infrastructure routes');
select throws_ok($$select public.manage_cms_redirect('35000000-0000-0000-0000-000000000001',null,'es-CL','/api/robo','57000000-0000-0000-0000-000000000001',301)$$,'23514',null,'Manual redirects cannot steal API paths');
select lives_ok($$update public.sites set settings='{"contact_enabled":true,"privacy_path":"/privacidad","contact_path":"/contacto"}' where id='35000000-0000-0000-0000-000000000001'$$,'Public settings can be configured');
select throws_ok($$update public.sites set settings='{"contact_path":"/admin"}' where id='35000000-0000-0000-0000-000000000001'$$,'23514',null,'Settings reject reserved contact paths');
select ok(private.is_safe_href('#consulta'),'In-page CTA anchor is safe');
select ok(not private.is_safe_href('javascript:alert(1)'),'Executable href remains unsafe');
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
select is(public.resolve_public_site('public-a.test')->>'id','35000000-0000-0000-0000-000000000001','Domain resolves the correct active site');
select is(public.resolve_public_site(null,'public-b-test','principal')->>'id','35000000-0000-0000-0000-000000000002','Organization plus site slug is unambiguous');
select is(public.get_public_snapshot((select id from public_test_values where key='draft')),null::jsonb,'Public snapshot cannot read a draft');
select is(public.get_public_snapshot((select id from public_test_values where key='privacy'))->>'title','Política de prueba','Public snapshot reads the published revision');
select ok(not(public.get_public_snapshot((select id from public_test_values where key='privacy'))?'created_by'),'Public snapshot excludes editor identity');
select ok(not(public.get_public_snapshot((select id from public_test_values where key='privacy'))?'editorial_state'),'Public snapshot excludes editorial state');
select is((public.list_published_content('35000000-0000-0000-0000-000000000001','es-CL',null)->>'total')::integer,1,'Public listing excludes all drafts');
select is((public.list_published_content('35000000-0000-0000-0000-000000000002','es-CL',null)->>'total')::integer,0,'Public listing scopes to its own site');
select is((public.list_published_content('35000000-0000-0000-0000-000000000001','es-CL',null,'Inexistente')->>'total')::integer,0,'Search counts before pagination');
select throws_ok($$select * from public.contact_submissions$$,'42501',null,'Anonymous cannot read contact messages');
select ok(not has_function_privilege('anon','public.submit_contact(uuid,text,uuid,text,text,text,text,text,text,boolean,uuid,text,uuid,text)','execute'),'Anonymous cannot bypass contact server validation');
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
insert into public_test_values values('receipt',public.submit_contact('35000000-0000-0000-0000-000000000001','es-CL',null,'/contacto','Persona de prueba','test@example.test','','Consulta','Descripción de prueba suficiente.',true,(select id from public_test_values where key='privacy'),repeat('1',64),'68000000-0000-0000-0000-000000000001',repeat('a',64)));
select is((select consent from public.contact_submissions where id=(select id from public_test_values where key='receipt')),true,'Consent is stored only on successful insertion');
select is(public.submit_contact('35000000-0000-0000-0000-000000000001','es-CL',null,'/contacto','Persona de prueba','test@example.test','','Consulta','Descripción de prueba suficiente.',true,(select id from public_test_values where key='privacy'),repeat('1',64),'68000000-0000-0000-0000-000000000001',repeat('a',64)),(select id from public_test_values where key='receipt'),'Network retry is idempotent');
select throws_ok($$select public.submit_contact('35000000-0000-0000-0000-000000000001','es-CL',null,'/contacto','Persona','test@example.test','','Consulta','Descripción suficiente.',true,(select id from public_test_values where key='privacy'),repeat('1',64),'68000000-0000-0000-0000-000000000001',repeat('b',64))$$,'23505',null,'A used form cannot be reused for different data');
select public.submit_contact('35000000-0000-0000-0000-000000000001','es-CL',null,'/contacto','Persona','test@example.test','','Consulta','Descripción suficiente.',true,(select id from public_test_values where key='privacy'),repeat('1',64),'68000000-0000-0000-0000-000000000002',repeat('b',64));
select public.submit_contact('35000000-0000-0000-0000-000000000001','es-CL',null,'/contacto','Persona','test@example.test','','Consulta','Descripción suficiente.',true,(select id from public_test_values where key='privacy'),repeat('1',64),'68000000-0000-0000-0000-000000000003',repeat('c',64));
select throws_ok($$select public.submit_contact('35000000-0000-0000-0000-000000000001','es-CL',null,'/contacto','Persona','test@example.test','','Consulta','Descripción suficiente.',true,(select id from public_test_values where key='privacy'),repeat('1',64),'68000000-0000-0000-0000-000000000004',repeat('d',64))$$,'P0001','CONTACT_RATE_LIMIT','Shared database rate limit rejects the fourth submission');
select is((select count(*) from public.contact_submissions where site_id='35000000-0000-0000-0000-000000000001'),3::bigint,'Rate rejection does not persist an extra message');
select throws_ok($$select public.submit_contact('35000000-0000-0000-0000-000000000002','es-CL',null,'/contacto','Persona','test@example.test','','Consulta','Descripción suficiente.',true,(select id from public_test_values where key='privacy'),repeat('2',64),gen_random_uuid(),repeat('e',64))$$,'42501',null,'A receipt cannot be inserted into another site using a foreign policy');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"14000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.contact_submissions where site_id='35000000-0000-0000-0000-000000000001'),3::bigint,'Authorized admin reads its own inbox');
select lives_ok($$update public.contact_submissions set status='in_progress',internal_notes='Seguimiento' where id=(select id from public_test_values where key='receipt')$$,'Authorized admin manages follow-up');
select throws_ok($$update public.contact_submissions set message='Reescribir consulta' where id=(select id from public_test_values where key='receipt')$$,'42501',null,'Inbox cannot rewrite the original message');
select set_config('request.jwt.claims','{"sub":"14000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.contact_submissions where site_id='35000000-0000-0000-0000-000000000001'),0::bigint,'Other study cannot read inbox');
select set_config('request.jwt.claims','{"sub":"14000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.contact_submissions where site_id='35000000-0000-0000-0000-000000000001'),0::bigint,'Lawyer without CMS permissions cannot read inbox');
reset role;
update public.organization_memberships set status='suspended' where id='46000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"14000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.contact_submissions where site_id='35000000-0000-0000-0000-000000000001'),0::bigint,'Suspension revokes inbox access without refreshing JWT');
reset role;
update public.organizations set status='suspended' where id='24000000-0000-0000-0000-000000000001';
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
select is(public.resolve_public_site('public-a.test'),null::jsonb,'Suspended study stops resolving publicly');
select is(public.get_public_snapshot((select id from public_test_values where key='privacy')),null::jsonb,'Suspension hides previously public snapshots in SQL');
reset role;
-- A standalone public team portrait is protected even without any article revisions.
insert into public.media_assets(id,organization_id,site_id,bucket_id,storage_path,filename,mime_type,byte_size,width,height,original_byte_size,checksum_sha256,optimization)
values('79000000-0000-0000-0000-000000000001','24000000-0000-0000-0000-000000000002','35000000-0000-0000-0000-000000000002','cms-public',
'24000000-0000-0000-0000-000000000002/35000000-0000-0000-0000-000000000002/79000000-0000-0000-0000-000000000001/portrait.webp','portrait.webp','image/webp',100,10,10,200,repeat('a',64),'webp-lossless-v1');
select set_config('storage.allow_delete_query','true',true);
insert into storage.objects(bucket_id,name,metadata) values('cms-public','24000000-0000-0000-0000-000000000002/35000000-0000-0000-0000-000000000002/79000000-0000-0000-0000-000000000001/portrait.webp','{"mimetype":"image/webp","size":100}');
insert into public.authors(organization_id,site_id,display_name,slug,is_public,avatar_asset_id)
values('24000000-0000-0000-0000-000000000002','35000000-0000-0000-0000-000000000002','Perfil público','portrait-test',true,'79000000-0000-0000-0000-000000000001');
select throws_ok($$delete from storage.objects where bucket_id='cms-public' and name='24000000-0000-0000-0000-000000000002/35000000-0000-0000-0000-000000000002/79000000-0000-0000-0000-000000000001/portrait.webp'$$,'23514',null,'Public team portrait cannot be removed behind its metadata');
select ok(not has_function_privilege('anon','public.cleanup_contact_rate_windows()','execute'),'Abuse-counter maintenance is service-only');
select ok(not public.public_section_available('35000000-0000-0000-0000-000000000001','es-CL','/equipo'),'Suspended study cannot expose a fallback section');
select ok(exists(select 1 from public.site_cache_events where site_id='35000000-0000-0000-0000-000000000001' and processed_at is null),'Public settings and status changes queue cache invalidation');
select * from finish();
rollback;
