package schemas

import (
	"crypto/sha256"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"main.go/utils/settings_utils"
	"time"
)

type User struct {
	ID          uuid.UUID `gorm:"primary_key"`
	Username    string    `gorm:"uniqueIndex"`
	PWDSalt     string
	PWDHash     string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	LastLoginAt time.Time
	DeletedAt   time.Time
}

func (r *User) GenerateTokenJWT() (string, error) {
	now := time.Now().UTC()
	claims := jwt.MapClaims{
		"sub":      r.ID,
		"username": r.Username,
		"exp":      now.Add(settings_utils.Settings.JwtTtl),
		"iat":      now,
		"jti":      uuid.New(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(settings_utils.Settings.SigningKey))
	if err != nil {
		return "", errors.Wrap(err, "failed to generate JWT token")
	}
	return t, nil
}

func (r *User) VerifyPassword(pwd string) bool {
	h := sha256.New()
	h.Write([]byte(r.PWDSalt + pwd))
	return r.PWDHash == string(h.Sum(nil))
}
