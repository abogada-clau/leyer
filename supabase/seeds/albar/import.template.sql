-- ALBAR ABOGADOS. Generado desde content.mjs; no ejecutar como migración automática.
-- Solo SQL Editor/conexión de confianza. Requiere todas las migraciones, incluida 20261022000100_editable_service_presentation.sql.
-- Edita esta configuración. Sin actor válido la transacción aborta sin crear datos.
-- Por defecto TODO queda en revisión y el sitio en borrador.
begin;
create temporary table albar_seed_config(config jsonb) on commit drop;
insert into albar_seed_config values (
 $ALBAR_CONFIG${
  "actor_email": "",
  "admin_email": null,
  "domain": "www.albarabogados.cl",
  "publish": false,
  "activate_site": false,
  "legal_review_confirmed": false,
  "privacy_review_confirmed": false,
  "privacy_controller": null,
  "privacy_email": "contacto@abogadaclaudia.com",
  "privacy_processors": null,
  "retention_days": null,
  "phone": "+56 9 4697 8661",
  "address": "Av. Corrientes 1234, piso 5, Quinta Normal, Chile",
  "whatsapp": "56946978661",
  "contact_enabled": false,
  "demo": false,
  "assets": {}
 }$ALBAR_CONFIG$::jsonb
 || coalesce(nullif(current_setting('leyer.albar_config',true),'')::jsonb,'{}'::jsonb)
);
create temporary table albar_seed_source(payload jsonb) on commit drop;
insert into albar_seed_source values ($ALBAR_PAYLOAD$__ALBAR_PAYLOAD__$ALBAR_PAYLOAD$::jsonb);

-- All helpers are session-local, invoker-security, and disappear on disconnect.
create or replace function pg_temp.albar_hash(value jsonb) returns text language sql immutable as $$
 select encode(sha256(convert_to(value::text,'UTF8')),'hex');
$$;
create or replace function pg_temp.albar_content(source jsonb, entries jsonb,terms jsonb,author uuid,assets jsonb,config jsonb)
returns jsonb language plpgsql as $$
declare result jsonb; b jsonb; blocks jsonb:='[]'; a uuid; asset_name text; replacements jsonb; pair record;
begin
 for b in select value from jsonb_array_elements(source->'blocks') loop
  asset_name:=b->>'asset_key';
  b:=(b-'asset_key')||jsonb_build_object('assets','[]'::jsonb);
  if asset_name is not null and nullif(assets->>asset_name,'') is not null then
   a:=(assets->>asset_name)::uuid;
   b:=b||jsonb_build_object('assets',jsonb_build_array(jsonb_build_object('asset_id',a,'slot','image','alt_text',case when asset_name like 'claudia%' then 'Claudia Albiña Aros, abogada y fundadora de ALBAR Abogados.' else 'Recurso autorizado de ALBAR Abogados.' end,'focal_point',jsonb_build_object('x',0.5,'y',0.5))));
  end if;
  blocks:=blocks||jsonb_build_array(b);
 end loop;
 result:=jsonb_build_object('title',source->>'title','excerpt',source->>'excerpt','path',source->>'path',
  'cover_asset_id',case when source->>'template_key' in ('home','service-landing') then assets->>(source#>>'{blocks,0,asset_key}') else null end,'template_key',source->>'template_key','template_version',coalesce((source->>'template_version')::integer,1),
  'seo',jsonb_build_object('title',source->>'title','description',source->>'excerpt','noindex',false),
  'blocks',blocks,'authors',jsonb_build_array(author),
  'terms',coalesce((select jsonb_agg(terms->>value) from jsonb_array_elements_text(coalesce(source->'terms','[]'))),'[]'::jsonb),
  'relations',coalesce((select jsonb_agg(jsonb_build_object('entry_id',entries->>value,'type','related')) from jsonb_array_elements_text(coalesce(source->'relations','[]'))),'[]'::jsonb));
 -- Safe JSON substitutions, never SQL string interpolation or executable HTML.
 replacements:=jsonb_build_object('{{privacy_controller}}',coalesce(nullif(config->>'privacy_controller',''),'[Responsable pendiente de validación]'),
  '{{privacy_email}}',coalesce(config->>'privacy_email','contacto@abogadaclaudia.com'),
  '{{privacy_processors}}',coalesce(nullif(config->>'privacy_processors',''),'[Proveedores, región y encargados pendientes de validación]'),
  '{{whatsapp}}',coalesce(config->>'whatsapp','56946978661'),
  '{{retention_days}}',coalesce(config->>'retention_days','[Plazo pendiente de validación]'));
 for pair in select key,value from jsonb_each_text(replacements) loop
  -- Replacing JSON-encoded strings preserves quotes, newlines and backslashes in config values.
  result:=replace(result::text,pair.key,substring(to_jsonb(pair.value)::text from 2 for length(to_jsonb(pair.value)::text)-2))::jsonb;
 end loop;
 return result;
end;
$$;
create or replace function pg_temp.albar_menu_items(items jsonb,site uuid,menu uuid,entry_ids jsonb,parent uuid default null)
returns void language plpgsql as $$
declare item jsonb; item_id uuid; pos integer:=0;
begin
 for item in select value from jsonb_array_elements(items) loop
  insert into public.menu_items(site_id,menu_id,parent_id,label,position,entry_id,external_url)
  values(site,menu,parent,item->>'label',pos,(entry_ids->>(item->>'entry'))::uuid,item->>'external_url') returning id into item_id;
  if item ? 'children' then perform pg_temp.albar_menu_items(item->'children',site,menu,entry_ids,item_id);end if;
  pos:=pos+1;
 end loop;
end;
$$;
create or replace function pg_temp.albar_menu_snapshot(menu uuid) returns jsonb language sql stable as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'parent_id',parent_id,'label',label,'position',position,'entry_id',entry_id,'external_url',external_url) order by id),'[]') from public.menu_items where menu_id=menu;
$$;

do $ALBAR_IMPORT$
<<albar_seed>>
declare
 cfg jsonb; src jsonb; actor uuid; site uuid; author uuid; tx uuid; entry uuid; menu uuid; admin_user uuid;
 state jsonb:='{}'; e_state jsonb:='{}'; entry_ids jsonb:='{}'; term_ids jsonb:='{}'; node jsonb; item jsonb; v_variant jsonb; variants jsonb;
 snapshot jsonb; expected uuid; revision uuid; previous_published uuid; current_published uuid; archived timestamptz;
 fingerprint text; current_hash text; site_status text; v_revision_state text; old_entry jsonb; known boolean;
 publish boolean; activate boolean; n_created integer:=0; n_saved integer:=0; n_published integer:=0; n_skipped integer:=0;
 row_menu record; old_claims text; old_sub text;
begin
 select config into cfg from albar_seed_config;
 select payload into src from albar_seed_source;
 if to_regprocedure('public.save_content_revision(uuid,uuid,jsonb)') is null or to_regprocedure('public.public_section_available(uuid,text,text)') is null then
  raise exception 'Aplica primero las migraciones de Leyer 001–016';end if;
 select p.id into actor from auth.users u join public.profiles p on p.id=u.id
  where lower(u.email)=lower(nullif(cfg->>'actor_email','')) and p.status='active' and p.is_admin;
 if actor is null then raise exception 'Configura actor_email con una cuenta Auth existente y administrador activo. No se crean cuentas ni accesos administrativos.';end if;
 old_claims:=current_setting('request.jwt.claims',true);old_sub:=current_setting('request.jwt.claim.sub',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
 perform set_config('request.jwt.claim.sub',actor::text,true);
 if not private.is_admin() then raise insufficient_privilege;end if;
 publish:=coalesce((cfg->>'publish')::boolean,false);activate:=coalesce((cfg->>'activate_site')::boolean,false);
 if activate and not publish then raise exception 'activate_site requiere publish=true y las revisiones confirmadas';end if;
 if publish and (cfg->>'legal_review_confirmed' is distinct from 'true' or cfg->>'privacy_review_confirmed' is distinct from 'true'
   or nullif(cfg->>'privacy_controller','') is null or nullif(cfg->>'privacy_processors','') is null
   or coalesce((cfg->>'retention_days')::integer,0) not between 1 and 3650) then
  raise exception 'Antes de publicar confirma revisión jurídica y privacidad, responsable, proveedores/región y plazo efectivo de conservación';end if;
 if coalesce(cfg->>'privacy_email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Correo de privacidad inválido';end if;
 if nullif(cfg->>'whatsapp','') is not null and cfg->>'whatsapp' !~ '^[0-9]{8,15}$' then raise exception 'whatsapp debe contener solo dígitos, incluido el código de país';end if;
 perform pg_advisory_xact_lock(hashtextextended(src->>'seed_key',0));
 -- Private import state is not public presentation metadata and has no Data API grants.
 create table if not exists private.cms_seed_registry(
  seed_key text primary key,
  site_id uuid not null unique references public.sites(id),state jsonb not null default '{}',updated_at timestamptz not null default now());
 alter table private.cms_seed_registry enable row level security;
 revoke all on private.cms_seed_registry from public,anon,authenticated,service_role;
 select id into site from public.sites for update;
 if site is null then raise exception 'Falta la configuración del sitio único. Ejecuta las migraciones.';end if;
 select r.state into state from private.cms_seed_registry r where r.seed_key=src->>'seed_key' and r.site_id=site for update;
 known:=found;
 select s.status into site_status from public.sites s where s.id=site;
 if site_status not in ('draft','active') then raise exception 'El sitio fue retirado: el seed no lo reactiva';end if;
 if known then
  if coalesce(state->'extensions','{}'::jsonb)<>'{}'::jsonb then
   raise exception 'ALBAR ya tiene un complemento editorial. Usa su seed complementario; repetir el inicial restauraría el menú anterior.';
  end if;
 else
  if exists(select 1 from public.content_entries where site_id=site) then
   raise exception 'El sitio ya tiene contenido ajeno al seed. No se sobrescribe automáticamente.';
  end if;
  insert into private.cms_seed_registry(seed_key,site_id) values(src->>'seed_key',site);
  state:='{}';
 end if;
 -- Resolve only public, physically present assets belonging to this exact site.
 for row_menu in select key,value from jsonb_each_text(coalesce(cfg->'assets','{}')) loop
  if row_menu.key not in ('claudia-perfil','claudia-hero','logo') then raise exception 'Clave de recurso no reconocida: %',row_menu.key;end if;
  if not exists(select 1 from public.media_assets m join storage.objects o on o.bucket_id=m.bucket_id and o.name=m.storage_path
    where m.id=row_menu.value::uuid and m.site_id=site and m.bucket_id='cms-public' and m.mime_type='image/webp') then
   raise exception 'El recurso % debe estar optimizado, existir en cms-public y pertenecer a ALBAR',row_menu.key;end if;
 end loop;
 snapshot:=jsonb_strip_nulls(jsonb_build_object('public_name','ALBAR Abogados','description','Asesoría jurídica para personas y empresas, con claridad, estrategia y acompañamiento cercano.',
  'email','contacto@abogadaclaudia.com','phone',cfg->'phone','address',cfg->'address','demo',coalesce((cfg->>'demo')::boolean,false),
  'contact_enabled',coalesce((cfg->>'contact_enabled')::boolean,false),'contact_on_landings',coalesce((cfg->>'contact_enabled')::boolean,false),
  'privacy_path','/privacidad','contact_path','/contacto','blog_path','/blog','team_path','/equipo','services_path','/servicios'));
 if known then
  select pg_temp.albar_hash(jsonb_build_object('settings',s.settings,'domain',s.domain,'name',s.name,'default_locale',s.default_locale)) into current_hash from public.sites s where s.id=site;
  if current_hash is distinct from state->>'site_hash' then raise exception 'Conflicto: la configuración del sitio fue editada fuera del seed' using errcode='40001';end if;
 end if;
 update public.sites set settings=snapshot,domain=nullif(cfg->>'domain',''),name=src->'site'->>'name',default_locale='es-CL' where id=site
  and (settings,domain,name,default_locale) is distinct from (snapshot,nullif(cfg->>'domain',''),src->'site'->>'name','es-CL');
 select pg_temp.albar_hash(jsonb_build_object('settings',s.settings,'domain',s.domain,'name',s.name,'default_locale',s.default_locale)) into current_hash from public.sites s where s.id=site;
 state:=state||jsonb_build_object('site_hash',current_hash);
 author:=nullif(state->>'author_id','')::uuid;
 if author is null then
  if exists(select 1 from public.authors where site_id=site and slug=src->'author'->>'slug') then raise exception 'Autor existente fuera del registro del seed';end if;
  insert into public.authors(site_id,display_name,slug) values(site,src->'author'->>'display_name',src->'author'->>'slug') returning id into author;
 else
  perform 1 from public.authors where id=author and site_id=site for update;
  select pg_temp.albar_hash(to_jsonb(a)-'id'-'site_id') into current_hash from public.authors a where a.id=author and a.site_id=site;
  if current_hash is distinct from state->>'author_hash' then raise exception 'Conflicto: el perfil de Claudia fue editado fuera del seed' using errcode='40001';end if;
 end if;
 update public.authors set display_name=src->'author'->>'display_name',slug=src->'author'->>'slug',biography=src->'author'->>'biography',professional_title=src->'author'->>'professional_title',
  avatar_asset_id=nullif(cfg->'assets'->>'claudia-perfil','')::uuid,is_public=is_public or publish where id=author and site_id=site
  and (display_name,slug,biography,professional_title,avatar_asset_id,is_public) is distinct from
   (src->'author'->>'display_name',src->'author'->>'slug',src->'author'->>'biography',src->'author'->>'professional_title',nullif(cfg->'assets'->>'claudia-perfil','')::uuid,is_public or publish);
 select pg_temp.albar_hash(to_jsonb(a)-'id'-'site_id') into current_hash from public.authors a where a.id=author;
 state:=state||jsonb_build_object('author_id',author,'author_hash',current_hash);
 tx:=nullif(state->>'taxonomy_id','')::uuid;
 if tx is null then
  if exists(select 1 from public.taxonomies where site_id=site and code='category') then raise exception 'Taxonomía existente fuera del registro del seed';end if;
  insert into public.taxonomies(site_id,code,name) values(site,'category','Áreas de práctica') returning id into tx;
  state:=state||jsonb_build_object('taxonomy_id',tx);
 elsif not exists(select 1 from public.taxonomies where id=tx and site_id=site and code='category' and name='Áreas de práctica') then raise exception 'Conflicto: taxonomía editada fuera del seed';end if;
 for node in select value from jsonb_array_elements(src->'terms') loop
  entry:=nullif(state->'terms'->>(node->>'key'),'')::uuid;
  if entry is null then
   insert into public.terms(site_id,taxonomy_id,name,slug) values(site,tx,node->>'name',node->>'slug') returning id into entry;
  elsif not exists(select 1 from public.terms where id=entry and site_id=site and taxonomy_id=tx and name=node->>'name' and slug=node->>'slug') then raise exception 'Conflicto: término editado fuera del seed';end if;
  term_ids:=term_ids||jsonb_build_object(node->>'key',entry);
 end loop;
 state:=state||jsonb_build_object('terms',term_ids);
 e_state:=coalesce(state->'entries','{}');
 -- Create all stable identities before resolving parents, relations and menus.
 for node in select value from jsonb_array_elements(src->'entries') loop
  entry:=nullif(e_state->(node->>'key')->>'id','')::uuid;
  if entry is null then
   if exists(select 1 from public.content_revisions where site_id=site and path=node->>'path') then raise exception 'Ruta editorial existente fuera del seed: %',node->>'path';end if;
   insert into public.content_entries(site_id,kind,locale,internal_name) values(site,node->>'kind','es-CL','ALBAR · '||(node->>'title')) returning id into entry;
   e_state:=e_state||jsonb_build_object(node->>'key',jsonb_build_object('id',entry));n_created:=n_created+1;
  end if;
  entry_ids:=entry_ids||jsonb_build_object(node->>'key',entry);
 end loop;
 for node in select value from jsonb_array_elements(src->'entries') loop
  entry:=(entry_ids->>(node->>'key'))::uuid;old_entry:=e_state->(node->>'key');
  perform 1 from public.content_entries where id=entry and site_id=site for update;
  if not exists(select 1 from public.content_entries where id=entry and site_id=site and kind=node->>'kind' and locale='es-CL') then raise exception 'Identidad editorial inválida: %',node->>'key';end if;
 select r.id,r.editorial_state into expected,v_revision_state from public.content_revisions r where r.entry_id=entry order by r.revision_number desc limit 1;
  select e.published_revision_id,e.archived_at into current_published,archived from public.content_entries e where e.id=entry;
  if archived is not null then raise exception 'El contenido fue archivado: el seed no lo recupera: %',node->>'key';end if;
  if expected is distinct from nullif(old_entry->>'last_revision_id','')::uuid or current_published is distinct from nullif(old_entry->>'published_revision_id','')::uuid then
   raise exception 'Conflicto editorial en %. Se conserva el trabajo ajeno y se revierte toda la importación.',node->>'key' using errcode='40001';end if;
  if old_entry ? 'editorial_state' and v_revision_state is distinct from old_entry->>'editorial_state' then
   raise exception 'Conflicto editorial: el estado de revisión cambió en %',node->>'key' using errcode='40001';end if;
  if exists(select 1 from public.scheduled_publications where entry_id=entry and status='pending') then
   raise exception 'Hay una publicación programada en %; el seed no altera su programación',node->>'key' using errcode='40001';end if;
  if old_entry ? 'identity_hash' and (select pg_temp.albar_hash(jsonb_build_object('internal_name',internal_name,'parent_id',parent_id)) from public.content_entries where id=entry) is distinct from old_entry->>'identity_hash' then
   raise exception 'Conflicto en la jerarquía/nombre interno de %',node->>'key' using errcode='40001';end if;
  update public.content_entries set parent_id=(entry_ids->>(node->>'parent'))::uuid,internal_name='ALBAR · '||(node->>'title') where id=entry
   and (parent_id,internal_name) is distinct from ((entry_ids->>(node->>'parent'))::uuid,'ALBAR · '||(node->>'title'));
  snapshot:=pg_temp.albar_content(node,entry_ids,term_ids,author,coalesce(cfg->'assets','{}'),cfg);
  fingerprint:=pg_temp.albar_hash(jsonb_build_object('snapshot',snapshot,'variants',node->'variants'));
  if expected is null or fingerprint is distinct from old_entry->>'fingerprint' then
   variants:='[]';
   for v_variant in select value from jsonb_array_elements(coalesce(node->'variants','[]')) loop
    revision:=public.save_content_revision(entry,expected,pg_temp.albar_content(node||v_variant,entry_ids,term_ids,author,coalesce(cfg->'assets','{}'),cfg));
    expected:=revision;variants:=variants||jsonb_build_array(jsonb_build_object('key',v_variant->>'key','capture',v_variant->'capture','revision_id',revision));n_saved:=n_saved+1;
   end loop;
   revision:=public.save_content_revision(entry,expected,snapshot);expected:=revision;
   perform public.set_revision_state(revision,'in_review');n_saved:=n_saved+1;
   old_entry:=old_entry||jsonb_build_object('variants',variants);
  else n_skipped:=n_skipped+1;end if;
  if publish and current_published is distinct from expected then
   if snapshot::text ~ '\[Responsable pendiente|\[Proveedores|\[Plazo pendiente|\{\{' then raise exception 'Hay campos sin completar en %',node->>'key';end if;
   if exists(select 1 from public.content_revisions where id=expected and locked_at is null) then perform public.set_revision_state(expected,'approved');end if;
   perform public.publish_content_revision(expected);current_published:=expected;n_published:=n_published+1;
  end if;
  select pg_temp.albar_hash(jsonb_build_object('internal_name',internal_name,'parent_id',parent_id)) into current_hash from public.content_entries where id=entry;
  select editorial_state into v_revision_state from public.content_revisions where id=expected;
  e_state:=e_state||jsonb_build_object(node->>'key',old_entry||jsonb_build_object('last_revision_id',expected,'published_revision_id',current_published,'editorial_state',v_revision_state,'fingerprint',fingerprint,'identity_hash',current_hash));
 end loop;
 state:=state||jsonb_build_object('entries',e_state);
 for node in select value from jsonb_array_elements(src->'menus') loop
  menu:=nullif(state->'menus'->(node->>'code')->>'id','')::uuid;
  if menu is null then
   insert into public.menus(site_id,code,name,locale,is_public) values(site,node->>'code',node->>'name','es-CL',publish) returning id into menu;
  else
   perform 1 from public.menus where id=menu and site_id=site for update;
   perform 1 from public.menu_items where menu_id=menu order by id for update;
   select pg_temp.albar_hash(jsonb_build_object('items',pg_temp.albar_menu_snapshot(menu),'menu',(select to_jsonb(m)-'id'-'site_id' from public.menus m where m.id=menu and m.site_id=site))) into current_hash;
   if current_hash is distinct from state->'menus'->(node->>'code')->>'hash' then raise exception 'Conflicto: menú % editado fuera del seed',node->>'code' using errcode='40001';end if;
  end if;
  item:=node->'items';
  if node->>'code'='primary' and nullif(cfg->>'whatsapp','') is not null then item:=item||jsonb_build_array(jsonb_build_object('label','WhatsApp','external_url','https://wa.me/'||(cfg->>'whatsapp')));end if;
  fingerprint:=pg_temp.albar_hash(item);
  if fingerprint is distinct from state->'menus'->(node->>'code')->>'source_hash' then
   -- Delete descendants first, preserving restrictive hierarchy FKs and all other menus.
   for row_menu in with recursive tree as(select id,0 as depth from public.menu_items where menu_id=menu and parent_id is null union all select m.id,t.depth+1 from public.menu_items m join tree t on m.parent_id=t.id where m.menu_id=menu) select id from tree order by depth desc loop
    delete from public.menu_items where id=row_menu.id and menu_id=menu;
   end loop;
   perform pg_temp.albar_menu_items(item,site,menu,entry_ids);
  end if;
  update public.menus set is_public=true where id=menu and publish and not is_public;
  select pg_temp.albar_hash(jsonb_build_object('items',pg_temp.albar_menu_snapshot(menu),'menu',(select to_jsonb(m)-'id'-'site_id' from public.menus m where m.id=menu))) into current_hash;
  state:=jsonb_set(state,'{menus}',coalesce(state->'menus','{}')||jsonb_build_object(node->>'code',jsonb_build_object('id',menu,'hash',current_hash,'source_hash',fingerprint)));
 end loop;
 for node in select value from jsonb_array_elements(src->'redirects') loop
  entry:=(entry_ids->>(node->>'entry'))::uuid;
  if exists(select 1 from public.redirects where site_id=site and locale='es-CL' and from_path=node->>'from' and (target_entry_id<>entry or status_code<>301)) then raise exception 'Redirección existente incompatible: %',node->>'from';end if;
  if not exists(select 1 from public.redirects where site_id=site and locale='es-CL' and from_path=node->>'from') then
   perform public.manage_cms_redirect(site,null,'es-CL',node->>'from',entry,301);
  end if;
 end loop;
 if nullif(cfg->>'admin_email','') is not null then
  select p.id into admin_user from auth.users u join public.profiles p on p.id=u.id where lower(u.email)=lower(cfg->>'admin_email') and p.status='active';
  if admin_user is null then raise exception 'admin_email debe ser una cuenta Auth existente y activa. Invítala mediante Auth, no insertando auth.users por SQL.';end if;
  update public.profiles set is_admin=true where id=admin_user;
 end if;
 if activate then update public.sites set status='active' where id=site and status<>'active';end if;
 update private.cms_seed_registry r set state=albar_seed.state,updated_at=now() where r.seed_key=src->>'seed_key';
 perform set_config('request.jwt.claims',coalesce(old_claims,''),true);perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);
 raise notice 'ALBAR: sitio %, contenidos nuevos %, revisiones nuevas %, publicados %, sin nueva revisión %',site,n_created,n_saved,n_published,n_skipped;
end;
$ALBAR_IMPORT$;
select r.site_id,s.status,
 (select count(*) from public.content_entries e where e.site_id=s.id) as contents,
 (select count(*) from public.content_entries e where e.site_id=s.id and e.published_revision_id is not null) as published
from private.cms_seed_registry r join public.sites s on s.id=r.site_id
where r.seed_key='albar-abogados-editorial-v1';
commit;
