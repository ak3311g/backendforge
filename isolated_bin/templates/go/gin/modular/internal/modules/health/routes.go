package health

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

var startTime = time.Now()

func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"uptime":    time.Since(startTime).String(),
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})
}