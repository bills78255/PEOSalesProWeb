# Implementation Plan

## Objective

Build a shared web MVP for PEO Sales Pro that supports web users now and can later serve as the shared backend/content layer for the iPhone app.

## Product Foundations

### Users and roles

- `Admin`: full content, user, and opportunity management
- `Rep`: consume training, use scripts/calculators, manage opportunities, post wins
- `Franchisee`: same core learning/sales experience with franchise-specific visibility rules later

### MVP modules

- landing and auth
- dashboard
- training
- scripts
- calculators
- opportunities
- wins
- insights
- profile/settings
- admin management tools

## Delivery Phases

### Phase 1: App foundation

- scaffold Next.js App Router project
- set up Supabase auth clients for browser, server, and middleware
- create shared layout system
- create public/auth/protected route groups
- add role-aware navigation and route guards

### Phase 2: Shared data model

- create Supabase schema
- create `profiles` table tied to `auth.users`
- create role system and seed base roles
- add content tables for training, scripts, articles, wins, opportunities, calculators
- add RLS policies for read/write by role

### Phase 3: MVP screens

- build landing page
- build login, signup, forgot password, reset password
- build dashboard shell with KPI cards and recent activity
- scaffold all primary app pages with responsive layouts
- scaffold admin management pages

### Phase 4: Business logic

- residual commission calculator
- non-residual commission calculator
- role-based dashboard data
- content publishing workflow for admin-managed resources

### Phase 5: Shared-platform readiness

- expose all business entities through Supabase tables/views
- avoid web-only assumptions in schema design
- keep auth/profile structure reusable for mobile clients
- centralize content and calculator settings so iPhone app can read from the same backend later

## Architecture Decisions

### Frontend

- Next.js App Router
- TypeScript
- responsive CSS with reusable design primitives
- server-rendered protected shell where possible

### Backend

- Supabase Auth for email/password, sessions, password recovery
- Supabase Postgres for shared content and reporting data
- RLS for role-based access

### Security

- server-side session validation in layouts and middleware
- admin route guard at the route group level
- profiles table stores effective role for app authorization

## MVP Success Criteria

- users can sign up, sign in, reset password, stay logged in, and log out
- each authenticated user lands in a protected app shell
- navigation changes based on role
- admin-only areas are protected
- database schema is ready for real content and calculator data
- the same backend can later support the mobile app
