from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.config.database import get_db
from app.errors.exceptions import UnauthorizedError
from app.modules.auth.models import User

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise UnauthorizedError("Invalid token claims")
    except JWTError:
        raise UnauthorizedError("Token is invalid or expired")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise UnauthorizedError("User no longer exists")

    return user