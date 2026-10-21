-- Filter in SQL before pagination, avoiding truncated association lists in PostgREST.
-- Invoker security retains the published-content and association RLS policies.
create function public.list_published_content(p_site_id uuid,p_locale text,p_kind text default 'post',
 p_query text default '',p_term_id uuid default null,p_author_id uuid default null,p_page integer default 1)
returns jsonb language sql stable set search_path = '' as $$
 with matches as materialized (
  select c.* from public.published_content c
  where c.site_id=p_site_id and c.locale=p_locale and (p_kind is null or c.kind::text=p_kind)
   and (coalesce(p_query,'')='' or c.title ilike '%'||left(p_query,200)||'%')
   and (p_term_id is null or exists(select 1 from public.revision_terms t
     where t.site_id=p_site_id and t.revision_id=c.revision_id and t.term_id=p_term_id))
   and (p_author_id is null or exists(select 1 from public.revision_authors a
     where a.site_id=p_site_id and a.revision_id=c.revision_id and a.author_id=p_author_id))
 ), page_rows as (
  select * from matches order by first_published_at desc nulls last,id
  limit 9 offset (greatest(1,least(coalesce(p_page,1),100000))-1)*9
 ) select jsonb_build_object('total',(select count(*) from matches),'rows',
   coalesce((select jsonb_agg(to_jsonb(p) order by p.first_published_at desc nulls last,p.id) from page_rows p),'[]'::jsonb));
$$;
revoke all on function public.list_published_content(uuid,text,text,text,uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.list_published_content(uuid,text,text,text,uuid,uuid,integer) to anon,authenticated;

-- Public standalone team portraits have the same file immutability as published pages.
create or replace function private.validate_public_author() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 perform 1 from public.sites where id=new.site_id for update;
 if new.is_public and new.avatar_asset_id is not null and not exists(
  select 1 from public.media_assets m where m.id=new.avatar_asset_id and m.site_id=new.site_id
   and m.bucket_id='cms-public' and exists(select 1 from storage.objects o where o.bucket_id=m.bucket_id and o.name=m.storage_path)
 ) then raise check_violation using message='La imagen del perfil público debe existir en cms-public'; end if;
 return new;
end;
$$;
create function private.guard_public_portrait() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_asset public.media_assets;
begin
 if old.bucket_id<>'cms-public' then
  if tg_op='DELETE' then return old; end if; return new;
 end if;
 if tg_op='UPDATE' and old.bucket_id=new.bucket_id and old.name=new.name
  and old.metadata is not distinct from new.metadata and old.version is not distinct from new.version then return new; end if;
 select * into v_asset from public.media_assets where bucket_id=old.bucket_id and storage_path=old.name;
 if found then
  perform 1 from public.sites where id=v_asset.site_id for update;
  if exists(select 1 from public.authors where avatar_asset_id=v_asset.id and is_public) then
   raise check_violation using message='La imagen de un perfil público no puede eliminarse ni sobrescribirse';
  end if;
 end if;
 if tg_op='DELETE' then return old; end if; return new;
end;
$$;
create trigger leyer_guard_public_portrait before update or delete on storage.objects
for each row execute function private.guard_public_portrait();
