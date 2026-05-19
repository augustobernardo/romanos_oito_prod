# Plano: Validação de Idade no Formulário "/oikos"

## Data: 2026-05-12

## Objetivo

Implementar validação dinâmica de idade mínima com base no lote selecionado, com 3 camadas de proteção (frontend reativo, submit, backend).

## Regras de Negócio

| Regra | Lote | Referência | Idade | Max Birth Date |
|-------|------|-----------|-------|----------------|
| Padrão | Qualquer (≠ LOTE#0016) | 01/01/2026 | >= 17 anos | 2009-01-01 |
| Especial | LOTE#0016 (Limitado) | 07/06/2026 | **Exatamente** 16 anos | 2010-06-07 |

## Mensagens de Erro

- **Padrão**: "É necessário ter no mínimo 17 anos completos para realizar esta inscrição."
- **Especial**: "Para este lote, é necessário ter exatamente 16 anos em 07/06/2026."

## Arquitetura

### 3 Camadas de Validação

1. **HTML** — `max` dinâmico no `<input type="date">` restringe seleção de datas inválidas
2. **Frontend (tempo real)** — `useEffect` reage a mudanças de lote e data → `form.setError`/`clearErrors`
3. **Frontend (submit)** — `handleFormSubmit` bloqueia antes de avançar de step
4. **Backend** — `inscricaoMapper.ts` valida antes do `supabase.insert()` — impede bypass

### Fluxo de Validação

```
Usuário seleciona lote → setLoteSelecionado(id)
                       → useEffect revalida dataNascimento com nova regra
                       → maxDate do input é atualizado
                       
Usuário altera data  → form.watch detecta mudança
                       → validateParticipantAge(data, loteNome)
                       → setError("dataNascimento", { message }) OU clearErrors

Usuário clica enviar → handleFormSubmit
                       → validateParticipantAge novamente (barreira final)
                       → se inválido: setError + return (não avança)

Backend (insert)    → mapFormToInscricao()
                       → validateParticipantAge → throw se inválido
```

## Arquivos Criados

| Arquivo | Finalidade |
|---------|-----------|
| `src/config/ageRules.ts` | Constantes centralizadas |
| `src/utils/validateParticipantAge.ts` | Lógica de validação + getMaxBirthDateForLote |
| `src/test/utils/validateParticipantAge.test.ts` | 13 casos de teste |

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/utils/dateUtils.ts` | Adicionado `calculateAgeAtReferenceDate()` |
| `src/components/oikos/useOikosForm.ts` | 2 useEffect + validação em handleFormSubmit + passa selectedLoteNome |
| `src/components/oikos/OikosFormSection.tsx` | Passa maxDate e selectedLoteNome |
| `src/components/form/DadosPessoaisSection.tsx` | Remove MIN_AGE_BIRTHDATE hardcoded, recebe prop maxDate |
| `src/config/inscricaoMapper.ts` | Adiciona loteNome + validação backend |
| `src/services/inscricoes.service.ts` | Adiciona loteNome no insertInscricao |

## Casos de Teste

### Regra Padrão
- 17 anos completos em 01/01/2026 (nascido 2009-01-01) → válido
- 16 anos em 01/01/2026 (nascido 2009-01-02) → inválido
- Mais velho que 17 → válido
- Data vazia → inválido

### Regra Especial (LOTE#0016)
- Apenas nascido exatamente em 07/06/2010 → válido (completa 16 em 07/06/2026)
- Nascido 06/06/2010 (já tem 16+ na referência) → inválido
- Nascido 08/06/2010 (ainda 15 na referência) → inválido
- Nascido 2008-03-15 (já 18) → inválido

### Lote não especial
- Aplica regra padrão mesmo com outro nome de lote
- loteNome null/undefined → aplica regra padrão

## Resultado: 28 test files, 225 testes passando

---

## Ajustes posteriores

### Idade exata para LOTE#0016
- Validação mudou de `>= 16` para comparação de data exata (`birthDate === "2010-06-07"`)
- Impede tanto menores quanto maiores de 16 no lote especial

### Cupom Servo Amigo desabilitado para LOTE#0016
- `handleFormSubmit` envia direto para `payment` quando `selectedLoteNome === "LOTE#0016 (Limitado)"`
- Pula tanto `cupom_validation` quanto `cupom_servo`
