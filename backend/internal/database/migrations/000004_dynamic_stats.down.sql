ALTER TABLE athlete_profiles
DROP COLUMN stats,
ADD COLUMN stat_sprint_200m VARCHAR(50),
ADD COLUMN stat_best_season_year VARCHAR(10),
ADD COLUMN stat_avg_points VARCHAR(50),
ADD COLUMN stat_personal_best VARCHAR(50);
