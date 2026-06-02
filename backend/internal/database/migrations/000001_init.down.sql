-- ============================================================
-- UAG Platform — Rollback Migration
-- Migration: 000001_init.down.sql
-- ============================================================

DROP TABLE IF EXISTS leaderboard_snapshots CASCADE;
DROP TABLE IF EXISTS referral_links CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS athlete_transactions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS athlete_photos CASCADE;
DROP TABLE IF EXISTS athlete_media CASCADE;
DROP TABLE IF EXISTS athlete_profiles CASCADE;
DROP TABLE IF EXISTS admin_otp_codes CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

DROP FUNCTION IF EXISTS update_updated_at CASCADE;

DROP TYPE IF EXISTS product_status;
DROP TYPE IF EXISTS media_type;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS athlete_tier;
DROP TYPE IF EXISTS movement_type;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS verification_status;
DROP TYPE IF EXISTS athlete_level;
DROP TYPE IF EXISTS user_role;
