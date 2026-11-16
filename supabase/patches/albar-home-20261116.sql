-- Apply on the existing ALBAR database as a trusted operator.
-- Set leyer.patch_actor_id to the UUID of the administrator approving this change
-- when running from a SQL connection without an Auth session, for example:
-- set leyer.patch_actor_id = '<administrator UUID>';
begin;
do $patch$
declare
  v_actor uuid := coalesce(auth.uid(), nullif(current_setting('leyer.patch_actor_id', true), '')::uuid);
  v_site public.sites%rowtype;
  v_home public.content_entries%rowtype;
  v_latest uuid;
  v_content jsonb;
  v_blocks jsonb;
  v_revision uuid;
  v_contact text;
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

  select i.external_url into v_contact
  from public.menus m join public.menu_items i on i.menu_id = m.id
  where m.site_id = v_site.id and m.locale = v_site.default_locale and m.is_public
    and i.external_url ~ '^https://wa[.]me/[0-9]{8,15}/?$'
  order by i.position, i.id limit 1;

  v_hero := jsonb_build_object(
    'eyebrow', 'Ley de Quiebras (Ley 20.720)',
    'heading', '¿Tus deudas se acumulan y las cobranzas no paran?',
    'body', 'Revisemos tu situación y las alternativas que ofrece la Ley 20.720.',
    'actions', jsonb_build_array(
      jsonb_build_object('label', 'Hablar con una abogada', 'href', coalesce(v_contact, nullif(v_site.settings->>'contact_path', ''), '/contacto'),
        'style', 'primary', 'icon', case when v_contact is null then 'none' else 'message-circle' end),
      jsonb_build_object('label', 'Ver otras áreas', 'href', '#areas-de-practica', 'style', 'text', 'icon', 'none')
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
