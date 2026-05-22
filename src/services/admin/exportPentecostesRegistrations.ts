import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import type { PentecosteRegistration } from "@/types/pentecoste";
import { BRING_SHARE_OPTIONS, WORKSHOP_OPTIONS } from "@/components/pentecostes/schema";
import { statusLabels } from "@/components/admin/pentecostes/statusTransitions";
import { calculateAge } from "@/utils/dateUtils";

const BRING_SHARE_MAP = new Map(
  BRING_SHARE_OPTIONS.map((opt) => [opt.value, opt.label]),
);

const WORKSHOP_MAP = new Map(
  WORKSHOP_OPTIONS.map((opt) => [opt.value, opt.label]),
);

export const sanitizeForExport = (val: string): string => {
  if (
    val.startsWith("=") ||
    val.startsWith("+") ||
    val.startsWith("-") ||
    val.startsWith("@") ||
    val.startsWith("\t") ||
    val.startsWith("\r")
  ) {
    return "'" + val;
  }
  return val;
};

export const formatPhone = (phone: string): string =>
  phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR");
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const date = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} - ${time}`;
};

export const convertBringShare = (
  codes: string[] | null,
  bringShareOther: string | null,
): string => {
  if (!codes || codes.length === 0) return "";

  const labels = codes.map((code) => {
    if (code === "outro" && bringShareOther) {
      return `Outro: ${bringShareOther}`;
    }
    return BRING_SHARE_MAP.get(code) ?? code;
  });

  return labels.join(", ");
};

export const formatWorkshopGroup = (group: string | null): string => {
  if (!group) return "";
  const mapped = WORKSHOP_MAP.get(group);
  if (mapped) return mapped;
  return group.replace("turma_", "Turma ");
};

export const formatPaymentMethod = (method: string): string => {
  if (method === "pix") return "PIX";
  if (method === "card_manual") return "Cartão Manual";
  return method;
};

export const formatPaymentStatus = (status: string): string => {
  return (statusLabels as Record<string, string>)[status] ?? status;
};

export const formatArrivalTime = (
  arrivalTime: boolean,
  restriction: string | null,
): string => {
  if (arrivalTime) return "Livre";
  return restriction ?? "";
};

export const formatProof = (url: string | null): string => {
  if (!url) return "Não";
  return "Sim";
};

export const formatBoolean = (val: boolean | null | undefined): string => {
  if (val === true) return "Sim";
  if (val === false) return "Não";
  return "";
};

export type ExportRow = Record<string, string>;

export const mapRegistrationToExportRow = (
  reg: PentecosteRegistration,
): ExportRow => {
  const age = calculateAge(reg.date_of_birth);

  const raw: Record<string, string> = {
    "Nome Completo": reg.fullname ?? "",
    WhatsApp: formatPhone(reg.whatsapp_number ?? ""),
    Instagram: reg.instagram_user ?? "",
    "Data de Nascimento": formatDate(reg.date_of_birth),
    Idade: age > 0 ? String(age) : "",
    Paróquia: reg.parish_church ?? "",
    "Participa de Movimento": reg.participate_moviment ?? "",
    "Já participou do R8?": formatBoolean(reg.participate_romanos_event === "sim"
      ? true
      : reg.participate_romanos_event === "nao"
        ? false
        : undefined),
    "Bring & Share": convertBringShare(reg.bring_share, reg.bring_share_other),
    "Bring & Share (outro)": reg.bring_share_other ?? "",
    Turma: formatWorkshopGroup(reg.workshop_group),
    "Horário de Chegada": formatArrivalTime(
      reg.arrival_time,
      reg.arrival_time_restriction,
    ),
    Expectativas: reg.expectations_pentecoste ?? "",
    Responsável: reg.contact_person_charge ?? "",
    "Método de Pagamento": formatPaymentMethod(reg.payment_method),
    "Status do Pagamento": formatPaymentStatus(reg.payment_status),
    Comprovante: formatProof(reg.payment_proof_url),
    "Data de Inscrição": formatDateTime(reg.created_at),
  };

  const row: ExportRow = {};
  for (const [key, val] of Object.entries(raw)) {
    row[key] = sanitizeForExport(val);
  }
  return row;
};

export const fetchAllRegistrations = async (): Promise<PentecosteRegistration[]> => {
  const all: PentecosteRegistration[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("pentecoste_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const registrations = (data ?? []) as unknown as PentecosteRegistration[];
    all.push(...registrations);

    if (registrations.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return all;
};

export const generateExcel = (rows: ExportRow[], filename: string): void => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pentecoste");
  XLSX.writeFile(wb, filename);
};

export const exportToExcel = async (): Promise<void> => {
  const registrations = await fetchAllRegistrations();

  if (registrations.length === 0) {
    throw new Error("Nenhuma inscrição para exportar");
  }

  const rows = registrations.map(mapRegistrationToExportRow);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `pentecostes-registrations-${today}.xlsx`;

  generateExcel(rows, filename);
};
