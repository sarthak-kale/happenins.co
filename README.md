# Happenins Event Ticketing Platform

Happenins is an event ticketing platform built with Express, React, Vite, and Prisma ORM.

For a code-based walkthrough and architecture diagram, see the [project overview](docs/PROJECT_OVERVIEW.md) and [architecture diagram](docs/architecture.svg).

For the configured local database, Redis, demo logins, and start/stop commands, see [local development](docs/LOCAL_DEVELOPMENT.md).

---

## Phase 1 Foundation & Production Safety Summary

Server startup behavior has been audited and secured.

### Server Startup Behavior
- **Zero Automatic Business Data Mutation**: Server startup **never** creates, updates, or deletes business data, demo events, or institution records on boot.
- **Data Preservation**: Database seeding and cleanup are strictly isolated to manual developer commands (`npm run db:seed`).

---

## 1. Local Setup

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `.env` or set required environment variables in your runtime environment.

3. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 2. PostgreSQL Requirement

Happenins uses **PostgreSQL** as its production relational database via Prisma ORM.
The `DATABASE_URL` connection string must follow PostgreSQL format:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/happenins_db?schema=public"
```

In `production` mode (`NODE_ENV=production`), startup strictly enforces that `DATABASE_URL` starts with `postgresql://` or `postgres://`.

---

## 3. Environment Variables Reference

| Variable | Required in Dev | Required in Prod | Description |
|---|---|---|---|
| `NODE_ENV` | Optional (`development`) | Yes (`production`) | Application runtime environment |
| `PORT` | Optional (`3000`) | Optional (`3000`) | Express server listening port |
| `DATABASE_URL` | Yes | Yes | PostgreSQL database connection string |
| `APP_URL` | Optional (`http://localhost:3000`) | Yes | Public application URL |
| `JWT_SECRET` | Auto-fallback in Dev | Yes (Strong string) | Secret key for signing session JWTs |
| `QR_HMAC_SECRET` | Auto-fallback in Dev | Yes (Strong string) | Secret key for signing dynamic QR gate passes |
| `RAZORPAY_KEY_ID` | Optional | Optional | Razorpay Key ID for ticket checkout |
| `RAZORPAY_KEY_SECRET` | Optional | Optional | Razorpay Key Secret for checkout verification |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Optional | Razorpay Webhook signature secret |
| `GOOGLE_CLIENT_ID` | Optional | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Optional | Google OAuth client secret |
| `SMTP_HOST` / `SMTP_USER` | Optional | Optional | Transactional email dispatches |

---

## 4. Safe Database Seeding

Seeding identity profiles and default institutions is performed **exclusively** on demand via developer commands:

```bash
npm run db:seed
```

This populates default identity test profiles (Attendee, Verified Organizer, Administrator) and university institutions without risking data deletion during regular server operations.

---

## 5. Migration Procedure

Prisma schema changes are deployed safely using Prisma's migration CLI:

1. **Generate Prisma Client Artifacts**
   ```bash
   npm run db:generate
   ```

2. **Apply Migrations to Production Database**
   ```bash
   npm run db:migrate
   ```
   *Note: `prisma migrate deploy` applies pending migrations without dropping or resetting existing data.*

---

## 6. Health and Readiness Monitoring Endpoints

- **Liveness Probe**: `GET /api/health`
  - Returns `HTTP 200 OK` if the Express process is running.
  - Does not depend on database connection.
  - Response format:
    ```json
    {
      "status": "ok",
      "timestamp": "2026-08-13T11:45:26.000Z",
      "environment": "development",
      "requestId": "550e8400-e29b-41d4-a716-446655440000"
    }
    ```

- **Readiness Probe**: `GET /api/ready`
  - Verifies database connectivity using a lightweight `SELECT 1` query.
  - Returns `HTTP 200 OK` when ready to handle traffic.
  - Returns `HTTP 503 Service Unavailable` if database connectivity fails.
  - Response format:
    ```json
    {
      "status": "ok",
      "database": "connected",
      "timestamp": "2026-08-13T11:45:26.000Z",
      "requestId": "550e8400-e29b-41d4-a716-446655440000"
    }
    ```

---

## 7. Graceful Shutdown

The application intercepts `SIGINT` and `SIGTERM` signals:
1. Stops accepting incoming HTTP requests (`server.close()`).
2. Cleans up pending connections with a bounded 10-second timeout.
3. Gracefully disconnects the Prisma database client (`prisma.$disconnect()`).
4. Exits cleanly with code `0`.
