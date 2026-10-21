-- INSERT ... RETURNING must authorize the inserted tenant row without requiring
-- a stable helper to look that same new row up in the command's old snapshot.
drop policy sites_read on public.sites;
create policy sites_read on public.sites for select to anon, authenticated
using (private.is_public_site(id) or private.has_org_permission(organization_id, 'content.read'));
-- Anonymous callers can evaluate a policy without receiving membership data.
grant execute on function private.has_org_permission(uuid, text) to anon;
