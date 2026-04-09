# Интеграция RetailCRM, Supabase и Дашборд на Next.js

Проект представляет собой систему мониторинга заказов, позволяющую выгружать и синхронизировать данные между RetailCRM и базой данных Supabase, а также визуализировать динамику потока заказов в реальном времени.

## Особенности
- **Telegram Уведомления:** При поступлении заказа на сумму свыше 50,000 ₸ система автоматически пришлет уведомление в Telegram.
- **Интеграция с RetailCRM:** Поддержка вебхуков для приема событий создания и изменения заказов в режиме реального времени. Скрипт синхронизации для выгрузки старых заказов.
- **Дашборд на Next.js:** Авторизация через Supabase Auth. Визуальные графики выручки (Recharts) и таблица последних заказов (shadcn/ui).

## Структура репозитория
- `/backend` — Приложение FastAPI (сервер приема вебхуков) и сервисные Python скрипты для миграции данных и работы с RetailCRM API.
  - `/backend/sql` — SQL-скрипт для быстрой инициализации таблицы в Supabase.
  - `/backend/scripts` — Скрипты для заливки тестовых данных (`upload_mock.py`) и получения заказов (`fetch_orders.py`).
- `/frontend` — Приложение на Next.js. Страница входа (`/login`) и приватный дашборд.

## Настройка окружения

Проект использует разные файлы окружения для Backend и Frontend:

### 1. Серверные переменные Backend (корневой `.env`)
В корневой папке создайте файл `.env`. Необходимые ключи:
```ini
RETAILCRM_URL=https://ваша_компания.retailcrm.ru
RETAILCRM_API=your_retail_api_token

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key

TG_BOT_TOKEN=your_telegram_bot_token
TG_CHAT_ID=your_telegram_chat_id
```

### 2. Клиентские переменные Frontend (`frontend/.env.local`)
Перейдите в папку `frontend` и создайте там файл `.env.local`:
```ini
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

## Как запустить

### 1. Подготовка базы данных
Выполните SQL-код из файла `backend/sql/create_orders.sql` в веб-интерфейсе Supabase (на вкладке SQL Editor).

### 2. Запуск Backend (FastAPI)
```cmd
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API будет доступно на `http://localhost:8000`. 
*(Чтобы RetailCRM мог посылать сюда вебхуки, вам понадобится `ngrok` или публичный IP).*

### 3. Запуск Frontend (Next.js)
```cmd
cd frontend
npm install
npm run dev
```
Откройте `http://localhost:3000`. Вы будете перенаправлены на страницу `Вход`. 
Создайте тестового пользователя в вашей панели Supabase Authentication для доступа к веб-интерфейсу.

## 🚀 Деплой на Vercel (Бесплатный план)

Так как у нас раздельная структура, проще всего задеплоить их как **два отдельных проекта** в вашем Vercel аккаунте. Бесплатный тариф (Hobby) идеально подходит для обеих частей.

### Подготовка (Обязательно)
1. Запушьте ваш код в GitHub (создайте репозиторий, например `gbc-project`).
2. Зарегистрируйтесь на [Vercel](https://vercel.com/) через ваш GitHub-аккаунт.

### Деплой Frontend (Сайт / Дашборд)
1. В дашборде Vercel нажмите **Add New -> Project**.
2. Выберите ваш репозиторий GitHub.
3. Откройте панель **Framework Preset** (Vercel сам определит Next.js).
4. Откройте поле **Root Directory** и укажите `frontend` (сохраните).
5. Разверните вкладку **Environment Variables** и перенесите туда всё из `frontend/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
6. Нажмите **Deploy**. Через минуту ваш фронтенд будет доступен по ссылке!

### Деплой Backend (FastAPI Webhooks)
Vercel поддерживает запуск Python-приложений (FastAPI) в Serverless-функциях!

2. Откройте Vercel и снова нажмите **Add New -> Project**, выберите тот же репозиторий.
3. В **Root Directory** теперь укажите `backend` (сохраните).
4. Во вкладке **Environment Variables** вставьте все ключи из серверного `.env`:
   - `RETAILCRM_URL`, `RETAILCRM_API`
   - `SUPABASE_URL`, `SUPABASE_KEY`
   - `TG_BOT_TOKEN`, `TG_CHAT_ID`
5. Нажмите **Deploy**. 

**Завершение интеграции:** Vercel выдаст вам ссылку на бекенд (например: `https://ваша-ссылка-backend.vercel.app`).
Вам нужно скопировать эту ссылку, добавить к ней маршрут `/webhooks/retailcrm` и вставить этот URL в настройки Webhooks в админ-панели RetailCRM!
