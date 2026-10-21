begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();
insert into auth.users(id,email) values
 ('12000000-0000-0000-0000-000000000001','panel-super@example.test'),
 ('12000000-0000-0000-0000-000000000002','panel-editor@example.test'),
 ('12000000-0000-0000-0000-000000000003','panel-empty@example.test');
insert into public.platform_role_assignments(user_id) values ('12000000-0000-0000-0000-000000000001');
insert into public.organizations(id,name,slug) values
 ('23000000-0000-0000-0000-000000000001','Panel A','panel-a'),
 ('23000000-0000-0000-0000-000000000002','Panel B','panel-b');
insert into public.organization_memberships(id,organization_id,user_id) values
 ('45000000-0000-0000-0000-000000000001','23000000-0000-0000-0000-000000000001','12000000-0000-0000-0000-000000000002');
insert into public.membership_roles(membership_id,role_code) values ('45000000-0000-0000-0000-000000000001','admin');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"12000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select is(public.get_admin_context()->>'super_admin','false','Editor is not a global admin');
select is(jsonb_array_length(public.get_admin_context()->'organizations'),1,'Context returns only the editor study');
select lives_ok($$insert into public.sites(id,organization_id,name,slug) values
 ('34000000-0000-0000-0000-000000000001','23000000-0000-0000-0000-000000000001','Panel site','panel') returning id$$,'Site INSERT RETURNING works with current tenant authorization');
select throws_ok($$insert into public.sites(organization_id,name,slug) values
 ('23000000-0000-0000-0000-000000000002','Wrong study','wrong')$$,'42501',null,'Cannot create a site in another study');
insert into public.content_entries(id,organization_id,site_id,internal_name,kind) values
 ('56000000-0000-0000-0000-000000000001','23000000-0000-0000-0000-000000000001','34000000-0000-0000-0000-000000000001','Panel entry','page');
select is(public.get_cms_dashboard('34000000-0000-0000-0000-000000000001')->>'draft','1','Entry without a revision counts as a real draft');
create temporary table panel_values(key text,id uuid);
grant all on panel_values to authenticated;
insert into panel_values values ('v1',public.save_cms_entry('56000000-0000-0000-0000-000000000001',null,'Panel renamed',null,
 '{"title":"Panel title","path":"/panel","seo":{"title":"SEO"},"blocks":[{"type":"hero","data":{"heading":"Heading"}}]}'));
select is((select internal_name from public.get_cms_entries('34000000-0000-0000-0000-000000000001')),'Panel renamed','Metadata saves with snapshot');
select is(public.get_cms_snapshot((select id from panel_values where key='v1'))#>>'{blocks,0,data,heading}','Heading','Snapshot reconstructs structured blocks');
select is(public.get_cms_dashboard('34000000-0000-0000-0000-000000000001')->>'draft','1','Dashboard counts actual drafts');
select throws_ok($$select public.save_cms_entry('56000000-0000-0000-0000-000000000001',null,'Wrong stale name',null,
 '{"title":"Stale","path":"/stale","blocks":[]}')$$,'40001',null,'Atomic save rejects stale revision');
select is((select internal_name from public.get_cms_entries('34000000-0000-0000-0000-000000000001')),'Panel renamed','Conflicting metadata is rolled back too');
select lives_ok($$select public.manage_cms_redirect('34000000-0000-0000-0000-000000000001',null,'es-CL','/old-panel','56000000-0000-0000-0000-000000000001',301)$$,'Site admin can create validated redirects');
select throws_ok($$select public.manage_cms_redirect('34000000-0000-0000-0000-000000000001',null,'es-CL','//unsafe','56000000-0000-0000-0000-000000000001',301)$$,'23514',null,'Redirect rejects unsafe paths');
select throws_ok($$select public.set_membership_access('45000000-0000-0000-0000-000000000001','active',array['lawyer'])$$,'42501',null,'An organization admin cannot assign roles');
select set_config('request.jwt.claims','{"sub":"12000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select is(jsonb_array_length(public.get_admin_context()->'sites'),0,'No-role context exposes no CMS sites');
select is(public.get_cms_snapshot((select id from panel_values where key='v1')),null::jsonb,'Private preview snapshot requires permission');
select is((select count(*) from public.get_cms_listing('34000000-0000-0000-0000-000000000001')),0::bigint,'Private listing requires permission');
select throws_ok($$select public.get_cms_dashboard('34000000-0000-0000-0000-000000000001')$$,'42501',null,'Private metrics require permission');
select set_config('request.jwt.claims','{"sub":"12000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.set_membership_access('45000000-0000-0000-0000-000000000001','active',array['admin','lawyer'])$$,'Super admin sets multiple organization roles atomically');
select is((select count(*) from public.membership_roles where membership_id='45000000-0000-0000-0000-000000000001'),2::bigint,'Both organization roles are retained');
select throws_ok($$select public.set_membership_access('45000000-0000-0000-0000-000000000001','active',array['super_admin'])$$,'22023',null,'Global roles cannot enter organization scope');
select lives_ok($$select public.set_membership_access('45000000-0000-0000-0000-000000000001','active',array[]::text[])$$,'Zero-role membership is supported');
select set_config('request.jwt.claims','{"sub":"12000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select is(jsonb_array_length(public.get_admin_context()->'sites'),0,'Revocation changes context immediately with same JWT');
select lives_ok($$update public.profiles set preferences='{"theme":"dark"}' where id='12000000-0000-0000-0000-000000000002'$$,'Active user can save own preferences');
select throws_ok($$update public.profiles set status='suspended' where id='12000000-0000-0000-0000-000000000002'$$,'42501',null,'Profile preferences grant cannot change status');
select ok(not has_function_privilege('anon','public.get_admin_context()','execute'),'Anonymous cannot query private context');
reset role;
select * from finish();
rollback;
