-- Revocation of a form location is checked again after a signed form was issued.
create or replace function public.submit_contact(
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
 insert into public.contact_submissions(organization_id,site_id,locale,source_entry_id,source_path,name,email,phone,subject,message,consent,privacy_revision_id,idempotency_key,request_hash)
 values(v_site.organization_id,v_site.id,p_locale,p_source_entry_id,p_source_path,p_name,lower(p_email),p_phone,p_subject,p_message,p_consent,p_privacy_revision_id,p_idempotency_key,p_request_hash)
 returning id into v_id;
 return v_id;
end;
$$;
