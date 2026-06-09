package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/uag/backend/internal/models"
)

func (r *AthleteRepository) GetDashboardStats(ctx context.Context, athleteID uuid.UUID) (*models.DashboardResponse, error) {
	ap, err := r.FindByID(ctx, athleteID)
	if err != nil {
		return nil, err
	}

	uagScore := int((ap.TotalVotes*10 + ap.TotalProfileViews*2) / 100)
	if uagScore > 99 {
		uagScore = 99
	}
	if uagScore < 10 {
		uagScore = 10
	}

	rank := 0
	if ap.GlobalRank != nil {
		rank = *ap.GlobalRank
	}

	username := ""
	if ap.Username != nil {
		username = *ap.Username
	}

	// Mocking trends and chart data for now
	resp := &models.DashboardResponse{
		AthleteName:     username,
		Tier:            string(ap.Tier),
		TotalVotes:      ap.TotalVotes,
		VotesTrend:      models.TrendData{Value: "+12% this week", IsUp: true},
		UAGScore:        uagScore,
		UAGScoreTrend:   models.TrendData{Value: "+2 pts", IsUp: true},
		ProfileViews30D: int(ap.TotalProfileViews),
		ViewsTrend:      models.TrendData{Value: "+24%", IsUp: true},
		CurrentRank:     rank,
		RankTrend:       models.TrendData{Value: "+3 spots", IsUp: true},
		ViewsChartData:  []int{120, 130, 135, 140, 150, 160, 170, 175, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 400},
		RecentActivity: []models.RecentActivity{
			{Type: "vote", Description: "Received 47 new votes", Timestamp: time.Now().Add(-2 * time.Hour)},
			{Type: "rank", Description: "Moved up 3 spots to #4", Timestamp: time.Now().Add(-5 * time.Hour)},
			{Type: "follower", Description: "12 new profile followers", Timestamp: time.Now().Add(-24 * time.Hour)},
			{Type: "view", Description: "Profile viewed 89 times", Timestamp: time.Now().Add(-24 * time.Hour)},
		},
	}

	return resp, nil
}

func (r *AthleteRepository) GetEarningsDetailed(ctx context.Context, athleteID uuid.UUID) (*models.EarningsDetailedResponse, error) {
	ap, err := r.FindByID(ctx, athleteID)
	if err != nil {
		return nil, err
	}

	// 1. Get Orders Count
	var ordersCount int
	err = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM orders WHERE referral_athlete_id = $1`, athleteID).Scan(&ordersCount)
	if err != nil {
		ordersCount = 0
	}

	// 2. Get 30-Day Earnings
	var thirtyDayEarnings float64
	err = r.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) 
		FROM athlete_transactions 
		WHERE athlete_id = $1 AND created_at > NOW() - INTERVAL '30 days'`, athleteID).Scan(&thirtyDayEarnings)
	if err != nil {
		thirtyDayEarnings = 0
	}

	// 3. Get Withdrawal History (last 3)
	rows, err := r.db.Query(ctx, `
		SELECT amount, COALESCE(bank_account_id, 'Bank Transfer'), created_at, status 
		FROM withdrawals 
		WHERE athlete_id = $1 
		ORDER BY created_at DESC LIMIT 3`, athleteID)
	var withdrawals []models.WithdrawalHistoryItem
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var w models.WithdrawalHistoryItem
			if err := rows.Scan(&w.Amount, &w.Method, &w.Date, &w.Status); err == nil {
				withdrawals = append(withdrawals, w)
			}
		}
	}

	// 4. Get Commission By Product
	crows, err := r.db.Query(ctx, `
		SELECT oi.name, SUM(oi.quantity) as sales, SUM(oi.price * oi.quantity * 0.10) as commission
		FROM order_items oi
		JOIN orders o ON oi.order_id = o.id
		WHERE o.referral_athlete_id = $1
		GROUP BY oi.name
		ORDER BY commission DESC`, athleteID)
	
	var productCommissions []models.ProductCommission
	if err == nil {
		defer crows.Close()
		for crows.Next() {
			var pc models.ProductCommission
			if err := crows.Scan(&pc.ProductName, &pc.Sales, &pc.CommissionEarned); err == nil {
				productCommissions = append(productCommissions, pc)
			}
		}
	}

	// Commission Rate based on Tier
	rate := 10
	if ap.Tier == "RISING" {
		rate = 15
	} else if ap.Tier == "ELITE" {
		rate = 20
	}

	resp := &models.EarningsDetailedResponse{
		CurrentTier:         string(ap.Tier),
		OrdersCount:         ordersCount,
		OrdersToNextTier:    100, // Hardcoded max for now
		AvailableBalance:    ap.AvailableBalance,
		PendingBalance:      ap.PendingBalance,
		MinWithdrawal:       25.00,
		WithdrawalHistory:   withdrawals,
		ThirtyDayEarnings:   thirtyDayEarnings,
		ThirtyDayTrend:      models.TrendData{Value: "+12% vs last month", IsUp: true},
		AllTimeEarnings:     ap.LifetimeEarned,
		PendingPayout:       ap.PendingBalance,
		CommissionRate:      rate,
		EarningsChartData:   []float64{0, 0, 10, 15, 15, 20, 25, 40, 50, 55, 60, 60, 75, 80, 85, 100, 110, 120, 150, 180, 200, 250, 300, 350, 380, 400, 420, 450, 485.50},
		CommissionByProduct: productCommissions,
	}

	return resp, nil
}
