-- Keep the DDL event trigger operational while removing its public RPC surface.
-- The event trigger is owned by postgres and remains responsible for enabling RLS
-- on newly created tables in the public schema.
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon, authenticated;
