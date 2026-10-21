create function private.site_permission(p_site_id uuid, p_permission text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.sites s
    where s.id = p_site_id and private.has_org_permission(s.organization_id, p_permission));
$$;
create function private.is_public_site(p_site_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.sites s join public.organizations o on o.id = s.organization_id
    where s.id = p_site_id and s.status = 'active' and o.status = 'active');
$$;
create function private.is_public_entry(p_entry_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.content_entries e where e.id = p_entry_id
    and e.published_revision_id is not null and e.archived_at is null and private.is_public_site(e.site_id));
$$;
create function private.is_public_revision(p_revision_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.content_entries e where e.published_revision_id = p_revision_id
    and e.archived_at is null and private.is_public_site(e.site_id));
$$;
create function private.is_public_author(p_author_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.revision_authors a
    where a.author_id = p_author_id and private.is_public_revision(a.revision_id));
$$;
create function private.is_public_asset(p_asset_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.media_assets m where m.id = p_asset_id and m.bucket_id = 'cms-public'
    and (exists (select 1 from public.revision_assets a where a.asset_id = m.id and private.is_public_revision(a.revision_id))
      or exists (select 1 from public.content_revisions r where r.cover_asset_id = m.id and private.is_public_revision(r.id))
      or exists (select 1 from public.authors a where a.avatar_asset_id = m.id and private.is_public_author(a.id))));
$$;

create function private.guard_tenant_identity() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.id is distinct from old.id or new.organization_id is distinct from old.organization_id
    or to_jsonb(new) -> 'site_id' is distinct from to_jsonb(old) -> 'site_id' then
    raise exception 'Tenant identity cannot be changed' using errcode = '23514';
  end if;
  return new;
end;
$$;

create function private.prevent_parent_cycle() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_cycle boolean;
begin
  if new.parent_id is null then return new; end if;
  -- Serialize hierarchy changes within one site. A deadlock aborts one conflicting edit.
  perform 1 from public.sites where id = new.site_id for update;
  execute format('with recursive ancestors as (
    select id, parent_id from public.%I where id = $1
    union select p.id, p.parent_id from public.%I p join ancestors a on p.id = a.parent_id
  ) select exists (select 1 from ancestors where id = $2)', tg_table_name, tg_table_name)
  into v_cycle using new.parent_id, new.id;
  if v_cycle then raise exception 'Hierarchy cannot contain cycles' using errcode = '23514'; end if;
  return new;
end;
$$;

-- Published snapshots and every association belonging to them stay immutable forever.
create function private.guard_revision_snapshot() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_revision uuid; v_locked timestamptz;
begin
  if tg_table_name = 'content_revisions' then
    if old.locked_at is not null then
      raise exception 'Published revisions are immutable' using errcode = '23514';
    end if;
  else
    v_revision := case when tg_op = 'DELETE' then old.revision_id else new.revision_id end;
    select locked_at into v_locked from public.content_revisions where id = v_revision for update;
    if v_locked is not null then
      raise exception 'Published revisions are immutable' using errcode = '23514';
    end if;
    if tg_op = 'UPDATE' and old.revision_id is distinct from new.revision_id then
      raise exception 'Revision associations cannot be moved' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create function private.is_safe_href(p_href text) returns boolean
language sql immutable set search_path = '' as $$
  select p_href is not null and p_href !~ '[[:space:]\\]'
    and ((left(p_href, 1) = '/' and left(p_href, 2) <> '//')
      or p_href ~ '^https://[^/]+' or p_href ~ '^(mailto:|tel:)[^:]');
$$;

create function private.validate_block() returns trigger
language plpgsql set search_path = '' as $$
declare v_required text[]; v_key text; v_item jsonb;
begin
  select required_fields into v_required from public.block_types
  where code = new.type and schema_version = new.schema_version;
  if not found then raise exception 'Unknown block type/version' using errcode = '23514'; end if;
  foreach v_key in array v_required loop
    if not new.data ? v_key or new.data -> v_key = 'null'::jsonb then
      raise exception 'Missing block field: %', v_key using errcode = '23514';
    end if;
  end loop;
  foreach v_key in array array['heading', 'body', 'text', 'caption'] loop
    if new.data ? v_key and jsonb_typeof(new.data -> v_key) <> 'string' then
      raise exception 'Block field % must be a string', v_key using errcode = '23514';
    end if;
  end loop;
  if new.type in ('card_grid', 'checklist', 'steps', 'faq') then
    if jsonb_typeof(new.data -> 'items') <> 'array' or jsonb_array_length(new.data -> 'items') = 0 then
      raise exception 'Block items must be a nonempty array' using errcode = '23514';
    end if;
    for v_item in select value from jsonb_array_elements(new.data -> 'items') loop
      if jsonb_typeof(v_item) <> 'object' then
        raise exception 'Block items must be objects' using errcode = '23514';
      end if;
      v_required := case new.type when 'faq' then array['question', 'answer']
        when 'checklist' then array['text'] else array['heading', 'body'] end;
      foreach v_key in array v_required loop
        if coalesce(jsonb_typeof(v_item -> v_key), '') <> 'string' then
          raise exception 'Invalid item field: %', v_key using errcode = '23514';
        end if;
      end loop;
    end loop;
  end if;
  if new.type = 'rich_text' and (jsonb_typeof(new.data -> 'document') <> 'object'
    or coalesce(new.data #>> '{document,type}', '') <> 'doc'
    or coalesce(jsonb_typeof(new.data #> '{document,content}'), '') <> 'array') then
    raise exception 'Rich text must contain a structured document' using errcode = '23514';
  end if;
  if new.data ? 'actions' then
    if jsonb_typeof(new.data -> 'actions') <> 'array' then
      raise exception 'Actions must be an array' using errcode = '23514';
    end if;
    for v_item in select value from jsonb_array_elements(new.data -> 'actions') loop
      if coalesce(jsonb_typeof(v_item -> 'label'), '') <> 'string'
        or not private.is_safe_href(v_item ->> 'href') then
        raise exception 'Invalid action label or URL' using errcode = '23514';
      end if;
    end loop;
  end if;
  return new;
end;
$$;

alter table public.menu_items add constraint menu_items_safe_external_url
check (external_url is null or private.is_safe_href(external_url));

do $$
declare t text;
begin
  foreach t in array array['sites', 'media_assets', 'content_entries', 'content_revisions', 'content_blocks', 'revision_assets',
    'authors', 'taxonomies', 'terms', 'content_relations', 'content_routes', 'redirects', 'menus', 'menu_items', 'scheduled_publications'] loop
    execute format('create trigger guard_tenant_identity before update on public.%I for each row execute function private.guard_tenant_identity()', t);
  end loop;
  foreach t in array array['content_entries', 'terms', 'menu_items'] loop
    execute format('create trigger prevent_parent_cycle before insert or update of parent_id on public.%I for each row execute function private.prevent_parent_cycle()', t);
  end loop;
  foreach t in array array['content_blocks', 'revision_assets', 'revision_authors', 'revision_terms', 'content_relations'] loop
    execute format('create trigger guard_revision_snapshot before insert or update or delete on public.%I for each row execute function private.guard_revision_snapshot()', t);
  end loop;
end;
$$;
create trigger guard_revision_snapshot before update or delete on public.content_revisions
for each row execute function private.guard_revision_snapshot();
create trigger validate_block before insert or update on public.content_blocks
for each row execute function private.validate_block();

-- Save the entire editor payload atomically. Each save creates a new revision.
-- p_expected_revision_id must be the latest revision the editor loaded (NULL for the first).
create function public.save_content_revision(p_entry_id uuid, p_expected_revision_id uuid, p_content jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_entry public.content_entries; v_latest uuid; v_number integer; v_revision uuid;
  v_block jsonb; v_block_id uuid; v_asset jsonb; v_position integer := 0;
begin
  select * into v_entry from public.content_entries
  where id = p_entry_id and private.has_org_permission(organization_id, 'content.edit') for update;
  if not found then raise insufficient_privilege; end if;
  if jsonb_typeof(p_content) is distinct from 'object'
    or coalesce(jsonb_typeof(p_content -> 'blocks'), '') <> 'array' then
    raise exception 'Content must contain a blocks array' using errcode = '23514';
  end if;
  select id, revision_number into v_latest, v_number from public.content_revisions
  where entry_id = p_entry_id order by revision_number desc limit 1;
  if v_latest is distinct from p_expected_revision_id then
    raise exception 'Content changed; reload before saving' using errcode = '40001';
  end if;
  insert into public.content_revisions(organization_id, site_id, entry_id, revision_number,
    title, excerpt, path, cover_asset_id, template_key, template_version, seo, created_by)
  values (v_entry.organization_id, v_entry.site_id, v_entry.id, coalesce(v_number, 0) + 1,
    p_content ->> 'title', coalesce(p_content ->> 'excerpt', ''), p_content ->> 'path',
    (p_content ->> 'cover_asset_id')::uuid, coalesce(p_content ->> 'template_key', 'default'),
    coalesce((p_content ->> 'template_version')::integer, 1), coalesce(p_content -> 'seo', '{}'), auth.uid())
  returning id into v_revision;
  for v_block in select value from jsonb_array_elements(p_content -> 'blocks') loop
    insert into public.content_blocks(organization_id, site_id, revision_id, block_key, type, schema_version, position, variant, data)
    values (v_entry.organization_id, v_entry.site_id, v_revision,
      coalesce((v_block ->> 'key')::uuid, gen_random_uuid()), v_block ->> 'type',
      coalesce((v_block ->> 'schema_version')::integer, 1), v_position,
      coalesce(v_block ->> 'variant', 'default'), coalesce(v_block -> 'data', '{}')) returning id into v_block_id;
    for v_asset in select value from jsonb_array_elements(coalesce(v_block -> 'assets', '[]')) loop
      insert into public.revision_assets(organization_id, site_id, revision_id, block_id, asset_id, slot, alt_text, focal_point)
      values (v_entry.organization_id, v_entry.site_id, v_revision, v_block_id, (v_asset ->> 'asset_id')::uuid,
        coalesce(v_asset ->> 'slot', 'image'), coalesce(v_asset ->> 'alt_text', ''),
        coalesce(v_asset -> 'focal_point', '{"x":0.5,"y":0.5}'));
    end loop;
    v_position := v_position + 1;
  end loop;
  insert into public.revision_authors(organization_id, site_id, revision_id, author_id, position)
  select v_entry.organization_id, v_entry.site_id, v_revision, value::uuid, (ordinality - 1)::integer
  from jsonb_array_elements_text(coalesce(p_content -> 'authors', '[]')) with ordinality;
  insert into public.revision_terms(organization_id, site_id, revision_id, term_id)
  select v_entry.organization_id, v_entry.site_id, v_revision, value::uuid
  from jsonb_array_elements_text(coalesce(p_content -> 'terms', '[]'));
  insert into public.content_relations(organization_id, site_id, revision_id, target_entry_id, relation_type, position)
  select v_entry.organization_id, v_entry.site_id, v_revision, (value ->> 'entry_id')::uuid,
    coalesce(value ->> 'type', 'related'), (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_content -> 'relations', '[]')) with ordinality;
  update public.content_entries set updated_at = now() where id = p_entry_id;
  return v_revision;
end;
$$;

create function public.set_revision_state(p_revision_id uuid, p_state text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_revision public.content_revisions;
begin
  select * into v_revision from public.content_revisions where id = p_revision_id for update;
  if not found or not private.has_org_permission(v_revision.organization_id,
    case when p_state = 'approved' then 'content.publish' else 'content.edit' end) then
    raise insufficient_privilege;
  end if;
  update public.content_revisions set editorial_state = p_state where id = p_revision_id;
end;
$$;

create function private.publish_revision(p_revision_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_revision public.content_revisions; v_entry public.content_entries; v_old_path text;
begin
  -- Lock order is site -> entry -> revision; route claims are serialized per site.
  select * into v_revision from public.content_revisions where id = p_revision_id;
  if not found then raise no_data_found; end if;
  perform 1 from public.sites where id = v_revision.site_id for update;
  select * into v_entry from public.content_entries where id = v_revision.entry_id for update;
  select * into v_revision from public.content_revisions where id = p_revision_id for update;
  if v_revision.editorial_state <> 'approved' then
    raise exception 'Only approved revisions can be published' using errcode = '23514';
  end if;
  if v_entry.archived_at is not null or not exists (
    select 1 from public.organizations where id = v_entry.organization_id and status = 'active'
  ) then raise exception 'Cannot publish archived content or an inactive organization' using errcode = '23514'; end if;
  if exists (select 1 from public.content_routes where site_id = v_entry.site_id and locale = v_entry.locale
    and path = v_revision.path and entry_id <> v_entry.id)
    or exists (select 1 from public.redirects where site_id = v_entry.site_id and locale = v_entry.locale
      and from_path = v_revision.path and target_entry_id <> v_entry.id) then
    raise exception 'Path is already reserved by another content entry' using errcode = '23505';
  end if;
  if exists (
    select 1 from public.media_assets m where (
      m.id = v_revision.cover_asset_id or exists (
        select 1 from public.revision_assets a where a.revision_id = v_revision.id and a.asset_id = m.id
      ) or exists (
        select 1 from public.revision_authors ra join public.authors a on a.id = ra.author_id
        where ra.revision_id = v_revision.id and a.avatar_asset_id = m.id
      )
    ) and (m.bucket_id <> 'cms-public' or not exists (
      select 1 from storage.objects o where o.bucket_id = m.bucket_id and o.name = m.storage_path
    ))
  ) then raise exception 'Publishable assets must exist in cms-public' using errcode = '23514'; end if;
  if exists (select 1 from public.content_blocks b where b.revision_id = v_revision.id and b.type = 'image'
    and not exists (select 1 from public.revision_assets a where a.block_id = b.id)) then
    raise exception 'Image blocks must reference an asset' using errcode = '23514';
  end if;
  select path into v_old_path from public.content_routes where entry_id = v_entry.id;
  delete from public.redirects where site_id = v_entry.site_id and locale = v_entry.locale
    and from_path = v_revision.path and target_entry_id = v_entry.id;
  insert into public.content_routes(organization_id, site_id, entry_id, locale, path)
  values (v_entry.organization_id, v_entry.site_id, v_entry.id, v_entry.locale, v_revision.path)
  on conflict (entry_id) do update set path = excluded.path;
  if v_old_path is not null and v_old_path <> v_revision.path then
    insert into public.redirects(organization_id, site_id, locale, from_path, target_entry_id)
    values (v_entry.organization_id, v_entry.site_id, v_entry.locale, v_old_path, v_entry.id)
    on conflict (site_id, locale, from_path) do update set target_entry_id = excluded.target_entry_id;
  end if;
  if v_revision.locked_at is null then
    update public.content_revisions set locked_at = now() where id = v_revision.id;
  end if;
  update public.content_entries set published_revision_id = v_revision.id,
    first_published_at = coalesce(first_published_at, now()) where id = v_entry.id;
  insert into public.publication_events(organization_id, site_id, entry_id, revision_id, action)
  values (v_entry.organization_id, v_entry.site_id, v_entry.id, v_revision.id, 'published');
end;
$$;

create function public.publish_content_revision(p_revision_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.content_revisions
    where id = p_revision_id and private.has_org_permission(organization_id, 'content.publish')) then
    raise insufficient_privilege;
  end if;
  perform private.publish_revision(p_revision_id);
end;
$$;

create function public.unpublish_content(p_entry_id uuid, p_archive boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
declare v_entry public.content_entries;
begin
  select * into v_entry from public.content_entries
  where id = p_entry_id and private.has_org_permission(organization_id, 'content.publish') for update;
  if not found then raise insufficient_privilege; end if;
  update public.content_entries set published_revision_id = null,
    archived_at = case when p_archive then now() else null end where id = p_entry_id;
  update public.scheduled_publications set status = 'cancelled' where entry_id = p_entry_id and status = 'pending';
  insert into public.publication_events(organization_id, site_id, entry_id, action)
  values (v_entry.organization_id, v_entry.site_id, v_entry.id, 'unpublished');
end;
$$;

-- Called by a trusted scheduled worker, never by a browser. Recheck the requester's
-- current permissions so a revoked admin cannot leave a future publication behind.
create function public.process_scheduled_publications(p_limit integer default 25) returns integer
language plpgsql security definer set search_path = '' as $$
declare j public.scheduled_publications; v_processed integer := 0; v_allowed boolean;
begin
  if p_limit < 1 or p_limit > 100 then raise invalid_parameter_value; end if;
  for j in select * from public.scheduled_publications where status = 'pending' and run_at <= now()
    order by run_at for update skip locked limit p_limit loop
    begin
      select exists (
        select 1 from public.profiles p where p.id = j.requested_by and p.status = 'active'
          and (exists (select 1 from public.platform_role_assignments r where r.user_id = p.id)
          or exists (select 1 from public.organization_memberships m
            join public.membership_roles r on r.membership_id = m.id
            join public.role_permissions rp on rp.role_code = r.role_code
            where m.user_id = p.id and m.organization_id = j.organization_id and m.status = 'active'
              and rp.permission_code = 'content.publish'))
      ) into v_allowed;
      if not v_allowed then raise insufficient_privilege; end if;
      perform private.publish_revision(j.revision_id);
      update public.scheduled_publications set status = 'completed', completed_at = now() where id = j.id;
    exception when others then
      update public.scheduled_publications set status = 'failed', error_message = sqlerrm, completed_at = now() where id = j.id;
    end;
    v_processed := v_processed + 1;
  end loop;
  return v_processed;
end;
$$;

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_active_user(), private.is_super_admin(), private.is_org_member(uuid),
  private.has_org_permission(uuid, text), private.site_permission(uuid, text), private.is_safe_href(text) to authenticated;
grant execute on function private.is_safe_href(text) to service_role;
grant execute on function private.is_public_site(uuid), private.is_public_entry(uuid),
  private.is_public_revision(uuid), private.is_public_author(uuid), private.is_public_asset(uuid) to anon, authenticated, service_role;
revoke all on function public.save_content_revision(uuid, uuid, jsonb), public.set_revision_state(uuid, text),
  public.publish_content_revision(uuid), public.unpublish_content(uuid, boolean),
  public.process_scheduled_publications(integer) from public, anon, authenticated;
grant execute on function public.save_content_revision(uuid, uuid, jsonb), public.set_revision_state(uuid, text),
  public.publish_content_revision(uuid), public.unpublish_content(uuid, boolean) to authenticated;
grant execute on function public.process_scheduled_publications(integer) to service_role;
