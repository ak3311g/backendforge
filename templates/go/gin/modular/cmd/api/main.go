package main

import (
	"log"

	"my-gin-backend/internal/config"
	"my-gin-backend/internal/modules/auth"
	"my-gin-backend/internal/modules/health"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	config.ConnectDB()

	// Auto migrate schema
	if err := config.DB.AutoMigrate(&auth.User{}); err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}

	r := gin.Default()
	r.Use(cors.Default())

	api := r.Group("/api/v1")
	{
		health.RegisterRoutes(api.Group("/health"))
		auth.RegisterRoutes(api.Group("/auth"))
	}

	log.Printf("🚀 Server running on port %s", config.AppConfig.Port)
	if err := r.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}