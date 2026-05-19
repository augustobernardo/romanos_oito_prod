import { supabase } from "@/integrations/supabase/client";
import type {
  PentecosteRegistration,
  PentecosteMetrics,
  PentecostePaymentStatus,
} from "@/types/pentecoste";
import { calculateAge } from "@/utils/dateUtils";

export const PentecosteService = {
  async findAll(
    page: number,
    pageSize: number,
    filters?: {
      search?: string;
      status?: string;
      method?: string;
      workshop?: string;
      underage?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("pentecoste_registrations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filters?.search) {
      const term = `%${filters.search}%`;
      query = query.or(
        `fullname.ilike.${term},whatsapp_number.ilike.${term},instagram_user.ilike.${term},parish_church.ilike.${term}`
      );
    }

    if (filters?.status) {
      query = query.eq("payment_status", filters.status);
    }

    if (filters?.method) {
      query = query.eq("payment_method", filters.method);
    }

    if (filters?.workshop) {
      query = query.eq("workshop_group", filters.workshop);
    }

    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte("created_at", `${filters.dateTo}T23:59:59`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    let registrations = (data ?? []) as unknown as PentecosteRegistration[];

    if (filters?.underage === "yes") {
      registrations = registrations.filter(
        (r) => calculateAge(r.date_of_birth) < 18
      );
    } else if (filters?.underage === "no") {
      registrations = registrations.filter(
        (r) => calculateAge(r.date_of_birth) >= 18
      );
    }

    return { registrations, total: count ?? 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("pentecoste_registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as unknown as PentecosteRegistration;
  },

  async updatePaymentStatus(id: string, status: PentecostePaymentStatus) {
    const { data, error } = await supabase.rpc(
      "update_pentecoste_payment_status",
      { _registration_id: id, _new_status: status },
    );

    if (error) throw error;

    const result = data as { success: boolean; error?: string };
    if (!result.success) {
      throw new Error(result.error ?? "Erro ao atualizar status");
    }

    return result;
  },

  async deleteRegistration(id: string) {
    const { data, error } = await supabase
      .from("pentecoste_registrations")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(
        "Não foi possível remover o registro. Execute a migration SQL de policies.",
      );
    }
  },

  async getMetrics(): Promise<PentecosteMetrics> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [
      totalRes,
      pendingRes,
      awaitingRes,
      paidRes,
      confirmedRes,
      allRes,
      todayRes,
    ] = await Promise.all([
      supabase
        .from("pentecoste_registrations")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("pentecoste_registrations")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "pending"),
      supabase
        .from("pentecoste_registrations")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "awaiting_confirmation"),
      supabase
        .from("pentecoste_registrations")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "paid"),
      supabase
        .from("pentecoste_registrations")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "confirmed"),
      supabase
        .from("pentecoste_registrations")
        .select("date_of_birth"),
      supabase
        .from("pentecoste_registrations")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
    ]);

    const underage =
      allRes.data?.filter((r) => calculateAge(r.date_of_birth ?? "") < 18)
        .length ?? 0;

    return {
      total: totalRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      awaiting_confirmation: awaitingRes.count ?? 0,
      paid: paidRes.count ?? 0,
      confirmed: confirmedRes.count ?? 0,
      underage,
      created_today: todayRes.count ?? 0,
    };
  },
};
