create function public.grant_invited_admin(p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- Keep the inviter's authorization valid until the grant is committed.
  perform 1 from public.profiles
  where id = auth.uid() and status = 'active' and is_admin
  for share;
  if not found then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  -- An invitation may be renewed while the account is still passwordless.
  perform 1 from auth.users
  where id = p_user_id and invited_at is not null
    and email_confirmed_at is null and phone_confirmed_at is null
    and coalesce(encrypted_password, '') = ''
  for share;
  if not found then
    raise exception 'Expected a pending passwordless invitation' using errcode = '23514';
  end if;

  perform 1 from public.profiles
  where id = p_user_id and status = 'active'
  for update;
  if not found then
    raise exception 'Invited profile unavailable' using errcode = '23514';
  end if;

  update public.profiles set is_admin = true
  where id = p_user_id and not is_admin;
end;
$$;
revoke all on function public.grant_invited_admin(uuid) from public, anon, authenticated;
grant execute on function public.grant_invited_admin(uuid) to authenticated;
notify pgrst, 'reload schema';
