# Plano: Correção do Bug `metodo_pagamento = "credit"` com Cupom Servo Amigo

## Data: 2026-05-20

## Problema

Registro de inscrição na rota `/oikos` utilizando cupom "servo amigo" foi salvo com `metodo_pagamento = "credit"` e sem comprovante (`comprovante_url` nulo). O admin exibe como "Cartão".

## Diagnóstico

O código atual da aplicação **NÃO pode gerar `metodo_pagamento = "credit"`**. Os únicos valores enviados são `"pix"` e `"cupom"` (validado por `ALLOWED_PAYMENT_METHODS` em `inscricaoMapper.ts:6`).

### Causa Raiz Provável

A coluna `metodo_pagamento` foi adicionada manualmente no dashboard do Supabase — não há migration no repositório e o campo não existe nos tipos TypeScript gerados (`src/integrations/supabase/types.ts`). Se a coluna foi criada com `DEFAULT 'credit'`, qualquer insert que não enviar explicitamente `metodo_pagamento` herdaria esse valor.

### Hipóteses Alternativas

1. **Trigger/RPC modificado em produção** — a RPC `validar_cupom_servo` pode ter sido alterada no Supabase para inserir registros
2. **Registro criado manualmente** via dashboard do Supabase
3. **Cache de versão antiga** — browser do usuário serviu JS com fluxo de cartão (antes do commit `21d8875`)

## Verificações Necessárias (executar no SQL Editor do Supabase)

```sql
-- 1. Verificar valor default da coluna
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'inscricoes' AND column_name = 'metodo_pagamento';

-- 2. Listar triggers na tabela inscricoes
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'inscricoes';

-- 3. Ver se a RPC validar_cupom_servo foi modificada em produção
SELECT prosrc FROM pg_proc WHERE proname = 'validar_cupom_servo';

-- 4. Inspecionar registros com metodo_pagamento = 'credit'
SELECT id, metodo_pagamento, comprovante_url, codigo_servo, lote_id, status, created_at
FROM public.inscricoes
WHERE metodo_pagamento = 'credit'
ORDER BY created_at DESC LIMIT 5;
```

## Ações Corretivas

| # | Ação | Onde |
|---|------|------|
| 1 | **Mudar DEFAULT** de `'credit'` para `'pix'` | SQL no Supabase |
| 2 | **Adicionar CHECK constraint** rejeitando `'credit'` para role `anon` | SQL no Supabase |
| 3 | **Regenerar tipos** com `npx supabase gen types` para incluir `metodo_pagamento` | Repositório |
| 4 | **Criar migration** documentando coluna e constraint | `supabase/migrations/` |
