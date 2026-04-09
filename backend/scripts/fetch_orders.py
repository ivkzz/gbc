import os
import logging
from dotenv import load_dotenv
import retailcrm
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

RETAILCRM_URL = os.getenv("RETAILCRM_URL")
RETAILCRM_API_KEY = os.getenv("RETAILCRM_API")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([RETAILCRM_URL, RETAILCRM_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    logger.error("Не хватает переменных окружения в .env")
    exit(1)

rc_client = retailcrm.v5(RETAILCRM_URL, RETAILCRM_API_KEY)
# Используем supabase API
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_and_sync():
    logger.info("Запрашиваем заказы из RetailCRM...")
    # Забираем первую страницу заказов, лимит 100 для примера (в проде нужна пагинация)
    response = rc_client.orders(limit=100)
    
    if not response.is_successful():
        logger.error(f"Ошибка получения заказов: {response.get_error_msg()}")
        return

    orders_data = response.get_response().get('orders', [])
    logger.info(f"Получено {len(orders_data)} заказов. Начинаем синхронизацию с Supabase.")

    upsert_data = []
    for order in orders_data:
        # Считаем сумму, если она не пришла явно 
        total_sum = order.get('totalSumm') or sum(item.get('initialPrice', 0) * item.get('quantity', 1) for item in order.get('items', []))
        
        upsert_data.append({
            "id": order.get('id'),
            "first_name": order.get('firstName', ''),
            "last_name": order.get('lastName', ''),
            "phone": order.get('phone', ''),
            "email": order.get('email', ''),
            "status": order.get('status', ''),
            "total": total_sum,
            "items": order.get('items', [])
        })

    if upsert_data:
        try:
            # Делаем upsert (чтобы не дублировать старые ID)
            res = supabase.table("orders").upsert(upsert_data).execute()
            logger.info("Успешно выгружено в Supabase.")
        except Exception as e:
            logger.error(f"Ошибка при сохранении в Supabase: {e}")

if __name__ == "__main__":
    fetch_and_sync()
