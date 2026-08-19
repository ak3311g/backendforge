from fastapi import HTTPException, status

class AppError(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class UnauthorizedError(AppError):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)

class NotFoundError(AppError):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)

class ConflictError(AppError):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT)