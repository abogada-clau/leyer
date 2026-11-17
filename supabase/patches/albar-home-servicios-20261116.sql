-- Apply to the existing ALBAR home as a trusted operator. With no Auth session:
-- set leyer.patch_actor_id = '<active administrator UUID>';
begin;
do $patch$
declare
  v_actor uuid := coalesce(auth.uid(), nullif(current_setting('leyer.patch_actor_id', true), '')::uuid);
  v_home public.content_entries%rowtype;
  v_site public.sites%rowtype;
  v_latest uuid;
  v_content jsonb;
  v_blocks jsonb;
  v_revision uuid;
  v_hero jsonb;
begin
  select s.* into strict v_site
  from private.cms_seed_registry r join public.sites s on s.id = r.site_id
  where r.seed_key = 'albar-abogados-editorial-v1' for update of s;

  if not exists (select 1 from public.profiles where id = v_actor and is_admin and status = 'active') then
    raise exception 'Set leyer.patch_actor_id to an active administrator';
  end if;
  perform set_config('request.jwt.claim.sub', v_actor::text, true);

  select e.* into strict v_home from public.content_entries e
  join public.published_content p on p.id = e.id
  where p.site_id = v_site.id and p.locale = v_site.default_locale and p.path = '/'
  for update of e;
  select id into v_latest from public.content_revisions
  where entry_id = v_home.id order by revision_number desc limit 1;
  if v_latest is distinct from v_home.published_revision_id or exists (
    select 1 from public.scheduled_publications where entry_id = v_home.id and status = 'pending'
  ) then
    raise exception 'Home has pending edits or a scheduled publication; review before applying';
  end if;

  v_content := public.get_cms_snapshot(v_latest);
  if v_content->>'template_key' is distinct from 'home' or
    (select count(*) from jsonb_array_elements(v_content->'blocks') b where b->>'type' = 'hero') <> 1
  then
    raise exception 'Unexpected home block structure';
  end if;

  v_hero := jsonb_build_object(
    'eyebrow', 'Servicios legales',
    'heading', 'Asesoría legal para personas y empresas',
    'body', 'Divorcios, pensión de alimentos, deudas, asuntos laborales y asesoría empresarial. Encuentra el servicio que corresponde a tu situación.',
    'actions', jsonb_build_array(
      jsonb_build_object('label', 'Explorar servicios', 'href', '#areas-de-practica',
        'style', 'primary', 'icon', 'arrow-right'),
      jsonb_build_object('label', 'Consultar mi caso', 'href', coalesce(nullif(v_site.settings->>'contact_path', ''), '/contacto'),
        'style', 'text', 'icon', 'none')
    )
  );
  select jsonb_agg(case when b->>'type' = 'hero'
    then jsonb_set(b, '{data}', ((b->'data') - 'note' - 'note_icon' - 'lead') || v_hero)
    else b end order by position)
  into v_blocks from jsonb_array_elements(v_content->'blocks') with ordinality as blocks(b, position);
  if v_blocks = v_content->'blocks' then return; end if;

  v_revision := public.save_content_revision(v_home.id, v_latest, jsonb_set(v_content, '{blocks}', v_blocks));
  perform public.set_revision_state(v_revision, 'approved');
  perform public.publish_content_revision(v_revision);
end;
$patch$;
commit;
