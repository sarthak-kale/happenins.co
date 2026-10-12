# Happening’s Engineering Blueprint: Production Specification

This specification outlines the architecture, database representation, lifecycles, and implementation mechanics of **Happenins** (community event marketplace). 

---

## 1. Complete Folder Structure

The code is strictly separated into a modular Express backend (`src/server/`) and a modern React frontend (`src/`).

```
/
├── prisma/
│   ├── schema.prisma              # Database Schemas & Relations
│   └── seed.ts                    # PostgreSQL Seeding Script
├── src/
│   ├── types/                     # Shared and explicit TypeScript interfaces
│   │   └── index.ts
│   ├── components/                # Shared presentation UI and layouts (clean typography)
│   │   ├── Button.tsx
│   │   ├── Navigation.tsx
│   │   ├── EventCard.tsx
│   │   └── QRScanner.tsx
│   ├── hooks/                     # Custom front-end React Hooks
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   └── useBookings.ts
│   ├── context/                   # Context declarations (Auth contexts, etc)
│   │   └── AuthContext.tsx
│   ├── pages/                     # Routed view screen modules
│   │   ├── Home.tsx
│   │   ├── EventDetails.tsx
│   │   ├── Checkout.tsx
│   │   ├── Tickets.tsx
│   │   ├── OrganizerDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── App.tsx                    # React routing coordinator and modal provider
│   ├── index.css                  # Tailwinds global import
│   ├── main.tsx                   # Browser bootstrap DOM mounter
│   └── server/                    # High Performance Layered Backend
│       ├── server.ts              # Express engine, dev/prod entry and routing mounting
│       ├── controllers/           # API request validations, payloads parsing, response returns
│       │   ├── auth.controller.ts
│       │   ├── event.controller.ts
│       │   ├── booking.controller.ts
│       │   ├── organizer.controller.ts
│       │   └── attendance.controller.ts
│       ├── services/              # Pure business rule processors (Transactions & lifecycles)
│       │   ├── auth.service.ts
│       │   ├── event.service.ts
│       │   ├── booking.service.ts
│       │   ├── payment.service.ts
│       │   └── qr.service.ts
│       ├── repositories/          # Isolated database query layer
│       │   ├── user.repository.ts
│       │   ├── event.repository.ts
│       │   └── booking.repository.ts
│       ├── middleware/            # Security filters and parameter validations
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   └── rate-limiter.ts
│       └── utils/                 # Cryptography engines and CSV builders
│           ├── db.ts              # Prisma or DB pooled engine
│           ├── crypto.ts          # Secret keys signing (HMAC-SHA256)
│           └── mailer.ts          # Advanced email notifications
```

---

## 2. Backend Architecture

The server implements a strict **Layered Controller-Service-Repository Pattern** with clear boundaries:

```
[Client Request] 
      ↓
[Middleware Layer]     (Helmet, Rate-Limiting, Session Validator)
      ↓
[Controllers]          (Zod Input Validation, DTO Mapping, Response serialization)
      ↓
[Services]             (Core business logic, transaction boundaries, validations)
      ↓
[Repositories]         (The ONLY layer communicating with data persistent storage)
      ↓
[Database (PostgreSQL)]
```

- **Rule 1**: Controllers never make database queries. They parse inputs, handle status codes, and return DTOs.
- **Rule 2**: Repositories are strictly state-agnostic data accessors.
- **Rule 3**: Services manage transactions, event triggers, state transition guards, and business operations.

---

## 3. Frontend Architecture

- **React 19**: Styled with modular Tailwind CSS utility classes. 
- **Zustand Store**: Lightweight client-side global state (auth sessions, settings, recently viewed).
- **TanStack Query (v5)**: Orchestrates server caching, optimistic updates, pagination data hydration, and request deduplication.
- **Micro-Animations**: Clean structural entries provided by `motion` (`motion/react`).
- **Typography Selection**: High contrast light interface pairing `inter` sans-serif for reading layout screens, and `jetbrains mono` for analytics codes and verification keys.

---

## 4. Database Schema

For a production-ready PostgreSQL design, we use:

```sql
-- PostgreSQL Conceptual Schema

-- Roles enum
CREATE TYPE "Role" AS ENUM ('USER', 'ORGANIZER', 'ADMIN');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'LIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
CREATE TYPE "BookingStatus" AS ENUM ('RESERVED', 'PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

CREATE TABLE "User" (
  "id" VARCHAR(64) PRIMARY KEY, -- Supports Firebase UID or UUIDv4
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255),  -- Optional for social oauth users
  "fullName" VARCHAR(255) NOT NULL,
  "avatarUrl" TEXT,
  "role" "Role" DEFAULT 'USER' NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "OrganizerProfile" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" VARCHAR(64) UNIQUE REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
  "companyName" VARCHAR(255) NOT NULL,
  "logoUrl" TEXT,
  "website" VARCHAR(255),
  "isVerified" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_organizer_user" ON "OrganizerProfile"("userId");

CREATE TABLE "Event" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizerId" UUID REFERENCES "OrganizerProfile"("id") ON DELETE CASCADE NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "bannerUrl" TEXT,
  "locationType" VARCHAR(50) NOT NULL, -- 'VENUE' | 'ONLINE'
  "venue" TEXT,
  "city" VARCHAR(100),
  "status" "EventStatus" DEFAULT 'DRAFT' NOT NULL,
  "startsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_event_city_status" ON "Event"("city", "status");
CREATE INDEX "idx_event_slug" ON "Event"("slug");

CREATE TABLE "TicketTier" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventId" UUID REFERENCES "Event"("id") ON DELETE CASCADE NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "price" INT NOT NULL, -- Stored in Cents (Integer)
  "capacity" INT NOT NULL,
  "reserved" INT DEFAULT 0 NOT NULL, -- Tracks current reserved/locked units
  "sold" INT DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Booking" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" VARCHAR(64) REFERENCES "User"("id") ON DELETE RESTRICT NOT NULL,
  "eventId" UUID REFERENCES "Event"("id") ON DELETE RESTRICT NOT NULL,
  "status" "BookingStatus" DEFAULT 'RESERVED' NOT NULL,
  "invoiceNumber" VARCHAR(100) UNIQUE NOT NULL,
  "reservedUntil" TIMESTAMP WITH TIME ZONE NOT NULL, -- Lock limit for checkout sessions (e.g., +10 mins)
  "totalAmount" INT NOT NULL, -- Total in Cents
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_booking_user" ON "Booking"("userId");
CREATE INDEX "idx_booking_event_status" ON "Booking"("eventId", "status");

CREATE TABLE "BookingItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId" UUID REFERENCES "Booking"("id") ON DELETE CASCADE NOT NULL,
  "ticketTierId" UUID REFERENCES "TicketTier"("id") ON DELETE RESTRICT NOT NULL,
  "quantity" INT NOT NULL,
  "subtotal" INT NOT NULL
);

CREATE TABLE "Payment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId" UUID REFERENCES "Booking"("id") ON DELETE RESTRICT NOT NULL,
  "transactionId" VARCHAR(255) UNIQUE NOT NULL, -- Razorpay Transaction or Mock ID
  "amount" INT NOT NULL,
  "method" VARCHAR(50) NOT NULL,
  "receiptUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Attendance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId" UUID REFERENCES "Booking"("id") ON DELETE RESTRICT NOT NULL,
  "qrHash" VARCHAR(255) UNIQUE NOT NULL, -- Monotonically signed hash
  "scannedAt" TIMESTAMP WITH TIME ZONE,
  "scannerUserId" VARCHAR(64) REFERENCES "User"("id"),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" VARCHAR(64) REFERENCES "User"("id") ON DELETE SET NULL,
  "action" VARCHAR(100) NOT NULL,
  "entity" VARCHAR(100) NOT NULL,
  "entityId" VARCHAR(100),
  "ipAddress" VARCHAR(45),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

---

## 5. Repository Architecture

Repositories own all direct interface declarations for database engines. Example for `BookingRepository`:

```typescript
export interface IBookingRepository {
  createWithReservation(
    userId: string, 
    items: Array<{ tierId: string; quantity: number }>, 
    lockMinutes: number
  ): Promise<Booking>;
  confirmPayment(bookingId: string, transactionId: string): Promise<Booking>;
  releaseExpiredReservations(): Promise<number>;
  getAttendeeRoster(eventId: string): Promise<Array<AttendeeDetails>>;
}
```

---

## 6. API Contract

The system exposes clean REST endpoints:

- **Authentication Module**:
  - `POST /api/auth/register` (Email/Password registration)
  - `POST /api/auth/login` (Email/Password session setup)
  - `POST /api/auth/google` (Handles federated authentication verification)
  - `POST /api/auth/logout` (Invalidates session cookie)
- **Events & Categories**:
  - `GET /api/events` (Public list, query params: category, search, city, limit, page)
  - `GET /api/events/:slug` (Return public display object)
  - `POST /api/events` (Organizer role required. Create draft status event)
  - `PATCH /api/events/:id/lifecycle` (Transition state draft -> pub -> live)
- **Booking Pipeline**:
  - `POST /api/bookings/reserve` (Secures temporary stock for 10 minutes)
  - `POST /api/bookings/:id/verify-payment` (Razorpay HMAC signature validation)
- **Attendance**:
  - `POST /api/attendance/check-in` (Scans QR and updates status if signed signature passes)
- **Organizer Insights**:
  - `GET /api/organizers/analytics` (Retrieves revenue metrics and inventory velocity)
  - `GET /api/organizers/events/:id/attendees/export` (Stream attendee records)

---

## 7. DTO Strategy

To eliminate data leakage, Prisma model conversions are strictly managed:

```typescript
// Incoming validation request DTO
export const CreateEventSchema = zod.object({
  title: zod.string().min(3).max(100),
  slug: zod.string().regex(/^[a-z0-9-]+$/),
  description: zod.string(),
  city: zod.string(),
  venue: zod.string(),
  startsAt: zod.string().datetime(),
  endsAt: zod.string().datetime()
});

// Outgoing Response DTO
export interface PublicEventResponse {
  id: string;
  title: string;
  slug: string;
  city: string;
  venue: string;
  startsAt: Date;
  bannerUrl: string | null;
  ticketsAvailable: number;
  priceFrom: number;
}
```

---

## 8. Authentication Architecture

- **Token Strategy**: Strict Cookie-based session validation.
- JWT verification runs inside a centralized `auth.middleware.ts` parser.
- Google Auth signs verified email IDs and synchronizes profiles inside `/api/auth/google`.
- The cookie uses: `HttpOnly`, `Secure` (in cloud environments), and `SameSite: Strict` to neutralize CSRF vectors.

---

## 9. Authorization Architecture

Role-based authorization is configured as a composite gate filter:

```typescript
export function restrictTo(...allowedRoles: Array<'USER' | 'ORGANIZER' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };
}
```

- **USER**: Can browse, purchase tickets, review, and view tickets inside their profile.
- **ORGANIZER**: Fully controls their own list of events, ticket tiers, and can export rosters.
- **ADMIN**: Can audit events, ban offensive content, verify organizers, and view global billing summaries.

---

## 10. Event Lifecycle State Machine

A rigid lifecycle model protects the marketplace integrity.

```
+---------+         +--------------+         +-----------+
|  DRAFT  | ------> | UNDER_REVIEW | ------> | PUBLISHED |
+---------+         +--------------+         +-----------+
     |                                             |
     ↓                                             ↓
+-----------+                                +-----------+
| CANCELLED |                                |   LIVE    |
+-----------+                                +-----------+
                                                   |
                                                   ↓
                                             +-----------+
                                             | COMPLETED |
                                             +-----------+
                                                   |
                                                   ↓
                                             +-----------+
                                             | ARCHIVED  |
                                             +-----------+
```

### Precondition Checks:
- **DRAFT**: Created by Organizers. Holds content and drafts descriptions.
- **DRAFT -> UNDER_REVIEW**: Allowed only if Event contains at least 1 ticket tier with capacity > 0 and start timestamp in future.
- **UNDER_REVIEW -> PUBLISHED**: Admin verification check completes.
- **PUBLISHED -> CANCELLED**: Can only trigger if no bookings have been confirmed. Otherwise, refund processors must be initiated.
- **LIVE**: Triggers automatically on cron check when current time >= startsAt.
- **COMPLETED**: Automatically updates when current time > endsAt.

---

## 11. Booking Lifecycle & Ticket Reservation

To match BookMyShow-level accuracy, inventory is strictly reserved inside database transactions using competitive locking patterns.

```
       [Select Ticket & Qty]
                ↓
  [Transaction: Check Inventory]
  SELECT capacity, sold, reserved 
  FROM TicketTier WHERE id = :tierId 
  FOR UPDATE;   -- Relational pessimistic row lock
                ↓
  [If Space exists? Add Reserve Lock]
  Update ticket reservations (+Qty) and 
  save Booking ID as "RESERVED" on 10 min lock 
                ↓
         [Initialize Checkout]
  Start Razorpay SDK order creation
                ↓
    [Confirmed Payment Callback]
  Update Booking -> "CONFIRMED"
  Update TicketTier -> Sold (+Qty), Reserved (-Qty)
                ↓
       [Generate Signed QR]
```

- **Reservation Expiry Cleanup**: A background scheduled cron checks for unpaid bookings where `reservedUntil < NOW()`. It releases the locks by decrementing reservation counters inside the associated `TicketTier` table automatically.

---

## 12. Payment Lifecycle

- **SDK Interface**: Integrate **Razorpay Webhook verification** with an Express router reading `req.rawBody` to securely verify order hash signatures.
- **Fallback Simulation Flow**: An isolated billing router allows complete offline and validation overrides during simulated environments using secure state callbacks, so the checkout flows operate seamlessly during sandbox testing.

---

## 13. Attendance Lifecycle & QR Cryptography

Strict QR codes protect entry tickets to completely prevent clone attacks.

```
[Booking Confirmed]
        ↓
  [Secure Signature Creation]
  Message = bookingId + ticketId + attendeeMail
  Signature = HMAC-SHA256(Message, SECRET_AUTH_KEY)
        ↓
  [QR Payload Envelop]
  QR_String = JSON({ bookingId, sig: Signature })
        ↓
  [Scan at Gate]
  Check: Decode Signature == HMAC-SHA256(Message, SECRET_AUTH_KEY)
        ↓
  [Check Scanned Database Logs]
  Is scannedAt != NULL? REJECT (Double Scan Error!)
  Else -> scannedAt = currentTimestamp, scanner = user_id
```

---

## 14. Analytics Architecture

Real-time reporting dashboards for organizers calculate:
- **Global Ticket Sales Pace**: Aggregate metric tracking reservation speed.
- **Conversion Efficiency**: Number of checkout locks divided by confirmed payment items.
- **Revenue Distributions**: Financial split by ticket tier category.

---

## 15. Export Architecture

Organizers can stream download full attendee rosters recursively.
- High capacity rosters are exported using memory-friendly Node streams:
  `res.setHeader('Content-Type', 'text/csv')` and pipeline piping format.
- Output covers fields: Attendee Name, Email, Ticket Tier Purchased, Status, Booking Date, and Scan Check.

---

## 16. Notification Architecture

- **Engine**: Fully transactional core integrated with **Nodemailer**.
- **Templates Available**:
  - `ticket_confirmation.html`: Inlines digital ticket summaries, check-in instructions, and links to the dashboard.
  - `event_update_notification.html`: Alerts ticket buyers of venue or timestamp updates.
- **Error Protection**: Safe asynchronous routing to prevent failing mail servers from blocking successful buying cycles.

---

## 17. Deployment Architecture

- **Runtime**: Runs fully optimized inside custom layered containers matching Google Cloud Run.
- **Bundling**: Serves API routes and passes fallback asset loaders through the embedded Express Vite production routing handler.

---

## 18. DevOps Workflow

We separate development and deployment validation into distinct cycles:
1. Complete structural lint checking of all components.
2. Dynamic local building checks using unified build scripts compiling typescript configurations.
3. Database migrations checks matching prisma structures.

---

## 19. CI/CD Pipeline

- All changes trigger an automated pipeline which compile sources and run TypeScript verification.
- Assets are built and server bundles are verified with standalone CJS esbuild steps before live service upgrades.

---

## 20. Testing Strategy

- **Module Inspections**: All state operations inside Services (Event lifecycles, Checkouts locks) must undergo unit checks.
- **Integration Checks**: Verify the entire route flow from `POST /api/bookings/reserve` through Razorpay callbacks using sandbox mock environments.

---

## 21. Logging Strategy

- **Winston Configuration**: Implements explicit context outputs to keep diagnostics clean.
- Logs separate trace records from core exception errors, always logging transaction metadata.

---

## 22. Monitoring Strategy

- Centralized status health check endpoint at `/api/health` returns database pooling status, transaction counts, and server load indicators.

---

## 23. Security Strategy

- **Helmet**: Secures response headers against sniffing.
- **Rate-Limiter**: Express rate liming shields auth routes (max 10 requests per minute per IP to protect against brute force) and checkout reserving (max 20 requests per min).
- **Audit Logging**: Saves all administrative modifications, organizer actions on ticket capacities, and status updates to the database.

---

## 24. Performance Strategy

- **Indexing**: Database-level indexing placed on searchable filters (`status`, `city`, `startsAt`, custom slugs).
- **Connection Pooling**: Node backend utilizes persistent pool sizes with structured keeps to keep queries extremely fast.
- **Cursor-based lists**: Configured for event listing scrolls to avoid deep O(N) database paging penalties.

---

## 25. Caching Strategy

- In-memory key caches store public event details and category list representations to minimize redundant queries.
- Static assets and layout templates leverage PWA workbox caching layers for seamless offline and low-connection rendering.

---

## 26. File Responsibilities

| File Path | Functional Responsibility |
|---|---|
| `prisma/schema.prisma` | PostgreSQL physical structure representations, mappings and index creations |
| `src/server/server.ts` | Express Server router definitions, dev/prod Vite middleware serving orchestration |
| `src/server/controllers/booking.controller.ts` | Processes checking out operations, handles payments status hooks |
| `src/server/services/qr.service.ts` | Signs and validates attendee verification codes using HMAC keys |
| `src/App.tsx` | UI Router routing maps, global contextual wraps, layouts setup |

---

## 27. Coding Standards

- **Static Typing**: Explicit interfaces for all elements. No `any` type usage is permitted.
- **Code Flow**: Strictly prefer stateless pure functional designs inside Services.
- **Asymmetric Operations**: Use `async/await` structures. Try-catch must strictly wrap all asynchronous execution chains.

---

## 28. Environment Variables

We maintain explicit configurations in `.env.example`:

```env
# SERVER CONTEXT
PORT=3000
NODE_ENV=production
APP_URL=http://localhost:3000
JWT_SECRET=super_secure_randomly_crafted_token_key_here
QR_HMAC_SECRET=secure_auth_cryptography_signing_secret_here

# DATABASE CONNECTION (Cloud SQL or Supabase / PostgreSQL)
DATABASE_URL=postgresql://user:pass@localhost:5432/happenins

# THIRD PARTY PLATFORMS (To be provided by the operator)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## 29. Required Dependencies

To achieve a production-grade stack, we will require the following additional modules:
- `@prisma/client` and `prisma` (Database Accessor)
- `bcryptjs` (Password Hashing)
- `cors` and `cookie-parser` (Authentication & Cors Management)
- `zod` (Robust schema and controller verification)
- `jsonwebtoken` (JWT Session administration)
- `@types/cookie-parser` / `@types/jsonwebtoken` / `@types/bcryptjs` (TypeScript Support)

---

## 30. Terminal Setup & Build Scripts

Our pipeline leverages modern Node TS engines:

```json
"scripts": {
  "dev": "tsx src/server/server.ts",
  "build": "vite build && esbuild src/server/server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
  "start": "node dist/server.cjs",
  "db:push": "prisma db push",
  "db:generate": "prisma generate"
}
```

This ensures complete compilation from TS to single bundled CJS files inside `/dist`, resolving relative link patterns and launching standalone server runs.
