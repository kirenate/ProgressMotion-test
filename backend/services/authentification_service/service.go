package authentification_service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"main.go/repositories/user_repository"
	"main.go/schemas"
	"main.go/utils/settings_utils"
	"time"
)

type Service struct {
	repository *user_repository.Repository
}

func NewService(repository *user_repository.Repository) *Service {
	return &Service{repository: repository}
}

func (r *Service) RegisterUser(ctx context.Context, req *schemas.LoginRequest) (string, error) {
	salt, hashSum, err := saltPassword(req.Password)
	if err != nil {
		return "", errors.Wrap(err, "failed to salt password")
	}

	now := time.Now().UTC()
	user := schemas.User{
		ID:          uuid.New(),
		Username:    req.Username,
		PWDSalt:     salt,
		PWDHash:     hashSum,
		Admin:       false,
		CreatedAt:   now,
		UpdatedAt:   now,
		LastLoginAt: now,
	}
	if req.Key == settings_utils.Settings.AdminKey {
		user.Admin = true
	}
	err = r.repository.SaveUser(ctx, &user)
	if err != nil {
		return "", errors.Wrap(err, "register user")
	}

	zerolog.Ctx(ctx).
		Info().Str("username", req.Username).
		Msg("new.user.registration.request.successful")

	token, err := user.GenerateTokenJWT()
	if err != nil {
		return "", errors.Wrap(err, "failed to generate JWT token")
	}

	zerolog.Ctx(ctx).
		Info().Str("token", token).
		Msg("new.token.generated")
	return token, nil
}

func (r *Service) LoginUser(ctx context.Context, req *schemas.LoginRequest) (*schemas.User, error) {
	user, err := r.repository.GetUserByUsername(ctx, req.Username)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get user")
	}

	if !user.VerifyPassword(req.Password) {
		return nil, ErrWrongPassword
	}

	err = r.repository.UpdateLastLoginAt(ctx, user.ID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to update lastLoginAt")
	}

	zerolog.Ctx(ctx).
		Info().
		Str("username", req.Username).
		Msg("new.login.successful")

	return user, nil
}

func (r *Service) LogoutUser(user *jwt.Token) (string, error) {
	claims := user.Claims.(jwt.MapClaims)
	claims["exp"] = time.Now().UTC()
	user.Claims = claims
	token, err := user.SignedString(settings_utils.Settings.SigningKey)
	if err != nil {
		return "", errors.Wrap(err, "logout user")
	}

	return token, nil
}

func saltPassword(password string) (salt string, hashSum string, err error) {
	salt = rand.Text()
	h := sha256.New()
	_, err = h.Write([]byte(salt + password))
	return salt, string(h.Sum(nil)), err
}

var ErrWrongPassword = errors.New("wrong password")
