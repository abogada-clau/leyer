create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 200),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  domain text unique check (domain = lower(domain) and domain ~ '^[a-z0-9][a-z0-9.-]+[a-z0-9]$'),
  default_locale text not null default 'es-CL',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  -- Public presentation/contact settings only; never put credentials here.
  settings jsonb not null default '{}' check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug), unique (id, organization_id)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  bucket_id text not null check (bucket_id in ('cms-public', 'cms-private')),
  -- Organization/site/asset UUID prefixes are also checked by Storage policies.
  storage_path text not null,
  filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'application/pdf')),
  byte_size bigint not null check (byte_size > 0),
  width integer check (width > 0), height integer check (height > 0),
  checksum_sha256 text check (checksum_sha256 ~ '^[0-9a-f]{64}$'),
  alt_text text not null default '', credits text,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete restrict,
  unique (id, site_id, organization_id), unique (bucket_id, storage_path),
  check (storage_path like organization_id::text || '/' || site_id::text || '/' || id::text || '/%'
    and storage_path !~ '(^|/)\.\.?(/|$)')
);

create table public.content_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  kind text not null check (kind in ('page', 'landing', 'post')),
  internal_name text not null check (length(btrim(internal_name)) between 1 and 250),
  locale text not null default 'es-CL',
  parent_id uuid,
  published_revision_id uuid,
  first_published_at timestamptz,
  archived_at timestamptz,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete restrict,
  unique (id, site_id, organization_id),
  foreign key (parent_id, site_id, organization_id) references public.content_entries(id, site_id, organization_id) on delete restrict,
  check (parent_id is distinct from id)
);

create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  entry_id uuid not null,
  revision_number integer not null check (revision_number > 0),
  title text not null check (length(btrim(title)) between 1 and 300),
  excerpt text not null default '',
  path text not null check (path ~ '^/' and path !~ '[?#%[:space:]\\]' and path !~ '//'
    and path !~ '(^|/)\.\.?(/|$)' and (path = '/' or right(path, 1) <> '/')),
  cover_asset_id uuid,
  template_key text not null default 'default',
  template_version integer not null default 1 check (template_version > 0),
  seo jsonb not null default '{}' check (jsonb_typeof(seo) = 'object'),
  editorial_state text not null default 'draft' check (editorial_state in ('draft', 'in_review', 'approved')),
  -- Set by publication, never cleared, even after unpublishing or restoring.
  locked_at timestamptz,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, revision_number),
  unique (id, site_id, organization_id),
  unique (id, entry_id, site_id, organization_id),
  foreign key (entry_id, site_id, organization_id) references public.content_entries(id, site_id, organization_id) on delete restrict,
  foreign key (cover_asset_id, site_id, organization_id) references public.media_assets(id, site_id, organization_id) on delete restrict
);
alter table public.content_entries add constraint published_revision_belongs_to_entry
foreign key (published_revision_id, id, site_id, organization_id)
references public.content_revisions(id, entry_id, site_id, organization_id) on delete restrict;

create table public.block_types (
  code text not null,
  schema_version integer not null check (schema_version > 0),
  description text not null,
  required_fields text[] not null default '{}',
  primary key (code, schema_version)
);
insert into public.block_types(code, schema_version, description, required_fields) values
  ('hero', 1, 'Portada con título, imagen y botones', '{heading}'),
  ('split_content', 1, 'Texto e imagen en columnas', '{heading,body}'),
  ('card_grid', 1, 'Tarjetas de beneficios o servicios', '{items}'),
  ('checklist', 1, 'Lista de requisitos o situaciones', '{items}'),
  ('steps', 1, 'Etapas ordenadas', '{items}'),
  ('faq', 1, 'Preguntas y respuestas', '{items}'),
  ('cta', 1, 'Llamado a la acción', '{heading,actions}'),
  ('rich_text', 1, 'Contenido enriquecido estructurado', '{document}'),
  ('image', 1, 'Imagen con leyenda', '{}'),
  ('quote', 1, 'Cita o testimonio', '{text}'),
  ('related_content', 1, 'Contenidos relacionados', '{}');

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  revision_id uuid not null,
  block_key uuid not null default gen_random_uuid(),
  type text not null,
  schema_version integer not null default 1,
  position integer not null check (position >= 0),
  variant text not null default 'default',
  data jsonb not null default '{}' check (jsonb_typeof(data) = 'object'),
  unique (id, revision_id, site_id, organization_id),
  unique (revision_id, block_key),
  unique (revision_id, position) deferrable initially immediate,
  foreign key (type, schema_version) references public.block_types(code, schema_version),
  foreign key (revision_id, site_id, organization_id) references public.content_revisions(id, site_id, organization_id) on delete cascade
);

-- Binary resources use explicit FKs rather than unvalidated asset UUIDs inside JSON.
create table public.revision_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  revision_id uuid not null,
  block_id uuid not null,
  asset_id uuid not null,
  slot text not null default 'image',
  alt_text text not null default '',
  focal_point jsonb not null default '{"x":0.5,"y":0.5}' check (jsonb_typeof(focal_point) = 'object'),
  unique (block_id, slot),
  foreign key (revision_id, site_id, organization_id) references public.content_revisions(id, site_id, organization_id) on delete cascade,
  foreign key (block_id, revision_id, site_id, organization_id) references public.content_blocks(id, revision_id, site_id, organization_id) on delete cascade,
  foreign key (asset_id, site_id, organization_id) references public.media_assets(id, site_id, organization_id) on delete restrict
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  display_name text not null,
  slug text not null,
  biography text not null default '',
  avatar_asset_id uuid,
  -- Auth linkage stays private in a separate table below.
  unique (id, site_id, organization_id), unique (site_id, slug),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete restrict,
  foreign key (avatar_asset_id, site_id, organization_id) references public.media_assets(id, site_id, organization_id) on delete restrict
);
create table public.author_users (
  author_id uuid primary key references public.authors(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict
);
create table public.revision_authors (
  organization_id uuid not null, site_id uuid not null, revision_id uuid not null,
  author_id uuid not null, position integer not null default 0 check (position >= 0),
  primary key (revision_id, author_id), unique (revision_id, position),
  foreign key (revision_id, site_id, organization_id) references public.content_revisions(id, site_id, organization_id) on delete cascade,
  foreign key (author_id, site_id, organization_id) references public.authors(id, site_id, organization_id) on delete restrict
);

create table public.taxonomies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, site_id uuid not null,
  code text not null, name text not null,
  unique (id, site_id, organization_id), unique (site_id, code),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete restrict
);
create table public.terms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, site_id uuid not null, taxonomy_id uuid not null,
  parent_id uuid, name text not null, slug text not null,
  unique (id, taxonomy_id, site_id, organization_id), unique (id, site_id, organization_id),
  unique (taxonomy_id, slug), check (id is distinct from parent_id),
  foreign key (taxonomy_id, site_id, organization_id) references public.taxonomies(id, site_id, organization_id) on delete restrict,
  foreign key (parent_id, taxonomy_id, site_id, organization_id) references public.terms(id, taxonomy_id, site_id, organization_id) on delete restrict
);
create table public.revision_terms (
  organization_id uuid not null, site_id uuid not null, revision_id uuid not null, term_id uuid not null,
  primary key (revision_id, term_id),
  foreign key (revision_id, site_id, organization_id) references public.content_revisions(id, site_id, organization_id) on delete cascade,
  foreign key (term_id, site_id, organization_id) references public.terms(id, site_id, organization_id) on delete restrict
);
create table public.content_relations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, site_id uuid not null, revision_id uuid not null,
  target_entry_id uuid not null, relation_type text not null default 'related',
  position integer not null default 0 check (position >= 0),
  unique (revision_id, relation_type, target_entry_id),
  foreign key (revision_id, site_id, organization_id) references public.content_revisions(id, site_id, organization_id) on delete cascade,
  foreign key (target_entry_id, site_id, organization_id) references public.content_entries(id, site_id, organization_id) on delete restrict
);

create table public.content_routes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, site_id uuid not null, entry_id uuid not null,
  locale text not null, path text not null,
  unique (site_id, locale, path), unique (entry_id),
  foreign key (entry_id, site_id, organization_id) references public.content_entries(id, site_id, organization_id) on delete restrict
);
create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, site_id uuid not null,
  locale text not null, from_path text not null, target_entry_id uuid not null,
  status_code integer not null default 301 check (status_code in (301, 308)),
  unique (site_id, locale, from_path),
  foreign key (target_entry_id, site_id, organization_id) references public.content_entries(id, site_id, organization_id) on delete restrict
);

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, site_id uuid not null,
  code text not null, locale text not null default 'es-CL', name text not null,
  is_public boolean not null default false,
  unique (id, site_id, organization_id), unique (site_id, locale, code),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete restrict
);
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, site_id uuid not null, menu_id uuid not null,
  parent_id uuid, label text not null, position integer not null default 0 check (position >= 0),
  entry_id uuid, external_url text,
  unique (id, menu_id, site_id, organization_id), check (id is distinct from parent_id),
  check (num_nonnulls(entry_id, external_url) = 1),
  check (external_url is null or external_url ~ '^(https://|mailto:|tel:)'),
  foreign key (menu_id, site_id, organization_id) references public.menus(id, site_id, organization_id) on delete cascade,
  foreign key (parent_id, menu_id, site_id, organization_id) references public.menu_items(id, menu_id, site_id, organization_id) on delete restrict,
  foreign key (entry_id, site_id, organization_id) references public.content_entries(id, site_id, organization_id) on delete restrict
);

create table public.scheduled_publications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, site_id uuid not null, entry_id uuid not null, revision_id uuid not null,
  run_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled', 'failed')),
  requested_by uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  completed_at timestamptz, error_message text,
  created_at timestamptz not null default now(),
  foreign key (revision_id, entry_id, site_id, organization_id) references public.content_revisions(id, entry_id, site_id, organization_id) on delete restrict
);
create unique index one_pending_publication_per_entry on public.scheduled_publications(entry_id) where status = 'pending';
create index scheduled_publications_due_idx on public.scheduled_publications(run_at) where status = 'pending';

-- Transactional outbox: a trusted worker invalidates Next.js caches after commit.
create table public.publication_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null, site_id uuid not null, entry_id uuid not null,
  revision_id uuid,
  action text not null check (action in ('published', 'unpublished')),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (entry_id, site_id, organization_id) references public.content_entries(id, site_id, organization_id) on delete restrict,
  foreign key (revision_id, entry_id, site_id, organization_id) references public.content_revisions(id, entry_id, site_id, organization_id) on delete restrict
);
create index publication_events_pending_idx on public.publication_events(id) where processed_at is null;

-- Index the tenant keys and reverse references used by authorization and public reads.
do $$
declare t text;
begin
  foreach t in array array['media_assets', 'content_entries', 'content_revisions', 'content_blocks', 'revision_assets',
    'authors', 'revision_authors', 'taxonomies', 'terms', 'revision_terms', 'content_relations',
    'content_routes', 'redirects', 'menus', 'menu_items', 'scheduled_publications', 'publication_events'] loop
    execute format('create index %I on public.%I (site_id, organization_id)', t || '_tenant_idx', t);
    execute format('create index %I on public.%I (organization_id)', t || '_org_idx', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function private.audit_change()', t);
  end loop;
  foreach t in array array['sites', 'content_entries', 'content_revisions'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()', t);
  end loop;
end;
$$;
alter table public.sites enable row level security;
alter table public.block_types enable row level security;
alter table public.author_users enable row level security;
revoke all on public.sites, public.block_types, public.author_users from anon, authenticated;
grant all on public.sites, public.block_types, public.author_users to service_role;
create trigger audit_change after insert or update or delete on public.sites
for each row execute function private.audit_change();
create index revision_assets_asset_idx on public.revision_assets(asset_id);
create index revision_authors_author_idx on public.revision_authors(author_id);
create index revision_terms_term_idx on public.revision_terms(term_id);
create index content_relations_target_idx on public.content_relations(target_entry_id);
create index entries_parent_idx on public.content_entries(parent_id);
create index entries_published_idx on public.content_entries(published_revision_id) where published_revision_id is not null;
create index entries_blog_idx on public.content_entries(site_id, first_published_at desc) where kind = 'post' and archived_at is null;
create index revisions_cover_idx on public.content_revisions(cover_asset_id);
create index author_users_user_idx on public.author_users(user_id);
create index revisions_search_idx on public.content_revisions using gin
  (to_tsvector('spanish'::regconfig, title || ' ' || excerpt));
