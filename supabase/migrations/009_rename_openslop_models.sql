-- The OpenSlop provider names each model as its vendor does ("Kling 3 Omni",
-- not "Slop Video v2"). Rewrite every stored model name, so saved elements,
-- their results, saved defaults and running jobs keep their model instead of
-- falling back or failing.
-- "Slop Video v1 Fast" (Kling 3 Turbo) is gone and is left to fall back.
create function pg_temp.rename_openslop_models(doc text) returns text
language sql immutable as $$
  select replace(replace(replace(replace(replace(replace(replace(replace(replace(doc, '"Slop Video v2"', '"Kling 3 Omni"'), '"Slop Video v1"', '"Seedance 2 Fast"'), '"Slop Image v2"', '"Muse Image"'), '"Slop Image v1"', '"Seedream 5 Lite"'), '"Slop LLM v1"', '"Claude Opus 5"'), '"Slop SFX v1"', '"Eleven Text to Sound v2"'), '"Slop Music v1"', '"Eleven Music v1"'), '"Slop STT v1"', '"Scribe v2"'), '"Slop TTS v1"', '"Sonic 3.6"')
$$;

-- Leave updated_at alone, so nobody's project list reorders.
alter table projects disable trigger projects_set_updated_at;
alter table canvas_versions disable trigger canvas_versions_set_updated_at;

update projects set
  script = pg_temp.rename_openslop_models(script),
  store = pg_temp.rename_openslop_models(store::text)::jsonb,
  generation = pg_temp.rename_openslop_models(generation::text)::jsonb
where concat(script, store::text, generation::text) like '%"Slop %';

update canvas_versions set
  script = pg_temp.rename_openslop_models(script),
  store = pg_temp.rename_openslop_models(store::text)::jsonb,
  generation = pg_temp.rename_openslop_models(generation::text)::jsonb
where concat(script, store::text, generation::text) like '%"Slop %';

alter table projects enable trigger projects_set_updated_at;
alter table canvas_versions enable trigger canvas_versions_set_updated_at;

update element_history set
  inputs = pg_temp.rename_openslop_models(inputs::text)::jsonb,
  result = pg_temp.rename_openslop_models(result::text)::jsonb
where concat(inputs::text, result::text) like '%"Slop %';

update auth.users set
  raw_user_meta_data = pg_temp.rename_openslop_models(raw_user_meta_data::text)::jsonb
where raw_user_meta_data::text like '%"Slop %';

-- A job still running at deploy is processed and polled by its model name.
update jobs set
  request = pg_temp.rename_openslop_models(request::text)::jsonb
where status in ('pending', 'processing') and request::text like '%"Slop %';
