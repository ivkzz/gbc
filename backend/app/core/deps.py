import retailcrm
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

def get_retailcrm_client():
    if settings.retailcrm_url and settings.retailcrm_api:
        logger.info(f"Initializing RetailCRM client for {settings.retailcrm_url}")
        return retailcrm.v5(settings.retailcrm_url, settings.retailcrm_api)
    
    logger.warning(f"RetailCRM credentials missing. URL: {'OK' if settings.retailcrm_url else 'MISSING'}, API: {'OK' if settings.retailcrm_api else 'MISSING'}")
    return None

SupabaseRepoDep = Annotated[SupabaseRepo, Depends(get_supabase_repo)]
RetailCRMDep = Annotated[Optional[object], Depends(get_retailcrm_client)]
