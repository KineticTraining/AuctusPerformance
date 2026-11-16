/*
# Add sport tags to videos and articles

1. Modified Tables
- videos: new column `sports` (text list). A video can belong to several sports, for example a squat video is tagged for Bodybuilding, Basketball, Soccer and Football.
- articles: new column `sports` (text list), same meaning for sports science articles.

2. Data
- Existing rows are tagged with sports that match their content. General content is tagged with every sport in the library.
- Existing columns (including the single `sport` label on videos) are left unchanged.

3. Security
- No change to access rules. Existing grants and policies still apply.

4. Important notes
- Empty tag lists mean the item is not shown when any sport filter is active.
*/

ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS sports text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS sports text[] NOT NULL DEFAULT '{}';

UPDATE public.videos AS v
SET sports = t.sports
FROM (VALUES
  ('ZaTM37cfiDs', ARRAY['Bodybuilding','Football']),
  ('my0tLDaWyDU', ARRAY['Bodybuilding','Basketball','Soccer','Football']),
  ('oMXHBcI1wJU', ARRAY['Basketball','Soccer','Football','Track & Field']),
  ('3-4pKUhkzoQ', ARRAY['Soccer','Football','Track & Field','Basketball']),
  ('H3iPiweaQqQ', ARRAY['Track & Field','Soccer','Football']),
  ('WNaWD-bxFT0', ARRAY['Track & Field','Soccer','Football']),
  ('9ZTRUVLjGzI', ARRAY['Football','Soccer','Basketball']),
  ('ZJBprx7oWAM', ARRAY['Basketball','Bodybuilding','Soccer','Football','Tennis','Swimming','Track & Field']),
  ('jj2AAH6jbHk', ARRAY['Basketball','Bodybuilding','Soccer','Football','Tennis','Swimming','Track & Field']),
  ('BoGzAZ_vOyA', ARRAY['Basketball','Bodybuilding','Soccer','Football','Tennis','Swimming','Track & Field']),
  ('E4O2JeAYg5Q', ARRAY['Basketball']),
  ('AQy_c30lNjI', ARRAY['Swimming']),
  ('IiRGdagtOKE', ARRAY['Tennis']),
  ('9v5eo9vIo2Y', ARRAY['Soccer']),
  ('5Ja5gwko9ro', ARRAY['Basketball','Bodybuilding','Soccer','Football','Tennis','Swimming','Track & Field']),
  ('HQwMrK54494', ARRAY['Basketball'])
) AS t(youtube_id, sports)
WHERE v.youtube_id = t.youtube_id;

UPDATE public.articles AS a
SET sports = t.sports
FROM (VALUES
  ('sleep-the-performance-drug', ARRAY['Basketball','Bodybuilding','Soccer','Football','Tennis','Swimming','Track & Field']),
  ('rate-of-force-development', ARRAY['Bodybuilding','Basketball','Soccer','Football','Track & Field']),
  ('hamstring-injury-prevention', ARRAY['Soccer','Football','Track & Field','Basketball']),
  ('fueling-for-training', ARRAY['Basketball','Bodybuilding','Soccer','Football','Tennis','Swimming','Track & Field']),
  ('mental-rehearsal', ARRAY['Basketball','Bodybuilding','Soccer','Football','Tennis','Swimming','Track & Field']),
  ('training-load-acwr', ARRAY['Basketball','Bodybuilding','Soccer','Football','Tennis','Swimming','Track & Field'])
) AS t(slug, sports)
WHERE a.slug = t.slug;
