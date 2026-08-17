package auth

import (
	"my-gin-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup) {
	r.POST("/register", RegisterHandler)
	r.POST("/login", LoginHandler)
	r.GET("/me", middleware.AuthRequired(), MeHandler)
}