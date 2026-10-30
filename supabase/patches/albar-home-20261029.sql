-- Apply in the Leyer SQL Editor. Keeps the previous published revision intact.
begin;
do $patch$
declare
  v_entry uuid := '606582f3-942c-5755-9898-ce97e671154d';
  v_expected uuid := '81d7622f-3326-4cab-a654-2d486b727920';
  v_actor uuid := 'a9834185-147a-4f2c-9e6e-88dada938369';
  v_latest uuid;
  v_content jsonb;
  v_blocks jsonb;
  v_revision uuid;
begin
  if not exists (select 1 from public.profiles where id = v_actor and is_admin and status = 'active') then
    raise exception 'Expected active administrator is unavailable';
  end if;
  perform set_config('request.jwt.claim.sub', v_actor::text, true);
  perform 1 from public.sites where id = (select site_id from public.content_entries where id = v_entry) for update;
  perform 1 from public.content_entries where id = v_entry and published_revision_id = v_expected for update;
  if not found then raise exception 'Published home changed; review before applying'; end if;
  select id into v_latest from public.content_revisions where entry_id = v_entry order by revision_number desc limit 1;
  if v_latest is distinct from v_expected then raise exception 'Home has pending edits; review before applying'; end if;
  if exists (select 1 from public.scheduled_publications where entry_id = v_entry and status = 'pending') then
    raise exception 'Home has a scheduled publication; review before applying';
  end if;
  v_content := public.get_cms_snapshot(v_expected);
  if v_content is null then raise exception 'Home snapshot unavailable'; end if;
  if (select count(*) from jsonb_array_elements(v_content->'blocks') b where b->>'type' = 'hero') <> 1
    or (select count(*) from jsonb_array_elements(v_content->'blocks') b where b->'data'->>'heading' = '¿Qué necesitas resolver hoy?') <> 1 then
    raise exception 'Unexpected home block structure';
  end if;
  select jsonb_agg(
    case
      when b->>'type' = 'hero' then jsonb_set(b, '{data}', (b->'data') || jsonb_build_object(
        'heading', 'Cuando una decisión cambia tu vida, necesitas una estrategia diseñada a tu medida.',
        'body', '¿Enfrentas un sobreendeudamiento, una separación, un asunto de alimentos u otro problema legal y no sabes por dónde empezar? En Albar revisamos tu situación, te explicamos tus opciones y definimos contigo los próximos pasos a partir de los antecedentes de tu caso, con un trato cercano y honesto.',
        'actions', (select jsonb_agg(a order by n) from jsonb_array_elements(b->'data'->'actions') with ordinality as actions(a,n) where a->>'label' <> 'Explorar soluciones para personas')))
      when b->>'type' = 'card_grid' and b->'data'->>'heading' = '¿Qué necesitas resolver hoy?' then
        jsonb_set(b, '{data,items}', (select jsonb_agg(item order by case item->>'heading'
          when 'Mis deudas superan mi capacidad de pago' then 0
          when 'Necesito asegurar o ajustar la pensión de mis hijos' then 1
          else 2 end, n) from jsonb_array_elements(b->'data'->'items') with ordinality as items(item,n)))
      else b
    end order by position)
    into v_blocks from jsonb_array_elements(v_content->'blocks') with ordinality as blocks(b,position)
    where not (b->>'type' = 'steps' and b->'data'->>'heading' = 'Así podemos acompañarte');
  v_content := jsonb_set(v_content, '{blocks}', v_blocks);
  v_revision := public.save_content_revision(v_entry, v_expected, v_content);
  perform public.set_revision_state(v_revision, 'approved');
  perform public.publish_content_revision(v_revision);
end;
$patch$;
commit;
select e.published_revision_id, r.revision_number, r.editorial_state
from public.content_entries e join public.content_revisions r on r.id = e.published_revision_id
where e.id = '606582f3-942c-5755-9898-ce97e671154d';
