import { describe, it, expect } from "vitest";
import {
  validateParticipantAge,
  getMaxBirthDateForLote,
  getMinBirthDateForLote,
} from "@/utils/validateParticipantAge";

describe("validateParticipantAge — regra padrão (17 anos até 05/06/2026)", () => {
  it("permite usuário nascido em 2009-05-25 (completa 17 antes do evento)", () => {
    const result = validateParticipantAge("2009-05-25");
    expect(result.valid).toBe(true);
  });

  it("permite usuário que completa 17 anos exatamente no dia do evento (nascido em 2009-06-05)", () => {
    const result = validateParticipantAge("2009-06-05");
    expect(result.valid).toBe(true);
  });

  it("permite usuário nascido em 2009-01-01 (completa 17 antes do evento)", () => {
    const result = validateParticipantAge("2009-01-01");
    expect(result.valid).toBe(true);
  });

  it("bloqueia usuário que completa 17 anos após o evento (nascido em 2009-06-06)", () => {
    const result = validateParticipantAge("2009-06-06");
    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      "É necessário ter 17 anos completos para realizar a inscrição.",
    );
  });

  it("permite usuário mais velho que 17 anos", () => {
    const result = validateParticipantAge("1995-06-20");
    expect(result.valid).toBe(true);
  });

  it("bloqueia data de nascimento vazia", () => {
    const result = validateParticipantAge("");
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Data de nascimento é obrigatória");
  });
});

describe("validateParticipantAge — regra especial LOTE#0016 (Limitado)", () => {
  const loteEspecial = 6;

  it("permite usuário que completa 16 anos exatamente em 07/06/2026 (nascido em 07/06/2010)", () => {
    const result = validateParticipantAge("2010-06-07", loteEspecial);
    expect(result.valid).toBe(true);
  });

  it("bloqueia usuário que completa 16 anos em 08/06/2026 (nascido em 08/06/2010)", () => {
    const result = validateParticipantAge("2010-06-08", loteEspecial);
    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      "Para este lote, é necessário ter exatamente 16 anos em 07/06/2026.",
    );
  });

  it("permite usuário que completa 16 anos em 12/05/2026 (antes da data de referência)", () => {
    const result = validateParticipantAge("2010-05-12", loteEspecial);
    expect(result.valid).toBe(true);
  });

  it("bloqueia usuário que já tem mais de 16 anos (nascido em 2008-03-15, teria 18)", () => {
    const result = validateParticipantAge("2008-03-15", loteEspecial);
    expect(result.valid).toBe(false);
  });

  it("bloqueia usuário com 15 anos na data de referência (nascido em 2010-06-09)", () => {
    const result = validateParticipantAge("2010-06-09", loteEspecial);
    expect(result.valid).toBe(false);
  });

  it("bloqueia usuário muito mais velho (nascido em 2003, teria 23 anos)", () => {
    const result = validateParticipantAge("2003-05-12", loteEspecial);
    expect(result.valid).toBe(false);
  });
});

describe("validateParticipantAge — lote não especial trata como regra padrão", () => {
  it("aplica regra padrão para um lote comum (não 6): bloqueia nascido em 2009-06-06", () => {
    const result = validateParticipantAge("2009-06-06", 5);
    expect(result.valid).toBe(false);
  });

  it("aplica regra padrão quando loteId é null", () => {
    const result = validateParticipantAge("2008-12-31", null);
    expect(result.valid).toBe(true);
  });

  it("aplica regra padrão quando loteId é undefined", () => {
    const result = validateParticipantAge("2008-12-31", undefined);
    expect(result.valid).toBe(true);
  });
});

describe("getMaxBirthDateForLote", () => {
  it("retorna 2009-06-05 para regra padrão", () => {
    const maxDate = getMaxBirthDateForLote(5);
    expect(maxDate).toBe("2009-06-05");
  });

  it("retorna null quando loteId é null", () => {
    const maxDate = getMaxBirthDateForLote(null);
    expect(maxDate).toBeNull();
  });

  it("retorna 2010-06-07 para lote ID 6", () => {
    const maxDate = getMaxBirthDateForLote(6);
    expect(maxDate).toBe("2010-06-07");
  });

  it("retorna null quando loteId é undefined", () => {
    const maxDate = getMaxBirthDateForLote(undefined);
    expect(maxDate).toBeNull();
  });
});

describe("getMinBirthDateForLote", () => {
  it("retorna null para lote padrão", () => {
    const minDate = getMinBirthDateForLote(5);
    expect(minDate).toBeNull();
  });

  it("retorna 2009-06-08 para lote ID 6", () => {
    const minDate = getMinBirthDateForLote(6);
    expect(minDate).toBe("2009-06-08");
  });

  it("retorna null quando loteId é null", () => {
    const minDate = getMinBirthDateForLote(null);
    expect(minDate).toBeNull();
  });

  it("retorna null quando loteId é undefined", () => {
    const minDate = getMinBirthDateForLote(undefined);
    expect(minDate).toBeNull();
  });
});
