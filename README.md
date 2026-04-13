# API Latency Analyzer

Production-minded **HTTP endpoint monitoring**: scheduled synthetic checks, durable history, percentile latency, uptime math, and alert workflows with webhook + structured console delivery. The stack is a **pnpm monorepo** with a **Fastify** API, **BullMQ** workers, **PostgreSQL**, **Redis**, and a **Next.js** operations UI.

This repository is intentionally structured like an internal Datadog / Better Stack / UptimeRobot-style service: typed boundaries, migrations, queues, observability hooks, and CI that runs lint, typecheck, tests, build, and a Playwright smoke pass.

## Why it exists

Teams need a **single place** to register critical URLs, watch them on a cadence, and understand **failures vs. slowness** without standing up a full APM suite. This project optimizes for:

- **Truthful measurements** (explicit attempts, first-error capture, no “fake” retries in metrics)
- **Operational clarity** (incidents, cooldowns, dedupe keys, resolution)
- **Hire-ready engineering** (clean modules, explicit validation, documented tradeoffs)

## Architecture (ASCII)

```
+-------------+      +--------------+      +------------+
|  Next.js UI |----->|  Fastify API |----->| PostgreSQL |
|  (apps/web) |      |  (apps/api)  |      |  (Prisma)  |
+-------------+      +-------+------+      +------------+
                             |
                     Redis + BullMQ
                             v
                     +--------------+
                     | Worker+Sched |
                     | (apps/worker)|
                     +-------+------+
                             |
                     HTTP checks (undici)
```

## Monorepo layout

```
apps/api              Fastify REST API (/api/v1)
apps/worker           Scheduler tick + monitor executor + alerts + retention scaffold
apps/web              Next.js App Router dashboard
packages/db           Prisma schema + migrations
packages/shared       Zod schemas + domain helpers (metrics + alert evaluation)
packages/config       Environment loading + validation (Zod)
packages/logger       Structured logging (pino)
packages/types        Shared TS aliases
packages/http-client  Undici-based probe with timing hooks
```

## Core flows

### Scheduled check → store result → alert

```
Scheduler (BullMQ repeatable)
  -> enqueue due Endpoint rows (Redis lock anti-burst)
       -> Worker executes HTTP probe (timeouts + error classification)
              -> Persist CheckResult (attempt + firstError fields)
                    -> Update Endpoint heartbeat + nextCheckAt
                       -> Evaluate AlertRules (cooldown + dedupe + OPEN/RESOLVED)
                               -> Notify (webhook + structured console)
```

## Local development

### Prerequisites

- Node.js **20+**
- **pnpm** 9 (`corepack enable`)
- Docker (for Postgres + Redis) **or** local instances

### Bootstrap

```bash
cp .env.example .env
make db-up            # postgres + redis (docker compose)
pnpm install
pnpm --filter @ala/db exec prisma migrate dev
pnpm dev # api + worker + web (parallel)
```

Defaults:

- API: `http://localhost:3001`
- Web: `http://localhost:3000`
- Postgres: `postgresql://ala:ala@localhost:5432/ala`
- Redis: `redis://localhost:6379`

### Docker (full stack)

```bash
docker compose up --build
```

Compose injects **local-only JWT defaults**; override with a root `.env` using long random secrets before any shared environment.

## Environment variables

See [.env.example](.env.example). **Never commit real secrets.** Minimum required locally:

- `DATABASE_URL`, `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (32+ chars)
- `NEXT_PUBLIC_API_URL` for the browser-facing API base

## Database migrations

```bash
pnpm db:migrate       # prisma migrate dev (packages/db)
```

CI uses `prisma migrate deploy` against an ephemeral Postgres service.

## Testing strategy

| Layer | Command | Notes |
| --- | --- | --- |
| Unit (packages) | `pnpm --filter @ala/shared test` | Percentiles + alert evaluation |
| Unit (api) | `pnpm --filter @ala/api test` | Crypto helpers |
| E2E (web) | `pnpm --filter @ala/web test:e2e` | Playwright boots standalone Next server |

Full E2E against a live API + seeded user:

```bash
export E2E_EMAIL='you@example.com'
export E2E_PASSWORD='your-12+-char-password'
pnpm --filter @ala/web test:e2e
```

## HTTP API (v1)

Base path: `/api/v1`

- **Auth**: `POST /auth/register|login|refresh`, `POST /auth/logout`, `GET /auth/me`
- **Endpoints CRUD**: `POST|GET|PATCH|DELETE /endpoints`
- **Telemetry**: `GET /endpoints/:id/metrics|checks|alerts`
- **Incidents**: `GET /incidents`
- **System**: `GET /health`, `GET /ready`, `GET /live`
- **Metrics placeholder**: `GET /metrics` (Prometheus wiring hook)

All list endpoints accept **pagination + filters + sorting** (validated). Errors follow `{ code, message, details?, requestId }`.

## Screenshots

_Add PNGs here (`docs/screenshots/`) in your fork: dashboard, endpoint detail, alert timeline._

## Security considerations

- **Passwords**: bcrypt cost configurable (`BCRYPT_ROUNDS`)
- **JWT access** validated against **Session** rows (revocation-ready)
- **Refresh rotation** updates hashed refresh token server-side
- **Helmet + CORS + Zod** on every write path
- **Redis-backed rate limiting** on the API
- **Structured logs** redact `authorization` and token fields

## Scaling and tradeoffs

- **Scheduler + worker** scale horizontally; ensure **single scheduler leader** or shorten lock TTL / use BullMQ repeatable job idempotency patterns for your throughput.
- **Percentile SQL** uses `PERCENTILE_CONT` (PostgreSQL) for efficient windows; for massive cardinality, roll up to hourly materialized tables.
- **Retention job** deletes old `CheckResult` rows (configurable horizon); tune for compliance needs.
- **Web UI tokens** are stored in `localStorage` for simplicity—production should prefer **httpOnly** cookies + CSRF strategy.

## Future improvements

- Workspace / organization tenancy (`User` already owns resources; add `Workspace` + membership)
- Email/Slack/Telegram notifiers (interfaces are isolated in `apps/worker/src/notify.ts`)
- Richer timing (Undici diagnostics / native `PerformanceResourceTiming` where available)
- OpenTelemetry traces spanning API → queue → probe

## CI

GitHub Actions workflow: `.github/workflows/ci.yml` runs install → migrate → lint → typecheck → test → build → Playwright.

## License

This project is open-sourced under MIT for educational and portfolio purposes.
Production-grade and enterprise features are not included in this repository.
