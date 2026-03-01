
-- Criar tabela de eventos
CREATE TABLE public.eventos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  data_inicio date,
  data_fim date,
  local text,
  tem_lote boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para eventos (leitura pública)
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eventos são públicos para leitura" ON public.eventos FOR SELECT USING (true);

-- Adicionar evento_id na tabela lotes
ALTER TABLE public.lotes ADD COLUMN evento_id uuid REFERENCES public.eventos(id);

-- Adicionar evento_id e status na tabela inscricoes
ALTER TABLE public.inscricoes ADD COLUMN evento_id uuid REFERENCES public.eventos(id);
ALTER TABLE public.inscricoes ADD COLUMN status text NOT NULL DEFAULT 'processando';
