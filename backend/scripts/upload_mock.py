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

    # Формируем все заказы в нужный формат
    batch_orders = []
    for order in data:
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
        
        for item in order.get("items", []):
            formatted_order["items"].append({
                "productName": item.get("productName"),
                "initialPrice": item.get("initialPrice"),
                "quantity": item.get("quantity", 1),
            })
            
        batch_orders.append(formatted_order)

    # В RetailCRM можно отправлять до 50 заказов пакетом за 1 запрос
    # Поскольку у нас ровно 50 (или около того), мы можем отправить их одним махом.
    # Если бы было больше, мы бы разбили их на чанки по 50:
    for i in range(0, len(batch_orders), 50):
        chunk = batch_orders[i:i+50]
        try:
            logger.info(f"Отправка пакета из {len(chunk)} заказов...")
            response = client.orders_upload(chunk)
            
            if response.is_successful():
                # Возвращает {"success": True, "uploadedOrders": [...]}
                uploaded = response.get_response().get("uploadedOrders", [])
                logger.info(f"Успешно создано {len(uploaded)} заказов в этом пакете!")
            else:
                logger.error(f"Ошибка при пакетной загрузке: {response.get_error_msg()}")
                if response.get_errors():
                    logger.error(f"Детали ошибки: {response.get_errors()}")
        except Exception as e:
            logger.error(f"Исключение при вызове пакетного API: {e}")

    logger.info("Процесс загрузки завершен!")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mock_file = os.path.join(current_dir, "..", "..", "mock_orders.json")
    upload_mocks(mock_file)
