from datetime import datetime, timedelta, timezone
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import jwt
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.errors.exceptions import ConflictError, UnauthorizedError
from app.modules.auth.models import User
from app.modules.auth.schemas import UserRegister, UserLogin

ph = PasswordHasher()

class AuthService:
    @staticmethod
    def create_access_token(user_id: str, email: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": user_id,
            "email": email,
            "exp": expire
        }
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

    @classmethod
    def register(cls, db: Session, payload: UserRegister) -> dict:
        existing_user = db.query(User).filter(User.email == payload.email).first()
        if existing_user:
            raise ConflictError("Email is already registered")

        hashed_password = ph.hash(payload.password)
        new_user = User(
            email=payload.email,
            password=hashed_password,
            name=payload.name
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = cls.create_access_token(new_user.id, new_user.email)
        return {"user": new_user, "token": token}

    @classmethod
    def login(cls, db: Session, payload: UserLogin) -> dict:
        user = db.query(User).filter(User.email == payload.email).first()
        if not user:
            raise UnauthorizedError("Invalid email or password")

        try:
            ph.verify(user.password, payload.password)
        except VerifyMismatchError:
            raise UnauthorizedError("Invalid email or password")

        token = cls.create_access_token(user.id, user.email)
        return {"user": user, "token": token}