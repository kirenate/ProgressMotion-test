package web

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"main.go/schemas"
	"main.go/utils/jwt_utils"
	validators_utils "main.go/utils/validator_utils"
)

func (r *Presentation) listCategories(c *fiber.Ctx) error {
	categories, err := r.categoryService.ListCategories(c.UserContext())
	if err != nil {
		return errors.Wrap(err, "failed to list categories")
	}

	return c.JSON(fiber.Map{"categories": categories})
}

func (r *Presentation) saveCategory(c *fiber.Ctx) error {
	token := c.Locals("user").(*jwt.Token)
	err := jwt_utils.CheckAdmin(token)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnauthorized}
	}

	var category schemas.Category
	err = c.BodyParser(&category)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = validators_utils.Validate.StructPartial(&category, "Name")
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = r.categoryService.SaveCategory(c.UserContext(), &category)
	if err != nil {
		return errors.Wrap(err, "failed to save category")
	}

	c.Status(fiber.StatusCreated)
	return nil
}

func (r *Presentation) updateCategory(c *fiber.Ctx) error {
	token := c.Locals("user").(*jwt.Token)
	err := jwt_utils.CheckAdmin(token)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnauthorized}
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity, Message: "invalid category id"}
	}

	var category schemas.Category
	err = c.BodyParser(&category)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = validators_utils.Validate.StructPartial(&category, "name")
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = r.categoryService.UpdateCategory(c.UserContext(), id, &category)
	if err != nil {
		return errors.Wrap(err, "failed to update category")
	}

	return nil
}

func (r *Presentation) deleteCategory(c *fiber.Ctx) error {
	token := c.Locals("user").(*jwt.Token)
	err := jwt_utils.CheckAdmin(token)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnauthorized}
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity, Message: "invalid category id"}
	}

	err = r.categoryService.DeleteCategory(c.UserContext(), id)
	if err != nil {
		return errors.Wrap(err, "failed to delete category")
	}

	return nil
}
