package web

import (
	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	recover2 "github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/gofiber/fiber/v2/middleware/timeout"
	"main.go/services"
	"main.go/utils/settings_utils"
)

type Presentation struct {
	service *services.Service
}

func NewPresentation(service *services.Service) *Presentation {
	return &Presentation{service: service}
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

	app.Get("/api/categories", timeout.NewWithContext(r.listCategories, settings_utils.Settings.Timeout))
	app.Post("/api/categories", timeout.NewWithContext(r.saveCategory, settings_utils.Settings.Timeout))

	app.Post("/api/books", timeout.NewWithContext(r.saveBook, settings_utils.Settings.Timeout))

	return app
}
