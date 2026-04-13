import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const InscricaoResultado = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const resultado = searchParams.get("resultado"); // "sucesso" ou "cancelado"
  const inscricaoId = searchParams.get("inscricao_id");

  useEffect(() => {
    const atualizarStatus = async () => {
      if (!inscricaoId) {
        setStatus(resultado === "sucesso" ? "success" : "error");
        return;
      }

      const novoStatus =
        resultado === "sucesso" ? "Confirmado" : "Não efetuado";

      const { error } = await supabase
        .from("inscricoes")
        .update({ status: novoStatus })
        .eq("id", inscricaoId);

      if (error) {
        console.error("Erro ao atualizar status:", error);
      }

      setStatus(resultado === "sucesso" ? "success" : "error");
    };

    atualizarStatus();
  }, [resultado, inscricaoId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
              isSuccess ? "bg-primary/10" : "bg-destructive/10"
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="h-10 w-10 text-primary" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground">
            {isSuccess ? "Inscrição Confirmada!" : "Pagamento Não Efetuado"}
          </h1>

          <p className="mt-4 max-w-md text-muted-foreground">
            {isSuccess
              ? "Seu pagamento foi confirmado com sucesso! Você receberá uma mensagem pelo WhatsApp com mais informações."
              : "O pagamento não foi concluído. Sua inscrição não foi confirmada. Você pode tentar novamente."}
          </p>

          <div className="mt-8 flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/eventos")}>
              Voltar aos Eventos
            </Button>
            {!isSuccess && (
              <Button onClick={() => navigate("/eventos/oikos-2026")}>
                Tentar Novamente
              </Button>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default InscricaoResultado;
