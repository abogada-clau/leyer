begin;
select no_plan();

insert into auth.users(id,email,raw_user_meta_data) values
 ('10000000-0000-0000-0000-000000000041','service-contact@example.test','{}');
update public.profiles set is_admin=true where id='10000000-0000-0000-0000-000000000041';
update public.sites set status='active', settings=settings||'{
  "contact_enabled":true,
  "contact_on_landings":true,
  "privacy_path":"/contact-test-privacy"
}'::jsonb;
select set_config('test.site',(select id::text from public.sites),true);
select set_config('test.locale',(select default_locale from public.sites),true);
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000041',true);

insert into public.content_entries(id,site_id,kind,locale,internal_name) values
 ('20000000-0000-0000-0000-000000000041',current_setting('test.site')::uuid,'page',current_setting('test.locale'),'Contact test privacy'),
 ('20000000-0000-0000-0000-000000000042',current_setting('test.site')::uuid,'landing',current_setting('test.locale'),'Contact test service');
select set_config('test.privacy',public.save_content_revision('20000000-0000-0000-0000-000000000041',null,
 '{"title":"Contact test privacy","path":"/contact-test-privacy","template_key":"legal","blocks":[]}'::jsonb)::text,true);
select set_config('test.service',public.save_content_revision('20000000-0000-0000-0000-000000000042',null,
 '{"title":"Contact test service","path":"/contact-test-service","template_key":"service-landing","template_version":2,"blocks":[{"type":"hero","data":{"heading":"Contact test service"}}]}'::jsonb)::text,true);
select public.set_revision_state(current_setting('test.privacy')::uuid,'approved');
select public.publish_content_revision(current_setting('test.privacy')::uuid);
select public.set_revision_state(current_setting('test.service')::uuid,'approved');
select public.publish_content_revision(current_setting('test.service')::uuid);

set local role service_role;
select lives_ok($$
  select public.submit_contact(current_setting('test.site')::uuid,current_setting('test.locale'),
    '20000000-0000-0000-0000-000000000042','/contact-test-service','Name test','person@example.test','',
    'Subject test','Contact message for a version two service',true,current_setting('test.privacy')::uuid,
    repeat('a',64),gen_random_uuid(),repeat('b',64))
$$,'The current service template is a valid contact source');
reset role;

update public.sites set settings=jsonb_set(settings,'{contact_on_landings}','false');
set local role service_role;
select throws_ok($$
  select public.submit_contact(current_setting('test.site')::uuid,current_setting('test.locale'),
    '20000000-0000-0000-0000-000000000042','/contact-test-service','Name test','person@example.test','',
    'Subject test','Contact message for a version two service',true,current_setting('test.privacy')::uuid,
    repeat('a',64),gen_random_uuid(),repeat('b',64))
$$,'42501',null,'Disabling forms on services revokes valid form sources');
reset role;

select * from finish();
rollback;
