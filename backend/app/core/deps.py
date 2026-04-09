from typing import Optional, Annotated
from fastapi import Depends
from supabase import create_client, Client
from loguru import logger
from app.core.config import settings
from app.repositories.supabase_repo import SupabaseRepo
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

def get_supabase_client() -> Optional[Client]:
    if settings.supabase_url and settings.supabase_key:
        return create_client(settings.supabase_url, settings.supabase_key)
    logger.warning("Supabase credentials missing.")
    return None

def get_supabase_repo(client: Optional[Client] = Depends(get_supabase_client)) -> SupabaseRepo:
    return SupabaseRepo(client=client)

SupabaseRepoDep = Annotated[SupabaseRepo, Depends(get_supabase_repo)]
