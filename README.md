# async-check-url

Asynchronous URL checking service (NestJS API + React frontend).

## Getting started

1. Create a `.env` file in the project root (copy from `.env.example`).

2. Create a `web/.env` file (copy from `web/.env.example`).

3. Create the external Docker network (one-time setup):

   ```bash
   docker network create acu-network
   ```

4. Build services:

   ```bash
   docker compose build
   ```

5. Start services:

   ```bash
   docker compose up -d
   ```

## Environment variables

### Root `.env` (backend + Docker Compose)

| Variable   | Default                 | Description                                      |
|------------|-------------------------|--------------------------------------------------|
| `API_PORT` | `8080`                  | Backend port (host and container)                |
| `WEB_PORT` | `5173`                  | Frontend dev server port on the host             |
| `ORIGIN`   | `http://localhost:5173` | Allowed CORS origin (must match the frontend URL)|

If you change `WEB_PORT`, update `ORIGIN` accordingly (e.g. `WEB_PORT=3000` → `ORIGIN=http://localhost:3000`).

### `web/.env` (frontend)

| Variable        | Default                 | Description        |
|-----------------|-------------------------|--------------------|
| `VITE_API_URL`  | `http://localhost:8080` | Backend base URL   |

## URLs

- Health check: `GET /health`
