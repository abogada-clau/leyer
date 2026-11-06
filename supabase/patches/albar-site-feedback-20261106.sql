-- ALBAR editorial update for the published revisions reviewed on 2026-11-06.
-- Deploy the public components before applying this patch.
begin;
do $patch$
declare
  site constant uuid := '709bf171-8449-4177-a1f7-2facca7090a5';
  actor constant uuid := 'a9834185-147a-4f2c-9e6e-88dada938369';
  about_title constant text := 'Conoce a ALBAR Abogados y a Claudia';
  review_copy constant jsonb := '{"eyebrow":"Testimonios","heading":"Reseñas de nuestros clientes"}';
  benefits constant jsonb := $benefits${
  "personas": {
    "type": "card_grid",
    "schema_version": 1,
    "variant": "studio-benefits",
    "data": {
      "heading": "¿Por qué trabajar con ALBAR?",
      "tone": "sand",
      "items": [
        {
          "icon": "users",
          "heading": "Estrategias personalizadas",
          "body": "Cada caso merece una solución diseñada para su realidad."
        },
        {
          "icon": "message-circle",
          "heading": "Comunicación cercana",
          "body": "Te mantenemos informado en cada etapa del proceso."
        },
        {
          "icon": "file-check",
          "heading": "Estudio riguroso",
          "body": "Cada estrategia nace del análisis detallado de los antecedentes."
        },
        {
          "icon": "heart-handshake",
          "heading": "Acompañamiento integral",
          "body": "Estamos contigo desde la primera consulta hasta el cierre del caso."
        }
      ]
    }
  },
  "empresas": {
    "type": "card_grid",
    "schema_version": 1,
    "variant": "studio-benefits",
    "data": {
      "heading": "¿Por qué trabajar con ALBAR?",
      "tone": "ivory",
      "items": [
        {
          "icon": "file-check",
          "heading": "Prevención",
          "body": "Anticipamos riesgos antes de que se transformen en conflictos."
        },
        {
          "icon": "heart-handshake",
          "heading": "Estrategia",
          "body": "Soluciones jurídicas alineadas con los objetivos de tu empresa."
        },
        {
          "icon": "message-circle",
          "heading": "Respuesta oportuna",
          "body": "Comunicación rápida y acompañamiento permanente."
        },
        {
          "icon": "users",
          "heading": "Visión integral",
          "body": "Asesoría preventiva y representación jurídica cuando se requiere."
        }
      ]
    }
  }
}$benefits$;
  company_steps constant jsonb := $steps${
  "heading": "Así trabajamos con las empresas",
  "items": [
    {
      "heading": "Diagnóstico",
      "body": "Entendemos tu negocio y sus necesidades legales."
    },
    {
      "heading": "Análisis jurídico",
      "body": "Evaluamos riesgos y oportunidades."
    },
    {
      "heading": "Diseño de la estrategia",
      "body": "Proponemos soluciones legales a medida."
    },
    {
      "heading": "Implementación",
      "body": "Te acompañamos en la ejecución de la estrategia."
    },
    {
      "heading": "Seguimiento",
      "body": "Monitoreamos y ajustamos la estrategia para proteger tu empresa."
    }
  ]
}$steps$;
  target record;
  review public.testimonials%rowtype;
  entry uuid;
  published uuid;
  latest uuid;
  revision uuid;
  snapshot jsonb;
  blocks jsonb;
  changed jsonb;
  block jsonb;
  people_parent uuid;
begin
  if not exists(select 1 from public.profiles where id=actor and is_admin and status='active') then
    raise exception 'El administrador esperado no está activo';
  end if;
  perform set_config('request.jwt.claim.sub', actor::text, true);
  perform 1 from public.sites where id=site for update;
  if not found then raise exception 'No se encontró el sitio ALBAR'; end if;

  for target in select * from (values
    ('/', '44ea9147-50f4-4d59-b18c-08dba6c9f2e3'::uuid),
    ('/contacto', '4799ce9f-8453-44ba-8c0c-bdeb69c61e55'::uuid),
    ('/empresas', '3aac43ad-8061-43bf-a476-788d3c4a2019'::uuid),
    ('/personas', 'cd3b7d16-c65b-4a03-89bb-c9c5b8f36829'::uuid),
    ('/sobre-albar', 'e3fcd330-7c5e-4373-804f-1d10fd0c8bad'::uuid)
  ) as expected(path, revision_id)
  loop
    select e.id, e.published_revision_id into strict entry, published
      from public.content_entries e join public.published_content p on p.id=e.id
      where p.site_id=site and p.locale='es-CL' and p.path=target.path
      for update of e;
    select id into latest from public.content_revisions where entry_id=entry order by revision_number desc limit 1;
    if published is distinct from target.revision_id or latest is distinct from published
       or exists(select 1 from public.scheduled_publications where entry_id=entry and status='pending') then
      raise exception 'Hay cambios editoriales en %', target.path;
    end if;

    snapshot := public.get_cms_snapshot(published);
    blocks := '[]'::jsonb;
    for block in select value from jsonb_array_elements(snapshot->'blocks') loop
      changed := block;
      if target.path in ('/', '/sobre-albar') and block->>'type'='testimonials' then
        changed := jsonb_set(block, '{data}', ((block->'data') - 'body') || review_copy);
      elsif target.path='/sobre-albar' then
        case block->>'key'
          when 'cb1c1621-1d2d-42f1-8eed-16b1fcba8dd4' then
            changed := jsonb_set(block, '{variant}', '"studio-origin"');
          when 'fee12b6f-40da-5687-8a2d-7bf3412e5c61' then
            changed := jsonb_set(block, '{variant}', '"studio-profile"');
          when 'c9bfade2-1793-4b4b-920a-2260498dadca' then
            changed := jsonb_set(block, '{data,items}', (
              select jsonb_agg(item order by item->>'href' is distinct from '/liquidacion-concursal', n)
              from jsonb_array_elements(block#>'{data,items}') with ordinality as items(item,n)
            ));
          else null;
        end case;
      elsif target.path in ('/personas','/empresas') and block->>'type'='steps' then
        changed := jsonb_set(block, '{variant}', '"step-cards"');
        if target.path='/empresas' then
          changed := jsonb_set(changed, '{data}', (block->'data') || company_steps);
        end if;
      elsif target.path='/contacto' and block->>'key'='028c7748-ef53-565b-b735-e69f824d5549' then
        changed := jsonb_set(block, '{data,hidden}', 'true');
      end if;
      blocks := blocks || jsonb_build_array(changed);
      if target.path in ('/personas','/empresas') and block->>'type'='hero' then
        blocks := blocks || jsonb_build_array((benefits->substr(target.path, 2))
          || jsonb_build_object('key',gen_random_uuid(),'assets','[]'::jsonb));
      end if;
    end loop;
    if target.path='/sobre-albar' then
      snapshot := jsonb_set(jsonb_set(snapshot,'{title}',to_jsonb(about_title)), '{seo,title}',to_jsonb(about_title));
    end if;
    revision := public.save_content_revision(entry, published, jsonb_set(snapshot,'{blocks}',blocks));
    perform public.set_revision_state(revision,'approved');
    perform public.publish_content_revision(revision);
  end loop;

  select i.id into strict people_parent from public.menu_items i
    join public.menus m on m.id=i.menu_id
    join public.published_content p on p.id=i.entry_id and p.locale=m.locale
    where i.site_id=site and m.code='primary' and m.locale='es-CL' and i.parent_id is null and p.path='/personas';
  update public.menu_items i set position=ordering.position
    from (values
      ('/personas/insolvencia-y-reemprendimiento',0), ('/personas/derecho-de-familia',1),
      ('/personas/derecho-laboral',2), ('/personas/derecho-civil',3), ('/personas/escrituras-publicas',4)
    ) as ordering(path,position)
    join public.published_content p on p.path=ordering.path and p.site_id=site and p.locale='es-CL'
    where i.parent_id=people_parent and i.entry_id=p.id;
  if (select count(*) from public.menu_items where parent_id=people_parent) <> 5 then
    raise exception 'Cambió el menú de Personas';
  end if;

  for review in
    select * from public.testimonials
    where site_id=site and is_published and author_name like 'Caso simulado · %'
      and id in ('338df594-be7c-4d8e-a1ee-d10d2b9ea5e1','739b7be5-efe1-4962-a189-24d1a8074d98','2708c724-f013-40a2-a12e-43b9c5a29c7c')
    for update
  loop
    perform public.save_testimonial(site,review.id,review.version,review.author_name,review.quote,review.context,review.position,false);
  end loop;
end;
$patch$;
commit;
