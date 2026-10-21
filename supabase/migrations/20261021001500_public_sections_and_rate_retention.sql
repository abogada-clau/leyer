-- Built-in section fallbacks must not resurrect a page explicitly withdrawn by an editor.
create function public.public_section_available(p_site_id uuid,p_locale text,p_path text) returns boolean
language sql stable security definer set search_path = '' as $$
 select private.is_public_site(p_site_id) and (
  exists(select 1 from public.published_content where site_id=p_site_id and locale=p_locale and path=p_path)
  or not exists(select 1 from public.content_routes where site_id=p_site_id and locale=p_locale and path=p_path)
 );
$$;
revoke all on function public.public_section_available(uuid,text,text) from public,anon,authenticated;
grant execute on function public.public_section_available(uuid,text,text) to anon,authenticated;

-- Expire pseudonymous abuse counters independently of the public browser.
create index contact_rate_windows_start_idx on private.contact_rate_windows(window_start);
create function public.cleanup_contact_rate_windows() returns integer
language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
 delete from private.contact_rate_windows where window_start < now()-interval '2 days';
 get diagnostics v_count=row_count;
 return v_count;
end;
$$;
revoke all on function public.cleanup_contact_rate_windows() from public,anon,authenticated;
grant execute on function public.cleanup_contact_rate_windows() to service_role;
