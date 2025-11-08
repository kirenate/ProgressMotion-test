package schemas

import (
	"github.com/google/uuid"
	"time"
)

type Book struct {
	ID          uuid.UUID   `json:"id" gorm:"primaryKey"`
	Name        string      `json:"name"`
	Authors     []string    `json:"authors" gorm:"serializer:json"`
	Price       int         `json:"price"`
	Description string      `json:"desc"`
	Categories  []uuid.UUID `json:"categories,omitempty" gorm:"serializer:json"`
	CreatedAt   time.Time   `json:"createdAt,omitempty"`
	UpdatedAt   time.Time   `json:"updatedAt,omitempty"`
	DeletedAt   time.Time   `json:"deletedAt,omitempty" gorm:"default:NULL"`
}

type Category struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"unique"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	DeletedAt time.Time `json:"deletedAt,omitempty" gorm:"default:NULL"`
}

type Cart struct {
	ID         uuid.UUID   `json:"id" gorm:"primaryKey"`
	UserId     uuid.UUID   `json:"userId"`
	BookIds    []uuid.UUID `json:"bookIds" gorm:"serializer:json"`
	TotalPrice int         `json:"totalPrice"`
	CreatedAt  time.Time   `json:"createdAt"`
	UpdatedAt  time.Time   `json:"updatedAt"`
	DeletedAt  time.Time   `json:"deletedAt,omitempty" gorm:"default:NULL"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Key      string `json:"key,omitempty"`
}
