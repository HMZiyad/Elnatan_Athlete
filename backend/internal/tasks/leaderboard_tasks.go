package tasks

import (
	"context"

	"github.com/hibiken/asynq"
	"github.com/uag/backend/internal/repository"
	"go.uber.org/zap"
)

// LeaderboardHandler refreshes the global athlete leaderboard rankings.
// This is scheduled to run periodically (e.g., every hour) by the Asynq scheduler.
type LeaderboardHandler struct {
	athleteRepo *repository.AthleteRepository
	log         *zap.Logger
}

func NewLeaderboardHandler(athleteRepo *repository.AthleteRepository, log *zap.Logger) *LeaderboardHandler {
	return &LeaderboardHandler{athleteRepo: athleteRepo, log: log}
}

// NewLeaderboardRefreshTask creates a leaderboard refresh task.
func NewLeaderboardRefreshTask() *asynq.Task {
	return asynq.NewTask(TypeLeaderboardRefresh, nil)
}

// HandleLeaderboardRefresh re-calculates and updates global_rank and tier for all verified athletes.
func (h *LeaderboardHandler) HandleLeaderboardRefresh(ctx context.Context, t *asynq.Task) error {
	h.log.Info("refreshing leaderboard rankings")

	if err := h.athleteRepo.UpdateRanksFromVotes(ctx); err != nil {
		h.log.Error("failed to refresh leaderboard", zap.Error(err))
		return err
	}

	h.log.Info("leaderboard refreshed successfully")
	return nil
}
