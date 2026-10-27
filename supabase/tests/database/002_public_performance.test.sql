begin;
select no_plan();
select has_index('public','content_revisions','revisions_public_path_idx','Public path lookups have an index');
insert into auth.users(id,email,raw_user_meta_data) values
 ('10000000-0000-0000-0000-000000000011','public-performance@example.test','{}');
update public.profiles set is_admin=true where id='10000000-0000-0000-0000-000000000011';
update public.sites set status='active';
select set_config('test.site',(select id::text from public.sites),true);
select set_config('test.locale',(select default_locale from public.sites),true);
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000011',true);
insert into public.authors(id,site_id,display_name,slug,is_public) values
 ('30000000-0000-0000-0000-000000000011',current_setting('test.site')::uuid,'Performance author','perf-public',true),
 ('30000000-0000-0000-0000-000000000012',current_setting('test.site')::uuid,'Private author','perf-hidden',false);
insert into public.taxonomies(id,site_id,code,name) values
 ('40000000-0000-0000-0000-000000000011',current_setting('test.site')::uuid,'perf-tests','Performance topics');
insert into public.terms(id,site_id,taxonomy_id,name,slug) values
 ('50000000-0000-0000-0000-000000000011',current_setting('test.site')::uuid,'40000000-0000-0000-0000-000000000011','Performance topic','performance');
insert into public.content_entries(id,site_id,kind,internal_name,locale) values
 ('20000000-0000-0000-0000-000000000011',current_setting('test.site')::uuid,'page','Performance parent',current_setting('test.locale'));
insert into public.content_entries(id,site_id,kind,internal_name,parent_id,locale) values
 ('20000000-0000-0000-0000-000000000012',current_setting('test.site')::uuid,'landing','Performance child','20000000-0000-0000-0000-000000000011',current_setting('test.locale'));
select set_config('test.parent',public.save_content_revision('20000000-0000-0000-0000-000000000011',null,
 '{"title":"Public parent","path":"/perf-parent","blocks":[{"type":"hero","data":{"heading":"Parent"}}]}'::jsonb)::text,true);
select set_config('test.child',public.save_content_revision('20000000-0000-0000-0000-000000000012',null,
 '{"title":"Public child","path":"/perf-parent/child","blocks":[{"type":"hero","data":{"heading":"Child"}}],"terms":["50000000-0000-0000-0000-000000000011"]}'::jsonb)::text,true);
select public.set_revision_state(current_setting('test.child')::uuid,'approved');
select public.publish_content_revision(current_setting('test.child')::uuid);
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select is(public.get_public_page('/perf-parent/child',null,true)->'entry'->>'title','Public child','Anonymous route resolves its published revision');
select is(public.get_public_page('/autores/perf-public')->'author'->>'display_name','Performance author','Public author resolves without separate metadata queries');
select is(public.get_public_page('/autores/perf-hidden')->'author','null'::jsonb,'Private author remains hidden through the combined resolver');
select is(public.get_public_page('/taxonomias/perf-tests/performance')->'term'->>'name','Performance topic','Published term resolves in the same call');
select is(public.get_public_page('/taxonomias/perf-tests/unknown')->'term','null'::jsonb,'Unknown term cannot resolve');
select is(public.get_public_page('/perf-parent/child',null,true)->'ancestors','[]'::jsonb,'Draft parents do not leak into breadcrumbs');
select is(public.get_public_page('/perf-parent/child','zz-NOT-PUBLISHED',true),null::jsonb,'Unavailable language cannot resolve');
select is(public.get_public_page('/perf-parent/child',null,false)->'translations','[]'::jsonb,'Proxy skips render-only queries');
select ok(public.get_public_page('/perf-parent/child',null,true)->'locales' @> jsonb_build_array(current_setting('test.locale')),'Locales are resolved in SQL');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000011',true);
select public.set_revision_state(current_setting('test.parent')::uuid,'approved');
select public.publish_content_revision(current_setting('test.parent')::uuid);
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select is(public.get_public_page('/perf-parent/child',null,true)->'ancestors'->0->>'path','/perf-parent','Published ancestor is resolved in the same call');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000011',true);
select set_config('test.child.new',public.save_content_revision('20000000-0000-0000-0000-000000000012',current_setting('test.child')::uuid,
 '{"title":"Renamed child","path":"/perf-renamed-child","blocks":[{"type":"hero","data":{"heading":"Renamed"}}]}'::jsonb)::text,true);
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select is(public.get_public_page('/perf-parent/child',null,true)->'entry'->>'title','Public child','New draft does not replace the live revision');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000011',true);
select public.set_revision_state(current_setting('test.child.new')::uuid,'approved');
select public.publish_content_revision(current_setting('test.child.new')::uuid);
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select is(public.get_public_page('/perf-parent/child')->'redirect'->>'path','/perf-renamed-child','Rename resolves the published redirect destination');
select is(public.get_public_page('/perf-renamed-child')->'entry'->>'title','Renamed child','Newly published revision is visible immediately');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000011',true);
select public.unpublish_content('20000000-0000-0000-0000-000000000012');
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select is(public.get_public_page('/perf-renamed-child')->'entry','null'::jsonb,'Unpublishing removes the live route immediately');
select is(public.get_public_page('/perf-renamed-child')->'available','false'::jsonb,'Claimed withdrawn route cannot fall back to a virtual section');
select is(public.get_public_page('/perf-parent/child')->'redirect','null'::jsonb,'Redirect to withdrawn content is no longer served');
reset role;
update public.sites set status='archived';
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select is(public.get_public_page('/perf-parent'),null::jsonb,'Inactive site cannot resolve');
reset role;
select * from finish();
rollback;
