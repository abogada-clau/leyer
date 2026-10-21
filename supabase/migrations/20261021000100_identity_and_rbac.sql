-- Identity is global; admin/lawyer grants belong to an organization membership.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name) <= 200),
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  code text primary key,
  scope text not null check (scope in ('platform', 'organization')),
  description text not null,
  unique (code, scope)
);

create table public.permissions (
  code text primary key,
  description text not null
);

create table public.role_permissions (
  role_code text not null references public.roles(code) on delete cascade,
  permission_code text not null references public.permissions(code) on delete cascade,
  primary key (role_code, permission_code)
);

create table public.platform_role_assignments (
  user_id uuid not null references public.profiles(id) on delete restrict,
  role_code text not null default 'super_admin',
  role_scope text generated always as ('platform'::text) stored,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role_code),
  foreign key (role_code, role_scope) references public.roles(code, scope)
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'active' check (status in ('invited', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index memberships_user_idx on public.organization_memberships(user_id, organization_id);

create table public.membership_roles (
  membership_id uuid not null references public.organization_memberships(id) on delete cascade,
  role_code text not null,
  role_scope text generated always as ('organization'::text) stored,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (membership_id, role_code),
  foreign key (role_code, role_scope) references public.roles(code, scope)
);

insert into public.roles (code, scope, description) values
  ('super_admin', 'platform', 'Administración global de Leyer'),
  ('admin', 'organization', 'Administración editorial del estudio'),
  ('lawyer', 'organization', 'Abogado del estudio; acceso documental por expediente');

insert into public.permissions (code, description) values
  ('users.manage', 'Gestionar usuarios'), ('roles.assign', 'Asignar roles'),
  ('organizations.manage', 'Gestionar estudios'),
  ('content.read', 'Consultar el CMS y sus borradores'),
  ('content.edit', 'Crear y editar contenido'), ('content.publish', 'Publicar contenido'),
  ('media.manage', 'Gestionar archivos del CMS'), ('sites.manage', 'Configurar sitios y navegación'),
  ('audit.read', 'Consultar auditoría del estudio'),
  ('cases.read', 'Consultar expedientes autorizados'),
  ('documents.read', 'Consultar documentos autorizados'),
  ('documents.upload', 'Subir documentos a expedientes autorizados');
insert into public.role_permissions
select 'super_admin', code from public.permissions;
insert into public.role_permissions values
  ('admin', 'content.read'), ('admin', 'content.edit'), ('admin', 'content.publish'),
  ('admin', 'media.manage'), ('admin', 'sites.manage'), ('admin', 'audit.read'),
  ('lawyer', 'cases.read'), ('lawyer', 'documents.read'), ('lawyer', 'documents.upload');

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 200));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();
-- Existing Auth users also start without roles.
insert into public.profiles(id, display_name)
select id, left(coalesce(raw_user_meta_data ->> 'display_name', ''), 200)
from auth.users on conflict (id) do nothing;

create function private.is_active_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active');
$$;
create function private.is_super_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_active_user() and exists (
    select 1 from public.platform_role_assignments where user_id = auth.uid() and role_code = 'super_admin'
  );
$$;
create function private.is_org_member(p_organization_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_active_user() and exists (
    select 1 from public.organization_memberships m
    join public.organizations o on o.id = m.organization_id
    where m.organization_id = p_organization_id and m.user_id = auth.uid()
      and m.status = 'active' and o.status = 'active'
  );
$$;
create function private.has_org_permission(p_organization_id uuid, p_permission text) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_active_user()
    and exists (select 1 from public.organizations where id = p_organization_id and status = 'active')
    and (private.is_super_admin() or exists (
      select 1 from public.organization_memberships m
      join public.membership_roles r on r.membership_id = m.id
      join public.role_permissions p on p.role_code = r.role_code
      where m.organization_id = p_organization_id and m.user_id = auth.uid()
        and m.status = 'active' and p.permission_code = p_permission
    ));
$$;

-- A row lock and counter serialize concurrent removals/suspensions of platform admins.
-- This avoids a count(*) race in which two admins could both remove the other.
create table private.platform_admin_guard (
  singleton boolean primary key default true check (singleton),
  active_count integer not null default 0 check (active_count >= 0)
);
insert into private.platform_admin_guard default values;

create function private.guard_platform_admins() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_delta integer;
begin
  if tg_table_name = 'platform_role_assignments' then
    if tg_op = 'INSERT' then
      -- Serialize a role grant against suspension of that same profile.
      perform 1 from public.profiles where id = new.user_id and status = 'active' for update;
      if not found then
        raise exception 'Super admin must have an active profile' using errcode = '23514';
      end if;
      v_delta := 1;
    else
      if not exists (select 1 from public.profiles where id = old.user_id and status = 'active') then
        return old;
      end if;
      v_delta := -1;
    end if;
  else
    if new.status = old.status or not exists (
      select 1 from public.platform_role_assignments where user_id = new.id and role_code = 'super_admin'
    ) then return new; end if;
    v_delta := case when new.status = 'active' then 1 else -1 end;
  end if;
  if v_delta = -1 then
    update private.platform_admin_guard set active_count = active_count - 1
    where singleton and active_count > 1;
    if not found then
      raise exception 'Cannot remove or suspend the last active super admin' using errcode = '23514';
    end if;
  else
    update private.platform_admin_guard set active_count = active_count + 1 where singleton;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger guard_platform_admins before insert or delete on public.platform_role_assignments
for each row execute function private.guard_platform_admins();
create trigger guard_platform_admin_status before update of status on public.profiles
for each row execute function private.guard_platform_admins();

-- Only a trusted SQL connection can bootstrap; never promote the first signup automatically.
create function private.bootstrap_super_admin(p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from private.platform_admin_guard where singleton for update;
  if exists (select 1 from public.platform_role_assignments) then
    raise exception 'Platform already bootstrapped' using errcode = '23514';
  end if;
  insert into public.platform_role_assignments(user_id) values (p_user_id);
end;
$$;

create function public.set_user_status(p_user_id uuid, p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_super_admin() then raise insufficient_privilege; end if;
  update public.profiles set status = p_status where id = p_user_id;
  if not found then raise no_data_found; end if;
end;
$$;

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  table_name text not null,
  record_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  changed_fields text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_org_date_idx on public.audit_events(organization_id, created_at desc);
create index audit_actor_idx on public.audit_events(actor_id);

-- Record changed field names, not credentials, document bodies or other sensitive values.
create function private.audit_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_row jsonb; v_old jsonb; v_org uuid; v_changed text[];
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_old := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  v_org := (v_row ->> 'organization_id')::uuid;
  if tg_table_name = 'organizations' then
    v_org := case when tg_op = 'DELETE' then null else (v_row ->> 'id')::uuid end;
  elsif tg_table_name = 'membership_roles' then
    select organization_id into v_org from public.organization_memberships
    where id = (v_row ->> 'membership_id')::uuid;
  end if;
  select coalesce(array_agg(k order by k), '{}'::text[]) into v_changed
  from jsonb_object_keys(v_row) k where v_row -> k is distinct from v_old -> k;
  insert into public.audit_events(organization_id, actor_id, table_name, record_id, action, changed_fields)
  values (v_org, auth.uid(), tg_table_name,
    coalesce(v_row ->> 'id', v_row ->> 'user_id', v_row ->> 'membership_id'), tg_op, v_changed);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles', 'organizations', 'organization_memberships'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()', t);
  end loop;
  foreach t in array array['profiles', 'organizations', 'organization_memberships', 'platform_role_assignments', 'membership_roles'] loop
    execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function private.audit_change()', t);
  end loop;
  foreach t in array array['profiles', 'organizations', 'roles', 'permissions', 'role_permissions', 'platform_role_assignments', 'organization_memberships', 'membership_roles', 'audit_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end;
$$;

grant select on public.roles, public.permissions, public.role_permissions to authenticated;
create policy roles_read on public.roles for select to authenticated using (private.is_active_user());
create policy permissions_read on public.permissions for select to authenticated using (private.is_active_user());
create policy role_permissions_read on public.role_permissions for select to authenticated using (private.is_active_user());

grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated
using (id = (select auth.uid()) or private.is_super_admin());
create policy profiles_update on public.profiles for update to authenticated
using (id = (select auth.uid()) and private.is_active_user())
with check (id = (select auth.uid()) and private.is_active_user());

grant select, insert, update on public.organizations to authenticated;
create policy organizations_read on public.organizations for select to authenticated
using (private.is_super_admin() or private.is_org_member(id));
create policy organizations_insert on public.organizations for insert to authenticated
with check (private.is_super_admin());
create policy organizations_update on public.organizations for update to authenticated
using (private.is_super_admin()) with check (private.is_super_admin());

grant select, insert, delete on public.platform_role_assignments to authenticated;
create policy platform_roles_read on public.platform_role_assignments for select to authenticated
using (user_id = (select auth.uid()) or private.is_super_admin());
create policy platform_roles_insert on public.platform_role_assignments for insert to authenticated
with check (private.is_super_admin() and granted_by = (select auth.uid()));
create policy platform_roles_delete on public.platform_role_assignments for delete to authenticated
using (private.is_super_admin());

grant select, insert, update, delete on public.organization_memberships to authenticated;
create policy memberships_read on public.organization_memberships for select to authenticated
using (user_id = (select auth.uid()) or private.is_super_admin());
create policy memberships_manage on public.organization_memberships for all to authenticated
using (private.is_super_admin()) with check (private.is_super_admin());
grant select, insert, delete on public.membership_roles to authenticated;
create policy membership_roles_read on public.membership_roles for select to authenticated using (
  private.is_super_admin() or exists (
    select 1 from public.organization_memberships m where m.id = membership_id and m.user_id = (select auth.uid())
  )
);
create policy membership_roles_insert on public.membership_roles for insert to authenticated
with check (private.is_super_admin() and granted_by = (select auth.uid()));
create policy membership_roles_delete on public.membership_roles for delete to authenticated using (private.is_super_admin());

grant select on public.audit_events to authenticated;
grant usage, select on sequence public.audit_events_id_seq to service_role;
create policy audit_read on public.audit_events for select to authenticated
using (private.is_super_admin() or private.has_org_permission(organization_id, 'audit.read'));

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_active_user(), private.is_super_admin(),
  private.is_org_member(uuid), private.has_org_permission(uuid, text) to authenticated;
revoke all on function public.set_user_status(uuid, text) from public, anon;
grant execute on function public.set_user_status(uuid, text) to authenticated;
