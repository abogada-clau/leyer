create function private.validate_public_site_settings() returns trigger
language plpgsql set search_path = '' as $$
declare k text; v text; v_paths text[]:='{}';
begin
 if new.default_locale !~ '^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$' then raise check_violation using message='Idioma de sitio inválido'; end if;
 foreach k in array array['privacy_path','contact_path','blog_path','team_path','services_path'] loop
  v:=coalesce(nullif(new.settings->>k,''),case k when 'privacy_path' then '/privacidad' when 'contact_path' then '/contacto' when 'blog_path' then '/articulos' when 'team_path' then '/equipo' else '/servicios' end);
  if v='/' or v !~ '^/' or v ~ '[?#%[:space:]\\]' or v ~ '//' or v ~ '(^|/)\.\.?(/|$)' or right(v,1)='/' or private.is_reserved_public_path(v) or v=any(v_paths) then raise check_violation using message='Las rutas de las secciones deben ser distintas, válidas y no reservadas'; end if;
  v_paths:=array_append(v_paths,v);
 end loop;
 foreach k in array array['contact_enabled','contact_on_landings'] loop
  if new.settings ? k and jsonb_typeof(new.settings->k)<>'boolean' then raise check_violation using message='Las opciones de formularios deben ser booleanas'; end if;
 end loop;
 return new;
end;
$$;
create trigger validate_public_site_settings before insert or update of settings,default_locale on public.sites for each row execute function private.validate_public_site_settings();
