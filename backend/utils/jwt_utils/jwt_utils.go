package jwt_utils

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/pkg/errors"
)

func CheckAdmin(token *jwt.Token) error {
	claims := token.Claims.(jwt.MapClaims)
	admin := claims["admin"].(bool)
	if !admin {
		return ErrNotAdmin
	}

	return nil
}

var ErrNotAdmin = errors.New("user is not admin")
