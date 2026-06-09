ALTER TABLE orders ADD COLUMN referral_athlete_id UUID REFERENCES athlete_profiles(id);
