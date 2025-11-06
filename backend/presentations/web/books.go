package web

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"main.go/schemas"
	validators_utils "main.go/utils/validator_utils"
)

func (r *Presentation) listBooks(c *fiber.Ctx) error {
	page := c.QueryInt("page")
	pageSize := c.QueryInt("pageSize")
	if page < 0 || pageSize < 1 {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}
	books, err := r.bookService.GetBooks(c.UserContext(), page, pageSize)
	if err != nil {
		return errors.Wrap(err, "list books")
	}

	return c.JSON(fiber.Map{"books": books})
}

func (r *Presentation) listBooksByCategory(c *fiber.Ctx) error {
	page := c.QueryInt("page")
	pageSize := c.QueryInt("pageSize")
	categoryName := c.Params("category")
	if categoryName == "" || page < 0 || pageSize < 1 {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	books, err := r.bookService.GetBooksByCategory(c.UserContext(), page, pageSize, categoryName)
	if err != nil {
		return errors.Wrap(err, "list books by category")
	}

	return c.JSON(fiber.Map{"books": books})
}

func (r *Presentation) bookInfo(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity, Message: "invalid book id"}
	}
	book, err := r.bookService.BookInfo(c.UserContext(), id)

	return c.JSON(fiber.Map{"book": book})
}

func (r *Presentation) saveBook(c *fiber.Ctx) error {
	var book *schemas.Book
	err := c.BodyParser(&book)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = validators_utils.Validate.StructExcept(&book, "ID", "CreatedAt", "UpdatedAt", "DeletedAt")
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = r.bookService.SaveBook(c.UserContext(), book)

	c.Status(fiber.StatusCreated)

	return nil
}

func (r *Presentation) updateBook(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity, Message: "invalid book id"}
	}

	var book *schemas.Book
	err = c.BodyParser(&book)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = r.bookService.UpdateBook(c.UserContext(), id, book)
	if err != nil {
		return errors.Wrap(err, "failed to update book")
	}

	return nil
}

func (r *Presentation) deleteBook(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity, Message: "invalid book id"}
	}

	err = r.bookService.DeleteBook(c.UserContext(), id)
	if err != nil {
		return errors.Wrap(err, "failed to delete book")
	}

	return nil
}

func (r *Presentation) searchBooks(c *fiber.Ctx) error {
	phrase := c.Query("phrase")
	if phrase == "" {
		return nil
	}
	page := c.QueryInt("page")
	pageSize := c.QueryInt("pageSize")
	if page < 0 || pageSize < 1 {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	books, err := r.bookService.SearchBooks(c.UserContext(), page, pageSize, phrase)
	if err != nil {
		return errors.Wrap(err, "failed to search books")
	}

	return c.JSON(fiber.Map{"books": books})
}
