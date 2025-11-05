package repositories

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

func (r *Repository) GetBooks(ctx context.Context, page int, pageSize int) (*[]schemas.Book, error) {
	var books *[]schemas.Book

	err := r.db.WithContext(ctx).Table("book").
		Limit(pageSize).Offset(page * pageSize).
		Find(&books).Error
	if err != nil {
		return nil, errors.Wrap(err, "failed to find books")
	}

	return books, nil
}

func (r *Repository) GetBooksByCategory(ctx context.Context, page int, pageSize int, categoryName string) (*[]schemas.Book, error) {
	var books *[]schemas.Book
	var category *schemas.Category

	err := r.db.Transaction(func(tx *gorm.DB) error {
		err := r.db.WithContext(ctx).Table("category").
			Where("name", categoryName).
			Find(&category).Error
		if err != nil {
			return errors.Wrap(err, "failed to find category")
		}

		err = r.db.WithContext(ctx).Table("book").
			Limit(pageSize).Offset(page*pageSize).Where("categories IN", category.ID).
			Find(&books).Error
		if err != nil {
			return errors.Wrap(err, "failed to find books")
		}
		return nil
	})
	if err != nil {
		return nil, errors.Wrap(err, "transaction")
	}

	return books, nil

}

func (r *Repository) BookInfo(ctx context.Context, id uuid.UUID) (*schemas.Book, error) {
	var book *schemas.Book
	err := r.db.WithContext(ctx).Table("book").Where("id", id).Find(&book).Error
	if err != nil {
		return nil, errors.Wrap(err, "get book info")
	}

	return book, nil
}

func (r *Repository) SaveBook(ctx context.Context, book *schemas.Book) error {
	err := r.db.WithContext(ctx).Table("book").Save(&book).Error
	if err != nil {
		return errors.Wrap(err, "save book repo")
	}

	return nil
}
