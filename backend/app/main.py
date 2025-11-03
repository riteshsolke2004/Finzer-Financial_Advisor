# app/main.py
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import time
import logging
import os

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, check_database_health
from app.utils.logger import setup_logging
from app.models.ml_models.budget_categorizer import budget_categorizer

# Routers
from app.api.routers import auth, budget, investment, chatbot

# Import profile router
try:
    from app.api.routers import profile
    PROFILE_ROUTER_AVAILABLE = True
except ImportError:
    PROFILE_ROUTER_AVAILABLE = False
    logging.warning("Profile router not available")

# Setup logging
logger = setup_logging()

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup & shutdown events"""
    # Startup
    logger.info(f"🚀 Starting {settings.API_TITLE} v{settings.API_VERSION}")

    # DB connect
    try:
        await connect_to_mongo()
        logger.info("✅ Connected to MongoDB")
    except Exception as e:
        logger.error(f"❌ Failed to connect to database: {e}")
        logger.error("⚠️ Application will continue but authentication may not work")

    # ML model check
    logger.info(f"📊 ML Model Status: {'Ready' if budget_categorizer.is_trained else 'Not Ready'}")
    if not budget_categorizer.is_trained:
        logger.warning("⚠️ ML model not ready. Some budget features may be limited.")

    yield

    # Shutdown
    logger.info("🛑 Shutting down FinZer API...")
    await close_mongo_connection()

# FastAPI app instance
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

# Trusted Host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0", "*"]
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add X-Process-Time header to each response"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Custom exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"❌ Validation error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation Error",
            "detail": exc.errors(),
            "message": "Please check your input data format"
        }
    )

@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    logger.error(f"❌ Internal server error on {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later."
        }
    )

# Routers
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(budget.router, prefix="/api/v1", tags=["Budget"])
app.include_router(investment.router, prefix="/api/v1", tags=["Investment"])
app.include_router(chatbot.router, prefix="/api/v1", tags=["Chatbot"])


# Include profile router if available
if PROFILE_ROUTER_AVAILABLE:
    app.include_router(profile.router, prefix="/api/v1")
    logger.info("✅ Profile router included")

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    db_healthy = await check_database_health()
    return {
        "message": f"🏦 {settings.API_TITLE}",
        "version": settings.API_VERSION,
        "status": "running",
        "docs": "/docs",
        "database": "connected" if db_healthy else "disconnected",
        "ml_model_ready": budget_categorizer.is_trained,
        "endpoints": {
            "auth": "/api/v1/auth",
            "budget": {
                "categorize": "/api/v1/budget/categorize",
                "batch_categorize": "/api/v1/budget/batch-categorize",
                "model_info": "/api/v1/budget/model-info",
                "health": "/api/v1/budget/health"
            },
            "investment": "/api/v1/investment",
            "chatbot": "/api/v1/chatbot"
        }
    }

# Health endpoint
@app.get("/health", tags=["Root"])
async def health_check():
    db_healthy = await check_database_health()
    return {
        "status": "healthy" if db_healthy and budget_categorizer.is_trained else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "ml_model": "ready" if budget_categorizer.is_trained else "not_ready",
        "version": settings.API_VERSION,
        "message": (
            "All systems operational"
            if db_healthy and budget_categorizer.is_trained
            else "Some services are not fully operational"
        )
    }

# Uvicorn entrypoint
if __name__ == "__main__":
    import uvicorn
    logger.info(f"🚀 Starting server on {settings.API_HOST}")
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=int(os.getenv("PORT", 8000)),
        reload=settings.API_DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
