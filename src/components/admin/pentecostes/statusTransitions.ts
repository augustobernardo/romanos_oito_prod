import type { PentecostePaymentStatus } from "@/types/pentecoste";

export const statusLabels: Record<PentecostePaymentStatus, string> = {
  pending: "Pendente",
  awaiting_confirmation: "Aguardando",
  confirmed: "Confirmado",
  paid: "Pago",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
  manual_card_payment: "Cartão Manual",
};

export const DRAWER_STATUS_OPTIONS: PentecostePaymentStatus[] = [
  "confirmed",
  "awaiting_confirmation",
  "cancelled",
];
