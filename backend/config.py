from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "aero_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"

    # Application settings
    APP_TITLE: str = "Aero Database API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # CORS settings - read from environment variable or use defaults
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    # ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    LOG_LVL: str = "DEBUG"

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"


settings = Settings()
