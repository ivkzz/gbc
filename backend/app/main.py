import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from loguru import logger

from app.core.deps import limiter
from app.schemas.webhook import WebhookResponse
from app.api.v1.routers import webhooks, orders

# Logger configuration
# На Vercel файловая система read-only, поэтому пишем в файл только локально
if not os.environ.get("VERCEL"):
    logger.add("logs/app.log", rotation="500 MB", level="INFO")
else:
    logger.info("Running on Vercel, file logging disabled")

app = FastAPI(
    title="RetailCRM Webhook Listener API",
    description="Production ready webhook listener for RetailCRM integrating with Supabase",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Middleware (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])

@app.get("/", response_model=WebhookResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def read_root(request: Request):
    return {"status": "ok", "message": "RetailCRM Webhook API v1.0.0 is running."}
