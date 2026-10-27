-- Keep publication checks live, but resolve each page in one PostgREST round trip.
-- Invoker security retains RLS for entries, redirects, authors and translations.
create index if not exists revisions_public_path_idx on public.content_revisions(path);

create or replace function public.get_public_page(p_path text default '/', p_locale text default null, p_details boolean default false)
returns jsonb language plpgsql stable set search_path = '' as $$
declare
 v_site jsonb; v_site_id uuid; v_locale text; v_entry jsonb; v_redirect jsonb;
 v_ancestors jsonb := '[]'::jsonb; v_translations jsonb := '[]'::jsonb; v_locales jsonb := '[]'::jsonb;
 v_author jsonb; v_taxonomy jsonb; v_term jsonb; v_parts text[];
begin
 v_site := public.get_public_site();
 if v_site is null then return null; end if;
 v_site_id := (v_site->>'id')::uuid;
 v_locale := coalesce(p_locale, v_site->>'default_locale');
 if v_locale <> v_site->>'default_locale' and not exists (
   select 1 from public.published_content where site_id=v_site_id and locale=v_locale
 ) then return null; end if;
 select to_jsonb(p) into v_entry from public.published_content p
 where p.site_id=v_site_id and p.locale=v_locale and p.path=p_path;
 if v_entry is null then
   select jsonb_build_object('path',p.path,'status',r.status_code) into v_redirect
   from public.redirects r join public.published_content p
     on p.id=r.target_entry_id and p.site_id=r.site_id and p.locale=r.locale
   where r.site_id=v_site_id and r.locale=v_locale and r.from_path=p_path and p.path<>p_path;
   v_parts := string_to_array(p_path,'/');
   if array_length(v_parts,1)=3 and v_parts[2]='autores' then
     select to_jsonb(a) into v_author from public.authors a where a.site_id=v_site_id and a.slug=v_parts[3];
   elsif array_length(v_parts,1)=4 and v_parts[2]='taxonomias' then
     select jsonb_build_object('id',t.id,'code',t.code,'name',t.name) into v_taxonomy
       from public.taxonomies t where t.site_id=v_site_id and t.code=v_parts[3];
     select jsonb_build_object('id',t.id,'taxonomy_id',t.taxonomy_id,'name',t.name,'slug',t.slug,'parent_id',t.parent_id)
       into v_term from public.terms t where t.site_id=v_site_id and t.taxonomy_id=(v_taxonomy->>'id')::uuid and t.slug=v_parts[4];
   end if;
 end if;
 if p_details then
   -- One recursive query instead of one HTTP query per breadcrumb level. Bound cycles/depth.
   with recursive parents as (
     select p.id,p.title,p.path,p.parent_id,1 as depth,array[p.id] as seen
     from public.published_content p
     where p.site_id=v_site_id and p.locale=v_locale and p.id=(v_entry->>'parent_id')::uuid
     union all
     select p.id,p.title,p.path,p.parent_id,a.depth+1,a.seen||p.id
     from parents a join public.published_content p on p.id=a.parent_id
     where p.site_id=v_site_id and p.locale=v_locale and a.depth<8 and not p.id=any(a.seen)
   ) select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'path',path) order by depth desc)
     filter(where path<>'/'),'[]') into v_ancestors from parents;
   select coalesce(jsonb_agg(jsonb_build_object('locale',locale,'path',path)),'[]') into v_translations
     from public.published_content where site_id=v_site_id and path=p_path;
   select coalesce(jsonb_agg(locale order by locale),'[]') into v_locales from (
     select distinct locale from public.published_content where site_id=v_site_id
   ) l;
 end if;
 return jsonb_build_object('site',v_site,'locale',v_locale,'entry',v_entry,'redirect',v_redirect,
   'available',case when v_entry is not null then true else public.public_section_available(v_site_id,v_locale,p_path) end,
   'ancestors',v_ancestors,'translations',v_translations,'locales',v_locales,
   'author',v_author,'taxonomy',v_taxonomy,'term',v_term);
end;
$$;
revoke all on function public.get_public_page(text,text,boolean) from public,anon,authenticated;
grant execute on function public.get_public_page(text,text,boolean) to anon,authenticated;
notify pgrst,'reload schema';
