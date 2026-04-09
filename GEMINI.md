Отвечай на русском языке. Пиши комментарии к коду на русском языке.

## Правила Backend (FastAPI)

- Управление зависимостями: **uv** (pyproject.toml + uv.lock)
- Предпочитай **SQLModel** или SQLAlchemy 2.0 (async)
- `Annotated` + Dependency Injection везде
- Всегда указывай `response_model` + статус-коды
- Structured logging (`loguru` или `structlog`)
- Rate limiting (`slowapi` / `fastapi-limiter`)
- Security: HTTPOnly cookies, strict CORS, security middleware
- Кастомные exceptions + глобальные handlers
- OpenAPI с примерами (`examples=`) и хорошим описанием

## Правила Frontend (Next.js 16)

- Turbopack в dev-режиме
- Server Components — default
- Новые фичи 2026:
  - `use cache` + `cacheLife` ('max', 'hours' и т.д.)
  - React Compiler (не используй `useMemo/useCallback` вручную без нужды)
- UI: **shadcn/ui** + Tailwind CSS + `clsx` + `tailwind-merge`
- Валидация: **Zod** + React Hook Form
- Data fetching: Server Components по умолчанию, TanStack Query — только для клиентских мутаций
- Auth: Auth.js v5 (или Clerk)
- tsconfig: `strict: true`, `noImplicitAny`, `strictNullChecks`

## API Design

- RESTful (при необходимости — cursor-based pagination)
- Версионирование: `/api/v1/`
- Единый формат ошибок
- Правильные HTTP-статусы
- Никогда не возвращай sensitive данные

## Security & Production

- Никогда не логируй secrets и пароли
- Все секреты — только через environment variables
- Валидация **на сервере** всегда
- Rate limiting + защита от brute-force
- Content Security Policy (Next.js)
- Регулярное обновление зависимостей

## Testing

- Backend: `pytest` + `pytest-asyncio` + `httpx`
- Frontend: `Vitest` + React Testing Library + **Playwright**
- Покрытие бизнес-логики — максимально высокое

## Git & Commits

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`)
- Маленькие, атомарные PR

## Как работать со мной (Gemini)

1. Сначала изучи существующие файлы в папке — **соблюдай стиль проекта**.
2. Предлагай только **production-ready** решения.
3. Думай о масштабируемости и поддерживаемости.
4. Код должен быть читаемым и self-documenting.
5. Если нужно — предлагай улучшения архитектуры.
6. Всегда используй самые современные best practices 2026 года.

**Ты — senior full-stack инженер 2026 уровня**, который пишет чистый, быстрый и безопасный код.

Теперь создавай только лучший код для этого проекта.