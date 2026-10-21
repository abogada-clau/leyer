begin;
-- This suite asserts platform-wide totals and bootstrap behavior. Isolate its
-- fixtures transactionally, including when local development data already exists.
-- ROLLBACK restores every existing row and the guard counter before returning.
truncate auth.users, public.organizations cascade;
update private.platform_admin_guard set active_count = 0;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

-- Every fixture is rolled back. No external users, projects or credentials needed.
insert into auth.users(id, email, raw_user_meta_data) values
  ('10000000-0000-0000-0000-000000000001', 'super@example.test', '{"display_name":"Super","roles":["super_admin"]}'),
  ('10000000-0000-0000-0000-000000000002', 'admin-a@example.test', '{}'),
  ('10000000-0000-0000-0000-000000000003', 'lawyer@example.test', '{}'),
  ('10000000-0000-0000-0000-000000000004', 'no-roles@example.test', '{}'),
  ('10000000-0000-0000-0000-000000000005', 'admin-b@example.test', '{}'),
  ('10000000-0000-0000-0000-000000000006', 'super-2@example.test', '{}');
select is((select count(*) from public.profiles), 6::bigint, 'Signups create profiles');
select is((select count(*) from public.platform_role_assignments), 0::bigint, 'Signup metadata never grants roles');
select ok(not exists (
  select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
), 'Every public table has RLS');
select ok(not has_function_privilege('authenticated', 'private.bootstrap_super_admin(uuid)', 'EXECUTE'), 'Bootstrap is SQL-only');
select ok(not has_function_privilege('anon', 'public.save_content_revision(uuid,uuid,jsonb)', 'EXECUTE'), 'Anon cannot invoke editor RPC');
select ok(not has_table_privilege('authenticated', 'public.content_revisions', 'INSERT'), 'Revisions cannot bypass save RPC');

select private.bootstrap_super_admin('10000000-0000-0000-0000-000000000001');
select throws_ok($$select private.bootstrap_super_admin('10000000-0000-0000-0000-000000000006')$$,
  '23514', null, 'Bootstrap cannot be reused');
insert into public.organizations(id, name, slug) values
  ('20000000-0000-0000-0000-000000000001', 'Estudio A', 'estudio-a'),
  ('20000000-0000-0000-0000-000000000002', 'Estudio B', 'estudio-b');
insert into public.organization_memberships(id, organization_id, user_id) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001');
insert into public.membership_roles(membership_id, role_code) values
  ('40000000-0000-0000-0000-000000000001', 'admin'),
  ('40000000-0000-0000-0000-000000000001', 'lawyer'),
  ('40000000-0000-0000-0000-000000000002', 'lawyer'),
  ('40000000-0000-0000-0000-000000000003', 'admin'),
  ('40000000-0000-0000-0000-000000000005', 'admin'),
  ('40000000-0000-0000-0000-000000000005', 'lawyer');
select is((select count(*) from public.membership_roles where membership_id = '40000000-0000-0000-0000-000000000005'),
  2::bigint, 'A global super admin can also have both organization roles');
select throws_ok($$insert into public.membership_roles(membership_id,role_code)
  values ('40000000-0000-0000-0000-000000000004','super_admin')$$,
  '23503', null, 'Global role cannot be assigned to a membership');
select throws_ok($$insert into public.platform_role_assignments(user_id,role_code)
  values ('10000000-0000-0000-0000-000000000004','admin')$$,
  '23503', null, 'Organization role cannot be assigned globally');
insert into public.sites(id, organization_id, name, slug, status) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Sitio A', 'principal', 'active'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Sitio B', 'principal', 'active');
insert into public.content_entries(id, organization_id, site_id, kind, internal_name) values
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'landing', 'Divorcio'),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'post', 'Artículo'),
  ('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'landing', 'Otra landing');
insert into public.authors(id, organization_id, site_id, display_name, slug) values
  ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Autora A', 'autora-a'),
  ('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Autora B', 'autora-b');
insert into public.taxonomies(id, organization_id, site_id, code, name) values
  ('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'category', 'Categorías');
insert into public.terms(id, organization_id, site_id, taxonomy_id, name, slug) values
  ('81000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000001', 'Familia', 'familia');
insert into public.media_assets(id, organization_id, site_id, bucket_id, storage_path, filename, mime_type, byte_size,
  width, height, original_byte_size, checksum_sha256, optimization) values
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'cms-public',
    '20000000-0000-0000-0000-000000000001/30000000-0000-0000-0000-000000000001/60000000-0000-0000-0000-000000000001/hero.webp', 'hero.webp', 'image/webp', 1024,
    800, 600, 2048, repeat('a', 64), 'webp-lossless-v1'),
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'cms-public',
    '20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002/60000000-0000-0000-0000-000000000002/hero.webp', 'hero.webp', 'image/webp', 1024,
    800, 600, 2048, repeat('a', 64), 'webp-lossless-v1'),
  ('60000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'cms-private',
    '20000000-0000-0000-0000-000000000001/30000000-0000-0000-0000-000000000001/60000000-0000-0000-0000-000000000003/draft.webp', 'draft.webp', 'image/webp', 1024,
    800, 600, 2048, repeat('a', 64), 'webp-lossless-v1');
insert into storage.objects(bucket_id, name) select bucket_id, storage_path from public.media_assets;

create temporary table test_values(key text primary key, id uuid);
grant all on test_values to authenticated, anon, service_role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}', true);
select ok(not private.has_org_permission('20000000-0000-0000-0000-000000000001', 'content.edit'), 'Membership without roles grants no CMS access');
select is((select count(*) from public.content_entries), 0::bigint, 'No-role user sees no drafts');
select throws_ok($$insert into public.membership_roles(membership_id,role_code,granted_by) values
  ('40000000-0000-0000-0000-000000000004','admin','10000000-0000-0000-0000-000000000004')$$,
  '42501', null, 'No-role user cannot self-promote');
select throws_ok($$update public.profiles set status='suspended' where id='10000000-0000-0000-0000-000000000004'$$,
  '42501', null, 'Own profile status cannot bypass administrative RPC');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
select ok(private.has_org_permission('20000000-0000-0000-0000-000000000001', 'documents.read'), 'Lawyer has document capability, subject to future case ACL');
select ok(not private.has_org_permission('20000000-0000-0000-0000-000000000001', 'content.edit'), 'Lawyer alone cannot edit the CMS');
select throws_ok($$select public.save_content_revision('50000000-0000-0000-0000-000000000001',null,'{}')$$,
  '42501', null, 'Lawyer cannot save content');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select ok(private.has_org_permission('20000000-0000-0000-0000-000000000001', 'content.edit'), 'Admin can edit own organization');
select ok(not private.has_org_permission('20000000-0000-0000-0000-000000000002', 'content.edit'), 'Admin cannot edit another organization');
select throws_ok($$insert into public.platform_role_assignments(user_id,granted_by) values
  ('10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002')$$,
  '42501', null, 'Admin cannot grant global roles');
select throws_ok($$update public.content_entries set published_revision_id=null where id='50000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'Publication pointer cannot bypass publication RPC');
select throws_ok($$update public.content_entries set parent_id='50000000-0000-0000-0000-000000000003'
  where id='50000000-0000-0000-0000-000000000001'$$, '23503', null, 'Parent cannot cross tenant boundary');
update public.content_entries set parent_id='50000000-0000-0000-0000-000000000001' where id='50000000-0000-0000-0000-000000000002';
select throws_ok($$update public.content_entries set parent_id='50000000-0000-0000-0000-000000000002'
  where id='50000000-0000-0000-0000-000000000001'$$, '23514', null, 'Hierarchy cannot contain cycles');
select throws_ok($$insert into public.author_users(author_id,user_id) values
  ('70000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005')$$,
  '23514', null, 'Author account cannot link another organization');

insert into test_values values ('v1', public.save_content_revision('50000000-0000-0000-0000-000000000001', null,
  '{"title":"Divorcio","path":"/divorcio","cover_asset_id":"60000000-0000-0000-0000-000000000001",
    "authors":["70000000-0000-0000-0000-000000000001"],"terms":["81000000-0000-0000-0000-000000000001"],
    "blocks":[{"type":"hero","data":{"heading":"Un nuevo comienzo","actions":[{"label":"Consultar","href":"/contacto"}]}},
      {"type":"faq","data":{"items":[{"question":"¿Cómo comenzar?","answer":"Agenda una consulta."}]}}]}'));
select is((select count(*) from public.content_revisions), 1::bigint, 'Save creates one complete revision');
select is((select count(*) from public.content_blocks), 2::bigint, 'Save creates ordered blocks');
select throws_ok($$select public.save_content_revision('50000000-0000-0000-0000-000000000001',null,
  '{"title":"Sobrescritura","path":"/divorcio","blocks":[]}')$$, '40001', null, 'Stale editor cannot overwrite a later save');
select throws_ok($$select public.save_content_revision('50000000-0000-0000-0000-000000000001',(select id from test_values where key='v1'),
  '{"title":"Inválido","path":"/invalido","blocks":[{"type":"hero","data":{}}]}')$$,
  '23514', null, 'Block schema requires its fields');
select throws_ok($$select public.save_content_revision('50000000-0000-0000-0000-000000000001',(select id from test_values where key='v1'),
  '{"title":"Inválido","path":"/invalido","blocks":[{"type":"cta","data":{"heading":"Contactar","actions":[{"label":"Ir","href":"javascript:alert(1)"}]}}]}')$$,
  '23514', null, 'Action URLs reject executable protocols');
select throws_ok($$select public.save_content_revision('50000000-0000-0000-0000-000000000001',(select id from test_values where key='v1'),
  '{"title":"Inválido","path":"/invalido","cover_asset_id":"60000000-0000-0000-0000-000000000002","blocks":[]}')$$,
  '23503', null, 'Cover image cannot cross tenant boundary');
select throws_ok($$select public.save_content_revision('50000000-0000-0000-0000-000000000001',(select id from test_values where key='v1'),
  '{"title":"Inválido","path":"/invalido","authors":["70000000-0000-0000-0000-000000000002"],"blocks":[]}')$$,
  '23503', null, 'Authors cannot cross tenant boundary');
select throws_ok($$select public.save_content_revision('50000000-0000-0000-0000-000000000001',(select id from test_values where key='v1'),
  '{"title":"Inválido","path":"/%2fexterno","blocks":[]}')$$,
  '23514', null, 'Canonical paths reject encoded path separators');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('cms-private','unknown/path.jpg')$$,
  '42501', null, 'Storage upload requires an authorized asset record');
select is((select count(*) from storage.objects where bucket_id='cms-private'), 1::bigint, 'Own private CMS files are readable by admin');
select is((select count(*) from public.content_revisions), 1::bigint, 'Invalid saves leave no partial revisions');
select throws_ok($$select public.publish_content_revision((select id from test_values where key='v1'))$$,
  '23514', null, 'Unapproved revision cannot be published');
select public.set_revision_state((select id from test_values where key='v1'), 'approved');
select lives_ok($$select public.publish_content_revision((select id from test_values where key='v1'))$$, 'Admin publishes approved revision');

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((select count(*) from public.published_content), 1::bigint, 'Anonymous visitors see published content');
select is((select title from public.published_content), 'Divorcio', 'Public projection exposes published title');
select is((select count(*) from public.content_blocks), 2::bigint, 'Published blocks are publicly readable');
select is((select count(*) from public.authors), 1::bigint, 'Only authors used in published revisions are public');
select is((select count(*) from public.media_assets), 1::bigint, 'Only intentionally public referenced media metadata is public');
select throws_ok($$select created_by from public.content_revisions$$, '42501', null, 'Internal editor identities are not public');
select throws_ok($$select * from public.profiles$$, '42501', null, 'Private profiles are not public');
select throws_ok($$select * from public.author_users$$, '42501', null, 'Public authors do not reveal account links');
select throws_ok($$select * from public.publication_events$$, '42501', null, 'Transactional outbox is not public');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
insert into test_values values ('v2', public.save_content_revision('50000000-0000-0000-0000-000000000001',
  (select id from test_values where key='v1'), '{"title":"Divorcio actualizado","path":"/divorcio-actualizado","blocks":[]}'));
select is((select count(*) from public.content_revisions), 2::bigint, 'Admin sees draft and published history');
select is((select count(*) from public.get_cms_revisions('50000000-0000-0000-0000-000000000001')),
  2::bigint, 'Authorized CMS RPC returns internal revision history');
select ok(not private.can_write_storage_object('cms-public',
  '20000000-0000-0000-0000-000000000001/30000000-0000-0000-0000-000000000001/60000000-0000-0000-0000-000000000001/hero.webp'),
  'Published binary cannot be deleted or overwritten');
select ok(not private.can_read_storage_object('cms-private', 'malformed/path'), 'Malformed Storage paths fail closed');
select ok(not private.can_read_storage_object('cms-public',
  '20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002/60000000-0000-0000-0000-000000000002/hero.webp'),
  'Storage authorization is scoped to the study');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000005","role":"authenticated"}', true);
select is((select count(*) from public.content_revisions where entry_id='50000000-0000-0000-0000-000000000001'),
  1::bigint, 'Other-study admin sees published revision but no draft/history');
select is((select count(*) from public.get_cms_entries('30000000-0000-0000-0000-000000000001')),
  0::bigint, 'CMS internal records never cross study boundary');
select throws_ok($$select public.save_content_revision('50000000-0000-0000-0000-000000000001',(select id from test_values where key='v2'),
  '{"title":"Ajeno","path":"/ajeno","blocks":[]}')$$, '42501', null, 'Other-study admin cannot modify content');
select throws_ok($$select public.publish_content_revision((select id from test_values where key='v2'))$$,
  '42501', null, 'Other-study admin cannot publish content');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}', true);
select throws_ok($$select created_by from public.content_revisions$$, '42501', null, 'Signup alone does not expose internal editor identities');
select throws_ok($$select internal_name from public.content_entries$$, '42501', null, 'Signup alone does not expose internal content names');
select throws_ok($$select created_by from public.media_assets$$, '42501', null, 'Signup alone does not expose internal uploader identities');
select is((select count(*) from public.get_cms_revisions('50000000-0000-0000-0000-000000000001')),
  0::bigint, 'No-role account cannot read internal snapshots through CMS RPC');

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((select title from public.published_content), 'Divorcio', 'Saving a draft does not change the live page');
select is((select count(*) from public.content_revisions), 1::bigint, 'Anonymous visitor cannot read draft revision');

reset role;
select throws_ok($$update public.content_revisions set title='Mutado' where id=(select id from test_values where key='v1')$$,
  '23514', null, 'Published revision remains immutable even for direct SQL edits');
select throws_ok($$delete from public.content_blocks where revision_id=(select id from test_values where key='v1')$$,
  '23514', null, 'Published associations cannot be deleted');
select throws_ok($$update storage.objects set metadata='{"size":999}' where bucket_id='cms-public' and name=
  '20000000-0000-0000-0000-000000000001/30000000-0000-0000-0000-000000000001/60000000-0000-0000-0000-000000000001/hero.webp'$$,
  '23514', null, 'Storage mutation guard protects historical published binaries');
select lives_ok($$update storage.objects set last_accessed_at=now() where bucket_id='cms-public' and name=
  '20000000-0000-0000-0000-000000000001/30000000-0000-0000-0000-000000000001/60000000-0000-0000-0000-000000000001/hero.webp'$$,
  'Storage access bookkeeping remains possible');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select public.set_revision_state((select id from test_values where key='v2'), 'approved');
select public.publish_content_revision((select id from test_values where key='v2'));
select is((select path from public.content_routes where entry_id='50000000-0000-0000-0000-000000000001'),
  '/divorcio-actualizado', 'Publishing changes the canonical route');
select is((select from_path from public.redirects), '/divorcio', 'Publishing preserves the previous URL as a redirect');
select lives_ok($$select public.publish_content_revision((select id from test_values where key='v1'))$$, 'A historical snapshot can be restored');
select is((select path from public.content_routes where entry_id='50000000-0000-0000-0000-000000000001'),
  '/divorcio', 'Restoring a revision restores its canonical path');
insert into test_values values ('conflict', public.save_content_revision('50000000-0000-0000-0000-000000000002', null,
  '{"title":"Conflicto","path":"/divorcio-actualizado","blocks":[]}'));
select public.set_revision_state((select id from test_values where key='conflict'), 'approved');
select throws_ok($$select public.publish_content_revision((select id from test_values where key='conflict'))$$,
  '23505', null, 'Another entry cannot claim a reserved redirect path');
insert into test_values values ('private-asset', public.save_content_revision('50000000-0000-0000-0000-000000000002',
  (select id from test_values where key='conflict'), '{"title":"Privado","path":"/privado",
  "cover_asset_id":"60000000-0000-0000-0000-000000000003","blocks":[]}'));
select public.set_revision_state((select id from test_values where key='private-asset'), 'approved');
select throws_ok($$select public.publish_content_revision((select id from test_values where key='private-asset'))$$,
  '23514', null, 'Private draft assets cannot become public through publication');
select ok((select count(*) > 0 from public.audit_events where organization_id='20000000-0000-0000-0000-000000000001'), 'Changes generate study audit events');
select throws_ok($$insert into public.audit_events(table_name,action) values ('forged','INSERT')$$,
  '42501', null, 'Clients cannot forge audit events');
select throws_ok($$select public.process_scheduled_publications()$$, '42501', null, 'Browser clients cannot execute scheduled worker');

-- Scheduling is pinned to an approved revision; process with the service role.
insert into public.scheduled_publications(organization_id,site_id,entry_id,revision_id,run_at)
values ('20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',(select id from test_values where key='v2'),now()+interval '1 hour');
reset role;
update public.scheduled_publications set run_at=now()-interval '1 minute';
set local role service_role;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
select is(public.process_scheduled_publications(), 1, 'Trusted worker processes a due publication');
select is((select status from public.scheduled_publications), 'completed', 'Successful scheduled publication is completed');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
insert into public.scheduled_publications(organization_id,site_id,entry_id,revision_id,run_at)
values ('20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',(select id from test_values where key='v1'),now()+interval '1 hour');
reset role;
update public.scheduled_publications set run_at=now()-interval '1 minute' where status='pending';
update public.organization_memberships set status='suspended' where id='40000000-0000-0000-0000-000000000001';
set local role service_role;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
select is(public.process_scheduled_publications(), 1, 'Worker also consumes revoked requests');
select is((select count(*) from public.scheduled_publications where status='failed'), 1::bigint, 'Revoked admin scheduled publication fails');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select ok(not private.has_org_permission('20000000-0000-0000-0000-000000000001','content.edit'), 'Membership suspension takes effect with the same JWT');
select throws_ok($$select public.publish_content_revision((select id from test_values where key='v1'))$$,
  '42501', null, 'Suspended membership cannot publish');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select throws_ok($$delete from public.platform_role_assignments where user_id='10000000-0000-0000-0000-000000000001'$$,
  '23514', null, 'Last active super admin cannot be removed');
select throws_ok($$select public.set_user_status('10000000-0000-0000-0000-000000000001','suspended')$$,
  '23514', null, 'Last active super admin cannot be suspended');
insert into public.platform_role_assignments(user_id,granted_by) values
  ('10000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001');
select lives_ok($$select public.set_user_status('10000000-0000-0000-0000-000000000006','suspended')$$,
  'A super admin can be suspended when another remains');
select public.unpublish_content('50000000-0000-0000-0000-000000000001', true);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((select count(*) from public.published_content), 0::bigint, 'Archived content is no longer publicly readable');
select is((select count(*) from public.content_blocks), 0::bigint, 'Unpublished blocks are not publicly readable');

reset role;
select * from finish();
rollback;
