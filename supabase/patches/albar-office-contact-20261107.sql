-- Office contact details confirmed on 2026-11-07.
-- Published history and submission records retain their original values.
begin;
do $patch$
declare
  site constant uuid := '709bf171-8449-4177-a1f7-2facca7090a5';
  actor constant uuid := 'a9834185-147a-4f2c-9e6e-88dada938369';
  portrait constant uuid := '98bcdf53-f654-42bd-badd-a5c81a369418';
  expected_contact constant uuid := '4f5c3f69-e7e9-475e-9cca-bab955bef750';
  office_address constant text := 'Victoria Subercaseaux 69, oficina 604, Santiago, Región Metropolitana, Chile';
  target record;
  current_settings jsonb;
  snapshot jsonb;
  blocks jsonb;
  latest uuid;
  revision uuid;
  contact_found boolean := false;
begin
  if not exists(select 1 from public.profiles where id=actor and is_admin and status='active') then
    raise exception 'El administrador esperado no está activo';
  end if;
  perform set_config('request.jwt.claim.sub',actor::text,true);
  select s.settings into strict current_settings from public.sites s where s.id=site for update;
  if current_settings->>'email' is distinct from 'contacto@abogadaclaudia.com'
     or current_settings->>'phone' is distinct from '+56 9 4697 8661'
     or current_settings->>'address' is distinct from 'Av. Corrientes 1234, piso 5, Quinta Normal, Chile' then
    raise exception 'Los datos de contacto cambiaron desde la revisión';
  end if;
  if not exists(select 1 from public.media_assets m join storage.objects o on o.bucket_id=m.bucket_id and o.name=m.storage_path
    where m.id=portrait and m.site_id=site and m.bucket_id='cms-public' and m.mime_type='image/webp') then
    raise exception 'El retrato público de Claudia no está disponible';
  end if;

  for target in
    select e.id,e.published_revision_id,p.path
    from public.content_entries e join public.published_content p on p.id=e.id
    where p.site_id=site and e.archived_at is null
      and (p.path='/contacto' or exists(
        select 1 from public.content_blocks b where b.revision_id=p.revision_id
          and b.data::text ~ '56946978661|4697 8661|contacto@abogadaclaudia.com|Av. Corrientes 1234'
      ))
    order by e.id for update of e
  loop
    select id into latest from public.content_revisions where entry_id=target.id order by revision_number desc limit 1;
    if latest is distinct from target.published_revision_id
       or exists(select 1 from public.scheduled_publications where entry_id=target.id and status='pending') then
      raise exception 'Hay cambios editoriales pendientes en %',target.path;
    end if;
    snapshot:=public.get_cms_snapshot(target.published_revision_id);
    snapshot:=replace(replace(replace(replace(snapshot::text,
      '56946978661','56926044751'),
      '+56 9 4697 8661','+56 9 2604 4751'),
      'contacto@abogadaclaudia.com','contacto@albarabogados.cl'),
      'Av. Corrientes 1234, piso 5, Quinta Normal, Chile',office_address)::jsonb;
    if target.path='/contacto' then
      contact_found:=true;
      if target.published_revision_id is distinct from expected_contact then
        raise exception 'La página de Contacto cambió desde la revisión';
      end if;
      if (select count(*) from jsonb_array_elements(snapshot->'blocks') b
        where b->>'key'='2a3954ac-e224-5122-981b-32158c43105d' and b->>'type'='split_content') <> 1 then
        raise exception 'No se encontró la presentación del estudio en Contacto';
      end if;
      select jsonb_agg(case when b->>'key'='2a3954ac-e224-5122-981b-32158c43105d' then
        jsonb_set(b,'{assets}',jsonb_build_array(jsonb_build_object('asset_id',portrait,'slot','image',
          'alt_text','Claudia Albiña Aros de pie junto al ventanal de su oficina.','focal_point',jsonb_build_object('x',0.5,'y',0.5))))
        else b end order by n)
      into blocks from jsonb_array_elements(snapshot->'blocks') with ordinality as items(b,n);
      snapshot:=jsonb_set(snapshot,'{blocks}',blocks);
    end if;
    revision:=public.save_content_revision(target.id,target.published_revision_id,snapshot);
    perform public.set_revision_state(revision,'approved');
    perform public.publish_content_revision(revision);
  end loop;
  if not contact_found then raise exception 'La página de Contacto no está publicada'; end if;

  update public.menu_items set external_url=replace(replace(external_url,
    '56946978661','56926044751'),'contacto@abogadaclaudia.com','contacto@albarabogados.cl')
    where site_id=site and (external_url like '%56946978661%' or external_url like '%contacto@abogadaclaudia.com%');
  update public.sites set settings=current_settings || jsonb_build_object(
    'email','contacto@albarabogados.cl','phone','+56 9 2604 4751','address',office_address
  ) where id=site;
end;
$patch$;
commit;
