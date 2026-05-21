import type { TablesInsert } from "@/integrations/supabase/types";
import { OIKOS_EVENT_ID } from "./constants";
import { calculateAge, calculateAgeAtReferenceDate } from "@/utils/dateUtils";
import { AGE_RULES, AGE_ERROR_MESSAGES } from "./ageRules";

export const ALLOWED_PAYMENT_METHODS = ["pix", "cupom"] as const;

type FormValues = {
  nome: string;
  dataNascimento: string;
  telefone: string;
  instagram: string;
  comunidade: string;
  cidadeEstado: string;
  enderecoCompleto: string;
  comoConheceu: string;
  comoConheceuOutro: string;
  nomeMae: string;
  numeroMae: string;
  nomePai: string;
  numeroPai: string;
  numeroResponsavelProximo: string;
  isCatolico: string;
  isCatolicoOutro: string;
  participaMovimento: string;
  fezRetiro: string;
  fezRetiroOutro: string;
  nomePessoaEmergencia: string;
  grauParentescoEmergencia: string;
  numeroEmergencia: string;
  tamanhoCamisa: string;
  expectativaOikos: string;
};

export const mapFormToInscricao = (
  loteId: number,
  formData: FormValues,
  method: "pix" | "cupom",
  status: string,
  cupomInfo?: { nomeTitular: string | null; comprovanteUrl: string | null },
  codigoServo?: string | null,
): TablesInsert<"inscricoes"> => {
  const isSpecial = loteId === AGE_RULES.SPECIAL_LOTE_ID;
  const referenceDate = isSpecial
    ? AGE_RULES.SPECIAL_REFERENCE_DATE
    : AGE_RULES.DEFAULT_REFERENCE_DATE;

  const ageAtRef = calculateAgeAtReferenceDate(formData.dataNascimento, referenceDate);

  const ageValid = isSpecial
    ? ageAtRef === AGE_RULES.SPECIAL_MIN_AGE
    : ageAtRef >= AGE_RULES.DEFAULT_MIN_AGE;

  if (!ageValid) {
    const message = isSpecial
      ? AGE_ERROR_MESSAGES.SPECIAL
      : AGE_ERROR_MESSAGES.DEFAULT;
    throw new Error(message);
  }

  if (!ALLOWED_PAYMENT_METHODS.includes(method)) {
    throw new Error(`Método de pagamento inválido: ${method}. Apenas PIX é aceito.`);
  }

  return ({
  lote_id: loteId,
  evento_id: OIKOS_EVENT_ID,
  nome: formData.nome,
  data_nascimento: formData.dataNascimento,
  telefone: formData.telefone.replace(/\D/g, ""),
  instagram: formData.instagram,
  comunidade: formData.comunidade,
  cidade_estado: formData.cidadeEstado,
  endereco_completo: formData.enderecoCompleto,
  como_conheceu: formData.comoConheceu,
  como_conheceu_outro: formData.comoConheceuOutro || null,
  nome_mae: formData.nomeMae,
  numero_mae: formData.numeroMae,
  nome_pai: formData.nomePai,
  numero_pai: formData.numeroPai,
  numero_responsavel_proximo: formData.numeroResponsavelProximo || null,
  is_catolico: formData.isCatolico,
  is_catolico_outro: formData.isCatolicoOutro || null,
  participa_movimento: formData.participaMovimento,
  fez_retiro: formData.fezRetiro,
  fez_retiro_outro: formData.fezRetiroOutro || null,
  nome_pessoa_emergencia: formData.nomePessoaEmergencia,
  grau_parentesco_emergencia: formData.grauParentescoEmergencia,
  numero_emergencia: formData.numeroEmergencia,
  tamanho_camisa: formData.tamanhoCamisa,
  expectativa_oikos: formData.expectativaOikos || null,
  idade: calculateAge(formData.dataNascimento),
  status,
  metodo_pagamento: method,
  lote_especial: method === "cupom",
  titular_especial: cupomInfo?.nomeTitular || null,
  comprovante_url: cupomInfo?.comprovanteUrl || null,
  ...(codigoServo ? ({ codigo_servo: codigoServo } as Record<string, string>) : {}),
  });
};
