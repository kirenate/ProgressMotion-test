package repositories

import (
	"context"
	"github.com/pkg/errors"
	"main.go/schemas"
)

func (r *Repository) GetCategories(ctx context.Context) (*[]schemas.Category, error) {
	var categories *[]schemas.Category
	err := r.db.WithContext(ctx).Table("category").Find(&categories).Error
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
