-- Add idade (age) column to inscricoes
ALTER TABLE public.inscricoes ADD COLUMN IF NOT EXISTS idade int;
