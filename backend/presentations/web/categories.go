package web

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"main.go/schemas"
	validators_utils "main.go/utils/validator_utils"
)

func (r *Presentation) listCategories(c *fiber.Ctx) error {
	categories, err := r.service.ListCategories(c.UserContext())
	if err != nil {
		return errors.Wrap(err, "failed to list categories")
	}

	return c.JSON(fiber.Map{"categories": categories})
}

func (r *Presentation) saveCategory(c *fiber.Ctx) error {
	var category *schemas.Category
	err := c.BodyParser(&category)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = validators_utils.Validate.StructPartial(&category, "Name")
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = r.service.SaveCategory(c.UserContext(), category)
	if err != nil {
		return errors.Wrap(err, "failed to save category")
	}

	c.Status(fiber.StatusCreated)
	return nil
}

func (r *Presentation) deleteCategory(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity, Message: "invalid category id"}
	}

	err = r.service.DeleteCategory(c.UserContext(), id)
	if err != nil {
		return errors.Wrap(err, "failed to delete category")
	}

	return nil
}
