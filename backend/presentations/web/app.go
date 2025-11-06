package web

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	recover2 "github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/gofiber/fiber/v2/middleware/timeout"
	"github.com/golang-jwt/jwt/v5"
	"main.go/services/authentification_service"
	book_service "main.go/services/book_service"
	"main.go/services/cart_service"
	category_service "main.go/services/category_service"
	"main.go/utils/settings_utils"
)

type Presentation struct {
	bookService     *book_service.Service
	categoryService *category_service.Service
	authService     *authentification_service.Service
	cartService     *cart_service.Service
}

func NewPresentation(bookService *book_service.Service,
	categoryService *category_service.Service,
	authService *authentification_service.Service,
	cartService *cart_service.Service) *Presentation {
	return &Presentation{bookService: bookService,
		categoryService: categoryService, authService: authService,
		cartService: cartService}
}

func (r *Presentation) BuildApp() *fiber.App {
	app := fiber.New(fiber.Config{
		Immutable: true,
	})
	app.Use(recover2.New(recover2.Config{EnableStackTrace: true}))
	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Format: "${pid} ${locals:requestid} ${status} - ${method} ${path}\n",
	}))

	apiGroup := app.Group("/api")
	apiGroup.Use(jwtware.New(jwtware.Config{SigningKey: jwtware.SigningKey{JWTAlg: jwt.SigningMethodHS256.Name, Key: []byte(settings_utils.Settings.SigningKey)}}))

	app.Get("/metrics", monitor.New(monitor.Config{Title: "Metrics Page"}))

	app.Post("/api/auth/register", r.registerUser)
	app.Post("/api/auth/login", r.loginUser)
	apiGroup.Post("/auth/logout", r.logoutUser)

	app.Get("/api/books", timeout.NewWithContext(r.listBooks, settings_utils.Settings.Timeout))
	app.Get("/api/books/:category", timeout.NewWithContext(r.listBooksByCategory, settings_utils.Settings.Timeout))
	app.Get("/api/books/:id", timeout.NewWithContext(r.bookInfo, settings_utils.Settings.Timeout))
	app.Get("/api/books/search", timeout.NewWithContext(r.searchBooks, settings_utils.Settings.Timeout))

	apiGroup.Post("/books", timeout.NewWithContext(r.saveBook, settings_utils.Settings.Timeout))
	apiGroup.Patch("/books/:id", timeout.NewWithContext(r.updateBook, settings_utils.Settings.Timeout))
	apiGroup.Delete("/books/:id", timeout.NewWithContext(r.deleteBook, settings_utils.Settings.Timeout))

	app.Get("/api/categories", timeout.NewWithContext(r.listCategories, settings_utils.Settings.Timeout))

	apiGroup.Post("/categories", timeout.NewWithContext(r.saveCategory, settings_utils.Settings.Timeout))
	apiGroup.Patch("categories/:id", timeout.NewWithContext(r.updateCategory, settings_utils.Settings.Timeout))
	apiGroup.Delete("/categories/:id", timeout.NewWithContext(r.deleteCategory, settings_utils.Settings.Timeout))

	apiGroup.Get("/cart", timeout.NewWithContext(r.getCart, settings_utils.Settings.Timeout))
	apiGroup.Post("/cart", timeout.NewWithContext(r.addToCart, settings_utils.Settings.Timeout))
	apiGroup.Delete("/cart/:id", timeout.NewWithContext(r.deleteFromCart, settings_utils.Settings.Timeout))

	return app
}
