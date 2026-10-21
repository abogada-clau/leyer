-- Entries with no saved revision are drafts too. Preserve existing records.
create or replace function public.get_cms_dashboard(p_site_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.site_permission(p_site_id, 'content.read') then raise insufficient_privilege; end if;
  return jsonb_build_object(
    'published', (select count(*) from public.content_entries where site_id = p_site_id and published_revision_id is not null),
    'draft', (select count(*) from public.get_cms_listing(p_site_id) where archived_at is null and coalesce(editorial_state, 'draft') = 'draft' and (revision_id is null or revision_id is distinct from published_revision_id)),
    'review', (select count(*) from public.get_cms_listing(p_site_id) where archived_at is null and editorial_state = 'in_review'),
    'media', (select count(*) from public.media_assets where site_id = p_site_id));
end;
$$;
