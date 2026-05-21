# Romanos Oito — Agent Guidelines

## Stack
- **React 18** + **Vite 5** + **TypeScript 5**
- **Supabase** (DB, Auth, Storage) — client at `src/integrations/supabase/client.ts`
- **shadcn/ui** + Radix UI — components at `src/components/ui/`
- **TanStack React Query** for server state
- **React Hook Form + Zod** for forms
- **PIX** only for payments (no Stripe/card)
- **Tailwind CSS 3** for styling
- **Vitest + Testing Library** for tests (NOT Jest)

## Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on **port 8080** |
| `npm run build` | Production build → `/dist` |
| `npm run build:dev` | Build in dev mode (for debugging) |
| `npm run lint` | ESLint |
| `npm run test` | Run all vitest tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Run e2e tests only (`src/test/e2e`) |
| `npm run test:hooks` | Run a specific hook test file |

## Path Alias
`@/` maps to `src/` (configured in `vite.config.ts` + `tsconfig.app.json`)

## Architecture

### Entry Point
`src/main.tsx` → `src/App.tsx` (BrowserRouter)

### Service Layer
All Supabase DB operations go through service files in `src/services/`:
- `auth.service.ts` — sign-in, sign-out, session, admin check
- `cupons.service.ts` / `cuponsServo.service.ts` — coupon CRUD
- `eventos.service.ts` / `lotes.service.ts` — event/lot CRUD
- `inscricoes.service.ts` — subscription CRUD (only `insertInscricao()` is used)
- `paymentProofUploadService.ts` / `pentecosteRegistrationService.ts` — payment proofs

### Inscricao Insertion
Use **`InscricoesService.insertInscricao()`** — inserts directly to Supabase via `supabase.from("inscricoes").insert()`. This is what `useOikosForm` uses. There is no working `/api/subscription/` proxy path.

### No API Proxy
- `vite.config.ts` has no proxy config
- `nginx.conf` is static-only — no `proxy_pass` directives
- `fetch("/api/subscription/")` will 404 unless the API is on the same host:port

### Admin Guard
`ProtectedRoute` checks if the user is **authenticated** (any signed-in user is admin). It does **not** check a `user_roles` table — `AuthService.checkAdmin()` simply returns `!!user`.

### Storage Buckets
- `Comprovantes_OIKOS` — Oikos payment receipts
- `pentecoste-payment-proofs` — Pentecostes payment proofs

## Environment Variables
- **Supabase**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (note: **NOT** `VITE_SUPABASE_ANON_KEY` — the README is wrong on this)
- **Pix**: `VITE_PIX_KEY`, `VITE_PIX_RECEIVER_NAME`
- **WhatsApp**: `VITE_WHATSAPP_NUMBER`
- **API**: `VITE_API_BASE_URL` (not currently used in prod)
- A `.env` file exists in the repo root with sandbox/demo credentials — **do not commit real keys**
- There is no `.env.example` file

## Testing
- Framework: **Vitest** with jsdom environment, `globals: true` (no need to import `describe`/`it`/`expect`)
- Setup: `src/test/setup.ts` (adds `@testing-library/jest-dom`, `matchMedia` polyfill)
- Pattern: `*.test.{ts,tsx}` or `*.spec.{ts,tsx}` in `src/`
- Factories in `src/test/factories/`: `cupom.factory.ts`, `inscricao.factory.ts`, `lote.factory.ts`
- Integration tests: `src/test/integration/hooks/useOikosForm.test.tsx`
- E2E tests: `src/test/e2e/`

## CI / Deploy
- CI (`.github/workflows/ci-cd.yml`) triggers on **PR to `main`** — runs `npm ci`, security audit, and build. Tests are **commented out**.
- Deploy (`.github/workflows/deploy-prod.yml`) triggers on **push to `main`** — builds and deploys `/dist` via **FTP** (`SamKirkland/FTP-Deploy-Action`), not Docker.
- Docker is for optional local prod simulation only (multi-stage: Node 20 build → Nginx serve).

## Branch Workflow
```
feat/* or fix/* → develop → main (production)
```
- PRs target `develop`. CI runs on PR to `main` (the merge from `develop` → `main`).
- Never push directly to `main`
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)

## Key Gotchas
- **Dev port**: 8080 (not Vite's default 5173)
- **Oikos event ID**: hardcoded in `src/config/constants.ts` as `OIKOS_EVENT_ID`
- **Supabase client** at `src/integrations/supabase/client.ts` is auto-generated — **DO NOT EDIT**
- **`opencode.json`**: bash commands default to `ask` permission (npm/pnpm/yarn and basic git status/diff/log are pre-approved; `rm` is denied)
- **`noUnusedLocals`/`noUnusedParameters`** are `false` — unused imports won't error at compile time but may fail lint
