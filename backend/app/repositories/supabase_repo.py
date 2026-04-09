from typing import Optional
from supabase import Client
from loguru import logger
from app.schemas.order import OrderData

class SupabaseRepo:
    def __init__(self, client: Optional[Client]):
        self.client = client

    def save_order(self, order: OrderData, total: float):
        if not self.client:
            logger.warning("No logic executed: Supabase client is missing.")
            return

        data = {
            "id": order.id,
            "first_name": order.firstName,
            "last_name": order.lastName,
            "phone": order.phone,
            "email": order.email,
            "status": order.status,
            "total": total,
            "items": [item.model_dump() for item in order.items]
        }

        try:
            self.client.table("orders").upsert([data]).execute()
            logger.info(f"Order {order.id} synced to Supabase")
        except Exception as e:
            logger.error(f"Error saving to supabase: {e}")
