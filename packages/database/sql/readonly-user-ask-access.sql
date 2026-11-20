-- Read access for readonly_user, the role behind HYPERDRIVE_READONLY that runs /ask SQL.
-- Safe to rerun. Keep the table list in step with readonlySelectPolicy() in src/schemas.
BEGIN;

GRANT USAGE ON SCHEMA public TO readonly_user;

GRANT SELECT ON
	public.hero_profiles,
	public.hero_matchups,
	public.hero_metas,
	public.hero_graphs,
	public.heroes_list,
	public.wikis
TO readonly_user;

DROP POLICY IF EXISTS readonly_user_select ON public.hero_profiles;
CREATE POLICY readonly_user_select ON public.hero_profiles AS PERMISSIVE FOR SELECT TO readonly_user USING (true);

DROP POLICY IF EXISTS readonly_user_select ON public.hero_matchups;
CREATE POLICY readonly_user_select ON public.hero_matchups AS PERMISSIVE FOR SELECT TO readonly_user USING (true);

DROP POLICY IF EXISTS readonly_user_select ON public.hero_metas;
CREATE POLICY readonly_user_select ON public.hero_metas AS PERMISSIVE FOR SELECT TO readonly_user USING (true);

DROP POLICY IF EXISTS readonly_user_select ON public.hero_graphs;
CREATE POLICY readonly_user_select ON public.hero_graphs AS PERMISSIVE FOR SELECT TO readonly_user USING (true);

DROP POLICY IF EXISTS readonly_user_select ON public.heroes_list;
CREATE POLICY readonly_user_select ON public.heroes_list AS PERMISSIVE FOR SELECT TO readonly_user USING (true);

DROP POLICY IF EXISTS readonly_user_select ON public.wikis;
CREATE POLICY readonly_user_select ON public.wikis AS PERMISSIVE FOR SELECT TO readonly_user USING (true);

COMMIT;
