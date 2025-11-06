package web

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/pkg/errors"
	"main.go/schemas"
	"main.go/services/authentification_service"
	validators_utils "main.go/utils/validator_utils"
)

func (r *Presentation) registerUser(c *fiber.Ctx) error {
	var registrationRequest *schemas.LoginRequest

	err := c.BodyParser(&registrationRequest)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = validators_utils.Validate.Struct(&registrationRequest)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	token, err := r.authService.RegisterUser(c.UserContext(), registrationRequest)
	if err != nil {
		return errors.Wrap(err, "failed to register user")
	}

	return c.JSON(fiber.Map{"token": token})
}

func (r *Presentation) loginUser(c *fiber.Ctx) error {
	var loginRequest *schemas.LoginRequest

	err := c.BodyParser(loginRequest)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	err = validators_utils.Validate.Struct(loginRequest)
	if err != nil {
		return &fiber.Error{Code: fiber.StatusUnprocessableEntity}
	}

	user, err := r.authService.LoginUser(c.UserContext(), loginRequest)
	if err != nil {
		if errors.Is(err, authentification_service.ErrWrongPassword) {
			return &fiber.Error{
				Code:    fiber.StatusUnauthorized,
				Message: errors.Wrap(err, "failed to log in").Error(),
			}
		}

		return errors.Wrap(err, "failed to log in")
	}

	token, err := user.GenerateTokenJWT()
	if err != nil {
		return errors.Wrap(err, "failed to generate JWT token")
	}

	return c.JSON(fiber.Map{"token": token})
}

func (r *Presentation) logoutUser(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)

	token, err := r.authService.LogoutUser(user)
	if err != nil {
		return errors.Wrap(err, "logout failed")
	}

	return c.JSON(fiber.Map{"token": token})
}
