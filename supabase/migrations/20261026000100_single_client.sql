-- One client, one site, direct administrator access. Historical migrations are retained.
-- Existing ALBAR installations are recognized by their private seed registry.
-- Multiple unrecognized sites cause an error instead of silently choosing a client.
-- Retired demo records and the former access model are archived privately before removal.
create table if not exists private.cms_seed_registry(seed_key text primary key,site_id uuid not null unique references public.sites(id),state jsonb not null default '{}',updated_at timestamptz not null default now());
alter table private.cms_seed_registry enable row level security;
revoke all on private.cms_seed_registry from public,anon,authenticated,service_role;
alter table public.redirects drop constraint "redirects_target_entry_id_site_id_organization_id_fkey";
alter table public.audit_events drop constraint "audit_events_organization_id_fkey";
alter table public.sites drop constraint "sites_organization_id_fkey";
alter table public.media_assets drop constraint "media_assets_site_id_organization_id_fkey";
alter table public.authors drop constraint "authors_site_id_organization_id_fkey";
alter table public.content_entries drop constraint "content_entries_site_id_organization_id_fkey";
alter table public.content_entries drop constraint "content_entries_parent_id_site_id_organization_id_fkey";
alter table public.authors drop constraint "authors_avatar_asset_id_site_id_organization_id_fkey";
alter table public.content_revisions drop constraint "content_revisions_entry_id_site_id_organization_id_fkey";
alter table public.content_revisions drop constraint "content_revisions_cover_asset_id_site_id_organization_id_fkey";
alter table public.content_entries drop constraint "published_revision_belongs_to_entry";
alter table public.content_blocks drop constraint "content_blocks_revision_id_site_id_organization_id_fkey";
alter table public.revision_assets drop constraint "revision_assets_revision_id_site_id_organization_id_fkey";
alter table public.revision_assets drop constraint "revision_assets_block_id_revision_id_site_id_organization__fkey";
alter table public.revision_assets drop constraint "revision_assets_asset_id_site_id_organization_id_fkey";
alter table public.revision_authors drop constraint "revision_authors_revision_id_site_id_organization_id_fkey";
alter table public.revision_authors drop constraint "revision_authors_author_id_site_id_organization_id_fkey";
alter table public.taxonomies drop constraint "taxonomies_site_id_organization_id_fkey";
alter table public.terms drop constraint "terms_taxonomy_id_site_id_organization_id_fkey";
alter table public.terms drop constraint "terms_parent_id_taxonomy_id_site_id_organization_id_fkey";
alter table public.revision_terms drop constraint "revision_terms_revision_id_site_id_organization_id_fkey";
alter table public.revision_terms drop constraint "revision_terms_term_id_site_id_organization_id_fkey";
alter table public.content_relations drop constraint "content_relations_revision_id_site_id_organization_id_fkey";
alter table public.content_relations drop constraint "content_relations_target_entry_id_site_id_organization_id_fkey";
alter table public.content_routes drop constraint "content_routes_entry_id_site_id_organization_id_fkey";
alter table public.menus drop constraint "menus_site_id_organization_id_fkey";
alter table public.menu_items drop constraint "menu_items_menu_id_site_id_organization_id_fkey";
alter table public.menu_items drop constraint "menu_items_parent_id_menu_id_site_id_organization_id_fkey";
alter table public.menu_items drop constraint "menu_items_entry_id_site_id_organization_id_fkey";
alter table public.scheduled_publications drop constraint "scheduled_publications_revision_id_entry_id_site_id_organi_fkey";
alter table public.publication_events drop constraint "publication_events_entry_id_site_id_organization_id_fkey";
alter table public.publication_events drop constraint "publication_events_revision_id_entry_id_site_id_organizati_fkey";
alter table public.contact_submissions drop constraint "contact_submissions_site_id_organization_id_fkey";
alter table public.contact_submissions drop constraint "contact_submissions_source_entry_id_site_id_organization_i_fkey";
alter table public.contact_submissions drop constraint "contact_submissions_privacy_revision_id_site_id_organizati_fkey";
alter table private.cms_seed_registry drop constraint if exists "cms_seed_registry_organization_id_fkey";
alter table public.menus drop constraint "menus_id_site_id_organization_id_key";
alter table public.authors drop constraint "authors_id_site_id_organization_id_key";
alter table public.sites drop constraint "sites_organization_id_slug_key";
alter table public.sites drop constraint "sites_id_organization_id_key";
alter table public.media_assets drop constraint "media_assets_check";
alter table public.media_assets drop constraint "media_assets_id_site_id_organization_id_key";
alter table public.content_entries drop constraint "content_entries_id_site_id_organization_id_key";
alter table public.content_revisions drop constraint "content_revisions_id_site_id_organization_id_key";
alter table public.content_revisions drop constraint "content_revisions_id_entry_id_site_id_organization_id_key";
alter table public.content_blocks drop constraint "content_blocks_id_revision_id_site_id_organization_id_key";
alter table public.taxonomies drop constraint "taxonomies_id_site_id_organization_id_key";
alter table public.terms drop constraint "terms_id_taxonomy_id_site_id_organization_id_key";
alter table public.terms drop constraint "terms_id_site_id_organization_id_key";
alter table public.menu_items drop constraint "menu_items_id_menu_id_site_id_organization_id_key";
alter table private.cms_seed_registry drop constraint if exists "cms_seed_registry_organization_id_key";
create table private.retired_installation_records (
  source_table text not null,
  record jsonb not null,
  archived_at timestamptz not null default now()
);
alter table private.retired_installation_records enable row level security;
revoke all on private.retired_installation_records from public, anon, authenticated, service_role;

do $migration$
declare chosen uuid; t record; site_count integer;
begin
  lock table public.sites in access exclusive mode;
  select count(*) into site_count from public.sites;
  if to_regclass('private.cms_seed_registry') is not null then
    execute 'select site_id from private.cms_seed_registry where seed_key = $1'
      into chosen using 'albar-abogados-editorial-v1';
  end if;
  if chosen is null and site_count = 1 then select id into chosen from public.sites; end if;
  if chosen is null and site_count > 1 then
    raise exception 'Single-client migration requires exactly one site or the registered ALBAR site. No records were changed.';
  end if;
  -- Preserve access records for recovery; none of this archive is exposed by the Data API.
  if site_count > 1 then
    for t in select table_schema,table_name from information_schema.columns
      where column_name='site_id' and table_schema in ('public','private')
      and table_name not in ('published_content') loop
      execute format('alter table %I.%I disable trigger user',t.table_schema,t.table_name);
      execute format('insert into private.retired_installation_records(source_table,record) select %L,to_jsonb(x) from %I.%I x where site_id <> $1',t.table_schema||'.'||t.table_name,t.table_schema,t.table_name) using chosen;
    end loop;
    insert into private.retired_installation_records(source_table,record)
      select 'public.author_users',to_jsonb(a) from public.author_users a
      join public.authors u on u.id=a.author_id where u.site_id<>chosen;
    delete from public.author_users where author_id in (select id from public.authors where site_id<>chosen);
    for t in select table_schema,table_name from information_schema.columns
      where column_name='site_id' and table_schema in ('public','private')
      and table_name not in ('published_content') loop
      execute format('delete from %I.%I where site_id <> $1',t.table_schema,t.table_name) using chosen;
      execute format('alter table %I.%I enable trigger user',t.table_schema,t.table_name);
    end loop;
    alter table public.sites disable trigger user;
    insert into private.retired_installation_records(source_table,record)
      select 'public.sites',to_jsonb(s) from public.sites s where id<>chosen;
    delete from public.sites where id<>chosen;
    alter table public.sites enable trigger user;
    set constraints all immediate;
  end if;
end;
$migration$;

alter table public.profiles add column is_admin boolean not null default false;
-- Preserve the existing owner's and the retained client's active editors' access.
update public.profiles p set is_admin=true where
  exists(select 1 from public.platform_role_assignments r where r.user_id=p.id)
  or exists(select 1 from public.organization_memberships m
    join public.membership_roles r on r.membership_id=m.id and r.role_code='admin'
    join public.sites s on s.organization_id=m.organization_id
    where m.user_id=p.id and m.status='active');

create function private.is_admin() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles where id=auth.uid() and status='active' and is_admin);
$$;
grant execute on function private.is_admin() to anon, authenticated, service_role;

create or replace function private.site_permission(p_site_id uuid,p_permission text) returns boolean
language sql stable security definer set search_path='' as $$
  select private.is_admin() and exists(select 1 from public.sites where id=p_site_id)
    and p_permission=any(array['content.read','content.edit','content.publish','media.manage','sites.manage','audit.read','contacts.read','contacts.manage']);
$$;
create or replace function private.is_public_site(p_site_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.sites where id=p_site_id and status='active');
$$;

create or replace function private.audit_change() returns trigger
language plpgsql security definer set search_path='' as $$
declare current_row jsonb; previous_row jsonb; changed text[];
begin
  current_row:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  previous_row:=case when tg_op='UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  select coalesce(array_agg(k order by k),'{}'::text[]) into changed
    from jsonb_object_keys(current_row) k where current_row->k is distinct from previous_row->k;
  insert into public.audit_events(actor_id,table_name,record_id,action,changed_fields)
    values(auth.uid(),tg_table_name,coalesce(current_row->>'id',current_row->>'user_id'),tg_op,changed);
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
create or replace function private.queue_public_cache_event() returns trigger
language plpgsql security definer set search_path='' as $$
declare current_row jsonb;
begin
  current_row:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  insert into public.site_cache_events(site_id)
    values((case when tg_table_name='sites' then current_row->>'id' else current_row->>'site_id' end)::uuid);
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

-- Scope policies become direct administrator policies; clients cannot create another site.
drop policy sites_insert on public.sites;
revoke insert on public.sites from authenticated;
alter policy sites_read on public.sites using(private.is_public_site(id) or private.is_admin());
alter policy sites_update on public.sites using(private.is_admin()) with check(private.is_admin());
alter policy profiles_read on public.profiles using(id=(select auth.uid()) or private.is_admin());
alter policy audit_read on public.audit_events using(private.is_admin());
drop trigger guard_platform_admin_status on public.profiles;
drop trigger validate_author_user on public.author_users;

drop view public.published_content;

insert into private.retired_installation_records(source_table,record) select 'public.organizations',to_jsonb(x) from public.organizations x;
insert into private.retired_installation_records(source_table,record) select 'public.organization_memberships',to_jsonb(x) from public.organization_memberships x;
insert into private.retired_installation_records(source_table,record) select 'public.membership_roles',to_jsonb(x) from public.membership_roles x;
insert into private.retired_installation_records(source_table,record) select 'public.platform_role_assignments',to_jsonb(x) from public.platform_role_assignments x;
insert into private.retired_installation_records(source_table,record) select 'public.roles',to_jsonb(x) from public.roles x;
insert into private.retired_installation_records(source_table,record) select 'public.permissions',to_jsonb(x) from public.permissions x;
insert into private.retired_installation_records(source_table,record) select 'public.role_permissions',to_jsonb(x) from public.role_permissions x;
alter table public.menus drop column organization_id;
alter table public.taxonomies drop column organization_id;
alter table public.content_routes drop column organization_id;
alter table public.revision_authors drop column organization_id;
alter table public.scheduled_publications drop column organization_id;
alter table public.authors drop column organization_id;
alter table public.content_blocks drop column organization_id;
alter table public.menu_items drop column organization_id;
alter table public.revision_terms drop column organization_id;
alter table public.content_revisions drop column organization_id;
alter table public.revision_assets drop column organization_id;
alter table public.media_assets drop column organization_id;
alter table public.audit_events drop column organization_id;
alter table public.content_relations drop column organization_id;
alter table public.sites drop column organization_id;
alter table public.contact_submissions drop column organization_id;
alter table public.publication_events drop column organization_id;
alter table public.content_entries drop column organization_id;
alter table public.terms drop column organization_id;
alter table public.redirects drop column organization_id;
alter table private.cms_seed_registry drop column if exists organization_id;
alter table public.sites drop column slug;
create unique index sites_single_client on public.sites ((true));
insert into public.sites(name) select 'ALBAR Abogados' where not exists(select 1 from public.sites);
alter table public.menus add constraint "menus_id_site_id_key" UNIQUE (id, site_id);
alter table public.authors add constraint "authors_id_site_id_key" UNIQUE (id, site_id);
alter table public.media_assets add constraint "media_assets_id_site_id_key" UNIQUE (id, site_id);
alter table public.content_entries add constraint "content_entries_id_site_id_key" UNIQUE (id, site_id);
alter table public.content_revisions add constraint "content_revisions_id_site_id_key" UNIQUE (id, site_id);
alter table public.content_revisions add constraint "content_revisions_id_entry_id_site_id_key" UNIQUE (id, entry_id, site_id);
alter table public.content_blocks add constraint "content_blocks_id_revision_id_site_id_key" UNIQUE (id, revision_id, site_id);
alter table public.taxonomies add constraint "taxonomies_id_site_id_key" UNIQUE (id, site_id);
alter table public.terms add constraint "terms_id_taxonomy_id_site_id_key" UNIQUE (id, taxonomy_id, site_id);
alter table public.terms add constraint "terms_id_site_id_key" UNIQUE (id, site_id);
alter table public.menu_items add constraint "menu_items_id_menu_id_site_id_key" UNIQUE (id, menu_id, site_id);
alter table public.redirects add constraint "redirects_target_entry_id_site_id_fkey" FOREIGN KEY (target_entry_id, site_id) REFERENCES content_entries(id, site_id) ON DELETE RESTRICT;
alter table public.media_assets add constraint "media_assets_site_id_fkey" FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE RESTRICT;
alter table public.authors add constraint "authors_site_id_fkey" FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE RESTRICT;
alter table public.content_entries add constraint "content_entries_site_id_fkey" FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE RESTRICT;
alter table public.content_entries add constraint "content_entries_parent_id_site_id_fkey" FOREIGN KEY (parent_id, site_id) REFERENCES content_entries(id, site_id) ON DELETE RESTRICT;
alter table public.authors add constraint "authors_avatar_asset_id_site_id_fkey" FOREIGN KEY (avatar_asset_id, site_id) REFERENCES media_assets(id, site_id) ON DELETE RESTRICT;
alter table public.content_revisions add constraint "content_revisions_entry_id_site_id_fkey" FOREIGN KEY (entry_id, site_id) REFERENCES content_entries(id, site_id) ON DELETE RESTRICT;
alter table public.content_revisions add constraint "content_revisions_cover_asset_id_site_id_fkey" FOREIGN KEY (cover_asset_id, site_id) REFERENCES media_assets(id, site_id) ON DELETE RESTRICT;
alter table public.content_entries add constraint "published_revision_belongs_to_entry" FOREIGN KEY (published_revision_id, id, site_id) REFERENCES content_revisions(id, entry_id, site_id) ON DELETE RESTRICT;
alter table public.content_blocks add constraint "content_blocks_revision_id_site_id_fkey" FOREIGN KEY (revision_id, site_id) REFERENCES content_revisions(id, site_id) ON DELETE CASCADE;
alter table public.revision_assets add constraint "revision_assets_revision_id_site_id_fkey" FOREIGN KEY (revision_id, site_id) REFERENCES content_revisions(id, site_id) ON DELETE CASCADE;
alter table public.revision_assets add constraint "revision_assets_block_id_revision_id_site_id_organization__fkey" FOREIGN KEY (block_id, revision_id, site_id) REFERENCES content_blocks(id, revision_id, site_id) ON DELETE CASCADE;
alter table public.revision_assets add constraint "revision_assets_asset_id_site_id_fkey" FOREIGN KEY (asset_id, site_id) REFERENCES media_assets(id, site_id) ON DELETE RESTRICT;
alter table public.revision_authors add constraint "revision_authors_revision_id_site_id_fkey" FOREIGN KEY (revision_id, site_id) REFERENCES content_revisions(id, site_id) ON DELETE CASCADE;
alter table public.revision_authors add constraint "revision_authors_author_id_site_id_fkey" FOREIGN KEY (author_id, site_id) REFERENCES authors(id, site_id) ON DELETE RESTRICT;
alter table public.taxonomies add constraint "taxonomies_site_id_fkey" FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE RESTRICT;
alter table public.terms add constraint "terms_taxonomy_id_site_id_fkey" FOREIGN KEY (taxonomy_id, site_id) REFERENCES taxonomies(id, site_id) ON DELETE RESTRICT;
alter table public.terms add constraint "terms_parent_id_taxonomy_id_site_id_fkey" FOREIGN KEY (parent_id, taxonomy_id, site_id) REFERENCES terms(id, taxonomy_id, site_id) ON DELETE RESTRICT;
alter table public.revision_terms add constraint "revision_terms_revision_id_site_id_fkey" FOREIGN KEY (revision_id, site_id) REFERENCES content_revisions(id, site_id) ON DELETE CASCADE;
alter table public.revision_terms add constraint "revision_terms_term_id_site_id_fkey" FOREIGN KEY (term_id, site_id) REFERENCES terms(id, site_id) ON DELETE RESTRICT;
alter table public.content_relations add constraint "content_relations_revision_id_site_id_fkey" FOREIGN KEY (revision_id, site_id) REFERENCES content_revisions(id, site_id) ON DELETE CASCADE;
alter table public.content_relations add constraint "content_relations_target_entry_id_site_id_fkey" FOREIGN KEY (target_entry_id, site_id) REFERENCES content_entries(id, site_id) ON DELETE RESTRICT;
alter table public.content_routes add constraint "content_routes_entry_id_site_id_fkey" FOREIGN KEY (entry_id, site_id) REFERENCES content_entries(id, site_id) ON DELETE RESTRICT;
alter table public.menus add constraint "menus_site_id_fkey" FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE RESTRICT;
alter table public.menu_items add constraint "menu_items_menu_id_site_id_fkey" FOREIGN KEY (menu_id, site_id) REFERENCES menus(id, site_id) ON DELETE CASCADE;
alter table public.menu_items add constraint "menu_items_parent_id_menu_id_site_id_fkey" FOREIGN KEY (parent_id, menu_id, site_id) REFERENCES menu_items(id, menu_id, site_id) ON DELETE RESTRICT;
alter table public.menu_items add constraint "menu_items_entry_id_site_id_fkey" FOREIGN KEY (entry_id, site_id) REFERENCES content_entries(id, site_id) ON DELETE RESTRICT;
alter table public.scheduled_publications add constraint "scheduled_publications_revision_id_entry_id_site_id_organi_fkey" FOREIGN KEY (revision_id, entry_id, site_id) REFERENCES content_revisions(id, entry_id, site_id) ON DELETE RESTRICT;
alter table public.publication_events add constraint "publication_events_entry_id_site_id_fkey" FOREIGN KEY (entry_id, site_id) REFERENCES content_entries(id, site_id) ON DELETE RESTRICT;
alter table public.publication_events add constraint "publication_events_revision_id_entry_id_site_id_organizati_fkey" FOREIGN KEY (revision_id, entry_id, site_id) REFERENCES content_revisions(id, entry_id, site_id) ON DELETE RESTRICT;
alter table public.contact_submissions add constraint "contact_submissions_site_id_fkey" FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE RESTRICT;
alter table public.contact_submissions add constraint "contact_submissions_source_entry_id_site_id_organization_i_fkey" FOREIGN KEY (source_entry_id, site_id) REFERENCES content_entries(id, site_id) ON DELETE RESTRICT;
alter table public.contact_submissions add constraint "contact_submissions_privacy_revision_id_site_id_organizati_fkey" FOREIGN KEY (privacy_revision_id, site_id) REFERENCES content_revisions(id, site_id) ON DELETE RESTRICT;
alter table public.media_assets add constraint media_storage_path_valid check(
  storage_path !~ '(^|/)\.\.?(/|$)' and
  (storage_path like site_id::text||'/'||id::text||'/%'
   or storage_path ~ ('^[0-9a-f-]{36}/'||site_id::text||'/'||id::text||'/[^/]+$')));
create view public.published_content with(security_invoker=true) as
select e.id,e.site_id,e.kind,e.locale,e.parent_id,e.first_published_at,
 r.id as revision_id,r.title,r.excerpt,r.path,r.cover_asset_id,r.template_key,r.template_version,r.seo
from public.content_entries e join public.content_revisions r on r.id=e.published_revision_id
where private.is_public_entry(e.id);
grant select on public.published_content to anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.submit_contact(p_site_id uuid, p_locale text, p_source_entry_id uuid, p_source_path text, p_name text, p_email text, p_phone text, p_subject text, p_message text, p_consent boolean, p_privacy_revision_id uuid, p_client_hash text, p_idempotency_key uuid, p_request_hash text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_site public.sites; v_privacy uuid; v_existing public.contact_submissions; v_key text; v_start timestamptz; v_count integer; v_id uuid;
begin
 if p_client_hash !~ '^[0-9a-f]{64}$' or p_request_hash !~ '^[0-9a-f]{64}$' then raise invalid_parameter_value; end if;
 select * into v_site from public.sites where id=p_site_id and private.is_public_site(id);
 if not found or v_site.settings->>'contact_enabled' is distinct from 'true' then raise insufficient_privilege using message='El formulario no está disponible'; end if;
 select p.revision_id into v_privacy from public.published_content p where p.site_id=p_site_id and p.locale=p_locale and p.path=coalesce(nullif(v_site.settings->>'privacy_path',''),'/privacidad');
 if v_privacy is null or v_privacy is distinct from p_privacy_revision_id then raise serialization_failure using message='La política de privacidad cambió; recarga el formulario'; end if;
 if p_source_entry_id is not null then
  if not exists(select 1 from public.published_content where id=p_source_entry_id and site_id=p_site_id and locale=p_locale and path=p_source_path
    and template_version=1 and (template_key='contact' or (template_key='service-landing' and v_site.settings->>'contact_on_landings'='true'))) then raise insufficient_privilege; end if;
 elsif p_source_path is distinct from coalesce(nullif(v_site.settings->>'contact_path',''),'/contacto') then raise insufficient_privilege; end if;
 -- Serializes rate accounting and retries for this client across all sites.
 perform pg_advisory_xact_lock(hashtextextended('contact:'||p_client_hash,0));
 select * into v_existing from public.contact_submissions where idempotency_key=p_idempotency_key;
 if found then
  if v_existing.site_id<>p_site_id or v_existing.request_hash<>p_request_hash then raise unique_violation using message='Este formulario ya fue utilizado'; end if;
  return v_existing.id;
 end if;
 -- One bucket per site (3/10 min) and one global bucket (20/hour).
 foreach v_key in array array[p_client_hash||':'||p_site_id::text,p_client_hash||':global'] loop
  v_start:=case when right(v_key,7)=':global' then date_trunc('hour',now()) else date_bin('10 minutes',now(),'2020-01-01'::timestamptz) end;
  insert into private.contact_rate_windows(key,window_start,count) values(v_key,v_start,1)
  on conflict(key) do update set window_start=excluded.window_start,
   count=case when private.contact_rate_windows.window_start=excluded.window_start then private.contact_rate_windows.count+1 else 1 end
  returning count into v_count;
  if v_count>(case when right(v_key,7)=':global' then 20 else 3 end) then raise exception using errcode='P0001',message='CONTACT_RATE_LIMIT'; end if;
 end loop;
 insert into public.contact_submissions(site_id,locale,source_entry_id,source_path,name,email,phone,subject,message,consent,privacy_revision_id,idempotency_key,request_hash)
 values(v_site.id,p_locale,p_source_entry_id,p_source_path,p_name,lower(p_email),p_phone,p_subject,p_message,p_consent,p_privacy_revision_id,p_idempotency_key,p_request_hash)
 returning id into v_id;
 return v_id;
end;
$function$;
CREATE OR REPLACE FUNCTION public.manage_cms_redirect(p_site_id uuid, p_id uuid, p_locale text, p_from_path text, p_target_entry_id uuid, p_status_code integer, p_delete boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    insert into public.redirects(site_id, locale, from_path, target_entry_id, status_code)
    select id, p_locale, p_from_path, p_target_entry_id, p_status_code from public.sites where id = p_site_id;
  else
    update public.redirects set locale = p_locale, from_path = p_from_path,
      target_entry_id = p_target_entry_id, status_code = p_status_code where id = p_id and site_id = p_site_id;
  end if;
end;
$function$;
CREATE OR REPLACE FUNCTION private.publish_revision(p_revision_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  if v_entry.archived_at is not null then raise exception 'Cannot publish archived content' using errcode = '23514'; end if;
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
  insert into public.content_routes(site_id, entry_id, locale, path)
  values (v_entry.site_id, v_entry.id, v_entry.locale, v_revision.path)
  on conflict (entry_id) do update set path = excluded.path;
  if v_old_path is not null and v_old_path <> v_revision.path then
    insert into public.redirects(site_id, locale, from_path, target_entry_id)
    values (v_entry.site_id, v_entry.locale, v_old_path, v_entry.id)
    on conflict (site_id, locale, from_path) do update set target_entry_id = excluded.target_entry_id;
  end if;
  if v_revision.locked_at is null then
    update public.content_revisions set locked_at = now() where id = v_revision.id;
  end if;
  update public.content_entries set published_revision_id = v_revision.id,
    first_published_at = coalesce(first_published_at, now()) where id = v_entry.id;
  insert into public.publication_events(site_id, entry_id, revision_id, action)
  values (v_entry.site_id, v_entry.id, v_revision.id, 'published');
end;
$function$;
CREATE OR REPLACE FUNCTION public.save_content_revision(p_entry_id uuid, p_expected_revision_id uuid, p_content jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_entry public.content_entries; v_latest uuid; v_number integer; v_revision uuid;
  v_block jsonb; v_block_id uuid; v_asset jsonb; v_position integer := 0;
begin
  select * into v_entry from public.content_entries
  where id = p_entry_id and private.site_permission(site_id, 'content.edit') for update;
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
  insert into public.content_revisions(site_id, entry_id, revision_number,
    title, excerpt, path, cover_asset_id, template_key, template_version, seo, created_by)
  values (v_entry.site_id, v_entry.id, coalesce(v_number, 0) + 1,
    p_content ->> 'title', coalesce(p_content ->> 'excerpt', ''), p_content ->> 'path',
    (p_content ->> 'cover_asset_id')::uuid, coalesce(p_content ->> 'template_key', 'default'),
    coalesce((p_content ->> 'template_version')::integer, 1), coalesce(p_content -> 'seo', '{}'), auth.uid())
  returning id into v_revision;
  for v_block in select value from jsonb_array_elements(p_content -> 'blocks') loop
    insert into public.content_blocks(site_id, revision_id, block_key, type, schema_version, position, variant, data)
    values (v_entry.site_id, v_revision,
      coalesce((v_block ->> 'key')::uuid, gen_random_uuid()), v_block ->> 'type',
      coalesce((v_block ->> 'schema_version')::integer, 1), v_position,
      coalesce(v_block ->> 'variant', 'default'), coalesce(v_block -> 'data', '{}')) returning id into v_block_id;
    for v_asset in select value from jsonb_array_elements(coalesce(v_block -> 'assets', '[]')) loop
      insert into public.revision_assets(site_id, revision_id, block_id, asset_id, slot, alt_text, focal_point)
      values (v_entry.site_id, v_revision, v_block_id, (v_asset ->> 'asset_id')::uuid,
        coalesce(v_asset ->> 'slot', 'image'), coalesce(v_asset ->> 'alt_text', ''),
        coalesce(v_asset -> 'focal_point', '{"x":0.5,"y":0.5}'));
    end loop;
    v_position := v_position + 1;
  end loop;
  insert into public.revision_authors(site_id, revision_id, author_id, position)
  select v_entry.site_id, v_revision, value::uuid, (ordinality - 1)::integer
  from jsonb_array_elements_text(coalesce(p_content -> 'authors', '[]')) with ordinality;
  insert into public.revision_terms(site_id, revision_id, term_id)
  select v_entry.site_id, v_revision, value::uuid
  from jsonb_array_elements_text(coalesce(p_content -> 'terms', '[]'));
  insert into public.content_relations(site_id, revision_id, target_entry_id, relation_type, position)
  select v_entry.site_id, v_revision, (value ->> 'entry_id')::uuid,
    coalesce(value ->> 'type', 'related'), (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_content -> 'relations', '[]')) with ordinality;
  update public.content_entries set updated_at = now() where id = p_entry_id;
  return v_revision;
end;
$function$;
CREATE OR REPLACE FUNCTION public.set_revision_state(p_revision_id uuid, p_state text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_revision public.content_revisions;
begin
  select * into v_revision from public.content_revisions where id = p_revision_id for update;
  if not found or not private.site_permission(v_revision.site_id,
    case when p_state = 'approved' then 'content.publish' else 'content.edit' end) then
    raise insufficient_privilege;
  end if;
  update public.content_revisions set editorial_state = p_state where id = p_revision_id;
end;
$function$;
CREATE OR REPLACE FUNCTION public.publish_content_revision(p_revision_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not exists (select 1 from public.content_revisions
    where id = p_revision_id and private.site_permission(site_id, 'content.publish')) then
    raise insufficient_privilege;
  end if;
  perform private.publish_revision(p_revision_id);
end;
$function$;
CREATE OR REPLACE FUNCTION public.unpublish_content(p_entry_id uuid, p_archive boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_entry public.content_entries;
begin
  select * into v_entry from public.content_entries
  where id = p_entry_id and private.site_permission(site_id, 'content.publish') for update;
  if not found then raise insufficient_privilege; end if;
  update public.content_entries set published_revision_id = null,
    archived_at = case when p_archive then now() else null end where id = p_entry_id;
  update public.scheduled_publications set status = 'cancelled' where entry_id = p_entry_id and status = 'pending';
  insert into public.publication_events(site_id, entry_id, action)
  values (v_entry.site_id, v_entry.id, 'unpublished');
end;
$function$;
create or replace function public.process_scheduled_publications(p_limit integer default 25) returns integer
language plpgsql security definer set search_path='' as $$
declare job public.scheduled_publications; processed integer:=0;
begin
  if p_limit<1 or p_limit>100 then raise invalid_parameter_value; end if;
  for job in select * from public.scheduled_publications where status='pending' and run_at<=now()
    order by run_at for update skip locked limit p_limit loop
    begin
      if not exists(select 1 from public.profiles where id=job.requested_by and status='active' and is_admin) then
        raise insufficient_privilege;
      end if;
      perform private.publish_revision(job.revision_id);
      update public.scheduled_publications set status='completed',completed_at=now() where id=job.id;
    exception when others then
      update public.scheduled_publications set status='failed',error_message=sqlerrm,completed_at=now() where id=job.id;
    end;
    processed:=processed+1;
  end loop;
  return processed;
end;
$$;
create or replace function public.get_admin_context() returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('profile',(select to_jsonb(p) from public.profiles p where p.id=auth.uid()),
    'is_admin',private.is_admin(),
    'site',(select to_jsonb(s)||jsonb_build_object('permissions',array['content.read','content.edit','content.publish','media.manage','sites.manage','audit.read','contacts.read','contacts.manage'])
      from public.sites s where private.is_admin())) where auth.uid() is not null;
$$;
drop function public.get_media_upload_context(uuid);
create function public.get_media_upload_context() returns table(site_id uuid)
language sql stable security definer set search_path='' as $$
  select id from public.sites where private.is_admin();
$$;
revoke all on function public.get_media_upload_context() from public,anon,authenticated;
grant execute on function public.get_media_upload_context() to authenticated;
drop function public.resolve_public_site(text,text,text);
create function public.get_public_site() returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('id',id,'name',name,'domain',domain,'default_locale',default_locale,'settings',settings)
  from public.sites where status='active';
$$;
grant execute on function public.get_public_site() to anon,authenticated;

create function private.guard_content_identity() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.id is distinct from old.id or to_jsonb(new)->'site_id' is distinct from to_jsonb(old)->'site_id' then
    raise exception 'Content identity is immutable' using errcode='23514';
  end if;
  return new;
end;
$$;
do $$ declare t record; begin
  for t in select event_object_schema,event_object_table from information_schema.triggers
    where trigger_name='guard_tenant_identity' group by event_object_schema,event_object_table loop
    execute format('drop trigger guard_tenant_identity on %I.%I',t.event_object_schema,t.event_object_table);
    execute format('create trigger guard_content_identity before update on %I.%I for each row execute function private.guard_content_identity()',t.event_object_schema,t.event_object_table);
  end loop;
end; $$;

-- Only trusted SQL/service administration can provision access. Public signup never grants it.
-- Column grants deliberately exclude is_admin and status.

drop function public.create_membership_access(uuid,uuid,text,text[]);
drop function public.set_membership_access(uuid,text,text[]);
drop function public.set_user_status(uuid,text);
drop function private.bootstrap_super_admin(uuid);
drop function private.validate_author_user();
drop function private.guard_tenant_identity();
drop table public.membership_roles,public.organization_memberships,public.platform_role_assignments,public.role_permissions,public.roles,public.permissions,public.organizations;
drop function private.guard_platform_admins();
drop function private.has_org_permission(uuid,text);
drop function private.is_org_member(uuid);
drop function private.is_super_admin();
drop table private.platform_admin_guard;
create index audit_created_at_idx on public.audit_events(created_at desc);
do $$ declare t record; begin
  for t in select table_name from information_schema.columns
    where column_name='site_id' and table_schema='public' and table_name<>'published_content' loop
    execute format('create index if not exists %I on public.%I(site_id)',t.table_name||'_site_idx',t.table_name);
  end loop;
end; $$;
notify pgrst,'reload schema';