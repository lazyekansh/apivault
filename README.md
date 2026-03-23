# API Vault

A production-ready secure API proxy that hides master API keys behind IP-locked passes and user-generated sub-keys.

## Architecture

```
Client Request (with x-api-key: vlt_sk_...)
  → /api/proxy/[...path]
  → Validate SubKey in DB
  → Strip sub-key, inject MASTER_API_KEY
  → Forward to PROXY_TARGET_BASE_URL
  → Return upstream response
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (jose) in HTTP-only cookies
- **Styling**: Tailwind CSS with custom design system

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/api_vault"
JWT_SECRET="your-super-secret-key-minimum-32-characters"
ADMIN_PASSWORD="your-secure-admin-password"
PROXY_TARGET_BASE_URL="https://api.openai.com"
MASTER_API_KEY="sk-your-actual-openai-key"
MASTER_API_KEY_HEADER="Authorization"
MASTER_API_KEY_PREFIX="Bearer "
NEXT_PUBLIC_APP_URL="https://vault.yourdomain.com"
```

### 3. Set up database

```bash
npm run db:push
```

### 4. Run development server

```bash
npm run dev
```

### 5. Production build

```bash
npm run build
npm run start
```

## Routes

| Route | Description |
|-------|-------------|
| `/login` | User pass login |
| `/dashboard` | User dashboard — manage sub-keys |
| `/admin/login` | Admin login (hidden route) |
| `/admin` | Admin panel — manage passes |
| `/api/proxy/[...path]` | Proxy endpoint |

## How It Works

### Passes (Admin-Generated)
1. Admin logs in at `/admin/login` with `ADMIN_PASSWORD`
2. Creates a Pass (generates `vlt_pass_...` string)
3. Distributes the pass key to a user

### IP Locking
1. User enters pass at `/login`
2. First login: server reads client IP, saves it to the pass
3. Subsequent logins: IP must match exactly or 403 is returned

### Sub-Keys
1. Authenticated user goes to `/dashboard`
2. Generates sub-keys (`vlt_sk_...`)
3. Uses sub-keys in API requests via `x-api-key` header

### Proxy
```bash
curl -X POST https://vault.yourdomain.com/api/proxy/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-api-key: vlt_sk_your_sub_key" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}'
```

The vault validates the sub-key, strips it, injects the master API key, and forwards to the target.

## Security Notes

- JWT tokens are HTTP-only cookies (not accessible via JavaScript)
- Admin route is obscured (no links from public pages)
- IP locking prevents pass sharing across networks
- Sub-keys can be revoked instantly
- Master API keys never leave the server
- All DB queries use parameterized queries via Prisma

## Database Schema

```prisma
Pass {
  id, key, label, ipAddress, isActive, createdAt, updatedAt
}

SubKey {
  id, key, name, isActive, passId (→ Pass), createdAt, updatedAt
}
```
