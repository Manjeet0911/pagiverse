from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    APPLICATION SETTINGS LAYER: Uses Pydantic to tightly bind and validate 
    environment configurations directly from your root .env template file.
    """
    DATABASE_URL: str
    GEMINI_API_KEY: str  # FIXED: Swapped GROQ validation guard with your active Gemini API field token

    # Configures the engine to read files targeting specific environment layout properties
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Gracefully ignores other extra keys if present inside the file
    )

settings = Settings()