# AfterHours.AI — Command Center

A full-stack Next.js 14 admin dashboard for managing the AfterHours.AI platform. Built with Auth.js v5, Stripe, Upstash Redis, Prisma, and PostgreSQL.

---

## Overview

Command Center provides AfterHours admins with:

- **Revenue management** — Stripe payments, subscriptions, refunds, and revenue charts
- **User management** — Role-based access, ban/unban, password reset
- **Security center** — Login attempt monitoring, session management, API keys, feature flags
- **Site settings** — Maintenance mode, announcements, notification configuration, audit log
- **Real-time activity** — SSE-based live audit event feed
- **Role-based access control** — `super_admin`, `admin`, `viewer`

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- [Upstash](https://upstash.com/) Redis account (free tier works)
- Stripe account with webhook endpoint configured
- (Optional) Google OAuth credentials for Google sign-in
- (Optional) Resend API key for email alerts
- (Optional) Slack webhook URL for Slack alerts

---

## Quick Start

```bash
# 1. Clone and install dependencies
git clone <repo>
cd admin
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables table below)

# 3. Set up the database
npm run db:migrate

# 4. Seed default admin user and feature flags
npm run db:seed

# 5. Start the development server
npm run dev
# Open http://localhost:3340
```

Default login after seed:
- Email: `admin@afterhours.ai`
- Password: `admin123!`

**Change this password immediately after first login.**

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Auth.js secret — generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`) |
| `UPSTASH_REDIS_URL` | Yes | Upstash Redis REST URL |
| `UPSTASH_REDIS_TOKEN` | Yes | Upstash Redis REST token |
| `RESEND_API_KEY` | No | Resend API key for email alerts |
| `RESEND_FROM` | No | From address for email alerts |
| `SLACK_WEBHOOK_URL` | No | Slack incoming webhook URL |
| `ALLOWED_IPS` | No | Comma-separated IP allowlist (empty = allow all) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of this admin app |
| `AFTERHOURS_AGENT_URL` | No | URL of the main agent server |
| `AFTERHOURS_AGENT_ADMIN_KEY` | No | Admin key for agent server health checks |
| `ADMIN_ALERT_EMAIL` | No | Email address for critical alert emails |
| `PORT` | No | Server port (default 3340) |

---

## Stripe Setup

### 1. Configure your webhook endpoint

In the Stripe Dashboard → Developers → Webhooks, add a new endpoint:

- **URL**: `https://your-admin-domain.com/api/webhooks/stripe`
- **Events to listen for**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

### 2. Copy the signing secret

After creating the webhook, copy the signing secret (`whsec_...`) and add it to your `.env` as `STRIPE_WEBHOOK_SECRET`.

### 3. Test locally with Stripe CLI

```bash
stripe listen --forward-to localhost:3340/api/webhooks/stripe
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3340/api/auth/callback/google` (and your production URL)
4. Copy Client ID and Client Secret to `.env`

---

## Two-Factor Authentication (TOTP)

2FA is implemented using TOTP (Time-based One-Time Passwords) compatible with Google Authenticator, Authy, etc.

- Users with `twoFactorEnabled: true` and a `twoFactorSecret` in the database will be prompted for a TOTP code after entering their password
- The login flow automatically detects `2FA_REQUIRED` and shows the TOTP step
- Secrets are stored as base32 strings — consider encrypting at rest in production using a KMS

---

## Docker Deployment

### Build and run with Docker Compose

```bash
# Copy and configure environment
cp .env.example .env

# Start all services (PostgreSQL + app)
docker compose up -d

# Run database migrations and seed
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

### Standalone Docker

```bash
docker build -t afterhours-admin .
docker run -p 3340:3340 --env-file .env afterhours-admin
```

---

## Directory Structure

```
admin/
├── app/
│   ├── (auth)/login/       # Login page (2-step: credentials + TOTP)
│   ├── api/
│   │   ├── auth/           # Auth.js route handler
│   │   ├── dashboard/      # Stats endpoint
│   │   ├── events/         # SSE live activity feed
│   │   ├── notifications/  # In-app notifications
│   │   ├── security/       # Sessions + API keys
│   │   ├── settings/       # Maintenance, feature flags, cache, audit
│   │   ├── stripe/         # Payments, subscriptions, refunds, webhooks
│   │   ├── users/          # User CRUD
│   │   └── webhooks/       # Stripe webhook receiver
│   └── dashboard/
│       ├── layout.tsx      # Sidebar + header layout
│       ├── page.tsx        # Overview dashboard
│       ├── stripe/         # Stripe management
│       ├── users/          # User management
│       ├── security/       # Security center
│       └── settings/       # Settings
├── components/
│   ├── dashboard/          # Stats cards, activity feed, charts
│   ├── layout/             # Sidebar, header, session provider
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── auth.ts             # Auth.js v5 configuration
│   ├── audit.ts            # Audit log helpers
│   ├── notifications.ts    # Slack + email notifications
│   ├── prisma.ts           # Prisma client singleton
│   ├── rate-limit.ts       # Rate limiting middleware
│   ├── redis.ts            # Upstash Redis + rate limiters
│   ├── stripe.ts           # Stripe SDK helpers
│   └── utils.ts            # Shared utilities
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seed
├── middleware.ts            # IP allowlist + auth + role guards
├── Dockerfile
└── docker-compose.yml
```

---

## Role Permissions

| Feature | viewer | admin | super_admin |
|---|---|---|---|
| View dashboard | Yes | Yes | Yes |
| View Stripe data | Yes | Yes | Yes |
| Manage Stripe (refund, cancel) | No | Yes | Yes |
| View users | Yes | Yes | Yes |
| Change user role | No | Yes (up to admin) | Yes (all roles) |
| Ban/unban users | No | Yes | Yes |
| Delete users | No | No | Yes |
| View security page | No | Yes | Yes |
| Kill sessions | No | Yes | Yes |
| Manage API keys | No | Yes | Yes |
| Toggle feature flags | No | No | Yes |
| View settings page | No | Yes | Yes |
| Toggle maintenance mode | No | Yes | Yes |
| Create announcements | No | Yes | Yes |

---

## API Endpoints Reference

All API routes require authentication (valid session) unless noted. Rate limited at 30 req/min per IP.

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Dashboard stats (revenue, sessions, health) |
| GET | `/api/events` | SSE stream of live audit events |
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications` | Mark notification(s) as read |
| POST | `/api/notifications` | Send test Slack notification |
| GET | `/api/stripe/payments` | List recent PaymentIntents |
| GET | `/api/stripe/subscriptions` | List subscriptions |
| PATCH | `/api/stripe/subscriptions` | Cancel/pause/resume a subscription |
| POST | `/api/stripe/refund` | Create a refund |
| GET | `/api/stripe/webhooks` | List stored webhook events |
| POST | `/api/webhooks/stripe` | Stripe webhook receiver (no auth) |
| GET | `/api/users` | List users (with filters + CSV export) |
| POST | `/api/users` | Create a user |
| PATCH | `/api/users/[id]` | Update user (role, ban, name) |
| DELETE | `/api/users/[id]` | Delete user (super_admin only) |
| GET | `/api/security/sessions` | List active sessions (or login attempts) |
| DELETE | `/api/security/sessions` | Kill a session |
| GET | `/api/security/api-keys` | List API keys |
| POST | `/api/security/api-keys` | Create API key (returns full key once) |
| DELETE | `/api/security/api-keys` | Revoke API key |
| GET | `/api/settings/maintenance` | Get maintenance mode state |
| POST | `/api/settings/maintenance` | Toggle maintenance mode |
| GET | `/api/settings/feature-flags` | List feature flags (or announcements) |
| PATCH | `/api/settings/feature-flags` | Toggle feature flag |
| POST | `/api/settings/feature-flags` | Create feature flag or announcement |
| GET | `/api/settings/cache` | Get audit logs |
| POST | `/api/settings/cache` | Invalidate Redis cache keys |
