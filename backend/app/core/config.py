from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Определяем путь к .env в корне проекта
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    retailcrm_url: str = ""
    retailcrm_api: str = ""
    tg_bot_token: str = ""
    tg_chat_id: str = ""
    
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
