package category_repository

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

func NewRepositpory(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetCategories(ctx context.Context) (*[]schemas.Category, error) {
	var categories *[]schemas.Category
	err := r.db.WithContext(ctx).Table("category").Where("deletedAt IS NULL").Find(&categories).Error
	if err != nil {
		return nil, errors.Wrap(err, "get categories repo")
	}

	return categories, nil
}

func (r *Repository) SaveCategory(ctx context.Context, category *schemas.Category) error {
	err := r.db.WithContext(ctx).Table("category").Save(&category).Error
	if err != nil {
		return errors.Wrap(err, "save category repo")
	}

	return nil
}

func (r *Repository) DeleteCategory(ctx context.Context, id uuid.UUID) error {
	err := r.db.WithContext(ctx).Table("category").Where("id", id).Update("deletedAt", time.Now().UTC()).Error
	if err != nil {
		return errors.Wrap(err, "delete category repo")
	}

	return nil
}
