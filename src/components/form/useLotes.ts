import { useState, useEffect } from "react";
import { supabase}  from "@/integrations/supabase/client";
import type { LoteInfo } from "./LoteCard";

export const useLotes = (): { lotes: LoteInfo[]; loading: boolean } => {
  const [lotes, setLotes] = useState<LoteInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotes = async () => {
      const { data, error } = await supabase
        .from("lotes")
        .select("*")
        .order("ordem", { ascending: true });

      if (!error && data) {
        setLotes(
          data.map((l: any) => ({
            id: l.id,
            id_payment_link: l.id_payment_link,
            nome: l.nome,
            preco: l.preco,
            status: l.status as "disponivel" | "esgotado",
          }))
        );
      }
      setLoading(false);
    };
    fetchLotes();
  }, []);

  return { lotes, loading };
};

export const getLoteDisponivel = (lotes: LoteInfo[]): number | null => {
  for (const lote of lotes) {
    if (lote.status === "disponivel") return lote.id;
  }
  return null;
};

export const getLoteDisponivelPaymentLink = (lotes: LoteInfo[], loteId: number): string | null => {
  const lote = lotes.find((l) => l.id === loteId);
  if (lote && lote.status === "disponivel") {
    return lote.id_payment_link;
  }
  return null;
};