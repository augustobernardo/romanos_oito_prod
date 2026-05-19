# Corrigir Bug de Skip do Step de Pagamento — Pentecostes

## Problema

Usuários relatam que, em alguns casos, o formulário da rota `/pentecostes` pula o step de pagamento (Step3Payment) e vai direto para a tela de sucesso.

## Investigação

Após auditoria completa do fluxo (máquina XState, hooks, componentes, schema Zod, RPC Supabase), a máquina está logicamente correta. O único caminho para `submission_success` é:  
`step4_payment → SUBMIT (canSubmit) → uploading_proof → submitting_registration → submission_success`

O guard `canSubmit` exige `paymentProofFile !== null`.

### Hipóteses
- Race condition com `handlePrimary` não estabilizada (sem `useCallback`) em React concurrent rendering
- `submission_success.entry: "resetContext"` zera contexto prematuramente
- Falta de testes E2E cobrindo o fluxo de pagamento completo

## Plano

### 1. Refatorar `handlePrimary` com defesas duplas
- Adicionar `useCallback` com dependências corretas
- Verificar `isLastStep && currentStep === 3` antes de submeter
- Log warning se estado for inconsistente

### 2. Remover `entry: "resetContext"` do `submission_success`
- Reset deve ocorrer apenas no `RESET` (Nova Inscrição), não na entrada

### 3. Adicionar logs de transição na máquina XState
- Log estado anterior → evento → próximo estado + valores de guards

### 4. Criar `pentecostesFlow.ts` com validador centralizado
- Função `canNavigateTo(targetStep)` como camada extra

### 5. Adicionar testes E2E do fluxo completo de pagamento
- Upload de comprovante + submit + verificação de sucesso
- Bloqueio de submit sem comprovante
- Double-click prevention

### 6. Melhorar UX do botão "Enviar"
- Texto explicativo quando disabled por falta de comprovante

## Arquivos

| Ação | Arquivo |
|------|---------|
| Modificar | `src/components/pentecostes/PentecostesForm.tsx` |
| Modificar | `src/machines/pentecosteFormMachine.ts` |
| Criar | `src/services/pentecostesFlow.ts` |
| Modificar | `src/test/e2e/pentecostesForm.e2e.test.tsx` |
