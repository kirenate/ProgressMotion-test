package cart_repository

import (
	"context"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"main.go/schemas"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetCart(ctx context.Context, userId uuid.UUID) (*schemas.Cart, error) {
	var cart *schemas.Cart
	row := r.db.WithContext(ctx).Table("cart").Where("user_id", userId).Find(&cart)
	if row.Error != nil {
		return nil, errors.Wrap(row.Error, "get cart repo")
	}

	if row.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	return cart, nil
}

func (r *Repository) UpdateCart(ctx context.Context, cart *schemas.Cart) error {
	err := r.db.WithContext(ctx).Table("cart").Where("id", cart.ID).Updates(cart).Error
	if err != nil {
		return errors.Wrap(err, "update cart repo")
	}

	return nil
}

func (r *Repository) SaveCart(ctx context.Context, cart *schemas.Cart) error {
	err := r.db.WithContext(ctx).Table("cart").Save(&cart).Error
	if err != nil {
		return errors.Wrap(err, "save cart repo")
	}

	return nil
}
