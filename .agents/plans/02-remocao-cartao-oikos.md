# Plano: Remoção do Pagamento por Cartão da Rota "/oikos"

## Data: 2026-05-12

## Objetivo

Remover completamente a opção de pagamento por cartão da rota "/oikos", mantendo exclusivamente PIX.

## Contexto

O fluxo "card_manual" atual **não possui inputs de cartão** (sem número, CVV, parcelamento, bandeira). É um fluxo manual onde:
- Status vai como "pending"
- Usuário é orientado a contactar SAC via WhatsApp para finalizar pagamento por cartão externamente

## Mudança de Fluxo

**Antes**: `PaymentStep` → escolhe PIX ou Cartão → cada um tem seu fluxo  
**Depois**: `PaymentStep` → mostra PIX diretamente (QR code + upload + botão)

```
Formulário → Cupom Servo (opcional) → PIX (direto) → Confirmação
```

---

## Arquivos a Modificar (7)

### 1. `src/components/oikos/PaymentStep.tsx`
- **Remover**: `PaymentCard` type, estado `selectedMethod`, card de seleção "Cartão" (linhas 143-178), seção inteira de Cartão (linhas 293-345), `handleCardSubmit`, prop `onCardManualPayment`
- **Simplificar**: remover UI de seleção de método — entra direto no PIX

### 2. `src/components/oikos/useOikosForm.ts`
- **Remover**: `"card_manual"` do tipo `PaymentMethodUsed`, função `handleCardManualPayment`, export de `handleCardManualPayment`
- **Simplificar**: `handleBackToForm` — remove `setPaymentMethodUsed(null)`
- **Manter**: `paymentMethodUsed` para distinguir "pix" vs "cupom" na confirmação

### 3. `src/components/oikos/OikosFormSection.tsx`
- **Remover**: destructuring de `handleCardManualPayment`, prop `onCardManualPayment` no PaymentStep
- **Simplificar**: ConfirmationScreen variant — sempre `"pix"`

### 4. `src/components/oikos/ConfirmationScreen.tsx`
- **Remover**: tipo `ConfirmationVariant`, objeto `cardManualConfirmation`, variável `isCardManual`, bloco WhatsApp CTA condicional
- **Simplificar**: sem variant prop — sempre mostra confirmação PIX

### 5. `src/services/inscricoes.service.ts`
- **Remover**: `"card_manual"` do union type do parâmetro `method` em `insertInscricao`

### 6. `src/config/inscricaoMapper.ts`
- **Remover**: `"card_manual"` do union type do parâmetro `method`
- **Manter**: `metodo_pagamento: method` — só receberá `"pix"` ou `"cupom"`

## Arquivos a NÃO Modificar

| Arquivo | Motivo |
|---------|--------|
| `AdminInscricoes.tsx` | Exibição de dados históricos (mantém label "Cartão SAC") |
| `CheckoutOikos2026.tsx` | Página separada de checkout Stripe, não é a rota `/oikos` |
| `pentecoste.ts` / admin pentecostes | Evento diferente |
| `inscricao.factory.ts` | Já usa `metodo_pagamento: "pix"` como padrão |

## Testes a Modificar (5)

| Arquivo | Ação |
|---------|------|
| `PaymentStep.test.tsx` | Remover testes de Cartão (linhas 90-103, 164-177), simplificar props |
| `useOikosForm.test.tsx` | Remover teste card_manual, atualizar mock de insertInscricao |
| `ConfirmationScreen.test.tsx` | Remover 2 testes card_manual |
| `oikosInscricaoPayments.e2e.test.ts` | Remover teste card_manual |
| `inscricaoMapper.test.ts` | Remover teste `"define metodo_pagamento como card_manual"` |

## Impacto

- Nenhum registro existente no banco é afetado
- Apenas novos cadastros não terão mais `metodo_pagamento = "card_manual"`
- Admin continua exibindo "Cartão SAC" para registros antigos
- Fluxo simplificado: sem escolha de método, direto para PIX
