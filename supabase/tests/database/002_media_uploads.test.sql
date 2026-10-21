begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select is((select allowed_mime_types from storage.buckets where id = 'cms-public'),
  array['image/webp', 'application/pdf'], 'Public bucket accepts WebP images and PDFs');
select is((select allowed_mime_types from storage.buckets where id = 'cms-private'),
  array['image/webp', 'application/pdf'], 'Private bucket has the same optimization requirement');
select ok(not has_any_column_privilege('authenticated', 'public.media_assets', 'INSERT'),
  'Clients cannot bypass the optimizer by inserting metadata');
select ok(not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects'
  and policyname='leyer_cms_storage_insert'), 'Direct client uploads are disabled');
select ok(not has_function_privilege('anon', 'public.get_media_upload_context(uuid)', 'EXECUTE'),
  'Anonymous users cannot request an upload context');

insert into auth.users(id, email, raw_user_meta_data) values
  ('11000000-0000-0000-0000-000000000001', 'media-admin@example.test', '{}'),
  ('11000000-0000-0000-0000-000000000002', 'media-lawyer@example.test', '{}');
insert into public.organizations(id, name, slug) values
  ('22000000-0000-0000-0000-000000000001', 'Media A', 'media-a'),
  ('22000000-0000-0000-0000-000000000002', 'Media B', 'media-b');
insert into public.sites(id, organization_id, name, slug) values
  ('33000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', 'Media A', 'media-a'),
  ('33000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000002', 'Media B', 'media-b');
insert into public.organization_memberships(id, organization_id, user_id) values
  ('44000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001'),
  ('44000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002');
insert into public.membership_roles(membership_id, role_code) values
  ('44000000-0000-0000-0000-000000000001', 'admin'),
  ('44000000-0000-0000-0000-000000000002', 'lawyer');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is((select count(*) from public.get_media_upload_context('33000000-0000-0000-0000-000000000001')),
  1::bigint, 'Admin can upload into its own site');
select is((select count(*) from public.get_media_upload_context('33000000-0000-0000-0000-000000000002')),
  0::bigint, 'Admin cannot upload into another organization');
select set_config('request.jwt.claims', '{"sub":"11000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select is((select count(*) from public.get_media_upload_context('33000000-0000-0000-0000-000000000001')),
  0::bigint, 'Lawyer without media.manage cannot upload CMS images');
reset role;

set local role service_role;
select throws_ok($$insert into public.media_assets(organization_id,site_id,bucket_id,storage_path,filename,mime_type,byte_size)
  values ('22000000-0000-0000-0000-000000000001','33000000-0000-0000-0000-000000000001','cms-public',
    '22000000-0000-0000-0000-000000000001/33000000-0000-0000-0000-000000000001/55000000-0000-0000-0000-000000000001/foto.jpg',
    'foto.jpg','image/jpeg',100)$$, '23514', null, 'Unoptimized JPEG is rejected even from the trusted media service');
select throws_ok($$insert into public.media_assets(organization_id,site_id,bucket_id,storage_path,filename,mime_type,byte_size)
  values ('22000000-0000-0000-0000-000000000001','33000000-0000-0000-0000-000000000001','cms-private',
    '22000000-0000-0000-0000-000000000001/33000000-0000-0000-0000-000000000001/55000000-0000-0000-0000-000000000001/foto.webp',
    'foto.webp','image/webp',100)$$, '23514', null, 'WebP without verified optimization metadata is rejected');
select lives_ok($$insert into public.media_assets(id,organization_id,site_id,bucket_id,storage_path,filename,mime_type,byte_size,
  width,height,original_byte_size,checksum_sha256,optimization)
  values ('55000000-0000-0000-0000-000000000001','22000000-0000-0000-0000-000000000001','33000000-0000-0000-0000-000000000001','cms-private',
    '22000000-0000-0000-0000-000000000001/33000000-0000-0000-0000-000000000001/55000000-0000-0000-0000-000000000001/foto.webp',
    'foto.webp','image/webp',100,10,10,200,repeat('a',64),'webp-lossless-v1')$$, 'Server-optimized WebP metadata is accepted');
select lives_ok($$insert into public.media_assets(id,organization_id,site_id,bucket_id,storage_path,filename,mime_type,byte_size)
  values ('55000000-0000-0000-0000-000000000002','22000000-0000-0000-0000-000000000001','33000000-0000-0000-0000-000000000001','cms-private',
    '22000000-0000-0000-0000-000000000001/33000000-0000-0000-0000-000000000001/55000000-0000-0000-0000-000000000002/documento.pdf',
    'documento.pdf','application/pdf',100)$$, 'PDFs retain their format for document workflows');
reset role;

update public.organization_memberships set status='suspended' where id='44000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is((select count(*) from public.get_media_upload_context('33000000-0000-0000-0000-000000000001')),
  0::bigint, 'Suspended membership immediately loses upload permission');

reset role;
select * from finish();
rollback;
