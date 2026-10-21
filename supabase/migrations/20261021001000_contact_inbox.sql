insert into public.permissions(code,description) values ('contacts.read','Consultar consultas del sitio'),('contacts.manage','Gestionar consultas del sitio');
insert into public.role_permissions(role_code,permission_code) values
 ('super_admin','contacts.read'),('super_admin','contacts.manage'),('admin','contacts.read'),('admin','contacts.manage');
create table public.contact_submissions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, site_id uuid not null,
 locale text not null, source_entry_id uuid, source_path text not null check(source_path ~ '^/' and length(source_path)<=2000),
 name text not null check(length(btrim(name)) between 2 and 200),
 email text not null check(length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 phone text not null default '' check(length(phone)<=50),
 subject text not null check(length(btrim(subject)) between 2 and 200),
 message text not null check(length(btrim(message)) between 10 and 5000),
 consent boolean not null check(consent), privacy_revision_id uuid not null,
 consent_at timestamptz not null default now(), status text not null default 'new' check(status in ('new','in_progress','closed','spam')),
 internal_notes text not null default '' check(length(internal_notes)<=5000),
 idempotency_key uuid not null unique, request_hash text not null check(request_hash ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(site_id,organization_id) references public.sites(id,organization_id) on delete restrict,
 foreign key(source_entry_id,site_id,organization_id) references public.content_entries(id,site_id,organization_id) on delete restrict,
 foreign key(privacy_revision_id,site_id,organization_id) references public.content_revisions(id,site_id,organization_id) on delete restrict
);
create index contact_submissions_site_date_idx on public.contact_submissions(site_id,created_at desc);
create index contact_submissions_org_idx on public.contact_submissions(organization_id);
create index contact_submissions_source_idx on public.contact_submissions(source_entry_id);
create index contact_submissions_privacy_idx on public.contact_submissions(privacy_revision_id);
alter table public.contact_submissions enable row level security;
revoke all on public.contact_submissions from anon,authenticated;
grant all on public.contact_submissions to service_role;
grant select on public.contact_submissions to authenticated;
grant update(status,internal_notes) on public.contact_submissions to authenticated;
create policy contacts_read on public.contact_submissions for select to authenticated using(private.site_permission(site_id,'contacts.read'));
create policy contacts_update on public.contact_submissions for update to authenticated using(private.site_permission(site_id,'contacts.manage')) with check(private.site_permission(site_id,'contacts.manage'));
create trigger touch_updated_at before update on public.contact_submissions for each row execute function private.touch_updated_at();
create trigger guard_tenant_identity before update on public.contact_submissions for each row execute function private.guard_tenant_identity();
create trigger audit_change after insert or update or delete on public.contact_submissions for each row execute function private.audit_change();

-- Shared atomic rate limits. No raw IP addresses or message bodies in this table.
create table private.contact_rate_windows (
 key text primary key, window_start timestamptz not null, count integer not null check(count>0)
);
revoke all on private.contact_rate_windows from public,anon,authenticated;
create function public.submit_contact(
 p_site_id uuid,p_locale text,p_source_entry_id uuid,p_source_path text,p_name text,p_email text,p_phone text,
 p_subject text,p_message text,p_consent boolean,p_privacy_revision_id uuid,p_client_hash text,p_idempotency_key uuid,p_request_hash text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_site public.sites; v_privacy uuid; v_existing public.contact_submissions; v_key text; v_start timestamptz; v_count integer; v_id uuid;
begin
 if p_client_hash !~ '^[0-9a-f]{64}$' or p_request_hash !~ '^[0-9a-f]{64}$' then raise invalid_parameter_value; end if;
 select * into v_site from public.sites where id=p_site_id and private.is_public_site(id);
 if not found or v_site.settings->>'contact_enabled' is distinct from 'true' then raise insufficient_privilege using message='El formulario no está disponible'; end if;
 select p.revision_id into v_privacy from public.published_content p where p.site_id=p_site_id and p.locale=p_locale and p.path=coalesce(nullif(v_site.settings->>'privacy_path',''),'/privacidad');
 if v_privacy is null or v_privacy is distinct from p_privacy_revision_id then raise serialization_failure using message='La política de privacidad cambió; recarga el formulario'; end if;
 if p_source_entry_id is not null then
  if not exists(select 1 from public.published_content where id=p_source_entry_id and site_id=p_site_id and locale=p_locale and path=p_source_path) then raise insufficient_privilege; end if;
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
 insert into public.contact_submissions(organization_id,site_id,locale,source_entry_id,source_path,name,email,phone,subject,message,consent,privacy_revision_id,idempotency_key,request_hash)
 values(v_site.organization_id,v_site.id,p_locale,p_source_entry_id,p_source_path,p_name,lower(p_email),p_phone,p_subject,p_message,p_consent,p_privacy_revision_id,p_idempotency_key,p_request_hash)
 returning id into v_id;
 return v_id;
end;
$$;
revoke all on function public.submit_contact(uuid,text,uuid,text,text,text,text,text,text,boolean,uuid,text,uuid,text) from public,anon,authenticated;
grant execute on function public.submit_contact(uuid,text,uuid,text,text,text,text,text,text,boolean,uuid,text,uuid,text) to service_role;
