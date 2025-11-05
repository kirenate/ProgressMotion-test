package main

import (
	"fmt"
	"github.com/pkg/errors"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
	"main.go/presentations/web"
	"main.go/repositories"
	"main.go/schemas"
	"main.go/services"
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

	repository := repositories.NewRepository(db)

	service := services.NewService(repository)

	presentation := web.NewPresentation(service)

	app := presentation.BuildApp()

	err = app.Listen(settings_utils.Settings.ServerUrl)
	if err != nil {
		panic(errors.Wrap(err, "failed to start server"))
	}
}
