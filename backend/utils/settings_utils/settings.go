package settings_utils

import (
	"context"
	"encoding/json"
	"github.com/rs/zerolog"
	"io"
	"os"
	"time"
)

type Setting struct {
	ServerUrl string `json:"SERVER_URL"`

	MysqlUser   string `json:"MYSQL_USER"`
	MysqlPass   string `json:"MYSQL_PASS"`
	MysqlHost   string `json:"MYSQL_HOST"`
	MysqlPort   uint16 `json:"MYSQL_PORT"`
	MysqlDbname string `json:"MYSQL_DBNAME"`

	TimeoutString string `json:"TIMEOUT"`
	Timeout       time.Duration

	SigningKey   string `json:"SIGNING_KEY"`
	JwtTtlString string `json:"JWT_TTL"`
	JwtTtl       time.Duration

	AdminKey string `json:"ADMIN_KEY"`

	Cors string `json:"CORS"`
}

func NewConfig() *Setting {
	envFile, err := os.Open("./dev_env.json")
	if err != nil {
		panic(err)
	}
	env, err := io.ReadAll(envFile)
	if err != nil {
		panic(err)
	}
	var set Setting
	err = json.Unmarshal(env, &set)
	if err != nil {
		panic(err)
	}

	set.Timeout, err = time.ParseDuration(set.TimeoutString)
	if err != nil {
		panic(err)
	}

	set.JwtTtl, err = time.ParseDuration(set.JwtTtlString)
	if err != nil {
		panic(err)
	}

	zerolog.Ctx(context.Background()).Info().Msg("config.created")
	return &set
}

var Settings = NewConfig()
