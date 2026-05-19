# Pentecoste Admin Dashboard — Implementation Plan

## Overview
Build a complete admin dashboard for Pentecoste registrations at `/admin/pentecostes`.

## Architecture Decisions
- **Status update**: New RPC `update_pentecoste_payment_status` (SECURITY DEFINER)
- **Insert status**: Change existing RPC to set `'awaiting_confirmation'` instead of `'confirmed'`
- **Types**: Manual type definitions in `src/types/pentecoste.ts` (no supabase CLI)
- **Auth**: Reuse existing `ProtectedRoute` + RLS policies

## Files to Create (8)

| # | File | Purpose |
|---|------|---------|
| 1 | `src/types/pentecoste.ts` | Manual types: row, insert, RPC args |
| 2 | `src/services/admin/pentecoste.service.ts` | findAll, updatePaymentStatus, getMetrics, getById |
| 3 | `src/components/admin/pentecostes/MetricsCards.tsx` | 5 overview cards |
| 4 | `src/components/admin/pentecostes/RegistrationFilters.tsx` | Filter bar |
| 5 | `src/components/admin/pentecostes/RegistrationsTable.tsx` | Table + mobile cards |
| 6 | `src/components/admin/pentecostes/RegistrationDetailsDrawer.tsx` | Side drawer + proof viewer |
| 7 | `src/components/admin/pentecostes/PaymentStatusBadge.tsx` | Color-coded badge |
| 8 | `supabase/migrations/20260510_pentecoste_admin.sql` | Status RPC + insert RPC update |

## Files to Modify (3)

| # | File | Change |
|---|------|--------|
| 1 | `src/App.tsx` | Add `/admin/pentecostes` route |
| 2 | `src/components/AdminLayout.tsx` | Add "Pentecostes" nav item |
| 3 | `supabase/migrations/20260508000004_*.sql` | Update insert RPC status |

## Test Files (6)

| # | File | Coverage |
|---|------|----------|
| 1 | `PentecosteAdmin.test.tsx` | Route protection, integration |
| 2 | `MetricsCards.test.tsx` | Loading, count, error |
| 3 | `RegistrationFilters.test.tsx` | Filter ops, mobile |
| 4 | `RegistrationsTable.test.tsx` | Rows, pagination |
| 5 | `RegistrationDetailsDrawer.test.tsx` | Drawer, proof |
| 6 | `PaymentStatusBadge.test.tsx` | Colors, a11y |

## Key Patterns
- TanStack Query for data fetching (matching other admin pages)
- Supabase best practices: {count:"exact",head:true} for metrics
- Signed URLs for proof access (60-min expiry)
- Debounced search (300ms)
- URL-state persistence via useSearchParams
- Server-side pagination via supabase range()
