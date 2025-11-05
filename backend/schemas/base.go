package schemas

import (
	"github.com/google/uuid"
	"time"
)

type Book struct {
	ID          uuid.UUID   `json:"id" gorm:"primaryKey"`
	Name        string      `json:"name"`
	Authors     []string    `json:"authors"`
	Price       int         `json:"price"`
	Description string      `json:"desc,omitempty"`
	Categories  []uuid.UUID `json:"category,omitempty"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
	DeletedAt   time.Time   `json:"deletedAt"`
}

type Category struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"unique"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	DeletedAt time.Time `json:"deletedAt"`
}

type Cart struct {
	ID      uuid.UUID   `json:"id" gorm:"primaryKey"`
	UserId  uuid.UUID   `json:"userId"`
	BookIds []uuid.UUID `json:"bookIds"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}
