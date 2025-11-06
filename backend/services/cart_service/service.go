package cart_service

import (
	"context"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"gorm.io/gorm"
	"main.go/repositories/book_repository"
	"main.go/repositories/cart_repository"
	"main.go/schemas"
	"slices"
	"time"
)

type Service struct {
	cartRepository *cart_repository.Repository
	bookRepository *book_repository.Repository
}

func NewService(repo *cart_repository.Repository) *Service {
	return &Service{cartRepository: repo}
}

func (r *Service) Add(ctx context.Context, userId, bookId uuid.UUID) error {
	cart, err := r.cartRepository.GetCart(ctx, userId)
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

			err = r.cartRepository.SaveCart(ctx, cart)
			if err != nil {
				return errors.Wrap(err, "add book to cart")
			}

			zerolog.Ctx(ctx).Info().Interface("cart", cart).Msg("cart.created")
		} else {
			return errors.Wrap(err, "add book to cart")
		}
	}

	zerolog.Ctx(ctx).Info().Str("userId", cart.UserId.String()).
		Str("cartId", cart.ID.String()).
		Msg("cart.found")

	book, err := r.bookRepository.BookInfo(ctx, bookId)
	if err != nil {
		return errors.Wrap(err, "add book to cart")
	}
	cart.BookIds = append(cart.BookIds, book.ID)
	cart.TotalPrice += book.Price

	err = r.cartRepository.UpdateCart(ctx, cart)
	if err != nil {
		return errors.Wrap(err, "add book to cart")
	}

	zerolog.Ctx(ctx).Info().Interface("cart", cart).Msg("cart.updated")
	return nil
}

func (r *Service) Get(ctx context.Context, userId uuid.UUID) (*schemas.Cart, *[]schemas.Book, error) {
	cart, err := r.cartRepository.GetCart(ctx, userId)
	if err != nil {
		return nil, nil, errors.Wrap(err, "get cart")
	}

	zerolog.Ctx(ctx).Info().Interface("cart", cart).Msg("cart.found")

	books, err := r.bookRepository.GetBooksInCart(ctx, cart.BookIds)
	if err != nil {
		return nil, nil, errors.Wrap(err, "get cart")
	}

	zerolog.Ctx(ctx).Info().
		Str("cartId", cart.ID.String()).
		Interface("books", books).
		Msg("books.in.cart.found")
	return cart, books, nil
}

func (r *Service) DeleteBook(ctx context.Context, userId, bookId uuid.UUID) error {
	cart, err := r.cartRepository.GetCart(ctx, userId)
	if err != nil {
		return errors.Wrap(err, "delete book")
	}

	bookIdx := slices.Index(cart.BookIds, bookId)
	if bookIdx == -1 {
		return errors.Wrap(err, "cart does not contain book")
	}

	bookPrice, err := r.bookRepository.GetBookPrice(ctx, bookId)
	if err != nil {
		return errors.Wrap(err, "delete book")
	}
	cart.BookIds = slices.Delete(cart.BookIds, bookIdx, bookIdx+1)
	cart.TotalPrice -= bookPrice
	if cart.TotalPrice < 0 {
		return errors.New("invalid book price")
	}

	err = r.cartRepository.UpdateCart(ctx, cart)
	if err != nil {
		return errors.Wrap(err, "delete book")
	}

	return nil
}
