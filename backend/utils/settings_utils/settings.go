package settings_utils

import (
	"context"
	"github.com/joeshaw/envdecode"
	"github.com/rs/zerolog"
	"time"
)

type Setting struct {
	ServerUrl string `env:"SERVER_URL,default=localhost:8080"`

	MysqlUser   string `env:"MYSQL_USER,default=user"`
	MysqlPass   string `env:"MYSQL_PASS,default=pass"`
	MysqlHost   string `env:"MYSQL_HOST,default=localhost"`
	MysqlPort   uint16 `env:"MYSQL_PORT,default=3306"`
	MysqlDbname string `env:"MYSQL_DBNAME,default=dbname"`

	Timeout time.Duration `env:"TIMEOUT,default=1m,strict"`

	SigningKey string        `env:"SIGNING_KEY"`
	JwtTtl     time.Duration `env:"JWT_TTL"`
}

func NewConfig() *Setting {
	var set Setting
	err := envdecode.Decode(&set)
	if err != nil {
		panic(err)
	}

	zerolog.Ctx(context.Background()).Info().Msg("config.created")
	return &set
}

var Settings = NewConfig()
