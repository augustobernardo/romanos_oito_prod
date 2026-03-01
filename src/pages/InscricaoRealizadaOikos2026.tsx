import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const InscricaoRealizadaOikos2026 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Inscrição Confirmada!
          </h1>
          <p className="mt-4 text-muted-foreground">
            Obrigado por se inscrever!
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/eventos")}>
              Voltar aos Eventos
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default InscricaoRealizadaOikos2026;
