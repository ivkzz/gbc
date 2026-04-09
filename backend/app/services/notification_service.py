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
            f"🚀 <b>Новый заказ в GBC!</b>\n\n"
            f"🆔 <b>ID:</b> <code>{order.id}</code>\n"
            f"💰 <b>Сумма:</b> <code>{total:,.0f} ₸</code>\n"
            f"👤 <b>Клиент:</b> {order.firstName} {order.lastName}\n"
            f"📞 <b>Тел:</b> {order.phone}\n"
        )
        text = text.replace(",", " ")

        url = f"https://api.telegram.org/bot{settings.tg_bot_token}/sendMessage"
        payload = {
            "chat_id": settings.tg_chat_id,
            "text": text,
            "parse_mode": "HTML"
        }

        async with httpx.AsyncClient() as client:
            try:
                print(f"--- [NOTIFICATION] Sending Telegram alert for Order {order.id}... ---")
                resp = await client.post(url, json=payload, timeout=10)
                if resp.status_code != 200:
                    print(f"!!! [NOTIFICATION_ERROR] Telegram API returned {resp.status_code}: {resp.text} !!!")
                resp.raise_for_status()
                print(f"--- [NOTIFICATION] Telegram alert sent successfully! ---")
                logger.info(f"Telegram alert sent for order {order.id}")
            except Exception as e:
                print(f"!!! [NOTIFICATION_ERROR] Telegram request failed: {e} !!!")
                logger.error(f"Failed to send Telegram alert: {e}")
