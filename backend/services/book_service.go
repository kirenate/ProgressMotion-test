package services

import (
	"context"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"main.go/repositories"
	"main.go/schemas"
	"time"
)

type Service struct {
	repository *repositories.Repository
}

func NewService(repo *repositories.Repository) *Service {
	return &Service{repository: repo}
}

func (r *Service) GetBooks(ctx context.Context, page int, pageSize int) (*[]schemas.Book, error) {
	books, err := r.repository.GetBooks(ctx, page, pageSize)
	if err != nil {
		return nil, errors.Wrap(err, "get books service")
	}

	zerolog.Ctx(ctx).Info().Msg("books.found")
	return books, nil
}

func (r *Service) GetBooksByCategory(ctx context.Context, page int, pageSize int, categoryName string) (*[]schemas.Book, error) {
	books, err := r.repository.GetBooksByCategory(ctx, page, pageSize, categoryName)
	if err != nil {
		return nil, errors.Wrap(err, "get books service")
	}

	zerolog.Ctx(ctx).Info().Str("category", categoryName).Msg("books.found")
	return books, nil
}

func (r *Service) BookInfo(ctx context.Context, id uuid.UUID) (*schemas.Book, error) {
	book, err := r.repository.BookInfo(ctx, id)
	if err != nil {
		return nil, errors.Wrap(err, "book info")
	}

	zerolog.Ctx(ctx).Info().Str("bookId", id.String()).Msg("book.info.found")
	return book, nil
}

func (r *Service) SaveBook(ctx context.Context, book *schemas.Book) error {
	id := uuid.New()
	now := time.Now().UTC()
	book.ID = id
	book.CreatedAt = now
	book.UpdatedAt = now
	err := r.repository.SaveBook(ctx, book)
	if err != nil {
		return errors.Wrap(err, "save book")
	}

	zerolog.Ctx(ctx).Info().Interface("book", book).Msg("book.saved")
	return nil
}

func (r *Service) DeleteBook(ctx context.Context, id uuid.UUID) error {
	err := r.repository.DeleteBook(ctx, id)
	if err != nil {
		return errors.Wrap(err, "delete book")
	}

	zerolog.Ctx(ctx).Info().Str("id", id.String()).Msg("book.deleted")
	return nil
}
