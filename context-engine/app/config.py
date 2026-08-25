import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Context Engine"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./context_engine.db")
    
    # Claude LLM Settings
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")
    
    # Voyage AI Settings
    VOYAGE_API_KEY: str = os.getenv("VOYAGE_API_KEY", "")
    VOYAGE_MODEL: str = os.getenv("VOYAGE_MODEL", "voyage-large-2")
    
    # Auth
    API_KEY_HEADER: str = "X-API-Key"
    STATIC_API_KEY: str = os.getenv("CONTEXT_ENGINE_API_KEY", "test-api-key")
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
