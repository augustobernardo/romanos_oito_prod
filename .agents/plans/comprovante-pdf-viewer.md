# Visualização de Comprovantes — Suporte a PDF + Imagens

## Problema

Os componentes de visualização de comprovantes em `/admin/pentecostes` (e também Oikos/Cupons) usam apenas `<img>` para renderizar o preview. Como PDF é um formato aceito no upload (`application/pdf` — `Step3Payment.tsx:16`), PDFs nunca carregam — a tag `<img>` não renderiza PDF.

**Problema adicional:** A sobreposição full-screen do preview em `RegistrationDetailsDrawer.tsx` usa `z-50`, mesma camada do `SheetOverlay` portaled. O portal insere o overlay depois no DOM, então o Sheet fica acima do preview.

## Plano

### 1. Criar `src/lib/fileType.ts`
Utilitário de detecção por extensão:
- `'image'` → `.png`, `.jpg`, `.jpeg`, `.webp`
- `'pdf'` → `.pdf`
- `'unknown'` → fallback

### 2. Criar `src/components/ReceiptViewer.tsx`
Componente reutilizável:

| Tipo | Renderização |
|------|-------------|
| Imagem | `<img>` com `object-contain`, loading/error states |
| PDF | `<iframe>` full-width/height, loading state |
| Unknown | Tenta ambos, fallback amigável |
| Erro | "Não foi possível visualizar este comprovante." |
| Loading | Spinner `<Loader2>` |

Props: `url`, `filename?`, `alt?`, `className?`, `onClick?`

### 3. Corrigir `RegistrationDetailsDrawer.tsx`
- Substituir `<img>` por `<ReceiptViewer>`
- Aumentar z-index do overlay para `z-[60]`
- Passar `payment_proof_filename` para detecção de tipo
- Corrigir callback duplicado de erro no `loadProof`

### 4. Corrigir `AdminInscricoes.tsx` (Oikos)
- Substituir `<img>` no Dialog por `<ReceiptViewer>`

### 5. Corrigir `AdminCupons.tsx`
- Substituir `<img>` no Dialog por `<ReceiptViewer>`

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/lib/fileType.ts` |
| Criar | `src/components/ReceiptViewer.tsx` |
| Modificar | `src/components/admin/pentecostes/RegistrationDetailsDrawer.tsx` |
| Modificar | `src/components/admin/AdminInscricoes.tsx` |
| Modificar | `src/components/admin/AdminCupons.tsx` |
