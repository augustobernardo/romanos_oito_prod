import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeForExport,
  formatPhone,
  formatDate,
  formatDateTime,
  convertBringShare,
  formatWorkshopGroup,
  formatPaymentMethod,
  formatPaymentStatus,
  formatArrivalTime,
  formatProof,
  formatBoolean,
  mapRegistrationToExportRow,
  generateExcel,
} from "@/services/admin/exportPentecostesRegistrations";
import type { PentecosteRegistration } from "@/types/pentecoste";

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

import * as XLSX from "xlsx";

const createMockRegistration = (
  overrides: Partial<PentecosteRegistration> = {},
): PentecosteRegistration => ({
  id: "abc-123",
  read_descriptions_confirmation: true,
  fullname: "João da Silva",
  fullname_normalized: "joao da silva",
  instagram_user: "@joaosilva",
  whatsapp_number: "11987654321",
  whatsapp_number_normalized: "11987654321",
  date_of_birth: "2000-05-15",
  contact_person_charge: null,
  confirm_authorization_underage: null,
  parish_church: "Paróquia São José",
  participate_moviment: "Grupo de Jovens",
  participate_romanos_event: "sim",
  bring_share: ["leite_1l", "refrigerante_2l"],
  bring_share_other: null,
  workshop_group: "turma_02",
  arrival_time: false,
  arrival_time_restriction: "22:00",
  expectations_pentecoste: "Crescer na fé",
  payment_method: "pix",
  payment_proof_url: "https://example.com/proof.jpg",
  payment_proof_filename: "proof.jpg",
  payment_proof_size: 102400,
  payment_uploaded_at: "2025-05-20T10:00:00Z",
  payment_status: "confirmed",
  created_at: "2025-05-18T15:30:00Z",
  updated_at: "2025-05-20T10:00:00Z",
  ...overrides,
});

describe("sanitizeForExport", () => {
  it("prefixes formula-like values with single quote", () => {
    expect(sanitizeForExport("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
    expect(sanitizeForExport("+cmd")).toBe("'+cmd");
    expect(sanitizeForExport("-value")).toBe("'-value");
    expect(sanitizeForExport("@mention")).toBe("'@mention");
    expect(sanitizeForExport("\tcalc")).toBe("'\tcalc");
    expect(sanitizeForExport("\rformula")).toBe("'\rformula");
  });

  it("returns normal values unchanged", () => {
    expect(sanitizeForExport("João")).toBe("João");
    expect(sanitizeForExport("12345")).toBe("12345");
    expect(sanitizeForExport("")).toBe("");
  });
});

describe("formatPhone", () => {
  it("formats numeric phone string to (XX) XXXXX-XXXX", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("handles already formatted phone gracefully", () => {
    expect(formatPhone("(11) 98765-4321")).toBe("(11) 98765-4321");
  });
});

describe("formatDate", () => {
  it("formats ISO date to pt-BR locale", () => {
    expect(formatDate("2025-05-18")).toBe("18/05/2025");
  });

  it("returns empty string for falsy input", () => {
    expect(formatDate("")).toBe("");
  });

  it("returns original string if date is invalid", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatDateTime", () => {
  it("formats ISO datetime to dd/MM/yyyy - HH:mm", () => {
    const result = formatDateTime("2026-05-22T18:18:30.649893+00:00");
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}$/);
  });

  it("returns empty string for falsy input", () => {
    expect(formatDateTime("")).toBe("");
  });

  it("returns original string if date is invalid", () => {
    expect(formatDateTime("not-a-date")).toBe("not-a-date");
  });
});

describe("convertBringShare", () => {
  it("maps codes to labels using BRING_SHARE_OPTIONS", () => {
    const result = convertBringShare(["leite_1l", "refrigerante_2l"], null);
    expect(result).toBe("01 Caixa de Leite (1L), 01 Pet 2L de Refrigerante");
  });

  it("includes 'outro' with the bringShareOther description", () => {
    const result = convertBringShare(["leite_1l", "outro"], "Bolo de fubá");
    expect(result).toBe("01 Caixa de Leite (1L), Outro: Bolo de fubá");
  });

  it("handles 'outro' without bringShareOther", () => {
    const result = convertBringShare(["outro"], null);
    expect(result).toBe("Outra coisa? Descreva abaixo");
  });

  it("returns empty string for null array", () => {
    expect(convertBringShare(null, null)).toBe("");
  });

  it("returns empty string for empty array", () => {
    expect(convertBringShare([], null)).toBe("");
  });

  it("leaves unknown codes as-is", () => {
    const result = convertBringShare(["unknown_item"], null);
    expect(result).toBe("unknown_item");
  });
});

describe("formatWorkshopGroup", () => {
  it("uses WORKSHOP_OPTIONS label when available", () => {
    expect(formatWorkshopGroup("turma_02")).toContain("Turma 02");
    expect(formatWorkshopGroup("turma_04")).toContain("Turma 04");
  });

  it("falls back to replacing turma_ prefix", () => {
    expect(formatWorkshopGroup("turma_99")).toBe("Turma 99");
  });

  it("returns empty string for null", () => {
    expect(formatWorkshopGroup(null)).toBe("");
  });
});

describe("formatPaymentMethod", () => {
  it('returns "PIX" for pix', () => {
    expect(formatPaymentMethod("pix")).toBe("PIX");
  });

  it('returns "Cartão Manual" for card_manual', () => {
    expect(formatPaymentMethod("card_manual")).toBe("Cartão Manual");
  });

  it("returns original for unknown methods", () => {
    expect(formatPaymentMethod("boleto")).toBe("boleto");
  });
});

describe("formatPaymentStatus", () => {
  it("uses statusLabels for known statuses", () => {
    expect(formatPaymentStatus("confirmed")).toBe("Confirmado");
    expect(formatPaymentStatus("pending")).toBe("Pendente");
    expect(formatPaymentStatus("paid")).toBe("Pago");
  });

  it("falls back to raw status for unknown values", () => {
    expect(formatPaymentStatus("unknown_status")).toBe("unknown_status");
  });
});

describe("formatArrivalTime", () => {
  it('returns "Livre" when arrivalTime is true', () => {
    expect(formatArrivalTime(true, "22:00")).toBe("Livre");
  });

  it("returns restriction value when arrivalTime is false", () => {
    expect(formatArrivalTime(false, "22:30")).toBe("22:30");
  });

  it("returns empty string when no restriction", () => {
    expect(formatArrivalTime(false, null)).toBe("");
  });
});

describe("formatProof", () => {
  it('returns "Sim" when proof URL exists', () => {
    expect(formatProof("https://example.com/proof.jpg")).toBe("Sim");
  });

  it('returns "Não" when proof URL is null', () => {
    expect(formatProof(null)).toBe("Não");
  });
});

describe("formatBoolean", () => {
  it('returns "Sim" for true', () => {
    expect(formatBoolean(true)).toBe("Sim");
  });

  it('returns "Não" for false', () => {
    expect(formatBoolean(false)).toBe("Não");
  });

  it("returns empty string for null/undefined", () => {
    expect(formatBoolean(null)).toBe("");
    expect(formatBoolean(undefined)).toBe("");
  });
});

describe("mapRegistrationToExportRow", () => {
  it("includes only user-facing columns", () => {
    const reg = createMockRegistration();
    const row = mapRegistrationToExportRow(reg);

    const allowed = [
      "Nome Completo",
      "WhatsApp",
      "Instagram",
      "Data de Nascimento",
      "Idade",
      "Paróquia",
      "Participa de Movimento",
      "Já participou do R8?",
      "Bring & Share",
      "Bring & Share (outro)",
      "Turma",
      "Horário de Chegada",
      "Expectativas",
      "Responsável",
      "Método de Pagamento",
      "Status do Pagamento",
      "Comprovante",
      "Data de Inscrição",
    ];

    const keys = Object.keys(row);
    expect(keys).toHaveLength(allowed.length);
    for (const key of allowed) {
      expect(keys).toContain(key);
    }
  });

  it("excludes internal fields", () => {
    const reg = createMockRegistration();
    const row = mapRegistrationToExportRow(reg);

    const forbiddenKeys = [
      "id",
      "fullname_normalized",
      "whatsapp_number_normalized",
      "read_descriptions_confirmation",
      "payment_proof_filename",
      "payment_proof_size",
      "payment_uploaded_at",
      "updated_at",
      "confirm_authorization_underage",
    ];

    for (const key of forbiddenKeys) {
      expect(row).not.toHaveProperty(key);
    }
  });

  it("formats name and personal data", () => {
    const reg = createMockRegistration({ fullname: "Maria Souza" });
    const row = mapRegistrationToExportRow(reg);

    expect(row["Nome Completo"]).toBe("Maria Souza");
    expect(row["WhatsApp"]).toContain("98765");
    expect(row["Instagram"]).toBe("'@joaosilva");
  });

  it("formats dates with correct format", () => {
    const reg = createMockRegistration({
      date_of_birth: "2000-05-15",
      created_at: "2026-05-22T18:18:30+00:00",
    });
    const row = mapRegistrationToExportRow(reg);

    expect(row["Data de Nascimento"]).toBe("15/05/2000");
    expect(row["Data de Inscrição"]).toMatch(
      /^\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}$/,
    );
  });

  it("formats bring & share with labels", () => {
    const reg = createMockRegistration({
      bring_share: ["cafe", "pao_de_queijo"],
      bring_share_other: null,
    });
    const row = mapRegistrationToExportRow(reg);

    expect(row["Bring & Share"]).toBe(
      "01 Garrafa com Café, Pão de Queijo (Assado)",
    );
  });

  it("formats payment method and status", () => {
    const reg = createMockRegistration({
      payment_method: "pix",
      payment_status: "confirmed",
    });
    const row = mapRegistrationToExportRow(reg);

    expect(row["Método de Pagamento"]).toBe("PIX");
    expect(row["Status do Pagamento"]).toBe("Confirmado");
  });

  it("formats arrival time correctly", () => {
    const regLivre = createMockRegistration({
      arrival_time: true,
      arrival_time_restriction: null,
    });
    expect(mapRegistrationToExportRow(regLivre)["Horário de Chegada"]).toBe(
      "Livre",
    );

    const regRestrito = createMockRegistration({
      arrival_time: false,
      arrival_time_restriction: "22:30",
    });
    expect(
      mapRegistrationToExportRow(regRestrito)["Horário de Chegada"],
    ).toBe("22:30");
  });

  it("handles null and missing optional fields", () => {
    const reg = createMockRegistration({
      instagram_user: null,
      parish_church: null,
      participate_moviment: null,
      expectations_pentecoste: null,
      contact_person_charge: null,
      workshop_group: null,
      bring_share: null,
      bring_share_other: null,
    });
    const row = mapRegistrationToExportRow(reg);

    expect(row["Instagram"]).toBe("");
    expect(row["Paróquia"]).toBe("");
    expect(row["Bring & Share"]).toBe("");
    expect(row["Turma"]).toBe("");
  });

  it("correctly formats Já participou do R8?", () => {
    const regSim = createMockRegistration({ participate_romanos_event: "sim" });
    expect(
      mapRegistrationToExportRow(regSim)["Já participou do R8?"],
    ).toBe("Sim");

    const regNao = createMockRegistration({
      participate_romanos_event: "nao",
    });
    expect(
      mapRegistrationToExportRow(regNao)["Já participou do R8?"],
    ).toBe("Não");
  });

  it("shows proof availability", () => {
    const regWithProof = createMockRegistration({
      payment_proof_url: "https://example.com/p.jpg",
    });
    expect(
      mapRegistrationToExportRow(regWithProof)["Comprovante"],
    ).toBe("Sim");

    const regWithoutProof = createMockRegistration({
      payment_proof_url: null,
    });
    expect(
      mapRegistrationToExportRow(regWithoutProof)["Comprovante"],
    ).toBe("Não");
  });
});

describe("generateExcel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates workbook with correct sheet name and writes file", () => {
    const rows = [
      { "Nome Completo": "João", WhatsApp: "(11) 98765-4321" },
      { "Nome Completo": "Maria", WhatsApp: "(11) 91234-5678" },
    ];
    const filename = "test-export.xlsx";

    generateExcel(rows, filename);

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(rows);
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.any(Object), filename);
  });

  it("handles empty rows array", () => {
    const rows: Record<string, string>[] = [];
    const filename = "empty.xlsx";

    generateExcel(rows, filename);

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
    expect(XLSX.writeFile).toHaveBeenCalled();
  });
});
