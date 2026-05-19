export type PentecostePaymentStatus =
  | "pending"
  | "awaiting_confirmation"
  | "confirmed"
  | "paid"
  | "rejected"
  | "cancelled"
  | "manual_card_payment";

export type PentecostePaymentMethod = "pix" | "card_manual";

export type WorkshopGroup =
  | "turma_01"
  | "turma_02"
  | "turma_03"
  | "turma_04";

export interface PentecosteRegistration {
  id: string;
  read_descriptions_confirmation: boolean;
  fullname: string;
  fullname_normalized: string;
  instagram_user: string | null;
  whatsapp_number: string;
  whatsapp_number_normalized: string;
  date_of_birth: string;
  contact_person_charge: string | null;
  confirm_authorization_underage: boolean | null;
  parish_church: string | null;
  participate_moviment: string | null;
  participate_romanos_event: string | null;
  bring_share: string[] | null;
  bring_share_other: string | null;
  workshop_group: WorkshopGroup | null;
  arrival_time: boolean;
  arrival_time_restriction: string | null;
  expectations_pentecoste: string | null;
  payment_method: PentecostePaymentMethod;
  payment_proof_url: string | null;
  payment_proof_filename: string | null;
  payment_proof_size: number | null;
  payment_uploaded_at: string | null;
  payment_status: PentecostePaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface PentecosteMetrics {
  total: number;
  pending: number;
  awaiting_confirmation: number;
  paid: number;
  confirmed: number;
  underage: number;
  created_today: number;
}

export type RegisterFilters = {
  search: string;
  status: PentecostePaymentStatus | "";
  method: PentecostePaymentMethod | "";
  workshop: WorkshopGroup | "";
  underage: "" | "yes" | "no";
  dateFrom: string;
  dateTo: string;
};

export type GrowthRegistrations = {
  page: number;
  pageSize: number;
  column?: string;
  ascending?: boolean;
};
