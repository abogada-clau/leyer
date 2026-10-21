create or replace function private.is_reserved_public_path(p_path text) returns boolean
language sql immutable set search_path = '' as $$
 select lower(p_path) ~ '^/(admin|auth|api|protected|site-unavailable|design-system|sitios|idioma|autores|taxonomias|_next)(/|$)'
  or lower(p_path) ~ '^/(sitemap\.xml|robots\.txt|favicon\.ico|icon\.svg|opengraph-image|twitter-image)(/|$)';
$$;
