from fastapi import APIRouter, HTTPException, status
from loguru import logger
from app.schemas.order import OrderData
from app.core.deps import RetailCRMDep

router = APIRouter()

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderData,
    crm_client: RetailCRMDep
):
    """
    Эндпоинт для создания заказа. 
    Отправляет заказ в RetailCRM. Сохранение в БД произойдет через вебхук.
    """
    if not crm_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="RetailCRM client is not configured"
        )

    # 1. Подготовка данных для RetailCRM
    crm_order = {
        "firstName": order.firstName,
        "lastName": order.lastName,
        "phone": order.phone,
        "email": order.email,
        "orderType": order.orderType or "eshop-individual",
        "orderMethod": order.orderMethod or "shopping-cart",
        "items": [
            {
                "productName": item.productName,
                "initialPrice": item.initialPrice,
                "quantity": item.quantity
            } for item in order.items
        ]
    }

    try:
        # Отправляем в RetailCRM
        response = crm_client.order_create(crm_order)
        
        if response.is_successful():
            crm_id = response.get_response().get("id")
            logger.info(f"Order created in RetailCRM with ID: {crm_id}. Waiting for webhook for DB sync.")
            
            return {
                "status": "ok",
                "message": "Order created in RetailCRM. Syncing via webhook soon.",
                "id": crm_id
            }
        else:
            error_msg = response.get_error_msg()
            logger.error(f"RetailCRM error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"RetailCRM Error: {error_msg}"
            )
            
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
