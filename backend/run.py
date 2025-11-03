#!/usr/bin/env python3
"""
Financial Literacy Budget API
Run script for development and production
"""
import uvicorn
import sys
from pathlib import Path

# Add app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

from app.core.config import settings


def main():
    """Main function to run the API server"""
    print("🏦 Financial Literacy Budget Planner API")
    print("=" * 50)
    print(f"🌐 Server: http://{settings.API_HOST}")
    print(f"📚 Docs: http://{settings.API_HOST}")
    print(f"🔧 Debug Mode: {settings.API_DEBUG}")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        reload=settings.API_DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True
    )


if __name__ == "__main__":
    main()
