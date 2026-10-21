-- Existing assets remain readable and immutable. All new image writes pass through
-- the server optimizer; PDF files retain their original format.
alter table public.media_assets
  add column original_byte_size bigint check (original_byte_size > 0),
  add column optimization text check (optimization is null or optimization = 'webp-lossless-v1');

update storage.buckets set allowed_mime_types = array['image/webp', 'application/pdf']
where id in ('cms-public', 'cms-private');

-- Column-level grants must also be revoked: revoking only the table grant leaves them intact.
revoke insert (id, organization_id, site_id, bucket_id, storage_path, filename, mime_type,
  byte_size, width, height, checksum_sha256, alt_text, credits) on public.media_assets from authenticated;
drop policy media_insert on public.media_assets;
drop policy leyer_cms_storage_insert on storage.objects;

create function public.get_media_upload_context(p_site_id uuid)
returns table (site_id uuid, organization_id uuid)
language sql stable security definer set search_path = '' as $$
  select s.id, s.organization_id from public.sites s
  where s.id = p_site_id and private.site_permission(s.id, 'media.manage');
$$;
revoke all on function public.get_media_upload_context(uuid) from public, anon, authenticated;
grant execute on function public.get_media_upload_context(uuid) to authenticated;

create function private.require_optimized_media() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.mime_type = 'application/pdf' then
    if new.storage_path !~ '\.pdf$' then
      raise exception 'PDF assets must use a .pdf extension' using errcode = '23514';
    end if;
  elsif new.mime_type <> 'image/webp' or new.storage_path !~ '\.webp$'
    or new.optimization is distinct from 'webp-lossless-v1'
    or new.original_byte_size is null or new.width is null or new.height is null
    or new.checksum_sha256 is null then
    raise exception 'New images must be optimized to lossless WebP by the media service' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger require_optimized_media before insert on public.media_assets
for each row execute function private.require_optimized_media();

-- Do not add triggers to storage.objects: Storage owns this schema. MIME restrictions,
-- removed client INSERT policies and server-only credentials enforce the write boundary.
comment on column public.media_assets.optimization is 'Server-verified optimizer version. No client image writes.';
