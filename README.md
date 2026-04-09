# Интеграция RetailCRM, Supabase и Дашборд на Next.js

Проект отслеживает поток заказов из RetailCRM (webhook/sync), сохраняет их в Supabase и визуализирует на дашборде. Telegram-уведомления приходят для заказов свыше 50,000 ₸.

## Структура
- `/backend/app/` — FastAPI сервер:
  - `/api` — Эндпоинты (вебхуки)
  - `/core`, `/services`, `/repositories` — Бизнес-логика, БД и конфигурации.
  - Окружение: `.env` (`SUPABASE_URL`, `SUPABASE_KEY`, `TG_...`, `RETAILCRM_...`)
  
- `/frontend/app/` — Дашборд Next.js (App Router):
  - `(auth)` / `(dashboard)` — Страницы входа и статистики
  - `/components`, `/lib`, `/hooks` — UI `shadcn/ui`, API Supabase Client.
  - Окружение: `frontend/.env.local` (`NEXT_PUBLIC_SUPABASE_...`)

## Локальный запуск

1. **Создайте таблицы** выполнив `backend/sql/create_orders.sql` в веб-панели Supabase.
2. **Backend**: 
   ```bash
   cd backend && python -m venv venv && .\venv\Scripts\activate
   pip install -r requirements.txt && uvicorn app.main:app --reload
   ```
   *(Вебхуки ждут POST-запросы на `http://localhost:8000/api/v1/webhooks/retailcrm`)*
3. **Frontend**:
   ```bash
   cd frontend
   npm install && npm run dev
   ```

## Деплой (Vercel)

1. **Frontend**: Создайте проект, Root Directory = `frontend`, добавьте переменные, деплой.
2. **Backend**: Создайте проект, Root Directory = `backend`, добавьте `.env` ключи. Vercel развернет FastAPI как Serverless-функции. 
3. **Webhook**: Добавьте ваш Vercel API URL `.../api/v1/webhooks/retailcrm` в настройки RetailCRM.
