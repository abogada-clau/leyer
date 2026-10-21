-- Panel APIs: identities remain user-scoped; permissions always consult current rows.
alter table public.profiles add column preferences jsonb not null default '{}'
  check (jsonb_typeof(preferences) = 'object');
grant update (preferences) on public.profiles to authenticated;

create function public.get_admin_context() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'profile', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'super_admin', private.is_super_admin(),
    'organizations', coalesce((select jsonb_agg(to_jsonb(o) order by o.name)
      from public.organizations o where private.is_super_admin() or private.is_org_member(o.id)), '[]'),
    'memberships', coalesce((select jsonb_agg(to_jsonb(m) || jsonb_build_object('roles',
      (select coalesce(jsonb_agg(r.role_code), '[]') from public.membership_roles r where r.membership_id = m.id)))
      from public.organization_memberships m where m.user_id = auth.uid()), '[]'),
    'sites', coalesce((select jsonb_agg(to_jsonb(s) || jsonb_build_object('permissions',
      (select coalesce(jsonb_agg(p.code), '[]') from public.permissions p where private.site_permission(s.id, p.code))) order by s.name)
      from public.sites s where private.site_permission(s.id, 'content.read')), '[]'))
  where auth.uid() is not null;
$$;

create function public.get_cms_listing(p_site_id uuid)
returns table (id uuid, internal_name text, kind text, locale text, parent_id uuid,
  published_revision_id uuid, archived_at timestamptz, updated_at timestamptz,
  revision_id uuid, revision_number integer, title text, path text, editorial_state text)
language sql stable security definer set search_path = '' as $$
  select e.id, e.internal_name, e.kind, e.locale, e.parent_id, e.published_revision_id, e.archived_at, e.updated_at,
    r.id, r.revision_number, r.title, r.path, r.editorial_state
  from public.content_entries e left join lateral (
    select r.* from public.content_revisions r where r.entry_id = e.id order by r.revision_number desc limit 1
  ) r on true where e.site_id = p_site_id and private.site_permission(p_site_id, 'content.read');
$$;

create function public.get_cms_dashboard(p_site_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.site_permission(p_site_id, 'content.read') then raise insufficient_privilege; end if;
  return jsonb_build_object(
    'published', (select count(*) from public.content_entries where site_id = p_site_id and published_revision_id is not null),
    'draft', (select count(*) from public.get_cms_listing(p_site_id) where archived_at is null and coalesce(editorial_state, 'draft') = 'draft' and revision_id is distinct from published_revision_id),
    'review', (select count(*) from public.get_cms_listing(p_site_id) where archived_at is null and editorial_state = 'in_review'),
    'media', (select count(*) from public.media_assets where site_id = p_site_id));
end;
$$;

create function public.get_cms_snapshot(p_revision_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(r) || jsonb_build_object(
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('key', b.block_key, 'type', b.type,
      'schema_version', b.schema_version, 'variant', b.variant, 'data', b.data,
      'assets', coalesce((select jsonb_agg(jsonb_build_object('asset_id', a.asset_id, 'slot', a.slot,
        'alt_text', a.alt_text, 'focal_point', a.focal_point)) from public.revision_assets a where a.block_id = b.id), '[]')) order by b.position)
      from public.content_blocks b where b.revision_id = r.id), '[]'),
    'authors', coalesce((select jsonb_agg(a.author_id order by a.position) from public.revision_authors a where a.revision_id = r.id), '[]'),
    'terms', coalesce((select jsonb_agg(t.term_id) from public.revision_terms t where t.revision_id = r.id), '[]'),
    'relations', coalesce((select jsonb_agg(jsonb_build_object('entry_id', c.target_entry_id, 'type', c.relation_type) order by c.position)
      from public.content_relations c where c.revision_id = r.id), '[]'))
  from public.content_revisions r where r.id = p_revision_id and private.site_permission(r.site_id, 'content.read');
$$;

-- Revision + editor metadata save in one transaction, using the existing concurrency contract.
create function public.save_cms_entry(p_entry_id uuid, p_expected_revision_id uuid,
  p_internal_name text, p_parent_id uuid, p_content jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_revision uuid;
begin
  v_revision := public.save_content_revision(p_entry_id, p_expected_revision_id, p_content);
  update public.content_entries set internal_name = p_internal_name, parent_id = p_parent_id where id = p_entry_id;
  return v_revision;
end;
$$;

create function public.set_membership_access(p_membership_id uuid, p_status text, p_roles text[]) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_super_admin() then raise insufficient_privilege; end if;
  if p_roles is null or not p_roles <@ array['admin', 'lawyer']::text[] then raise invalid_parameter_value; end if;
  perform 1 from public.organization_memberships where id = p_membership_id for update;
  if not found then raise no_data_found; end if;
  update public.organization_memberships set status = p_status where id = p_membership_id;
  delete from public.membership_roles where membership_id = p_membership_id and not (role_code = any(p_roles));
  insert into public.membership_roles(membership_id, role_code, granted_by)
  select p_membership_id, r, auth.uid() from (select distinct unnest(p_roles) r) roles
  on conflict do nothing;
end;
$$;

-- Metadata can be corrected without touching immutable binary objects or snapshots.
grant update (alt_text, credits) on public.media_assets to authenticated;
create policy media_metadata_update on public.media_assets for update to authenticated
using (private.site_permission(site_id, 'media.manage')) with check (private.site_permission(site_id, 'media.manage'));

create function public.manage_cms_redirect(p_site_id uuid, p_id uuid, p_locale text,
  p_from_path text, p_target_entry_id uuid, p_status_code integer, p_delete boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.site_permission(p_site_id, 'sites.manage') then raise insufficient_privilege; end if;
  perform 1 from public.sites where id = p_site_id for update;
  if p_delete then
    delete from public.redirects where id = p_id and site_id = p_site_id;
    return;
  end if;
  if p_from_path !~ '^/' or p_from_path ~ '[?#%[:space:]\\]' or p_from_path ~ '//' or p_from_path ~ '(^|/)\.\.?(/|$)'
    or (p_from_path <> '/' and right(p_from_path, 1) = '/') then raise check_violation using message = 'Ruta inválida'; end if;
  if not exists (select 1 from public.content_entries where id = p_target_entry_id and site_id = p_site_id and locale = p_locale)
    or exists (select 1 from public.content_routes where site_id = p_site_id and locale = p_locale and path = p_from_path) then
    raise check_violation using message = 'El destino debe pertenecer al sitio e idioma; la ruta no puede ser canónica';
  end if;
  if p_id is null then
    insert into public.redirects(organization_id, site_id, locale, from_path, target_entry_id, status_code)
    select organization_id, id, p_locale, p_from_path, p_target_entry_id, p_status_code from public.sites where id = p_site_id;
  else
    update public.redirects set locale = p_locale, from_path = p_from_path,
      target_entry_id = p_target_entry_id, status_code = p_status_code where id = p_id and site_id = p_site_id;
  end if;
end;
$$;

revoke all on function public.get_admin_context(), public.get_cms_listing(uuid), public.get_cms_dashboard(uuid),
  public.get_cms_snapshot(uuid), public.save_cms_entry(uuid, uuid, text, uuid, jsonb),
  public.set_membership_access(uuid, text, text[]), public.manage_cms_redirect(uuid, uuid, text, text, uuid, integer, boolean)
  from public, anon, authenticated;
grant execute on function public.get_admin_context(), public.get_cms_listing(uuid), public.get_cms_dashboard(uuid),
  public.get_cms_snapshot(uuid), public.save_cms_entry(uuid, uuid, text, uuid, jsonb),
  public.set_membership_access(uuid, text, text[]), public.manage_cms_redirect(uuid, uuid, text, text, uuid, integer, boolean)
  to authenticated;

create function public.create_membership_access(p_organization_id uuid, p_user_id uuid, p_status text, p_roles text[]) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not private.is_super_admin() then raise insufficient_privilege; end if;
  insert into public.organization_memberships(organization_id, user_id, status)
  values (p_organization_id, p_user_id, p_status) returning id into v_id;
  perform public.set_membership_access(v_id, p_status, p_roles);
  return v_id;
end;
$$;
revoke all on function public.create_membership_access(uuid, uuid, text, text[]) from public, anon, authenticated;
grant execute on function public.create_membership_access(uuid, uuid, text, text[]) to authenticated;
