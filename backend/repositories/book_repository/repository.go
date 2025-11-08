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
		Limit(pageSize).Offset(page * pageSize).Where("deleted_at IS NULL").
		Order(sortBy + " " + orderBy).
		Find(&books).Error
	if err != nil {
		return nil, errors.Wrap(err, "failed to find books")
	}

	return books, nil
}

func (r *Repository) GetBooksByCategory(ctx context.Context, page int, pageSize int, categoryName string, sortBy, orderBy string) (*[]schemas.Book, error) {
	var books []schemas.Book
	var category schemas.Category

	err := r.db.Transaction(func(tx *gorm.DB) error {
		row := r.db.WithContext(ctx).Table("category").
			Where("name", categoryName).Where("deleted_at IS NULL").
			Find(&category)
		if row.Error != nil {
			return errors.Wrap(row.Error, "failed to find category")
		}

		if row.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}

		err := r.db.WithContext(ctx).Table("book"). //TODO: rewrite for something more adequate
								Where("categories LIKE ?", "%"+category.ID.String()+"%").
								Where("deleted_at IS NULL").
								Limit(pageSize).Offset(page * pageSize).
								Find(&books).Error
		if err != nil {
			return errors.Wrap(err, "failed to find books")
		}
		return nil
	})
	if err != nil {
		return nil, errors.Wrap(err, "transaction")
	}

	return &books, nil

}

func (r *Repository) BookInfo(ctx context.Context, id uuid.UUID) (*schemas.Book, error) {
	var book schemas.Book
	row := r.db.WithContext(ctx).Table("book").Where("id", id).Find(&book)
	if row.Error != nil {
		return nil, errors.Wrap(row.Error, "get book info")
	}

	if row.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &book, nil
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
		Where("id", id).Omit("id", "created_at", "deleted_at").
		Updates(&book).Error
	if err != nil {
		return errors.Wrap(err, "update book repo")
	}

	return nil
}

func (r *Repository) DeleteBook(ctx context.Context, id uuid.UUID) error {
	err := r.db.WithContext(ctx).Table("book").
		Where("id", id).
		Update("deleted_at", time.Now().UTC()).Error

	if err != nil {
		return errors.Wrap(err, "delete book repo")
	}

	return nil
}

func (r *Repository) SearchBooks(ctx context.Context, page int, pageSize int, phrase string, sortBy, orderBy string) (*[]schemas.Book, error) {
	var books *[]schemas.Book
	phrase = "%" + phrase + "%"
	row := r.db.WithContext(ctx).Table("book").
		Where("LOWER(name) LIKE LOWER(?)", phrase).Where("deleted_at IS NULL").
		Limit(pageSize).Offset(page * pageSize).Order(sortBy + " " + orderBy).
		Find(&books)
	if row.Error != nil {
		return nil, errors.Wrap(row.Error, "search books repo")
	}

	return books, nil
}

func (r *Repository) GetBooksInCart(ctx context.Context, bookIds []uuid.UUID) (*[]schemas.Book, error) {
	var books *[]schemas.Book
	err := r.db.WithContext(ctx).Table("book").Where("id IN ?", bookIds).Find(&books).Error
	if err != nil {
		return nil, errors.Wrap(err, "get books in cart repo")
	}

	return books, nil
}

func (r *Repository) GetBookPrice(ctx context.Context, bookId uuid.UUID) (int, error) {
	var price int
	err := r.db.WithContext(ctx).Table("book").Where("id", bookId).Select("price").Find(&price).Error
	if err != nil {
		return 0, errors.Wrap(err, "get book price repo")
	}

	return price, nil
}
