import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Copy, CreditCard, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/utils/supabase";

import { formSchema, type FormData } from "@/components/form/types";
import {
  useLotes,
  getLoteDisponivel,
  getLoteDisponivelPaymentLink,
} from "@/components/form/useLotes";
import LoteCard from "@/components/form/LoteCard";
import DadosPessoaisSection from "@/components/form/DadosPessoaisSection";
import PaisResponsaveisSection from "@/components/form/PaisResponsaveisSection";
import VidaIgrejaSection from "@/components/form/VidaIgrejaSection";
import EmergenciaSection from "@/components/form/EmergenciaSection";
import CamisaSection from "@/components/form/CamisaSection";
import ExpectativaSection from "@/components/form/ExpectativaSection";
import { STRIPE_PAYMENT_LINK_BASE_URL } from "@/utils/stripe";

import qrCodePix from "@/assets/qr_code_pix.png";

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

type PaymentMethod = "credit" | "pix" | null;

const OikosFormSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loteSelecionado, setLoteSelecionado] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
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

  const goToPaymentLink = () => {
    const selectedLotePaymentId = getLoteDisponivelPaymentLink(
      lotes,
      loteSelecionado!,
    );
    if (selectedLotePaymentId) {
      const selectedLoteId = selectedLotePaymentId;
      const paymentLink = `${STRIPE_PAYMENT_LINK_BASE_URL}${selectedLoteId}`;

      const url = new URL(paymentLink);
      window.location.href = url.toString();
    }
  };

  const handleSubmit = async (data: FormData) => {
    const { error } = await supabase.from("inscricoes").insert({
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
      idade: calculateAge(data.dataNascimento),
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

    setIsSubmitted(true);
  };

  // if (isSubmitted) {
  //   return (
  //     <div className="flex-1 px-4 py-8 md:px-6">
  //       <div className="mx-auto max-w-2xl space-y-8">
  //         <div className="text-center">
  //           <h1 className="font-display text-2xl font-bold text-[#393939] uppercase md:text-3xl">
  //             Finalizar pagamento
  //           </h1>
  //           <p className="mt-2 text-muted-foreground">
  //             OIKOS 2026 — confirme a sua inscrição de forma segura.
  //           </p>
  //         </div>

  //         <div className="flex flex-col items-center gap-6 rounded-lg border bg-[#fffbef] p-8">
  //           <div className="flex h-14 w-14 items-center justify-center rounded-full">
  //             <CreditCard className="h-7 w-7 text-primary" style={{ color: 'hsl(195 100% 45%)' }} />
  //           </div>
  //           <p className="text-center text-muted-foreground">
  //             Você será redirecionado para uma página segura para realizar o pagamento.
  //           </p>
  //           <Button
  //             size="lg"
  //             className="w-full max-w-xs hover:bg-[#faf7ef]/90 text-foreground text-white"
  //             style={{ backgroundColor: 'hsl(195 100% 45%)' }}
  //             onClick={goToPaymentLink}
  //           >
  //             Ir para pagamento
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  if (isSubmitted) {
    return (
      <div className="flex-1 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#393939] uppercase md:text-3xl">
              Finalizar pagamento
            </h1>
            <p className="mt-2 text-muted-foreground">
              OIKOS 2026 — escolha a forma de pagamento
            </p>
          </div>

          {/* Cards de seleção de pagamento */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card de Crédito */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentMethod("credit")}
              className={`
                cursor-pointer rounded-lg border-2 p-6 transition-all
                ${
                  paymentMethod === "credit"
                    ? "border-[hsl(195,100%,45%)] bg-[#fffbef]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <CreditCard
                  className="h-8 w-8"
                  style={{
                    color:
                      paymentMethod === "credit"
                        ? "hsl(195,100%,45%)"
                        : "#9ca3af",
                  }}
                />
                <span
                  className="font-medium"
                  style={{
                    color:
                      paymentMethod === "credit"
                        ? "hsl(195,100%,45%)"
                        : "#393939",
                  }}
                >
                  Cartão
                </span>
              </div>
            </motion.div>

            {/* Card de PIX */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentMethod("pix")}
              className={`
                cursor-pointer rounded-lg border-2 p-6 transition-all
                ${
                  paymentMethod === "pix"
                    ? "border-[hsl(195,100%,45%)] bg-[#fffbef]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <QrCode
                  className="h-8 w-8"
                  style={{
                    color:
                      paymentMethod === "pix" ? "hsl(195,100%,45%)" : "#9ca3af",
                  }}
                />
                <span
                  className="font-medium"
                  style={{
                    color:
                      paymentMethod === "pix" ? "hsl(195,100%,45%)" : "#393939",
                  }}
                >
                  PIX
                </span>
              </div>
            </motion.div>
          </div>

          {/* Conteúdo condicional baseado no método selecionado */}
          {paymentMethod === "credit" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-6 rounded-lg border bg-[#fffbef] p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full">
                <CreditCard
                  className="h-7 w-7 text-primary"
                  style={{ color: "hsl(195 100% 45%)" }}
                />
              </div>
              <p className="text-center text-muted-foreground">
                Você será redirecionado para uma página segura para realizar o
                pagamento com cartão.
              </p>
              <Button
                size="lg"
                className="w-full max-w-xs hover:bg-[#faf7ef]/90 text-white"
                style={{ backgroundColor: "hsl(195 100% 45%)" }}
                onClick={goToPaymentLink}
              >
                Ir para pagamento
              </Button>
            </motion.div>
          )}

          {paymentMethod === "pix" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-6 rounded-lg border bg-[#fffbef] p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full">
                <QrCode
                  className="h-7 w-7 text-primary"
                  style={{ color: "hsl(195 100% 45%)" }}
                />
              </div>

              {/* Espaço para QR Code */}
              <div className="w-full max-w-[250px] aspect-square bg-white rounded-lg border-2 shadow-md flex items-center justify-center">
                <img src={qrCodePix} className="w-full h-full" />
              </div>

              {/* Chave PIX */}
              <div className="w-full max-w-sm flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-[#393939] text-center">
                  Ou copie a chave PIX:
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white rounded-md border px-3 py-2 text-md text-black font-bold text-center">
                    177.169.606-01
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    style={{ color: "hsl(195 100% 45%)" }}
                    onClick={() => {
                      navigator.clipboard.writeText("177.169.606-01");
                      toast({
                        title: "Chave copiada!",
                        description:
                          "A chave PIX foi copiada para a área de transferência.",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Nome do recebedor */}
              <div className="w-full max-w-sm flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-[#393939] text-center">
                  Nome do recebedor(a):
                </p>
                <div className="bg-white rounded-md border px-3 py-2 text-md font-bold text-black text-center">
                  Ana Clara Gonçalves dos Santos
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-2">
                Fique tranquilo! Após realizar o pagamento, sua inscrição será
                confirmada pela nossa equipe em nosso sistema em até 5 minutos.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
  return (
    <section
      id="inscricao"
      className="w-full"
      style={{ backgroundColor: "#fff9e1" }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-16 md:py-20 lg:py-24">
        {/* Lote Selection */}
        <h2
          className="font-display text-2xl md:text-3xl font-bold uppercase text-center mb-2"
          style={{ color: "#393939" }}
        >
          SELECIONE O LOTE
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: "#393939" }}>
          Escolha a melhor opção para você
        </p>

        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto mb-12">
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
          <p
            className="text-center text-sm font-medium mb-8"
            style={{ color: "#e53e3e" }}
          >
            Todos os lotes estão esgotados. As inscrições foram encerradas.
          </p>
        )}

        {/* Form */}
        {loteSelecionado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="oikos-form mx-auto max-w-3xl rounded-lg p-1"
          >
            <h3
              className="mb-8 text-center font-display text-xl md:text-3xl uppercase"
              style={{ color: "#393939" }}
            >
              Formulário de Inscrição
            </h3>

            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <DadosPessoaisSection form={form} />
                <PaisResponsaveisSection form={form} />
                <VidaIgrejaSection form={form} />
                <EmergenciaSection form={form} />
                <CamisaSection form={form} />
                <ExpectativaSection form={form} />

                <Button
                  size="lg"
                  className="w-full font-semibold text-white"
                  style={{ backgroundColor: "hsl(195 100% 45%)" }}
                >
                  Confirmar Inscrição
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default OikosFormSection;
