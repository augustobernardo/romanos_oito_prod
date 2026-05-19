# OIKOS PIX-Only Payment Refactor

## Summary
Refactor the `/oikos/` payment flow to support PIX only, remove all card/Stripe functionality, secure the PIX CPF from visual exposure, and simplify the UX.

## Architecture

The active `/oikos` route renders: `OikosLanding → OikosFormSection → useOikosForm (hook) → PaymentStep (component)`.

Stripe integration is purely client-side (Payment Link redirects + Pricing Table embed). No server-side Stripe code exists.

## Stripe Removal Strategy

1. Remove `@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe` from package.json
2. Delete `src/utils/stripe.ts` — move PIX constants to new `src/utils/pix.ts`
3. Delete `src/pages/CheckoutOikos2026.tsx` (dead page)
4. Delete `src/pages/EventoOikos2026.tsx` (dead page)
5. Delete `src/components/form/useLotes.ts` (legacy duplicate)
6. Remove `id_payment_link` from LoteInfo type and useLotes hook
7. Remove credit payment logic from useOikosForm

## Files

### New (2)
- `src/utils/pix.ts`
- `src/components/ui/pix-copy-button.tsx`

### Modified (10)
- `src/components/oikos/PaymentStep.tsx` — PIX-only, secure copy, SAC notice
- `src/components/oikos/useOikosForm.ts` — remove credit flow
- `src/components/oikos/OikosFormSection.tsx` — remove credit props
- `src/components/oikos/ConfirmationScreen.tsx` — minor updates
- `src/components/form/LoteCard.tsx` — remove id_payment_link
- `src/hooks/useLotes.ts` — remove id_payment_link + getLoteDisponivelPaymentLink
- `src/config/inscricaoMapper.ts` — remove "credit" from method type
- `src/components/pentecostes/steps/Step3Payment.tsx` — import path update
- `package.json` — remove stripe deps
- `.env` — remove stripe vars

### Deleted (4)
- `src/utils/stripe.ts`
- `src/pages/CheckoutOikos2026.tsx`
- `src/pages/EventoOikos2026.tsx`
- `src/components/form/useLotes.ts`

### Tests Updated (3)
- `src/test/integration/components/oikos/PaymentStep.test.tsx`
- `src/test/e2e/oikosInscricaoPayments.e2e.test.ts`
- `src/test/integration/hooks/useOikosForm.test.tsx`

## Security
- PIX CPF NEVER rendered in DOM
- Copy only via navigator.clipboard.writeText with execCommand fallback
- No PIX data in logs, toasts, or analytics

## States
- `pix_ready` → `copying` → `copied` → `copy_failed`
- `proof_pending` → `proof_uploaded`
