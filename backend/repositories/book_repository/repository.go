package book_repository

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

func (r *Repository) GetBooks(ctx context.Context, page int, pageSize int, sortBy, orderBy string) (*[]schemas.Book, error) {
	var books *[]schemas.Book
	err := r.db.WithContext(ctx).Table("book").
		Limit(pageSize).Offset(page * pageSize).Where("deletedAt IS NULL").
		Order(sortBy + " " + orderBy).
		Find(&books).Error
	if err != nil {
		return nil, errors.Wrap(err, "failed to find books")
	}

	return books, nil
}

func (r *Repository) GetBooksByCategory(ctx context.Context, page int, pageSize int, categoryName string, sortBy, orderBy string) (*[]schemas.Book, error) {
	var books *[]schemas.Book
	var category *schemas.Category

	err := r.db.Transaction(func(tx *gorm.DB) error {
		err := r.db.WithContext(ctx).Table("category").
			Where("name", categoryName).Where("deletedAt IS NULL").
			Order(sortBy + " " + orderBy).
			Find(&category).Error
		if err != nil {
			return errors.Wrap(err, "failed to find category")
		}

		err = r.db.WithContext(ctx).Table("book").
			Limit(pageSize).Offset(page*pageSize).Where("categories IN", category.ID).
			Where("deletedAt IS NULL").
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

func (r *Repository) UpdateBook(ctx context.Context, id uuid.UUID, book *schemas.Book) error {
	err := r.db.WithContext(ctx).Table("book").
		Where("id", id).Omit("id", "createdAt", "deletedAt").
		Updates(&book).Error
	if err != nil {
		return errors.Wrap(err, "update book repo")
	}

	return nil
}

func (r *Repository) DeleteBook(ctx context.Context, id uuid.UUID) error {
	err := r.db.WithContext(ctx).Table("book").
		Where("id", id).
		Update("deletedAt", time.Now().UTC()).Error

	if err != nil {
		return errors.Wrap(err, "delete book repo")
	}

	return nil
}

func (r *Repository) SearchBooks(ctx context.Context, page int, pageSize int, phrase string, sortBy, orderBy string) (*[]schemas.Book, error) {
	var books *[]schemas.Book
	phrase = "%" + phrase + "%"
	err := r.db.WithContext(ctx).Table("book").
		Where("name ILIKE ?", phrase).Where("deletedAt IS NULL").
		Limit(pageSize).Offset(page * pageSize).Order(sortBy + " " + orderBy).
		Find(&books).Error
	if err != nil {
		return nil, errors.Wrap(err, "search books repo")
	}

	return books, nil
}
