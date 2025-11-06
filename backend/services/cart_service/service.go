package cart_service

import (
	"context"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"gorm.io/gorm"
	"main.go/repositories/cart_repository"
	"main.go/schemas"
	"time"
)

type Service struct {
	repository *cart_repository.Repository
}

func NewService(repo *cart_repository.Repository) *Service {
	return &Service{repository: repo}
}

func (r *Service) Add(ctx context.Context, userId, bookId uuid.UUID) error {
	cart, err := r.repository.GetCart(ctx, userId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			now := time.Now().UTC()
			cart = &schemas.Cart{
				ID:         uuid.New(),
				UserId:     userId,
				BookIds:    nil,
				TotalPrice: 0,
				CreatedAt:  now,
				UpdatedAt:  now,
				DeletedAt:  time.Time{},
			}

			err = r.repository.SaveCart(ctx, cart)
			if err != nil {
				return errors.Wrap(err, "add")
			}

			zerolog.Ctx(ctx).Info().Interface("cart", cart).Msg("cart.created")
		} else {
			return errors.Wrap(err, "add")
		}
	}

	zerolog.Ctx(ctx).Info().Str("userId", cart.UserId.String()).
		Str("cartId", cart.ID.String()).
		Msg("cart.found")

	cart.BookIds = append(cart.BookIds, bookId)
	err = r.repository.UpdateCart(ctx, cart)
	if err != nil {
		return errors.Wrap(err, "add")
	}

	zerolog.Ctx(ctx).Info().Interface("cart", cart).Msg("cart.updated")
	return nil
}
