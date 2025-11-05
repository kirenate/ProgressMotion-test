package main

import (
	"fmt"
	"github.com/pkg/errors"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
	"main.go/presentations/web"
	"main.go/repositories/book_repository"
	"main.go/repositories/category_repository"
	"main.go/repositories/user_repository"
	"main.go/schemas"
	"main.go/services/authentification_service"
	book_service "main.go/services/book_service"
	category_service "main.go/services/category_service"
	"main.go/utils/settings_utils"
)

func main() {

	dsn := fmt.Sprintf("%s:%s@tcp(%v:%v)/%s?charset=utf8mb4&parseTime=True",
		settings_utils.Settings.MysqlUser, settings_utils.Settings.MysqlPass,
		settings_utils.Settings.MysqlHost, settings_utils.Settings.MysqlPort,
		settings_utils.Settings.MysqlDbname)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), NamingStrategy: schema.NamingStrategy{SingularTable: true}})
	if err != nil {
		panic(errors.Wrap(err, "failed to connect database"))
	}

	err = db.AutoMigrate(&schemas.Book{}, &schemas.Category{})
	if err != nil {
		panic(errors.Wrap(err, "failed to merge database"))
	}

	bookRepo := book_repository.NewRepository(db)
	categoryRepo := category_repository.NewRepositpory(db)
	userRepo := user_repository.NewRepository(db)

	bookService := book_service.NewService(bookRepo)
	categoryService := category_service.NewService(categoryRepo)
	authService := authentification_service.NewService(userRepo)

	presentation := web.NewPresentation(bookService, categoryService, authService)

	app := presentation.BuildApp()

	err = app.Listen(settings_utils.Settings.ServerUrl)
	if err != nil {
		panic(errors.Wrap(err, "failed to start server"))
	}
}
