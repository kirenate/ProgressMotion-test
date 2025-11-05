package web

import (
	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	recover2 "github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/gofiber/fiber/v2/middleware/timeout"
	book_service "main.go/services/book_service"
	category_service "main.go/services/category_service"
	"main.go/utils/settings_utils"
)

type Presentation struct {
	bookService     *book_service.Service
	categoryService *category_service.Service
}

func NewPresentation(bookService *book_service.Service, categoryService *category_service.Service) *Presentation {
	return &Presentation{bookService: bookService, categoryService: categoryService}
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
	app.Get("/api/metrics", monitor.New(monitor.Config{Title: "Metrics Page"}))

	app.Get("/api/books", timeout.NewWithContext(r.listBooks, settings_utils.Settings.Timeout))
	app.Get("/api/books/:category", timeout.NewWithContext(r.listBooksByCategory, settings_utils.Settings.Timeout))
	app.Get("/api/books/:id", timeout.NewWithContext(r.bookInfo, settings_utils.Settings.Timeout))
	app.Post("/api/books", timeout.NewWithContext(r.saveBook, settings_utils.Settings.Timeout))
	app.Delete("/api/books/:id", timeout.NewWithContext(r.deleteBook, settings_utils.Settings.Timeout))

	app.Get("/api/categories", timeout.NewWithContext(r.listCategories, settings_utils.Settings.Timeout))
	app.Post("/api/categories", timeout.NewWithContext(r.saveCategory, settings_utils.Settings.Timeout))
	app.Delete("/api/categories/:id", timeout.NewWithContext(r.deleteCategory, settings_utils.Settings.Timeout))

	return app
}
