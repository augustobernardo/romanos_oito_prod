import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, ArrowLeft } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/utils/supabase";

import { formSchema, type FormData } from "@/components/form/types";
import { useLotes, getLoteDisponivel } from "@/components/form/useLotes";
import LoteCard from "@/components/form/LoteCard";
import DadosPessoaisSection from "@/components/form/DadosPessoaisSection";
import PaisResponsaveisSection from "@/components/form/PaisResponsaveisSection";
import VidaIgrejaSection from "@/components/form/VidaIgrejaSection";
import EmergenciaSection from "@/components/form/EmergenciaSection";
import CamisaSection from "@/components/form/CamisaSection";
import ExpectativaSection from "@/components/form/ExpectativaSection";


const calculateAge = (birthday: string) => {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const EventoOikos2026 = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loteSelecionado, setLoteSelecionado] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { lotes, loading: lotesLoading } = useLotes();
  const loteDisponivelId = getLoteDisponivel(lotes);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      dataNascimento: "",
      telefone: "",
      instagram: "",
      comunidade: "",
      cidadeEstado: "",
      enderecoCompleto: "",
      comoConheceu: "",
      comoConheceuOutro: "",
      nomeMae: "",
      numeroMae: "",
      nomePai: "",
      numeroPai: "",
      numeroResponsavelProximo: "",
      isCatolico: "",
      isCatolicoOutro: "",
      participaMovimento: "",
      fezRetiro: "",
      fezRetiroOutro: "",
      nomePessoaEmergencia: "",
      grauParentescoEmergencia: "",
      numeroEmergencia: "",
      tamanhoCamisa: "",
      cienteTrocaCamisa: false,
      expectativaOikos: "",
    },
  });

  const handleCheckout = (data: FormData) => {
    navigate("/eventos/oikos-2026/checkout", {
      state: { customerEmail: data.nome },
    });
  };

  const handleSubmit = async (data: FormData) => {
    const { data: insertedData, error } = await supabase.from("inscricoes").insert({
      lote_id: loteSelecionado!,
      evento_id: "a4a01143-0560-44ea-88cd-735f7b29bf25",
      nome: data.nome,
      data_nascimento: data.dataNascimento,
      telefone: data.telefone.replace(/\D/g, ""),
      instagram: data.instagram,
      comunidade: data.comunidade,
      cidade_estado: data.cidadeEstado,
      endereco_completo: data.enderecoCompleto,
      como_conheceu: data.comoConheceu,
      como_conheceu_outro: data.comoConheceuOutro || null,
      nome_mae: data.nomeMae,
      numero_mae: data.numeroMae,
      nome_pai: data.nomePai,
      numero_pai: data.numeroPai,
      numero_responsavel_proximo: data.numeroResponsavelProximo || null,
      is_catolico: data.isCatolico,
      is_catolico_outro: data.isCatolicoOutro || null,
      participa_movimento: data.participaMovimento,
      fez_retiro: data.fezRetiro,
      fez_retiro_outro: data.fezRetiroOutro || null,
      nome_pessoa_emergencia: data.nomePessoaEmergencia,
      grau_parentesco_emergencia: data.grauParentescoEmergencia,
      numero_emergencia: data.numeroEmergencia,
      tamanho_camisa: data.tamanhoCamisa,
      expectativa_oikos: data.expectativaOikos || null,
      idade: calculateAge(data.dataNascimento)
    });

    if (error) {
      toast({
        title: "Erro ao realizar inscrição",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error("Insert error:", error);
      return;
    }

    handleCheckout(data);

    setIsSubmitted(true);
  };

  // ─── Success state ──────────────────────────────────────────────────────────

  if (isSubmitted) {
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
              Obrigado por se inscrever! Você receberá uma mensagem pelo Whatsapp informado com mais informações.
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
  }

  // ─── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4 text-center md:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Button variant="ghost" className="mb-4" onClick={() => navigate("/eventos")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar aos Eventos
              </Button>
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                OIKOS 2026
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Um final de semana de imersão espiritual e renovação da fé.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Lotes */}
        <section className="bg-background py-10">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Selecione o Lote</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Escolha o lote disponível para prosseguir com a inscrição.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {lotes.map((lote) => (
                  <LoteCard
                    key={lote.id}
                    lote={lote}
                    isActive={loteSelecionado === lote.id}
                    isEnabled={lote.id === loteDisponivelId}
                    onSelect={() => setLoteSelecionado(lote.id)}
                  />
                ))}
              </div>
              {!loteDisponivelId && (
                <p className="mt-4 text-sm font-medium text-destructive">
                  Todos os lotes estão esgotados. As inscrições foram encerradas.
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Form */}
        {loteSelecionado && (
            <section className="bg-card py-12 md:py-16">
              <div className="container mx-auto px-4 md:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto max-w-2xl"
                >
                  <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
                    Formulário de Inscrição
                  </h2>

                <Form {...form}>
                  <div className="space-y-6">
                    <DadosPessoaisSection form={form} />
                    <PaisResponsaveisSection form={form} />
                    <VidaIgrejaSection form={form} />
                    <EmergenciaSection form={form} />
                    <CamisaSection form={form} />
                    <ExpectativaSection form={form} />

                      <Button onClick={() => handleSubmit(form.getValues())} size="lg" className="w-full shadow-soft">
                        Confirmar Inscrição
                      </Button>
                    </div>
                  </Form>
                </motion.div>
              </div>
            </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventoOikos2026;
