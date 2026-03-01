
-- Tabela de lotes
CREATE TABLE public.lotes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  preco TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'esgotado')),
  ordem INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de inscrições
CREATE TABLE public.inscricoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id INT REFERENCES public.lotes(id) NOT NULL,
  nome TEXT NOT NULL,
  data_nascimento TEXT NOT NULL,
  telefone TEXT NOT NULL,
  instagram TEXT NOT NULL,
  comunidade TEXT NOT NULL,
  cidade_estado TEXT NOT NULL,
  endereco_completo TEXT NOT NULL,
  como_conheceu TEXT NOT NULL,
  como_conheceu_outro TEXT,
  nome_mae TEXT NOT NULL,
  numero_mae TEXT NOT NULL,
  nome_pai TEXT NOT NULL,
  numero_pai TEXT NOT NULL,
  numero_responsavel_proximo TEXT,
  is_catolico TEXT NOT NULL,
  is_catolico_outro TEXT,
  participa_movimento TEXT NOT NULL,
  fez_retiro TEXT NOT NULL,
  fez_retiro_outro TEXT,
  nome_pessoa_emergencia TEXT NOT NULL,
  grau_parentesco_emergencia TEXT NOT NULL,
  numero_emergencia TEXT NOT NULL,
  tamanho_camisa TEXT NOT NULL,
  expectativa_oikos TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: lotes são públicos para leitura
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lotes são públicos para leitura" ON public.lotes FOR SELECT USING (true);

-- RLS: inscrições podem ser inseridas por qualquer pessoa (formulário público)
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer pessoa pode se inscrever" ON public.inscricoes FOR INSERT WITH CHECK (true);

-- Inserir lotes iniciais
INSERT INTO public.lotes (nome, preco, status, ordem) VALUES
  ('1º Lote', 'R$ 100,00', 'disponivel', 1),
  ('2º Lote', 'R$ 130,00', 'disponivel', 2),
  ('3º Lote', 'R$ 160,00', 'disponivel', 3);


-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS: only admins can read user_roles
CREATE POLICY "Admins can read user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add SELECT policy for inscricoes (admins only)
CREATE POLICY "Admins can view inscricoes"
ON public.inscricoes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for eventos
CREATE POLICY "Admins can insert eventos"
ON public.eventos
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update eventos"
ON public.eventos
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for lotes
CREATE POLICY "Admins can insert lotes"
ON public.lotes
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lotes"
ON public.lotes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin update policy for inscricoes (status changes)
CREATE POLICY "Admins can update inscricoes"
ON public.inscricoes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
