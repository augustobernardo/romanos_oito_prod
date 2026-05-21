# Plano: Auditoria e Remoção Completa de Cartão — Rota "/oikos"

## Data: 2026-05-20

## Objetivo

Eliminar definitivamente qualquer vestígio de pagamento por cartão/Stripe no projeto, garantindo que o sistema funcione exclusivamente com PIX.

## Contexto

Um cliente reportou que um usuário conseguiu concluir inscrição com cartão usando o cupom "servo amigo". Auditoria completa revelou:

1. **Fluxo ativo `/oikos` já é PIX-only** — nenhum bypass existe
2. **Cupom SERVOAMIGO não altera método de pagamento** — permanece `"pix"`
3. **Código morto Stripe** ainda presente (4 arquivos)
4. **Links quebrados** apontando para páginas mortas (2 arquivos)
5. **Pacotes Stripe** instalados mas não utilizados

## Ações

### 1. Deletar código morto
- `src/pages/CheckoutOikos2026.tsx` — Stripe Pricing Table + Payment Link (sem rota)
- `src/pages/EventoOikos2026.tsx` — Página antiga com handleCheckout
- `src/utils/stripe.ts` — Constantes Stripe (inclui STRIPE_SERVO_AMIGO_PAYMENT_LINK)
- `src/components/form/useLotes.ts` — Hook legado com id_payment_link

### 2. Remover pacotes Stripe
- `@stripe/react-stripe-js`
- `@stripe/stripe-js`

### 3. Corrigir links quebrados
- `Events.tsx:56` → `/eventos/oikos-2026` → `/oikos`
- `InscricaoResultado.tsx:96` → `/eventos/oikos-2026` → `/oikos`

### 4. Limpar id_payment_link
- `src/hooks/useLotes.ts` — remover id_payment_link, getLoteDisponivelPaymentLink
- `src/components/form/LoteCard.tsx` — remover id_payment_link da interface

### 5. Hardening backend
- `inscricaoMapper.ts` — validar explicitamente que method é "pix" ou "cupom"

### 6. Atualizar testes
- Testes que referenciam card_manual, CheckoutOikos2026, EventoOikos2026

### 7. Atualizar AGENTS.md
- Remover Stripe da lista de env vars

### 8. Atualizar `.env`
- Remover variáveis Stripe residuais (se houver)
