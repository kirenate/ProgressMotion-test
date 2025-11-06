package web

import (
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func (r *Presentation) addToCart(c *fiber.Ctx) error {
	body := c.Body()
	var request struct {
		ID uuid.UUID `json:"id"`
	}
	err := json.Unmarshal(body, &request)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	token := c.Locals("user").(*jwt.Token)
	userId, err := GetUserIdFromJwt(token)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnauthorized}
	}

	err = r.cartService.Add(c.UserContext(), userId, request.ID)
	if err != nil {
		return errors.Wrap(err, "add to cart")
	}

	return nil
}

func (r *Presentation) getCart(c *fiber.Ctx) error {
	token := c.Locals("user").(*jwt.Token)
	userId, err := GetUserIdFromJwt(token)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnauthorized}
	}

	cart, books, err := r.cartService.Get(c.UserContext(), userId)
	if err != nil {
		return errors.Wrap(err, "failed to get cart")
	}

	return c.JSON(fiber.Map{"cart": cart, "books": books})
}

func (r *Presentation) deleteFromCart(c *fiber.Ctx) error {
	bookId, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return &fiber.Error{Code: fiber.StatusBadRequest}
	}

	token := c.Locals("user").(*jwt.Token)
	userId, err := GetUserIdFromJwt(token)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnauthorized}
	}

	err = r.cartService.DeleteBook(c.UserContext(), userId, bookId)
	if err != nil {
		return errors.Wrap(err, "failed to delete from cart")
	}
	
	return nil
}

func GetUserIdFromJwt(token *jwt.Token) (uuid.UUID, error) {
	claims := token.Claims.(jwt.MapClaims)
	id, err := uuid.Parse(claims["sub"].(string))
	if err != nil {
		return uuid.Nil, errors.Wrap(err, "invalid uuid")
	}

	return id, nil
}
