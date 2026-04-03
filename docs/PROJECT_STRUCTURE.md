# Starter Project Structure

```text
peo-sales-pro-web/
  docs/
    IMPLEMENTATION_PLAN.md
    AUTH_AND_ROLES.md
    PROJECT_STRUCTURE.md
    ROUTE_MAP.md
  supabase/
    schema.sql
  src/
    app/
      (app)/
        admin/
          articles/page.tsx
          opportunities/page.tsx
          users/page.tsx
          wins/page.tsx
          layout.tsx
        calculators/page.tsx
        dashboard/page.tsx
        insights/page.tsx
        opportunities/page.tsx
        scripts/page.tsx
        settings/page.tsx
        training/page.tsx
        wins/page.tsx
        layout.tsx
      forgot-password/page.tsx
      login/page.tsx
      reset-password/page.tsx
      signup/page.tsx
      globals.css
      layout.tsx
      page.tsx
    components/
      app/
      auth/
      public/
      ui/
    lib/
      auth/
      supabase/
      demo-data.ts
      navigation.ts
      utils.ts
  middleware.ts
  package.json
  tsconfig.json
  next.config.mjs
  .env.example
```

## Folder intent

- `docs`: planning, route, auth, and implementation reference
- `supabase`: database schema and policies
- `src/app`: Next.js App Router pages and layouts
- `src/components`: reusable UI and app shell components
- `src/lib`: auth helpers, Supabase clients, shared data, and navigation logic
