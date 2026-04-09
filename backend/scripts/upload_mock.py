import os
import json
import logging
from dotenv import load_dotenv
import retailcrm

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Загружаем переменные окружения
load_dotenv()

RETAILCRM_URL = os.getenv("RETAILCRM_URL")
RETAILCRM_API_KEY = os.getenv("RETAILCRM_API")

if not RETAILCRM_URL or not RETAILCRM_API_KEY:
    logger.error("Убедитесь, что RETAILCRM_URL и RETAILCRM_API заданы в файле .env (например, RETAILCRM_URL=https://ваша_компания.retailcrm.ru)")
    exit(1)

client = retailcrm.v5(RETAILCRM_URL, RETAILCRM_API_KEY)

def upload_mocks(file_path):
    if not os.path.exists(file_path):
        logger.error(f"Файл {file_path} не найден!")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    success_count = 0
    for order in data:
        # Приводим к формату API RetailCRM
        # https://docs.retailcrm.ru/Developers/API/APIv5/Orders/ordersCreate
        # В мок дате есть firstName, lastName, phone, email, orderMethod, orderType, items, delivery -> address
        formatted_order = {
            "firstName": order.get("firstName"),
            "lastName": order.get("lastName"),
            "phone": order.get("phone"),
            "email": order.get("email"),
            "orderType": order.get("orderType", "eshop-individual"),
            "orderMethod": order.get("orderMethod", "shopping-cart"),
            "customFields": order.get("customFields", {}),
            "items": [],
            "delivery": {
                "address": {
                    "city": order.get("delivery", {}).get("address", {}).get("city"),
                    "text": order.get("delivery", {}).get("address", {}).get("text"),
                }
            }
        }
        
        # Обработка товаров
        for item in order.get("items", []):
            formatted_order["items"].append({
                # В RetailCRM для создания товара в заказе обязательно нужен productId или offerId 
                # (если товара нет в CRM, то может не дать создать, однако можно передать productName вместо привязки если настройки CRM позволяют)
                "productName": item.get("productName"),
                "initialPrice": item.get("initialPrice"),
                "quantity": item.get("quantity", 1),
            })
            
        try:
            # Создаем заказ (site=None означает дефолтный сайт)
            response = client.orders_create(formatted_order)
            if response.is_successful():
                logger.info(f"Заказ успешно создан, ID: {response.get_response().get('id')}")
                success_count += 1
            else:
                logger.error(f"Ошибка при создании заказа: {response.get_error_msg()}")
                if response.get_errors():
                    logger.error(f"Детали ошибки: {response.get_errors()}")
        except Exception as e:
            logger.error(f"Исключение при вызове API: {e}")

    logger.info(f"Загрузка завершена. Успешно: {success_count}/{len(data)}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mock_file = os.path.join(current_dir, "..", "..", "mock_orders.json")
    upload_mocks(mock_file)
