import httpx
from loguru import logger
from app.core.config import settings
from app.schemas.order import OrderData

class NotificationService:
    @staticmethod
    async def send_telegram_alert(order: OrderData, total: float):
        if not settings.tg_bot_token or not settings.tg_chat_id:
            logger.warning("Telegram config missing. Alert not sent.")
            return

        text = (
            f"🔥 **Новый крупный заказ!**\n\n"
            f"**ID заказа:** {order.id}\n"
            f"**Сумма:** {total} ₸\n"
            f"**Клиент:** {order.firstName} {order.lastName}\n"
            f"**Телефон:** {order.phone}\n"
        )

        url = f"https://api.telegram.org/bot{settings.tg_bot_token}/sendMessage"
        payload = {
            "chat_id": settings.tg_chat_id,
            "text": text,
            "parse_mode": "Markdown"
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, json=payload, timeout=10)
                resp.raise_for_status()
                logger.info(f"Telegram alert sent for order {order.id}")
            except Exception as e:
                logger.error(f"Failed to send Telegram alert: {e}")
