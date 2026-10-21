-- In-page anchors are valid CTA destinations; executable and protocol-relative URLs remain rejected.
create or replace function private.is_safe_href(p_href text) returns boolean
language sql immutable set search_path = '' as $$
 select p_href is not null and p_href !~ '[[:space:]\\]'
  and ((left(p_href,1)='/' and left(p_href,2)<>'//') or p_href ~ '^https://[^/]+'
   or p_href ~ '^(mailto:|tel:)[^:]' or p_href ~ '^#[a-zA-Z][a-zA-Z0-9_-]*$');
$$;
-- A team's public portrait must exist in the public CMS bucket.
create function private.validate_public_author() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 if new.is_public and new.avatar_asset_id is not null and not exists(
  select 1 from public.media_assets m where m.id=new.avatar_asset_id and m.site_id=new.site_id
   and m.bucket_id='cms-public' and exists(select 1 from storage.objects o where o.bucket_id=m.bucket_id and o.name=m.storage_path)
 ) then raise check_violation using message='La imagen del perfil público debe existir en cms-public'; end if;
 return new;
end;
$$;
create trigger validate_public_author before insert or update on public.authors for each row execute function private.validate_public_author();
