from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    APPLICATION SETTINGS LAYER: Uses Pydantic to tightly bind and validate 
    environment configurations directly from your root .env template file.
    Tailored explicitly for the multi-key API rotator matrix.
    """
    DATABASE_URL: str
    PROJECT_NAME: str = "AI PDF Study Companion"

    # 🔑 MULTI-KEY FAILOVER CONFIGURATION HOOKS
    GEMINI_API_KEY_PRIMARY: str
    GEMINI_API_KEY_SECONDARY: Optional[str] = None
    GEMINI_API_KEY_TERTIARY: Optional[str] = None
    
    # Optional Third-Party Fallback Core
    GROQ_API_KEY: Optional[str] = None

    @property
    def GEMINI_API_KEY(self) -> str:
        """
        Backward compatibility layer. If any older service module tries to 
        read settings.GEMINI_API_KEY, it automatically routes to the Primary Key.
        """
        return self.GEMINI_API_KEY_PRIMARY

    # Configures the engine to read files targeting specific environment layout properties
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Gracefully ignores extra keys if present inside the file
    )

settings = Settings()