package services

import (
	"context"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"main.go/schemas"
	"time"
)

func (r *Service) ListCategories(ctx context.Context) (*[]schemas.Category, error) {
	categories, err := r.repository.GetCategories(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "list categories")
	}

	zerolog.Ctx(ctx).Info().Int("amount", len(*categories)).Msg("categories.listed")
	return categories, nil
}

func (r *Service) SaveCategory(ctx context.Context, category *schemas.Category) error {
	id := uuid.New()
	now := time.Now().UTC()
	category.ID = id
	category.CreatedAt = now
	category.UpdatedAt = now

	err := r.repository.SaveCategory(ctx, category)
	if err != nil {
		return errors.Wrap(err, "save category")
	}

	zerolog.Ctx(ctx).Info().Interface("category", &category).Msg("category.saved")
	return nil
}

func (r *Service) DeleteCategory(ctx context.Context, id uuid.UUID) error {
	err := r.repository.DeleteCategory(ctx, id)
	if err != nil {
		return errors.Wrap(err, "delete category")
	}

	zerolog.Ctx(ctx).Info().Str("id", id.String()).Msg("category.deleted")
	return nil
}
