-- ============================================================
-- UAG Platform — Complete Database Schema
-- Migration: 000001_init.up.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('fan', 'athlete');
CREATE TYPE athlete_level AS ENUM ('Amateur', 'Semi Pro', 'College', 'Pro');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
CREATE TYPE movement_type AS ENUM ('up', 'down', 'same');
CREATE TYPE athlete_tier AS ENUM ('ROOKIE', 'RISING', 'ELITE');
CREATE TYPE transaction_type AS ENUM ('referral_signup', 'referral_tip', 'vote_income', 'withdrawal');
CREATE TYPE media_type AS ENUM ('photo', 'video');
CREATE TYPE product_status AS ENUM ('In Stock', 'Out of Stock');

-- ─── ADMINS ─────────────────────────────────────────────────
CREATE TABLE admins (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USERS (fans + athletes share this table) ────────────────
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name           VARCHAR(255) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    role                user_role NOT NULL,
    avatar_url          TEXT,
    onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    -- Stripe customer ID for payment method storage
    stripe_customer_id  VARCHAR(255),
    referred_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- ─── PASSWORD RESET TOKENS ────────────────────────────────────
CREATE TABLE password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ADMIN PASSWORD RESET (OTP based) ───────────────────────
CREATE TABLE admin_otp_codes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id   UUID REFERENCES admins(id) ON DELETE CASCADE,
    code_hash  TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ATHLETE PROFILES ────────────────────────────────────────
CREATE TABLE athlete_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username            VARCHAR(100) UNIQUE,
    date_of_birth       DATE,
    location            VARCHAR(255),
    sport               VARCHAR(100),
    level               athlete_level,
    position            VARCHAR(100),
    achievements        TEXT,
    bio                 VARCHAR(240),
    highlight_clip_url  TEXT,
    -- Sport stats (stored as text for flexibility)
    stat_sprint_200m    VARCHAR(50),
    stat_best_season_year VARCHAR(10),
    stat_avg_points     VARCHAR(50),
    stat_personal_best  VARCHAR(50),
    recent_achievements TEXT,
    -- Socials
    instagram_url       TEXT,
    twitter_url         TEXT,
    youtube_url         TEXT,
    website_url         TEXT,
    -- Verification
    id_document_url     TEXT,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified            BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at         TIMESTAMPTZ,
    reviewer_notes      TEXT,
    -- Agreements
    agreed_to_terms         BOOLEAN NOT NULL DEFAULT FALSE,
    agreed_to_privacy       BOOLEAN NOT NULL DEFAULT FALSE,
    agreed_to_earnings_policy BOOLEAN NOT NULL DEFAULT FALSE,
    -- Onboarding step tracking
    onboarding_step     INT NOT NULL DEFAULT 0,  -- 0=not started, 1-5=steps
    -- Referral
    referral_code       VARCHAR(50) UNIQUE,
    referral_link       TEXT,
    -- Financials
    available_balance   NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    lifetime_earned     NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pending_balance     NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    -- Stats cache (updated by background job)
    total_votes         BIGINT NOT NULL DEFAULT 0,
    total_profile_views BIGINT NOT NULL DEFAULT 0,
    global_rank         INT,
    tier                athlete_tier NOT NULL DEFAULT 'ROOKIE',
    rank_movement       movement_type NOT NULL DEFAULT 'same',
    rank_movement_value INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_athlete_profiles_user_id ON athlete_profiles(user_id);
CREATE INDEX idx_athlete_profiles_referral_code ON athlete_profiles(referral_code);
CREATE INDEX idx_athlete_profiles_total_votes ON athlete_profiles(total_votes DESC);
CREATE INDEX idx_athlete_profiles_global_rank ON athlete_profiles(global_rank);
CREATE INDEX idx_athlete_profiles_verified ON athlete_profiles(verified);

-- ─── ATHLETE MEDIA GALLERY ────────────────────────────────────
CREATE TABLE athlete_media (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id  UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    type        media_type NOT NULL,
    url         TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_athlete_media_athlete_id ON athlete_media(athlete_id);

-- ─── ATHLETE PHOTOS ───────────────────────────────────────────
CREATE TABLE athlete_photos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id  UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── VOTES ────────────────────────────────────────────────────
CREATE TABLE votes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fan_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    athlete_id  UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    voted_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    voted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_vote_fan_athlete_day UNIQUE (fan_id, athlete_id, voted_date)
);

CREATE INDEX idx_votes_athlete_id ON votes(athlete_id);
CREATE INDEX idx_votes_fan_id ON votes(fan_id);
CREATE INDEX idx_votes_voted_at ON votes(voted_at);

-- ─── FAVORITES ────────────────────────────────────────────────
CREATE TABLE favorites (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fan_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    athlete_id  UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_favorites_fan_athlete UNIQUE (fan_id, athlete_id)
);

CREATE INDEX idx_favorites_fan_id ON favorites(fan_id);

-- ─── ADDRESSES ────────────────────────────────────────────────
CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       VARCHAR(100) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    street      TEXT NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100),
    zip         VARCHAR(20) NOT NULL,
    country     VARCHAR(100) NOT NULL DEFAULT 'US',
    phone       VARCHAR(30),
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- ─── PAYMENT METHODS (Stripe-backed) ─────────────────────────
CREATE TABLE payment_methods (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_pm_id    VARCHAR(255) UNIQUE NOT NULL,
    brand           VARCHAR(50) NOT NULL,   -- visa, mastercard, etc.
    last_four       CHAR(4) NOT NULL,
    expires_month   SMALLINT NOT NULL,
    expires_year    SMALLINT NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    price           NUMERIC(10, 2) NOT NULL,
    original_price  NUMERIC(10, 2),
    inventory       INT NOT NULL DEFAULT 0,
    sizes           TEXT[] NOT NULL DEFAULT '{}',
    colors          TEXT[] NOT NULL DEFAULT '{}',
    image_url       TEXT,
    status          product_status NOT NULL DEFAULT 'In Stock',
    rating          NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    review_count    INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);

-- ─── CARTS ────────────────────────────────────────────────────
CREATE TABLE carts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id     UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size        VARCHAR(20),
    color       VARCHAR(50),
    quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price       NUMERIC(10, 2) NOT NULL, -- snapshot at time of add
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cart_item_product_variant UNIQUE (cart_id, product_id, size, color)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- ─── ORDERS ───────────────────────────────────────────────────
CREATE TABLE orders (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number            VARCHAR(50) UNIQUE NOT NULL,
    user_id                 UUID NOT NULL REFERENCES users(id),
    address_id              UUID REFERENCES addresses(id),
    payment_method_id       UUID REFERENCES payment_methods(id),
    status                  order_status NOT NULL DEFAULT 'Pending',
    subtotal                NUMERIC(10, 2) NOT NULL,
    shipping                NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    tax                     NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total                   NUMERIC(10, 2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    -- Snapshot of shipping address at order time
    shipping_address        JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID REFERENCES products(id),
    name        VARCHAR(255) NOT NULL,   -- snapshot
    size        VARCHAR(20),
    color       VARCHAR(50),
    price       NUMERIC(10, 2) NOT NULL, -- snapshot
    quantity    INT NOT NULL,
    image_url   TEXT,                    -- snapshot
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ─── ATHLETE TRANSACTIONS (earnings ledger) ──────────────────
CREATE TABLE athlete_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id      UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    type            transaction_type NOT NULL,
    amount          NUMERIC(12, 2) NOT NULL,
    description     TEXT NOT NULL,
    -- Optional references
    order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    distributed_by  UUID REFERENCES admins(id) ON DELETE SET NULL,
    period          VARCHAR(7),  -- e.g., "2026-06" for monthly distributions
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_athlete_transactions_athlete_id ON athlete_transactions(athlete_id);
CREATE INDEX idx_athlete_transactions_type ON athlete_transactions(type);
CREATE INDEX idx_athlete_transactions_period ON athlete_transactions(period);
-- Prevent duplicate admin distributions for the same athlete + period
CREATE UNIQUE INDEX uq_vote_income_per_period
    ON athlete_transactions(athlete_id, period)
    WHERE type = 'vote_income';

-- ─── WITHDRAWALS ──────────────────────────────────────────────
CREATE TABLE withdrawals (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id          UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    amount              NUMERIC(12, 2) NOT NULL,
    bank_account_id     VARCHAR(255),
    status              VARCHAR(50) NOT NULL DEFAULT 'processing',
    estimated_arrival   DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REFERRAL LINKS ───────────────────────────────────────────
-- Tracks which athlete referred which user (for lifetime tip calculation)
CREATE TABLE referral_links (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referred_user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referrer_id     UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referral_links_referrer_id ON referral_links(referrer_id);
CREATE INDEX idx_referral_links_referred_user_id ON referral_links(referred_user_id);

-- ─── LEADERBOARD HISTORY (snapshot for movement tracking) ─────
CREATE TABLE leaderboard_snapshots (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id  UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    rank        INT NOT NULL,
    total_votes BIGINT NOT NULL,
    snapshotted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_snapshots_athlete_id ON leaderboard_snapshots(athlete_id);
CREATE INDEX idx_leaderboard_snapshots_snapshotted_at ON leaderboard_snapshots(snapshotted_at DESC);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_athlete_profiles_updated_at
    BEFORE UPDATE ON athlete_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_withdrawals_updated_at
    BEFORE UPDATE ON withdrawals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
