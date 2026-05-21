# Plano: Correção do Botão "Copiar Chave PIX" na Rota "/pentecostes"

## Data: 2026-05-20

## Problema

Usuários relatam erro "Erro ao tentar copiar. Tente novamente." ao clicar no botão "Copiar chave PIX" na tela de pagamento do Pentecostes.

## Causa Raiz

O handler `handleCopyPixKey` em `Step3Payment.tsx:55-63` é uma implementação mínima que usa apenas `navigator.clipboard.writeText()` sem fallback:

- Sem verificação `window.isSecureContext`
- Sem fallback `document.execCommand("copy")` para Safari/iOS
- Sem guarda de chave vazia
- `catch` sem `console.error` (impossível debugar)

## Solução

1. Criar `src/utils/copyToClipboard.ts` com helper robusto e reutilizável
2. Refatorar `PixCopyButton` (Oikos) para usar o novo helper
3. Substituir handler inline do Step3Payment pelo helper + manter UI existente

## Arquivos

### Novo (1)
- `src/utils/copyToClipboard.ts`

### Modificados (2)
- `src/components/ui/pix-copy-button.tsx` — usar helper compartilhado
- `src/components/pentecostes/steps/Step3Payment.tsx` — usar helper, remover estados copiados, manter UI
