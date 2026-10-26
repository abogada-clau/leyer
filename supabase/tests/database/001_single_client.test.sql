begin;
select no_plan();
select is((select count(*)::integer from public.sites),1,'Exactly one site configuration');
select hasnt_table('public','organizations','No organization table');
select hasnt_table('public','organization_memberships','No study memberships');
select hasnt_table('public','membership_roles','No membership role assignments');
select hasnt_table('public','platform_role_assignments','No global platform roles');
select hasnt_table('public','roles','No generic role model');
select is((select count(*)::integer from information_schema.columns where table_schema='public' and column_name='organization_id'),0,'No organization identifiers in application tables');
select throws_ok($$insert into public.sites(name) values('Second site')$$,'23505',null,'Database rejects a second site even for trusted callers');
select hasnt_function('public','resolve_public_site',array['text','text','text'],'No resolver for multiple studies');
select hasnt_function('public','create_membership_access',array['uuid','uuid','text','text[]'],'No membership provisioning RPC');
select hasnt_function('public','get_media_upload_context',array['uuid'],'Uploads cannot select a client');

insert into auth.users(id,email,raw_user_meta_data) values
 ('10000000-0000-0000-0000-000000000001','single-admin@example.test','{}'),
 ('10000000-0000-0000-0000-000000000002','single-pending@example.test','{"is_admin":true,"role":"super_admin"}');
update public.profiles set is_admin=true where id='10000000-0000-0000-0000-000000000001';
select is((select is_admin from public.profiles where id='10000000-0000-0000-0000-000000000002'),false,'Forged signup metadata does not grant access');
select set_config('test.site',(select id::text from public.sites),true);
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002',true);
select is((public.get_admin_context()->>'is_admin')::boolean,false,'Pending account has no admin access');
select is(public.get_admin_context()->'site','null'::jsonb,'Pending account has no CMS context');
select is((select count(*)::integer from public.get_media_upload_context()),0,'Pending account cannot upload');
select is((select count(*)::integer from public.get_cms_entries(current_setting('test.site')::uuid)),0,'Pending account cannot read drafts');
select throws_ok($$update public.profiles set is_admin=true where id=auth.uid()$$,'42501',null,'Accounts cannot promote themselves');
select throws_ok($$insert into public.sites(name) values('Unauthorized site')$$,'42501',null,'Accounts cannot create sites');

select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
select is((public.get_admin_context()->>'is_admin')::boolean,true,'Owner has direct access');
select ok(public.get_admin_context()->'site'->>'id' is not null,'Owner receives one site object');
select ok(not(public.get_admin_context() ?| array['organizations','memberships','sites','super_admin']),'Context has no tenant selection data');
select is((select count(*)::integer from public.get_media_upload_context()),1,'Owner can upload to the only site');
insert into public.content_entries(id,site_id,kind,internal_name) values
 ('20000000-0000-0000-0000-000000000001',current_setting('test.site')::uuid,'page','Single client verification');
select set_config('test.revision', public.save_content_revision('20000000-0000-0000-0000-000000000001',null,
 '{"title":"Single client","path":"/single-client-test","blocks":[{"type":"hero","data":{"heading":"Single client"}}]}'::jsonb)::text,true);
select lives_ok($$select public.set_revision_state(current_setting('test.revision')::uuid,'approved')$$,'Owner approves content');
select lives_ok($$select public.publish_content_revision(current_setting('test.revision')::uuid)$$,'Owner publishes content');
select throws_ok($$select public.save_content_revision('20000000-0000-0000-0000-000000000001',null,'{"title":"Stale","path":"/stale","blocks":[]}')$$,'40001',null,'Stale editor cannot overwrite a newer revision');
reset role;
update public.sites set status='active';
set local role anon;
select is(public.get_public_site()->>'id',current_setting('test.site'),'Anonymous visitors resolve the only active site');
select is(public.get_public_snapshot(current_setting('test.revision')::uuid)->>'title','Single client','Published snapshot remains readable');
select throws_ok($$select public.get_admin_context()$$,'42501',null,'Admin context is private');
select throws_ok($$select public.get_media_upload_context()$$,'42501',null,'Media upload context is private');
reset role;
update public.profiles set status='suspended' where id='10000000-0000-0000-0000-000000000001';
set local role authenticated;
select is((public.get_admin_context()->>'is_admin')::boolean,false,'Suspension revokes access with the same JWT');
select is((select count(*)::integer from public.get_media_upload_context()),0,'Suspended account cannot upload');
select throws_ok($$select public.unpublish_content('20000000-0000-0000-0000-000000000001')$$,'42501',null,'Suspended account cannot change publications');
reset role;
select * from finish();
rollback;
