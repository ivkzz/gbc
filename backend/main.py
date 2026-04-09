import os
import requests
import logging
from typing import Any, Dict
from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RetailCRM Webhook Listener")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "RetailCRM Webhook Listener is running. Webhook endpoint is at POST /webhooks/retailcrm"}

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN")
TG_CHAT_ID = os.getenv("TG_CHAT_ID")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    logger.warning("Supabase credentials are not set. DB syncing will fail.")
    supabase = None

def get_order_total(order_data: Dict[str, Any]) -> float:
    """Извлечение суммы заказа"""
    if "totalSumm" in order_data:
        return float(order_data["totalSumm"])
    # Если нет явной суммы, пробуем сложить стоимости (только для моков/тестов)
    total = sum(float(item.get("initialPrice", 0)) * int(item.get("quantity", 1)) for item in order_data.get("items", []))
    return total

def send_telegram_notification(order: Dict[str, Any], total: float):
    """Отпрака уведомления в тг"""
    if not TG_BOT_TOKEN or not TG_CHAT_ID:
        logger.warning("Telegram token or chat_id is missing. Notification not sent.")
        return

    text = (
        f"🔥 **Новый крупный заказ!**\n\n"
        f"**ID заказа:** {order.get('id', 'N/A')}\n"
        f"**Сумма:** {total} ₸\n"
        f"**Клиент:** {order.get('firstName', '')} {order.get('lastName', '')}\n"
        f"**Телефон:** {order.get('phone', 'N/A')}\n"
    )

    url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TG_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown"
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        logger.info(f"Telegram alert sent for order {order.get('id')}")
    except Exception as e:
        logger.error(f"Failed to send Telegram alert: {e}")

def save_order_to_supabase(order: Dict[str, Any], total: float):
    """Сохраняем или обновляем заказ в Supabase"""
    if not supabase:
        return

    data = {
        "id": order.get('id'),
        "first_name": order.get('firstName', ''),
        "last_name": order.get('lastName', ''),
        "phone": order.get('phone', ''),
        "email": order.get('email', ''),
        "status": order.get('status', ''),
        "total": total,
        "items": order.get('items', [])
    }

    try:
        supabase.table("orders").upsert([data]).execute()
        logger.info(f"Order {order.get('id')} synced to Supabase")
    except Exception as e:
        logger.error(f"Error saving to supabase: {e}")

@app.post("/webhooks/retailcrm")
async def retailcrm_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Эндпоинт для вебхуков от RetailCRM.
    Обрабатываем формально x-www-form-urlencoded или json, смотря как настроено в CRM.
    Обычно RetailCRM шлет POST-запросы.
    """
    try:
        # Пытаемся распарсить как json или form-data
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            payload = await request.json()
        else:
            form_data = await request.form()
            # В RetailCRM вебхуки часто приходят в поле 'order' в формате JSON.
            import json
            if "order" in form_data:
                payload = {"order": json.loads(form_data["order"])}
            else:
                payload = dict(form_data)
                
        # Логгируем для отладки
        logger.info(f"Received webhook: {payload}")
        
    except Exception as e:
        logger.error(f"Error parsing webhook request: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Предположим, RetailCRM присылает данные заказа внутри поля 'order' (или если это прямо объект)
    order_data = payload.get("order") if "order" in payload else payload

    # Получаем сумму
    total = get_order_total(order_data)

    # 1. Запустить сохранение в Supabase в фоне
    background_tasks.add_task(save_order_to_supabase, order_data, total)

    # 2. Если сумма > 50000, послать уведомление
    if total > 50000:
        logger.info(f"Order total {total} > 50000. Trigering Telegram alert.")
        background_tasks.add_task(send_telegram_notification, order_data, total)

    return {"status": "ok"}
