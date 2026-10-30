-- Shared testimonials: drafts remain private; edits use optimistic concurrency.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete restrict,
  author_name text not null check (length(btrim(author_name)) between 1 and 160),
  quote text not null check (length(btrim(quote)) between 1 and 3000),
  context text not null default '' check (length(context) <= 200),
  position integer not null default 0 check (position >= 0),
  is_published boolean not null default false,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index testimonials_public_order on public.testimonials(site_id, position, created_at, id) where is_published;
alter table public.testimonials enable row level security;
revoke all on public.testimonials from public, anon, authenticated;
grant select on public.testimonials to anon, authenticated;
create policy testimonials_read on public.testimonials for select to anon, authenticated
using (private.site_permission(site_id, 'content.read') or (is_published and private.is_public_site(site_id)));
create trigger testimonials_audit after insert or update or delete on public.testimonials
for each row execute function private.audit_change();
create trigger testimonials_cache after insert or update or delete on public.testimonials
for each row execute function private.queue_public_cache_event();

create function public.save_testimonial(p_site_id uuid, p_id uuid, p_expected_version integer,
  p_author_name text, p_quote text, p_context text, p_position integer, p_is_published boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.testimonials; saved_id uuid;
begin
  if not private.site_permission(p_site_id, 'content.edit') then raise insufficient_privilege; end if;
  if p_author_name is null or length(btrim(p_author_name)) not between 1 and 160
    or p_quote is null or length(btrim(p_quote)) not between 1 and 3000
    or p_context is null or length(p_context) > 200
    or p_position is null or p_position < 0 or p_is_published is null then
    raise check_violation using message = 'Invalid testimonial fields';
  end if;
  if p_id is null then
    if p_expected_version is not null then raise check_violation; end if;
    if p_is_published and not private.site_permission(p_site_id, 'content.publish') then raise insufficient_privilege; end if;
    insert into public.testimonials(site_id, author_name, quote, context, position, is_published)
    values(p_site_id, btrim(p_author_name), btrim(p_quote), btrim(p_context), p_position, p_is_published)
    returning id into saved_id;
  else
    select * into current_row from public.testimonials where id = p_id and site_id = p_site_id for update;
    if not found then raise insufficient_privilege; end if;
    if current_row.version is distinct from p_expected_version then
      raise exception 'Testimonial changed; reload before saving' using errcode = '40001';
    end if;
    if (current_row.is_published or p_is_published) and not private.site_permission(p_site_id, 'content.publish') then raise insufficient_privilege; end if;
    update public.testimonials set author_name = btrim(p_author_name), quote = btrim(p_quote),
      context = btrim(p_context), position = p_position, is_published = p_is_published,
      version = version + 1, updated_at = now() where id = p_id returning id into saved_id;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_testimonial(uuid, uuid, integer, text, text, text, integer, boolean) from public, anon, authenticated;
grant execute on function public.save_testimonial(uuid, uuid, integer, text, text, text, integer, boolean) to authenticated;
insert into public.block_types(code, schema_version, description, required_fields)
values ('testimonials', 1, 'Carrusel de testimonios publicados', '{heading}');
