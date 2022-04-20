REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role)
FROM anon;

REVOKE EXECUTE ON FUNCTION private.owns_artisan(uuid)
FROM anon;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role)
TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION private.owns_artisan(uuid)
TO authenticated, service_role;