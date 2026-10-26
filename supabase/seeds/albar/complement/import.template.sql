-- Complemento editorial ALBAR: ejecutar DESPUÉS de ../seed.sql.
-- SQL autocontenido; no crea cuentas ni modifica configuración del sitio.
begin;
create temporary table albar_complement_config(config jsonb) on commit drop;
insert into albar_complement_config values (
 $ALBAR_COMPLEMENT_CONFIG${"actor_email":"","publish":false,"content_review_confirmed":false}$ALBAR_COMPLEMENT_CONFIG$::jsonb
 || coalesce(nullif(current_setting('leyer.albar_complement_config',true),'')::jsonb,'{}'::jsonb)
);
create temporary table albar_complement_source(payload jsonb) on commit drop;
insert into albar_complement_source values ($ALBAR_COMPLEMENT$__PAYLOAD__$ALBAR_COMPLEMENT$::jsonb);

__HELPERS__
-- Check current identity, concurrency, publication state and scheduling together.
create or replace function pg_temp.albar_complement_guard(p_entry uuid,p_site uuid,previous jsonb)
returns uuid language plpgsql as $$
declare latest uuid; published uuid; archived timestamptz; revision_state text; identity text;
begin
 perform 1 from public.content_entries where id=p_entry and site_id=p_site for update;
 if not found then raise exception 'Identidad ajena al sitio ALBAR' using errcode='40001';end if;
 select r.id,r.editorial_state into latest,revision_state from public.content_revisions r where r.entry_id=p_entry order by r.revision_number desc limit 1;
 select e.published_revision_id,e.archived_at,pg_temp.albar_hash(jsonb_build_object('internal_name',e.internal_name,'parent_id',e.parent_id,'first_published_at',e.first_published_at))
 into published,archived,identity from public.content_entries e where e.id=p_entry;
 if archived is not null or latest is distinct from nullif(previous->>'last_revision_id','')::uuid
   or published is distinct from nullif(previous->>'published_revision_id','')::uuid
   or (previous ? 'editorial_state' and revision_state is distinct from previous->>'editorial_state')
   or (previous ? 'identity_hash' and identity is distinct from previous->>'identity_hash') then
  raise exception 'Conflicto editorial: se conserva la edición, publicación o jerarquía existente de %',p_entry using errcode='40001';
 end if;
 if exists(select 1 from public.scheduled_publications where entry_id=p_entry and status='pending') then
  raise exception 'Hay una publicación programada; el complemento no la modifica' using errcode='40001';end if;
 return latest;
end;
$$;

do $IMPORT$
<<complement>>
declare
 cfg jsonb; src jsonb; state jsonb; ext jsonb; node jsonb; old jsonb; snapshot jsonb; ids jsonb:='{}'; terms jsonb;
 actor uuid; site uuid; author uuid; entry uuid; expected uuid; revision uuid; menu uuid; term uuid;
 published uuid; revision_state text; hash text; fingerprint text; menu_input jsonb; old_claims text; old_sub text;
 record_item record; is_patch boolean; publish boolean; n_created integer:=0; n_saved integer:=0; n_published integer:=0;
begin
 select config into cfg from albar_complement_config;
 select payload into src from albar_complement_source;
 if to_regclass('private.cms_seed_registry') is null then raise exception 'Ejecuta primero el seed inicial de ALBAR';end if;
 select p.id into actor from auth.users u join public.profiles p on p.id=u.id
  where lower(u.email)=lower(nullif(cfg->>'actor_email','')) and p.status='active' and p.is_admin;
 if actor is null then raise exception 'Configura actor_email con un administrador activo existente';end if;
 old_claims:=current_setting('request.jwt.claims',true);old_sub:=current_setting('request.jwt.claim.sub',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
 perform set_config('request.jwt.claim.sub',actor::text,true);
 if not private.is_admin() then raise insufficient_privilege;end if;
 publish:=coalesce((cfg->>'publish')::boolean,false);
 if publish and cfg->>'content_review_confirmed' is distinct from 'true' then raise exception 'Confirma la revisión del contenido antes de publicar';end if;
 -- Serialize with both this extension and the initial importer.
 perform pg_advisory_xact_lock(hashtextextended(src->>'base_seed_key',0));
 select r.site_id,r.state into site,state from private.cms_seed_registry r
  join public.sites s on s.id=r.site_id
  where r.seed_key=src->>'base_seed_key' and s.status in ('draft','active') for update of r,s;
 if site is null then raise exception 'Falta el seed inicial de ALBAR o el estudio/sitio no está disponible';end if;
 ext:=coalesce(state->'extensions'->(src->>'extension_key'),'{}');
 for record_item in select key,value from jsonb_each(state->'entries') loop
  if not exists(select 1 from public.content_entries e where e.id=(record_item.value->>'id')::uuid and e.site_id=site and e.archived_at is null) then
   raise exception 'Referencia base inválida o archivada: %',record_item.key;end if;
  ids:=ids||jsonb_build_object(record_item.key,record_item.value->>'id');
 end loop;
 -- The article credits the original displayed author; no Auth identity is invented.
 author:=nullif(ext->>'author_id','')::uuid;
 if author is null then
  if exists(select 1 from public.authors where site_id=site and slug=src->'author'->>'slug') then raise exception 'Autor Jorge preexistente fuera del complemento';end if;
  insert into public.authors(site_id,display_name,slug,biography,professional_title,is_public)
   values(site,src->'author'->>'display_name',src->'author'->>'slug','','',publish) returning id into author;
 else
  perform 1 from public.authors where id=author and site_id=site for update;
  select pg_temp.albar_hash(to_jsonb(a)-'id'-'site_id') into hash from public.authors a where a.id=author and a.site_id=site;
  if hash is distinct from ext->>'author_hash' then raise exception 'Conflicto: autor original editado' using errcode='40001';end if;
  update public.authors set is_public=true where id=author and publish and not is_public;
 end if;
 select pg_temp.albar_hash(to_jsonb(a)-'id'-'site_id') into hash from public.authors a where a.id=author;
 ext:=ext||jsonb_build_object('author_id',author,'author_hash',hash);
 terms:=coalesce(state->'terms','{}')||coalesce(ext->'terms','{}');
 if not exists(select 1 from public.taxonomies t where t.id=(state->>'taxonomy_id')::uuid and t.site_id=site and t.code='category') then raise exception 'Taxonomía base inválida';end if;
 for node in select value from jsonb_array_elements(src->'terms') loop
  term:=nullif(terms->>(node->>'key'),'')::uuid;
  if term is null then
   if exists(select 1 from public.terms t where t.site_id=site and t.taxonomy_id=(state->>'taxonomy_id')::uuid and t.slug=node->>'slug') then raise exception 'Categoría preexistente fuera del complemento: %',node->>'slug';end if;
   insert into public.terms(site_id,taxonomy_id,name,slug) values(site,(state->>'taxonomy_id')::uuid,node->>'name',node->>'slug') returning id into term;
  elsif not exists(select 1 from public.terms t where t.id=term and t.site_id=site and t.taxonomy_id=(state->>'taxonomy_id')::uuid and t.name=node->>'name' and t.slug=node->>'slug' and t.parent_id is null) then
   raise exception 'Conflicto: categoría editada' using errcode='40001';end if;
  terms:=terms||jsonb_build_object(node->>'key',term);
 end loop;
 ext:=ext||jsonb_build_object('terms',terms);
 -- Allocate environment-specific IDs before building any snapshots or relations.
 for node in select value from jsonb_array_elements(src->'entries') loop
  entry:=nullif(ext->'entries'->(node->>'key')->>'id','')::uuid;
  if entry is null then
   if exists(select 1 from public.content_revisions where site_id=site and path=node->>'path')
    or exists(select 1 from public.content_routes where site_id=site and path=node->>'path')
    or exists(select 1 from public.redirects where site_id=site and from_path=node->>'path') then
    raise exception 'Ruta preexistente fuera del complemento: %',node->>'path';end if;
   insert into public.content_entries(site_id,kind,locale,internal_name,parent_id,first_published_at)
    values(site,node->>'kind','es-CL','ALBAR · '||(node->>'title'),(ids->>(node->>'parent'))::uuid,
     case when node->>'published_date' is not null then (node->>'published_date')::date::timestamp at time zone 'America/Santiago' else null end)
    returning id into entry;
   ext:=jsonb_set(ext,'{entries}',coalesce(ext->'entries','{}')||jsonb_build_object(node->>'key',jsonb_build_object('id',entry)));
   n_created:=n_created+1;
  end if;
  ids:=ids||jsonb_build_object(node->>'key',entry);
 end loop;
 for node in select value from jsonb_array_elements((src->'entries')||(src->'patches')) loop
  is_patch:=not (node ? 'kind');
  entry:=(ids->>(node->>'key'))::uuid;
  old:=coalesce(ext->'entries'->(node->>'key'),'{}');
  if is_patch and not (old ? 'last_revision_id') then
   old:=state->'entries'->(node->>'key');
   -- Initial importer predates the first_published_at identity fingerprint.
   if old->>'identity_hash' is distinct from (select pg_temp.albar_hash(jsonb_build_object('internal_name',internal_name,'parent_id',parent_id)) from public.content_entries where id=entry and site_id=site) then
    raise exception 'Conflicto en la página base: %',node->>'key' using errcode='40001';end if;
   old:=old-'identity_hash';
  end if;
  expected:=pg_temp.albar_complement_guard(entry,site,old);
  if is_patch then
   old:=old||jsonb_build_object('base_revision_id',coalesce(old->>'base_revision_id',expected::text));
   snapshot:=public.get_cms_snapshot((old->>'base_revision_id')::uuid);
   if snapshot is null then raise exception 'Snapshot base inaccesible';end if;
   snapshot:=snapshot||jsonb_build_object('blocks',(snapshot->'blocks')||(node->'blocks'));
  else
   if not exists(select 1 from public.content_entries e where e.id=entry and e.site_id=site and e.kind=node->>'kind' and e.locale='es-CL' and e.parent_id=(ids->>(node->>'parent'))::uuid) then raise exception 'Identidad o jerarquía inválida';end if;
   snapshot:=pg_temp.albar_content(node,ids,terms,case when node->>'author'='jorge' then author else (state->>'author_id')::uuid end,'{}','{}');
   snapshot:=snapshot||jsonb_build_object('seo',(snapshot->'seo')||jsonb_strip_nulls(jsonb_build_object('source_url',node->>'source_url','source_html_sha256',node->>'source_html_sha256','source_published_date',node->>'published_date')));
  end if;
  fingerprint:=pg_temp.albar_hash(snapshot);
  if expected is null or fingerprint is distinct from old->>'complement_fingerprint' then
   revision:=public.save_content_revision(entry,expected,snapshot);
   perform public.set_revision_state(revision,'in_review');expected:=revision;n_saved:=n_saved+1;
  end if;
  select e.published_revision_id into published from public.content_entries e where e.id=entry;
  if publish and published is distinct from expected then
   perform public.set_revision_state(expected,'approved');perform public.publish_content_revision(expected);published:=expected;n_published:=n_published+1;
  end if;
  select r.editorial_state into revision_state from public.content_revisions r where r.id=expected;
  select pg_temp.albar_hash(jsonb_build_object('internal_name',e.internal_name,'parent_id',e.parent_id,'first_published_at',e.first_published_at)) into hash from public.content_entries e where e.id=entry;
  ext:=jsonb_set(ext,'{entries}',coalesce(ext->'entries','{}')||jsonb_build_object(node->>'key',old||jsonb_build_object('id',entry,'last_revision_id',expected,'published_revision_id',published,'editorial_state',revision_state,'identity_hash',hash,'complement_fingerprint',fingerprint)));
 end loop;
 menu:=nullif(state->'menus'->'primary'->>'id','')::uuid;
 perform 1 from public.menus where id=menu and site_id=site for update;
 if not found then raise exception 'Menú base inválido';end if;
 perform 1 from public.menu_items where menu_id=menu order by id for update;
 select pg_temp.albar_hash(jsonb_build_object('items',pg_temp.albar_menu_snapshot(menu),'menu',(select to_jsonb(m)-'id'-'site_id' from public.menus m where m.id=menu))) into hash;
 if hash is distinct from coalesce(ext->>'menu_hash',state->'menus'->'primary'->>'hash') then raise exception 'Conflicto: menú editado fuera del seed' using errcode='40001';end if;
 menu_input:=(src->'menu'->'items')||coalesce((select jsonb_agg(jsonb_build_object('label',m.label,'external_url',m.external_url) order by m.position) from public.menu_items m where m.menu_id=menu and m.parent_id is null and m.external_url is not null),'[]'::jsonb);
 fingerprint:=pg_temp.albar_hash(menu_input);
 if fingerprint is distinct from ext->>'menu_source_hash' then
  for record_item in with recursive tree as(select id,0 as depth from public.menu_items where menu_id=menu and parent_id is null union all select m.id,t.depth+1 from public.menu_items m join tree t on m.parent_id=t.id where m.menu_id=menu) select id from tree order by depth desc loop
   delete from public.menu_items where id=record_item.id and menu_id=menu;
  end loop;
  perform pg_temp.albar_menu_items(menu_input,site,menu,ids);
 end if;
 update public.menus set is_public=true where id=menu and publish and not is_public;
 select pg_temp.albar_hash(jsonb_build_object('items',pg_temp.albar_menu_snapshot(menu),'menu',(select to_jsonb(m)-'id'-'site_id' from public.menus m where m.id=menu))) into hash;
 ext:=ext||jsonb_build_object('menu_hash',hash,'menu_source_hash',fingerprint);
 for node in select value from jsonb_array_elements(src->'redirects') loop
  entry:=(ids->>(node->>'entry'))::uuid;
  if exists(select 1 from public.redirects where site_id=site and locale='es-CL' and from_path=node->>'from' and (target_entry_id<>entry or status_code<>301)) then raise exception 'Redirección incompatible';end if;
  if exists(select 1 from public.content_routes where site_id=site and locale='es-CL' and path=node->>'from' and entry_id<>entry) then raise exception 'La redirección desplazaría contenido existente';end if;
  if not exists(select 1 from public.redirects where site_id=site and locale='es-CL' and from_path=node->>'from') then
   perform public.manage_cms_redirect(site,null,'es-CL',node->>'from',entry,301);
  end if;
 end loop;
 state:=jsonb_set(state,'{extensions}',coalesce(state->'extensions','{}')||jsonb_build_object(src->>'extension_key',ext));
 update private.cms_seed_registry r set state=complement.state,updated_at=now() where r.seed_key=src->>'base_seed_key';
 perform set_config('request.jwt.claims',coalesce(old_claims,''),true);perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);
 raise notice 'ALBAR complemento: % contenidos nuevos, % revisiones nuevas, % publicaciones',n_created,n_saved,n_published;
end;
$IMPORT$;
select s.name,count(e.id) as contents,count(e.published_revision_id) as published
 from private.cms_seed_registry r join public.sites s on s.id=r.site_id
 join public.content_entries e on e.site_id=s.id
 where r.seed_key=(select payload->>'base_seed_key' from albar_complement_source) group by s.name;
commit;
