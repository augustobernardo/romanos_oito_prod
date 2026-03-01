import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
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
