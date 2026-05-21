import { OIKOS_EVENT_START_DATE } from "./constants";

export const AGE_RULES = {
  DEFAULT_MIN_AGE: 17,
  DEFAULT_REFERENCE_DATE: OIKOS_EVENT_START_DATE,
  SPECIAL_LOTE_NOME: "LOTE#0016 (16+ | Quantidade Limitada)",
  SPECIAL_LOTE_ID: 6,
  SPECIAL_MIN_AGE: 16,
  SPECIAL_REFERENCE_DATE: "2026-06-07",
} as const;

export const AGE_ERROR_MESSAGES = {
  DEFAULT:
    "É necessário ter 17 anos completos para realizar a inscrição.",
  SPECIAL:
    "Para este lote, é necessário ter exatamente 16 anos em 07/06/2026.",
} as const;
