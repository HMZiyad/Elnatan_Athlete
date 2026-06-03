// Package models defines all domain structs shared across layers.
package models

import (
	"time"

	"github.com/google/uuid"
)

// ─── ENUMS ────────────────────────────────────────────────────

type UserRole string

const (
	RoleFan     UserRole = "fan"
	RoleAthlete UserRole = "athlete"
)

type AthleteLevel string

const (
	LevelAmateur  AthleteLevel = "Amateur"
	LevelSemiPro  AthleteLevel = "Semi Pro"
	LevelCollege  AthleteLevel = "College"
	LevelPro      AthleteLevel = "Pro"
)

type VerificationStatus string

const (
	VerificationPending  VerificationStatus = "pending"
	VerificationApproved VerificationStatus = "approved"
	VerificationRejected VerificationStatus = "rejected"
)

type OrderStatus string

const (
	OrderPending    OrderStatus = "Pending"
	OrderProcessing OrderStatus = "Processing"
	OrderShipped    OrderStatus = "Shipped"
	OrderDelivered  OrderStatus = "Delivered"
	OrderCancelled  OrderStatus = "Cancelled"
)

type AthleteTier string

const (
	TierRookie AthleteTier = "ROOKIE"
	TierRising AthleteTier = "RISING"
	TierElite  AthleteTier = "ELITE"
)

type TransactionType string

const (
	TxReferralSignup TransactionType = "referral_signup"
	TxReferralTip    TransactionType = "referral_tip"
	TxVoteIncome     TransactionType = "vote_income"
	TxWithdrawal     TransactionType = "withdrawal"
)

// ─── USER ─────────────────────────────────────────────────────

type User struct {
	ID                 uuid.UUID  `json:"id"`
	FullName           string     `json:"full_name"`
	Email              string     `json:"email"`
	PasswordHash       string     `json:"-"`
	Role               UserRole   `json:"role"`
	AvatarURL          *string    `json:"avatar_url"`
	OnboardingComplete bool       `json:"onboarding_complete"`
	StripeCustomerID   *string    `json:"-"`
	ReferredBy         *uuid.UUID `json:"-"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

// ─── ADMIN ────────────────────────────────────────────────────

type Admin struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ─── ATHLETE PROFILE ──────────────────────────────────────────

type AthleteProfile struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	Username     *string   `json:"username"`
	DateOfBirth  *string   `json:"date_of_birth"`
	Location     *string   `json:"location"`
	Sport        *string   `json:"sport"`
	Level        *string   `json:"level"`
	Position     *string   `json:"position"`
	Achievements *string   `json:"achievements"`
	Bio          *string   `json:"bio"`

	HighlightClipURL *string `json:"highlight_clip_url"`

	// Sport stats
	StatSprint200m    *string `json:"stat_sprint_200m,omitempty"`
	StatBestSeasonYear *string `json:"stat_best_season_year,omitempty"`
	StatAvgPoints     *string `json:"stat_avg_points,omitempty"`
	StatPersonalBest  *string `json:"stat_personal_best,omitempty"`
	RecentAchievements *string `json:"recent_achievements,omitempty"`

	// Socials
	InstagramURL *string `json:"instagram_url,omitempty"`
	TwitterURL   *string `json:"twitter_url,omitempty"`
	YoutubeURL   *string `json:"youtube_url,omitempty"`
	WebsiteURL   *string `json:"website_url,omitempty"`

	// Verification
	IDDocumentURL      *string            `json:"id_document_url,omitempty"`
	VerificationStatus VerificationStatus `json:"verification_status"`
	Verified           bool               `json:"verified"`
	VerifiedAt         *time.Time         `json:"verified_at,omitempty"`
	ReviewerNotes      *string            `json:"reviewer_notes,omitempty"`

	// Agreements
	AgreedToTerms           bool `json:"-"`
	AgreedToPrivacy         bool `json:"-"`
	AgreedToEarningsPolicy  bool `json:"-"`

	OnboardingStep int `json:"onboarding_step"`

	// Referral
	ReferralCode *string `json:"referral_code,omitempty"`
	ReferralLink *string `json:"referral_link,omitempty"`

	// Financials
	AvailableBalance float64 `json:"available_balance"`
	LifetimeEarned   float64 `json:"lifetime_earned"`
	PendingBalance   float64 `json:"pending_balance"`

	// Stats
	TotalVotes       int64       `json:"total_votes"`
	TotalProfileViews int64      `json:"total_profile_views"`
	GlobalRank       *int        `json:"global_rank,omitempty"`
	Tier             AthleteTier `json:"tier"`
	RankMovement     string      `json:"rank_movement"`
	RankMovementValue int        `json:"rank_movement_value"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ─── ATHLETE MEDIA ─────────────────────────────────────────────

type AthleteMedia struct {
	ID           uuid.UUID `json:"id"`
	AthleteID    uuid.UUID `json:"athlete_id"`
	Type         string    `json:"type"`
	URL          string    `json:"url"`
	ThumbnailURL *string   `json:"thumbnail_url"`
	CreatedAt    time.Time `json:"created_at"`
}

// ─── VOTE ─────────────────────────────────────────────────────

type Vote struct {
	ID        uuid.UUID `json:"id"`
	FanID     uuid.UUID `json:"fan_id"`
	AthleteID uuid.UUID `json:"athlete_id"`
	VotedAt   time.Time `json:"voted_at"`
}

// ─── FAVORITE ─────────────────────────────────────────────────

type Favorite struct {
	ID          uuid.UUID `json:"id"`
	FanID       uuid.UUID `json:"fan_id"`
	AthleteID   uuid.UUID `json:"athlete_id"`
	CreatedAt   time.Time `json:"created_at"`
}

// ─── ADDRESS ──────────────────────────────────────────────────

type Address struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Label     string    `json:"label"`
	FullName  string    `json:"full_name"`
	Street    string    `json:"street"`
	City      string    `json:"city"`
	State     *string   `json:"state"`
	Zip       string    `json:"zip"`
	Country   string    `json:"country"`
	Phone     *string   `json:"phone"`
	IsDefault bool      `json:"is_default"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ─── PAYMENT METHOD ───────────────────────────────────────────

type PaymentMethod struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	StripePMID   string    `json:"-"`
	Brand        string    `json:"brand"`
	LastFour     string    `json:"last_four"`
	ExpiresMonth int       `json:"expires_month"`
	ExpiresYear  int       `json:"expires_year"`
	IsDefault    bool      `json:"is_default"`
	CreatedAt    time.Time `json:"created_at"`
}

// ─── PRODUCT ──────────────────────────────────────────────────

type Product struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Description   *string   `json:"description"`
	Category      string    `json:"category"`
	Price         float64   `json:"price"`
	OriginalPrice *float64  `json:"original_price"`
	Inventory     int       `json:"inventory"`
	Sizes         []string  `json:"sizes"`
	Colors        []string  `json:"colors"`
	ImageURL      *string   `json:"image_url"`
	Status        string    `json:"status"`
	Rating        float64   `json:"rating"`
	ReviewCount   int       `json:"review_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ProductReview struct {
	ID        uuid.UUID `json:"id"`
	ProductID uuid.UUID `json:"product_id"`
	UserID    uuid.UUID `json:"user_id"`
	Rating    int       `json:"rating"`
	Title     *string   `json:"title"`
	Comment   *string   `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Joined fields
	UserFullName  string  `json:"user_full_name,omitempty"`
	UserAvatarURL *string `json:"user_avatar_url,omitempty"`
}

// ─── CART ─────────────────────────────────────────────────────

type Cart struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	Items     []CartItem `json:"items"`
	Subtotal  float64    `json:"subtotal"`
	ItemCount int        `json:"item_count"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type CartItem struct {
	ID        uuid.UUID `json:"cart_item_id"`
	CartID    uuid.UUID `json:"-"`
	ProductID uuid.UUID `json:"product_id"`
	Name      string    `json:"name"`
	Size      *string   `json:"size"`
	Color     *string   `json:"color"`
	Price     float64   `json:"price"`
	Quantity  int       `json:"quantity"`
	ImageURL  *string   `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ─── ORDER ────────────────────────────────────────────────────

type Order struct {
	ID                    uuid.UUID   `json:"id"`
	OrderNumber           string      `json:"order_number"`
	UserID                uuid.UUID   `json:"user_id"`
	Status                OrderStatus `json:"status"`
	Items                 []OrderItem `json:"items,omitempty"`
	Subtotal              float64     `json:"subtotal"`
	Shipping              float64     `json:"shipping"`
	Tax                   float64     `json:"tax"`
	Total                 float64     `json:"total"`
	StripePaymentIntentID *string     `json:"-"`
	ShippingAddress       *Address    `json:"shipping_address,omitempty"`
	CreatedAt             time.Time   `json:"created_at"`
	UpdatedAt             time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID        uuid.UUID  `json:"id"`
	OrderID   uuid.UUID  `json:"order_id"`
	ProductID *uuid.UUID `json:"product_id"`
	Name      string     `json:"name"`
	Size      *string    `json:"size"`
	Color     *string    `json:"color"`
	Price     float64    `json:"price"`
	Quantity  int        `json:"quantity"`
	ImageURL  *string    `json:"image_url"`
	CreatedAt time.Time  `json:"created_at"`
}

// ─── ATHLETE TRANSACTION (Earnings Ledger) ──────────────────

type AthleteTransaction struct {
	ID             uuid.UUID       `json:"id"`
	AthleteID      uuid.UUID       `json:"athlete_id"`
	Type           TransactionType `json:"type"`
	Amount         float64         `json:"amount"`
	Description    string          `json:"description"`
	OrderID        *uuid.UUID      `json:"order_id,omitempty"`
	ReferredUserID *uuid.UUID      `json:"referred_user_id,omitempty"`
	DistributedBy  *uuid.UUID      `json:"distributed_by,omitempty"`
	Period         *string         `json:"period,omitempty"`
	CreatedAt      time.Time       `json:"created_at"`
}

// ─── REFERRAL LINK ────────────────────────────────────────────

type ReferralLink struct {
	ID             uuid.UUID `json:"id"`
	ReferredUserID uuid.UUID `json:"referred_user_id"`
	ReferrerID     uuid.UUID `json:"referrer_id"`
	CreatedAt      time.Time `json:"created_at"`
}
