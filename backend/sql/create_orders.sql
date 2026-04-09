-- Скрипт для создания таблицы orders в Supabase

CREATE TABLE IF NOT EXISTS public.orders (
    id BIGINT PRIMARY KEY, -- ID заказа из RetailCRM
    first_name VARCHAR,
    last_name VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    total NUMERIC,
    status VARCHAR,
    items JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Включаем Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Создаем политику, разрешающую чтение всем авторизованным пользователям
CREATE POLICY "Allow read access to authenticated users" 
ON public.orders FOR SELECT 
TO authenticated 
USING (true);

-- Создаем политику, разрешающую чтение анонимным пользователям (опционально для MVP, чтобы дашборд работал без сложного логина)
-- Уберите строку ниже в production
CREATE POLICY "Allow read access to public" 
ON public.orders FOR SELECT 
TO anon 
USING (true);

-- Создаем политику для сервисного ключа (или webhook'а) на вставку
CREATE POLICY "Allow insert/update to service_role" 
ON public.orders FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);
