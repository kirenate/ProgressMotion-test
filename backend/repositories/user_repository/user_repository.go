package user_repository

import (
	"context"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"main.go/schemas"
	"time"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) SaveUser(ctx context.Context, user *schemas.User) error {
	err := r.db.WithContext(ctx).Table("user").Save(&user).Error
	if err != nil {
		return errors.Wrap(err, "save user repo")
	}

	return nil
}

func (r *Repository) GetUserByUsername(ctx context.Context, username string) (*schemas.User, error) {
	var userFound schemas.User
	err := r.db.WithContext(ctx).Where("username", username).Find(&userFound).Error
	if err != nil {
		return nil, errors.Wrap(err, "get user by username repo")
	}

	return &userFound, nil
}

func (r *Repository) UpdateLastLoginAt(ctx context.Context, userId uuid.UUID) error {
	err := r.db.WithContext(ctx).Table("users").Where("id", userId).Update("last_login_at", time.Now().UTC()).Error
	if err != nil {
		return errors.Wrap(err, "failed to update lastLoginAt")
	}
	
	return nil
}
