# Smart Queue Management System

## Active architecture

- `Client/` is the React + Vite frontend.
- `backend/` is the active Express/PostgreSQL API. From the repository root, use `npm run dev`.
- `Server/` is the earlier Express-only starter. It is intentionally retained untouched for reference and is not used by the root scripts.

## Database safety

`docker-compose.yml` names a PostgreSQL 17 container `smart-queue-db`; the previous container was named `postgres-db`. Docker Desktop's CLI is unavailable in this session, so neither container nor any volume was started, stopped, recreated, renamed, or removed. Inspect both containers and their volumes before running Compose. The schema migration at `backend/migrations/001_initial_schema.sql` only creates missing objects and does not drop anything.

Credentials stay in `backend/.env`, which is ignored by Git. `backend/.env.example` contains placeholders only.

## API baseline

- `GET /health`, `GET /test-db`
- `GET|POST /api/queues`
- `GET /api/queues/:queueId`
- `POST /api/queues/:queueId/tokens`
- `GET /api/queues/:queueId/tokens/:tokenNumber`
- `POST /api/counters`, `POST /api/counters/:counterId/call-next`
- `POST /api/services/:serviceId/complete`, `POST /api/services/:serviceId/cancel`
