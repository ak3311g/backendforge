package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterHandler(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	res, err := Register(input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": res})
}

func LoginHandler(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	res, err := Login(input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": res})
}

func MeHandler(c *gin.Context) {
	userID, _ := c.Get("userID")
	email, _ := c.Get("email")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user": gin.H{
				"id":    userID,
				"email": email,
			},
		},
	})
}