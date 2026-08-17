from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.middleware.auth import get_current_user
from app.modules.auth.models import User
from app.modules.auth.schemas import UserRegister, UserLogin, AuthResponse, UserResponse
from app.modules.auth.service import AuthService

router = APIRouter()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    return AuthService.register(db, payload)

@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    return AuthService.login(db, payload)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user