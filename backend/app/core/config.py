# app/core/config.py (Just change this line)
import os
from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path

class Settings(BaseSettings):
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DEBUG: bool = True
    API_TITLE: str = "Financial Literacy Budget Planner API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "AI-powered budget categorization and financial planning API"
    
    # Security Configuration
    SECRET_KEY: str = "your-super-secret-key-change-in-production-2025-finzer"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # 🔥 Database Configuration - ONLY THIS LINE CHANGED
    MONGODB_URL: str = "mongodb+srv://ritzzz8799_db_user:MXyTDGZSnXp2wven@finzer.uyxtkp6.mongodb.net/finzer_db?retryWrites=true&w=majority"
    DATABASE_NAME: str = "finzer_db"
    
    # AI / ML API Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    ENABLE_CHATBOT_MODEL: bool = os.getenv("ENABLE_CHATBOT_MODEL", "False").lower() in ("true", "1", "yes")

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "https://fin-zer-vnek.vercel.app/"
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
    ALLOWED_METHODS: List[str] = ["*"]
    ALLOWED_HEADERS: List[str] = ["*"]
    ALLOW_CREDENTIALS: bool = True
    
    # ML Model Configuration
    ML_MODEL_PATH: str = "./app/models/ml_models/"
    MODEL_FILE_NAME: str = "expense_classifier.pkl"
    DATASET_FILE_NAME: str = "transactions_dataset.csv"
    ENABLE_ML_LOGGING: bool = True
    MODEL_AUTO_RETRAIN: bool = False
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Background Tasks
    ENABLE_BACKGROUND_TASKS: bool = True
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

# Create directories
import os
os.makedirs(settings.ML_MODEL_PATH, exist_ok=True)
os.makedirs(Path(settings.LOG_FILE).parent, exist_ok=True)

print(f"✅ Settings loaded: {settings.API_TITLE} v{settings.API_VERSION}")
print(f"✅ Database: {settings.DATABASE_NAME}")
print(f"✅ MongoDB URL: MongoDB Atlas Cloud") # 🔥 Updated message
