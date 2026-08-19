package auth

import (
	"errors"
	"time"

	"my-gin-backend/internal/config"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func GenerateJWT(userID, email string) (string, error) {
	claims := jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

func Register(input RegisterInput) (*AuthResponse, error) {
	var count int64
	config.DB.Model(&User{}).Where("email = ?", input.Email).Count(&count)
	if count > 0 {
		return nil, errors.New("email is already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := User{
		Email:    input.Email,
		Password: string(hashedPassword),
		Name:     input.Name,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return nil, err
	}

	token, err := GenerateJWT(user.ID, user.Email)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User: UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		},
		Token: token,
	}, nil
}

func Login(input LoginInput) (*AuthResponse, error) {
	var user User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return nil, errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	token, err := GenerateJWT(user.ID, user.Email)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User: UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		},
		Token: token,
	}, nil
}