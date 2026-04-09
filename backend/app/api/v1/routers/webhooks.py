import json
from fastapi import APIRouter, Request, BackgroundTasks, HTTPException, status
from loguru import logger
from app.schemas.webhook import WebhookResponse
from app.schemas.order import OrderData
from app.core.deps import SupabaseRepoDep
from app.services.notification_service import NotificationService

router = APIRouter()

@router.post("/retailcrm", response_model=WebhookResponse, status_code=status.HTTP_200_OK)
async def retailcrm_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    supabase_repo: SupabaseRepoDep
):
    # Самый первый лог - без условий и парсинга
    print(f"!!! [WEBHOOK_ENTRY] Request received FROM: {request.client.host if request.client else 'Unknown'} !!!")
    
    try:
        # Пытаемся прочитать как JSON в любом случае, так как триггеры CRM могут слать разный Content-Type
        body = await request.body()
        try:
            payload = json.loads(body)
            print(f"--- [WEBHOOK] Parsed JSON payload: {payload} ---")
        except:
            # Если не JSON, пробуем как форму
            form_data = await request.form()
            if "order" in form_data:
                payload = {"order": json.loads(str(form_data["order"]))}
            else:
                payload = dict(form_data)
            print(f"--- [WEBHOOK] Parsed Form payload: {payload} ---")
        
    except Exception as e:
        print(f"--- [WEBHOOK_ERROR] Failed to parse payload: {e} ---")
        logger.error(f"Error parsing webhook request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload format")

    # Если данные пришли плоским списком (как в вашем триггере), или через 'order'
    order_raw = payload.get("order") if isinstance(payload, dict) and "order" in payload else payload
    
    # Гарантируем, что ID есть в данных
    if not order_raw.get("id"):
        # Иногда ID может быть в самом payload, если он плоский
        order_raw["id"] = payload.get("id")

    print(f"--- [WEBHOOK] Processing Order Data: {order_raw} ---")
    
    try:
        order_data = OrderData(**order_raw)
        print(f"--- [WEBHOOK] Pydantic Validated. ID: {order_data.id}, Total: {order_data.calculated_total} ---")
    except Exception as e:
        print(f"--- [WEBHOOK_ERROR] Pydantic Validation Failed: {e} ---")
        logger.error(f"Validation error for webhook data: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Schema mismatch: {e}")

    total = order_data.calculated_total
    
    # Сохраняем в Supabase
    print(f"--- [WEBHOOK] Saving to Supabase... ID: {order_data.id} ---")
    supabase_repo.save_order(order_data, total)

    # send_telegram_alert - асинхронная, используем await.
    if total > 50000:
        await NotificationService.send_telegram_alert(order_data, total)

    return {"status": "ok", "message": "Webhook processed successfully"}
