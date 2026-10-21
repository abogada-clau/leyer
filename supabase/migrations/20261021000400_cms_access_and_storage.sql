-- All DML is opt-in. In particular, revisions/routes/publication pointers cannot
-- be written directly by authenticated clients: use the transactional RPCs.
grant select on public.sites to anon, authenticated;
grant insert on public.sites to authenticated;
grant update (name, domain, default_locale, status, settings) on public.sites to authenticated;
create policy sites_read on public.sites for select to anon, authenticated
using (private.is_public_site(id) or private.site_permission(id, 'content.read'));
create policy sites_insert on public.sites for insert to authenticated
with check (private.has_org_permission(organization_id, 'sites.manage'));
create policy sites_update on public.sites for update to authenticated
using (private.has_org_permission(organization_id, 'sites.manage'))
with check (private.has_org_permission(organization_id, 'sites.manage'));

grant select on public.block_types to authenticated;
create policy block_types_read on public.block_types for select to authenticated using (private.is_active_user());

-- An authenticated account with no roles is still a public visitor. Column
-- grants must not reveal private editor metadata just because it signed up.
grant select (id, organization_id, site_id, kind, locale, parent_id, published_revision_id,
  first_published_at, archived_at, created_at, updated_at) on public.content_entries to authenticated;
grant select (id, organization_id, site_id, entry_id, revision_number, title, excerpt, path,
  cover_asset_id, template_key, template_version, seo, editorial_state, locked_at, created_at, updated_at)
  on public.content_revisions to authenticated;
grant select (id, organization_id, site_id, kind, locale, parent_id, published_revision_id, first_published_at)
  on public.content_entries to anon;
grant select (id, organization_id, site_id, entry_id, title, excerpt, path, cover_asset_id,
  template_key, template_version, seo, created_at) on public.content_revisions to anon;
grant insert (id, organization_id, site_id, kind, internal_name, locale, parent_id) on public.content_entries to authenticated;
grant update (internal_name, parent_id) on public.content_entries to authenticated;
create policy entries_read on public.content_entries for select to anon, authenticated
using (private.is_public_entry(id) or private.site_permission(site_id, 'content.read'));
create policy entries_insert on public.content_entries for insert to authenticated
with check (private.site_permission(site_id, 'content.edit') and created_by = (select auth.uid()));
create policy entries_update on public.content_entries for update to authenticated
using (private.site_permission(site_id, 'content.edit')) with check (private.site_permission(site_id, 'content.edit'));
create policy revisions_read on public.content_revisions for select to anon, authenticated
using (private.is_public_revision(id) or private.site_permission(site_id, 'content.read'));

-- Anon can evaluate every public policy without access to private membership data.
grant execute on function private.site_permission(uuid, text) to anon;

do $$
declare t text;
begin
  foreach t in array array['content_blocks', 'revision_assets', 'revision_authors', 'revision_terms', 'content_relations'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('create policy revision_children_read on public.%I for select to anon, authenticated
      using (private.is_public_revision(revision_id) or private.site_permission(site_id, ''content.read''))', t);
  end loop;
end;
$$;

grant select on public.content_routes, public.redirects to anon, authenticated;
create policy routes_read on public.content_routes for select to anon, authenticated
using (private.is_public_entry(entry_id) or private.site_permission(site_id, 'content.read'));
create policy redirects_read on public.redirects for select to anon, authenticated
using (private.is_public_entry(target_entry_id) or private.site_permission(site_id, 'content.read'));

grant select on public.authors, public.taxonomies, public.terms to anon, authenticated;
grant insert, update, delete on public.authors, public.taxonomies, public.terms to authenticated;
create policy authors_read on public.authors for select to anon, authenticated
using (private.is_public_author(id) or private.site_permission(site_id, 'content.read'));
create policy terms_read on public.terms for select to anon, authenticated using (
  private.site_permission(site_id, 'content.read') or exists (
    select 1 from public.revision_terms r where r.term_id = terms.id and private.is_public_revision(r.revision_id)
  )
);
create policy taxonomies_read on public.taxonomies for select to anon, authenticated using (
  private.site_permission(site_id, 'content.read') or exists (
    select 1 from public.terms t where t.taxonomy_id = taxonomies.id
  )
);
do $$
declare t text;
begin
  foreach t in array array['authors', 'taxonomies', 'terms'] loop
    execute format('create policy editor_insert on public.%I for insert to authenticated
      with check (private.site_permission(site_id, ''content.edit''))', t);
    execute format('create policy editor_update on public.%I for update to authenticated
      using (private.site_permission(site_id, ''content.edit'')) with check (private.site_permission(site_id, ''content.edit''))', t);
    execute format('create policy editor_delete on public.%I for delete to authenticated
      using (private.site_permission(site_id, ''content.edit''))', t);
  end loop;
end;
$$;

create function private.validate_author_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.authors a join public.organization_memberships m
    on m.organization_id = a.organization_id where a.id = new.author_id and m.user_id = new.user_id) then
    raise exception 'Author account must belong to the same organization' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger validate_author_user before insert or update on public.author_users
for each row execute function private.validate_author_user();
grant select, insert, update, delete on public.author_users to authenticated;
create policy author_users_manage on public.author_users for all to authenticated
using (exists (select 1 from public.authors a where a.id = author_id and private.site_permission(a.site_id, 'content.edit')))
with check (exists (select 1 from public.authors a where a.id = author_id and private.site_permission(a.site_id, 'content.edit')));

grant select (id, organization_id, site_id, bucket_id, storage_path, mime_type,
  byte_size, width, height, alt_text, credits) on public.media_assets to anon, authenticated;
grant insert (id, organization_id, site_id, bucket_id, storage_path, filename, mime_type, byte_size,
  width, height, checksum_sha256, alt_text, credits) on public.media_assets to authenticated;
grant delete on public.media_assets to authenticated;
create policy media_read on public.media_assets for select to anon, authenticated
using (private.is_public_asset(id) or private.site_permission(site_id, 'content.read'));
create policy media_insert on public.media_assets for insert to authenticated
with check (private.site_permission(site_id, 'media.manage') and created_by = (select auth.uid()));
create policy media_delete on public.media_assets for delete to authenticated
using (private.site_permission(site_id, 'media.manage') and not exists (
  select 1 from storage.objects o where o.bucket_id = media_assets.bucket_id and o.name = media_assets.storage_path
));

-- Internal CMS reads return full records only after checking the current user's
-- site permission. Keeping them separate avoids leaking private columns through
-- a public row policy to accounts that registered without any role.
create function public.get_cms_entries(p_site_id uuid) returns setof public.content_entries
language sql stable security definer set search_path = '' as $$
  select e.* from public.content_entries e
  where e.site_id = p_site_id and private.site_permission(p_site_id, 'content.read');
$$;
create function public.get_cms_revisions(p_entry_id uuid) returns setof public.content_revisions
language sql stable security definer set search_path = '' as $$
  select r.* from public.content_revisions r
  where r.entry_id = p_entry_id and private.site_permission(r.site_id, 'content.read');
$$;
create function public.get_cms_media(p_site_id uuid) returns setof public.media_assets
language sql stable security definer set search_path = '' as $$
  select m.* from public.media_assets m
  where m.site_id = p_site_id and private.site_permission(p_site_id, 'content.read');
$$;
revoke all on function public.get_cms_entries(uuid), public.get_cms_revisions(uuid),
  public.get_cms_media(uuid) from public, anon, authenticated;
grant execute on function public.get_cms_entries(uuid), public.get_cms_revisions(uuid),
  public.get_cms_media(uuid) to authenticated;

grant select, insert, update, delete on public.menus, public.menu_items to authenticated;
grant select on public.menus, public.menu_items to anon;
create policy menus_read on public.menus for select to anon, authenticated
using ((is_public and private.is_public_site(site_id)) or private.site_permission(site_id, 'content.read'));
create policy menu_items_read on public.menu_items for select to anon, authenticated using (
  private.site_permission(site_id, 'content.read') or (
    exists (select 1 from public.menus m where m.id = menu_id and m.is_public and private.is_public_site(m.site_id))
    and (entry_id is null or private.is_public_entry(entry_id))
  )
);
do $$
declare t text;
begin
  foreach t in array array['menus', 'menu_items'] loop
    execute format('create policy navigation_insert on public.%I for insert to authenticated
      with check (private.site_permission(site_id, ''sites.manage''))', t);
    execute format('create policy navigation_update on public.%I for update to authenticated
      using (private.site_permission(site_id, ''sites.manage'')) with check (private.site_permission(site_id, ''sites.manage''))', t);
    execute format('create policy navigation_delete on public.%I for delete to authenticated
      using (private.site_permission(site_id, ''sites.manage''))', t);
  end loop;
end;
$$;

grant select on public.scheduled_publications to authenticated;
grant insert (organization_id, site_id, entry_id, revision_id, run_at) on public.scheduled_publications to authenticated;
grant update (status) on public.scheduled_publications to authenticated;
create policy scheduled_read on public.scheduled_publications for select to authenticated
using (private.site_permission(site_id, 'content.read'));
create policy scheduled_insert on public.scheduled_publications for insert to authenticated with check (
  private.site_permission(site_id, 'content.publish') and requested_by = (select auth.uid())
  and status = 'pending' and run_at > now() and exists (
    select 1 from public.content_revisions r where r.id = revision_id and r.editorial_state = 'approved'
  )
);
create policy scheduled_cancel on public.scheduled_publications for update to authenticated
using (private.site_permission(site_id, 'content.publish') and status = 'pending')
with check (private.site_permission(site_id, 'content.publish') and status = 'cancelled');
-- No client policies on publication_events. Only the trusted worker consumes it.
grant usage, select on sequence public.publication_events_id_seq to service_role;

create view public.published_content with (security_invoker = true) as
select e.id, e.organization_id, e.site_id, e.kind, e.locale, e.parent_id, e.first_published_at,
  r.id as revision_id, r.title, r.excerpt, r.path, r.cover_asset_id,
  r.template_key, r.template_version, r.seo
from public.content_entries e join public.content_revisions r on r.id = e.published_revision_id
where private.is_public_entry(e.id);
grant select on public.published_content to anon, authenticated, service_role;

-- Public media is intentionally public even before a page uses it. Draft-only
-- uploads go into cms-private and must be copied to a new public asset to publish.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values
  ('cms-public', 'cms-public', true, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'application/pdf']),
  ('cms-private', 'cms-private', false, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'application/pdf']);

-- No casting path components to UUID: malformed Storage names simply fail authorization.
create function private.can_read_storage_object(p_bucket text, p_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.media_assets m where m.bucket_id = p_bucket and m.storage_path = p_name
    and private.site_permission(m.site_id, 'content.read'));
$$;
create function private.can_write_storage_object(p_bucket text, p_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.media_assets m where m.bucket_id = p_bucket and m.storage_path = p_name
    and private.site_permission(m.site_id, 'media.manage')
    and not exists (select 1 from public.revision_assets a join public.content_revisions r on r.id = a.revision_id
      where a.asset_id = m.id and r.locked_at is not null)
    and not exists (select 1 from public.content_revisions r where r.cover_asset_id = m.id and r.locked_at is not null)
    and not exists (select 1 from public.authors a join public.revision_authors ra on ra.author_id = a.id
      join public.content_revisions r on r.id = ra.revision_id where a.avatar_asset_id = m.id and r.locked_at is not null));
$$;
grant execute on function private.can_read_storage_object(text, text), private.can_write_storage_object(text, text) to authenticated;

-- Serialize deletes against publication and check all historical snapshots again
-- after acquiring the site lock. This also protects trusted Storage API callers.
create function private.guard_cms_storage_object() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_asset public.media_assets;
begin
  if old.bucket_id not in ('cms-public', 'cms-private') then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  -- Storage may update access timestamps without changing file contents.
  if tg_op = 'UPDATE' and old.bucket_id = new.bucket_id and old.name = new.name
    and old.metadata is not distinct from new.metadata
    and old.version is not distinct from new.version then return new; end if;
  select * into v_asset from public.media_assets
  where bucket_id = old.bucket_id and storage_path = old.name;
  if found then
    perform 1 from public.sites where id = v_asset.site_id for update;
    if exists (select 1 from public.revision_assets a join public.content_revisions r on r.id = a.revision_id
        where a.asset_id = v_asset.id and r.locked_at is not null)
      or exists (select 1 from public.content_revisions r where r.cover_asset_id = v_asset.id and r.locked_at is not null)
      or exists (select 1 from public.authors a join public.revision_authors ra on ra.author_id = a.id
        join public.content_revisions r on r.id = ra.revision_id
        where a.avatar_asset_id = v_asset.id and r.locked_at is not null) then
      raise exception 'Published assets are immutable' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger leyer_guard_cms_storage_object before update or delete on storage.objects
for each row execute function private.guard_cms_storage_object();

create policy leyer_cms_storage_read on storage.objects for select to authenticated
using (bucket_id in ('cms-public', 'cms-private') and private.can_read_storage_object(bucket_id, name));
create policy leyer_cms_storage_insert on storage.objects for insert to authenticated
with check (bucket_id in ('cms-public', 'cms-private') and private.can_write_storage_object(bucket_id, name));
-- Files are immutable: upload a new asset instead of overwriting an existing path.
-- No UPDATE policy, so rename/move/upsert are denied for authenticated clients.
create policy leyer_cms_storage_delete on storage.objects for delete to authenticated
using (bucket_id in ('cms-public', 'cms-private') and private.can_write_storage_object(bucket_id, name));

comment on table public.platform_role_assignments is 'Global super_admin grants; no automatic promotion on signup.';
comment on table public.membership_roles is 'Zero or more organization roles per membership; scopes enforced by FK.';
comment on table public.content_revisions is 'Snapshots created by save_content_revision; published snapshots remain immutable.';
comment on table public.revision_assets is 'Explicit asset references for FK integrity, deletion protection and publication checks.';
comment on table public.publication_events is 'Transactional outbox for cache invalidation; service_role worker only.';
comment on table public.sites is 'settings is public presentation configuration, never secrets or internal business data.';
