import time

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from backend.config import settings
from backend.database.database import db
from backend.routes import (
    experiments,
    geometries,
    objects,
    reports,
    sources,
)
from logger.setup import logger, logger_route


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to database
    await db.connect()
    logger.info("Application started")
    yield
    # Shutdown: disconnect from database
    await db.disconnect()
    logger.info("Application stopped")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    redirect_slashes=False
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(experiments.router, prefix=settings.API_PREFIX)
app.include_router(geometries.router, prefix=settings.API_PREFIX)
app.include_router(objects.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(sources.router, prefix=settings.API_PREFIX)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Aero Database API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Try to query database
        await db.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


# Middleware для логирования запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # думаю время начала запроса не самый надежный идентификатор запроса, но пока сойдет

    logger_route.info(f"Request: {start_time} : {request.method} {request.url.path}")

    response: Response = await call_next(request)

    process_time = time.time() - start_time
    logger_route.info(f"Response: {start_time} : {response.status_code} - {process_time:.3f}s")

    return response


if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_config=None  # Отключаем встроенный логгер uvicorn
    )
