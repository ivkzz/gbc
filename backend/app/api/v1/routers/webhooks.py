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
    """
    Эндпоинт для вебхуков от RetailCRM.
    Обрабатываем формально x-www-form-urlencoded или json.
    """
    try:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            payload = await request.json()
        else:
            form_data = await request.form()
            if "order" in form_data:
                payload = {"order": json.loads(str(form_data["order"]))}
            else:
                payload = dict(form_data)
                
        logger.debug("Received webhook payload")
    except Exception as e:
        logger.error(f"Error parsing webhook request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload format")

    order_raw = payload.get("order") if "order" in payload else payload
    
    try:
        order_data = OrderData(**order_raw)
    except Exception as e:
        logger.error(f"Validation error for webhook data: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid order schema")

    total = order_data.calculated_total

    # Business Logic Layer orchestration
    background_tasks.add_task(supabase_repo.save_order, order_data, total)

    if total > 50000:
        background_tasks.add_task(NotificationService.send_telegram_alert, order_data, total)

    return {"status": "ok", "message": "Webhook processed successfully"}
