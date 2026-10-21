-- Shared public catalogs are opt-in. Existing authors remain unchanged.
alter table public.authors add column is_public boolean not null default false,
  add column professional_title text not null default '' check (length(professional_title) <= 200);
create or replace function private.is_public_author(p_author_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.authors a where a.id = p_author_id and private.is_public_site(a.site_id)
    and (a.is_public or exists (select 1 from public.revision_authors ra where ra.author_id = a.id and private.is_public_revision(ra.revision_id))));
$$;

-- Resolve only active sites and organizations; never expose identity/membership tables.
create function public.resolve_public_site(p_domain text default null, p_organization_slug text default null, p_site_slug text default null)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id',s.id,'organization_id',s.organization_id,'organization_slug',o.slug,
    'slug',s.slug,'name',s.name,'domain',s.domain,'default_locale',s.default_locale,'settings',s.settings)
  from public.sites s join public.organizations o on o.id=s.organization_id
  where s.status='active' and o.status='active' and (
    (p_domain is not null and s.domain=lower(p_domain)) or
    (p_domain is null and o.slug=p_organization_slug and s.slug=p_site_slug));
$$;
revoke all on function public.resolve_public_site(text,text,text) from public,anon,authenticated;
grant execute on function public.resolve_public_site(text,text,text) to anon,authenticated;

-- This public projection deliberately does not reuse the private editor RPC.
create function public.get_public_snapshot(p_revision_id uuid) returns jsonb
language sql stable set search_path = '' as $$
  select to_jsonb(r) || jsonb_build_object(
    'blocks',coalesce((select jsonb_agg(jsonb_build_object('key',b.block_key,'type',b.type,'schema_version',b.schema_version,
      'variant',b.variant,'data',b.data,'assets',coalesce((select jsonb_agg(jsonb_build_object('asset_id',a.asset_id,
      'slot',a.slot,'alt_text',a.alt_text,'focal_point',a.focal_point)) from public.revision_assets a where a.block_id=b.id),'[]')) order by b.position)
      from public.content_blocks b where b.revision_id=r.revision_id),'[]'),
    'authors',coalesce((select jsonb_agg(a.author_id order by a.position) from public.revision_authors a where a.revision_id=r.revision_id),'[]'),
    'terms',coalesce((select jsonb_agg(t.term_id) from public.revision_terms t where t.revision_id=r.revision_id),'[]'),
    'relations',coalesce((select jsonb_agg(jsonb_build_object('entry_id',c.target_entry_id,'type',c.relation_type) order by c.position)
      from public.content_relations c where c.revision_id=r.revision_id),'[]'))
  from public.published_content r where r.revision_id=p_revision_id;
$$;
revoke all on function public.get_public_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.get_public_snapshot(uuid) to anon,authenticated;

create function private.is_reserved_public_path(p_path text) returns boolean
language sql immutable set search_path = '' as $$
  select lower(p_path) ~ '^/(admin|auth|api|protected|design-system|sitios|idioma|autores|taxonomias|_next)(/|$)'
    or lower(p_path) ~ '^/(sitemap\.xml|robots\.txt|favicon\.ico|icon\.svg|opengraph-image|twitter-image)(/|$)';
$$;
create function private.guard_public_route() returns trigger
language plpgsql set search_path = '' as $$
declare v_path text;
begin
  v_path := case when tg_table_name='redirects' then to_jsonb(new)->>'from_path' else to_jsonb(new)->>'path' end;
  if private.is_reserved_public_path(v_path) then
    raise check_violation using message='Esta ruta está reservada para funciones del sistema o catálogos públicos';
  end if;
  return new;
end;
$$;
create trigger guard_public_route before insert or update on public.content_routes for each row execute function private.guard_public_route();
create trigger guard_public_route before insert or update on public.redirects for each row execute function private.guard_public_route();

-- A site-wide outbox also covers public settings, catalogs and navigation.
create table public.site_cache_events (
 id bigint generated always as identity primary key,
 site_id uuid not null references public.sites(id) on delete cascade,
 processed_at timestamptz, created_at timestamptz not null default now()
);
alter table public.site_cache_events enable row level security;
revoke all on public.site_cache_events from anon,authenticated;
grant all on public.site_cache_events to service_role;
grant usage,select on sequence public.site_cache_events_id_seq to service_role;
create index site_cache_events_pending_idx on public.site_cache_events(id) where processed_at is null;
create function private.queue_public_cache_event() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_row jsonb; v_site uuid;
begin
  v_row:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  if tg_table_name='organizations' then
    insert into public.site_cache_events(site_id) select id from public.sites where organization_id=(v_row->>'id')::uuid;
  else
    v_site:=case when tg_table_name='sites' then (v_row->>'id')::uuid else (v_row->>'site_id')::uuid end;
    insert into public.site_cache_events(site_id) values(v_site);
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
do $$ declare t text; begin
 foreach t in array array['sites','organizations','authors','taxonomies','terms','menus','menu_items','redirects'] loop
  execute format('create trigger queue_public_cache_event after insert or update or delete on public.%I for each row execute function private.queue_public_cache_event()',t);
 end loop;
end; $$;
