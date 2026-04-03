# Auth and Role Logic

## Auth flow

### Signup

- user creates account with email/password
- Supabase Auth creates the identity
- app creates or updates a matching `profiles` row
- default role is `rep` unless assigned otherwise by admin workflow

### Login

- user signs in with email/password
- middleware refreshes session cookies
- protected routes check server session and redirect unauthenticated users to `/login`

### Forgot password

- user enters email on `/forgot-password`
- Supabase sends a reset email
- email links back to `/reset-password`

### Persistent sessions

- Supabase session cookies are managed by middleware and server helpers
- protected layouts load the current user/profile on the server

### Logout

- browser signs out with Supabase
- user is redirected to `/login`

## Role model

### Stored source of truth

- `profiles.role_id` references `roles.id`
- `roles.slug` is one of:
  - `admin`
  - `rep`
  - `franchisee`

### Route authorization

- `admin`: access all routes
- `rep`: access core app routes only
- `franchisee`: access core app routes only

### Content authorization

- admin can create/update/delete content
- reps and franchisees can read published content
- opportunities and wins can later be scoped by owner or franchise

## Recommended future enhancements

- invite-only onboarding
- admin role changes through dashboard
- franchise hierarchy and territory scoping
- audit trail for admin content changes
