ALTER TABLE athlete_profiles
DROP COLUMN stat_sprint_200m,
DROP COLUMN stat_best_season_year,
DROP COLUMN stat_avg_points,
DROP COLUMN stat_personal_best,
ADD COLUMN stats JSONB DEFAULT '{}'::jsonb;
