import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Invoice Automation API"
    VERSION: str = "1.0.0"
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://enlight_sales_os_user:enlight_sales_os_password@localhost:5432/enlight_sales_os_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Auth
    JWT_SECRET_KEY: str = "enlight-sales-os-super-secret-jwt-key-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # File Upload
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    # AWS S3 Storage (optional, for future cloud deployment)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: str = "invoice-automation-documents"

    # Google Gemini AI Config
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TEMPERATURE: float = 0.0
    GEMINI_MAX_OUTPUT_TOKENS: int = 2048

    # Business Rule Tolerances
    DEFAULT_WEIGHT_TOLERANCE_PERCENT: float = 1.0

    # Zoho Books API Config
    ZOHO_CLIENT_ID: str = ""
    ZOHO_CLIENT_SECRET: str = ""
    ZOHO_REFRESH_TOKEN: str = ""
    ZOHO_ORGANIZATION_ID: str = ""
    ZOHO_ORG_ID: str = ""  # Alias from .env.production
    ZOHO_ACCOUNTS_URL: str = "https://accounts.zoho.in"
    ZOHO_BOOKS_API_URL: str = "https://www.zohoapis.in/books/v3"

    # WhatsApp / Twilio Business API
    WHATSAPP_ACCOUNT_SID: str = ""
    WHATSAPP_AUTH_TOKEN: str = ""
    WHATSAPP_NUMBER: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""

    # n8n Automation
    N8N_WEBHOOK_URL: str = "http://localhost:5679"

    # Statutory Constraints
    FORCE_DRAFT_STATUS: bool = True
    HARD_LOCK_PO_SELLING_RATE: bool = True
    MAX_WEIGHT_TOLERANCE_PCT: float = 1.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def effective_zoho_org_id(self) -> str:
        """Returns ZOHO_ORGANIZATION_ID, falling back to ZOHO_ORG_ID."""
        return self.ZOHO_ORGANIZATION_ID or self.ZOHO_ORG_ID

settings = Settings()
