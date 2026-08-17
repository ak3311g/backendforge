package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	JWTSecret   string
}

var AppConfig *Config

func LoadConfig() {
	_ = godotenv.Load() // Loads .env if present

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	AppConfig = &Config{
		Port:        port,
		Environment: os.Getenv("ENVIRONMENT"),
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
	}
}