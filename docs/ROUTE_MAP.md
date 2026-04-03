# Route Map

## Public routes

- `/` landing page
- `/login` login page
- `/signup` signup page
- `/forgot-password` forgot password page
- `/reset-password` password reset completion page

## Protected app routes

- `/dashboard`
- `/training`
- `/scripts`
- `/calculators`
- `/opportunities`
- `/wins`
- `/insights`
- `/settings`

## Admin routes

- `/admin/articles`
- `/admin/opportunities`
- `/admin/users`
- `/admin/wins`

## Supporting route groups

- `(marketing)` public pages
- `(auth)` auth pages
- `(app)` protected pages
- `(app)/admin` admin-only pages

## Route access rules

- public routes: everyone
- protected app routes: authenticated `admin`, `rep`, `franchisee`
- admin routes: authenticated `admin` only
