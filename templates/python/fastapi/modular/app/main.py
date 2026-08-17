from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import Base, engine
from app.modules.health.router import router as health_router
from app.modules.auth.router import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables on startup if they don't exist
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Module Routers
app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}!",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)