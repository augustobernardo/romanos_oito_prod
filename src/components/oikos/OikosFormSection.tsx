import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Copy,
  CreditCard,
  QrCode,
  Upload,
  X,
  ArrowLeft,
  Home,
  Calendar,
} from "lucide-react";

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
type PaymentStep = "form" | "payment" | "confirmation";

const PIX_DATA = {
  key: "177.169.606-01",
  receiverName: "Ana Clara Gonçalves dos Santos",
};

const OikosFormSection = () => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("form");
  const [loteSelecionado, setLoteSelecionado] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [inscricaoId, setInscricaoId] = useState<number | null>(null);
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [comprovantePreview, setComprovantePreview] = useState<string | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const { toast } = useToast();

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

  // Função para salvar a inscrição no banco
  const salvarInscricao = async (data: FormData, method: PaymentMethod) => {
    const { data: insertedData, error } = await supabase
      .from("inscricoes")
      .insert({
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
        status: "processando",
        metodo_pagamento: method,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return insertedData.id;
  };

  // Função para fazer upload do comprovante
  const uploadComprovante = async (file: File, id: number) => {
    // Criar um nome único para o arquivo
    const fileExt = file.name.split(".").pop();
    const fileName = `comprovante_${id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Fazer upload para o Supabase Storage no bucket Comprovantes_OIKOS
    const { error: uploadError } = await supabase.storage
      .from("Comprovantes_OIKOS")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Obter a URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from("Comprovantes_OIKOS")
      .getPublicUrl(filePath);

    // Atualizar a inscrição com a URL do comprovante
    const { error: updateError } = await supabase
      .from("inscricoes")
      .update({
        comprovante_url: urlData.publicUrl,
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    // Apenas avança para a tela de pagamento, sem salvar no banco ainda
    setFormData(data);
    setCurrentStep("payment");
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleCreditPayment = async () => {
    if (!formData || !loteSelecionado || !paymentMethod) {
      toast({
        title: "Erro ao processar pagamento",
        description: "Selecione um método de pagamento primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Salva a inscrição no banco
      const id = await salvarInscricao(formData, "credit");
      setInscricaoId(id);

      // Redireciona para o Stripe
      goToPaymentLink();

      // Vai para a tela de confirmação
      setCurrentStep("confirmation");
    } catch (error) {
      console.error("Erro ao salvar inscrição:", error);
      toast({
        title: "Erro ao processar inscrição",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handlePixPayment = async () => {
    if (!formData || !loteSelecionado || !paymentMethod) {
      toast({
        title: "Erro ao processar pagamento",
        description: "Selecione um método de pagamento primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!comprovanteFile) {
      toast({
        title: "Comprovante necessário",
        description: "Selecione o comprovante de pagamento PIX.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Salva a inscrição no banco
      const id = await salvarInscricao(formData, "pix");
      setInscricaoId(id);

      // Faz upload do comprovante
      await uploadComprovante(comprovanteFile, id);

      // Vai para a tela de confirmação
      setCurrentStep("confirmation");
    } catch (error) {
      console.error("Erro ao processar pagamento PIX:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(PIX_DATA.key);
    toast({
      title: "Chave copiada!",
      description: "A chave PIX foi copiada para a área de transferência.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem (PNG, JPG, etc).",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O comprovante deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setComprovanteFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setComprovantePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearComprovante = () => {
    setComprovanteFile(null);
    setComprovantePreview(null);
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
    setPaymentMethod(null);
    setComprovanteFile(null);
    setComprovantePreview(null);
  };

  // Tela de confirmação genérica
  if (currentStep === "confirmation") {
    // Textos dinâmicos baseados no método de pagamento
    const confirmationMessages = {
      title:
        paymentMethod === "pix"
          ? "Comprovante enviado!"
          : "Redirecionamento realizado!",
      mainMessage:
        paymentMethod === "pix"
          ? "Seu comprovante foi enviado com sucesso para nossa equipe."
          : "Você foi redirecionado para o ambiente seguro de pagamento.",
      instruction:
        paymentMethod === "pix"
          ? "Em até 5 minutos sua inscrição será confirmada. Fique atento ao seu e-mail!"
          : "Após a confirmação do pagamento, sua inscrição será automaticamente confirmada.",
    };

    return (
      <div className="flex-1 px-4 py-8 md:px-6 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-md w-full"
        >
          <div className="bg-[#fffbef] rounded-2xl border shadow-lg p-8 md:p-10 text-center space-y-6">
            {/* Ícone de check verde */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>

            {/* Título */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-2xl md:text-3xl font-bold text-[#393939]"
            >
              {confirmationMessages.title}
            </motion.h2>

            {/* Mensagem principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <p className="text-muted-foreground">
                {confirmationMessages.mainMessage}
              </p>
              <p className="text-sm text-muted-foreground">
                {confirmationMessages.instruction}
              </p>
            </motion.div>

            {/* Aviso de segurança */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-muted-foreground pt-2"
            >
              Esta é uma mensagem automática. O status do seu pagamento será
              atualizado em breve.
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Tela de escolha de pagamento
  if (currentStep === "payment") {
    return (
      <div className="flex-1 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <Button
            variant="ghost"
            className="mb-4 -ml-2 text-[#393939] hover:text-[hsl(195,100%,45%)]"
            onClick={handleBackToForm}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao formulário
          </Button>

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
              onClick={() => handlePaymentMethodSelect("credit")}
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
                  Cartão de Crédito
                </span>
              </div>
            </motion.div>

            {/* Card de PIX */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePaymentMethodSelect("pix")}
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
                pagamento com cartão de crédito.
              </p>
              <Button
                size="lg"
                className="w-full max-w-xs hover:bg-[#faf7ef]/90 text-white"
                style={{ backgroundColor: "hsl(195 100% 45%)" }}
                onClick={handleCreditPayment}
                disabled={!paymentMethod}
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

              {/* QR Code PIX */}
              <div className="w-full max-w-[300px] aspect-square bg-white flex items-center justify-center">
                <img
                  src={qrCodePix}
                  className="w-full h-full"
                  alt="QR Code PIX"
                />
              </div>

              {/* Chave PIX */}
              <div className="w-full max-w-sm flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-[#393939] text-center">
                  Ou copie a chave PIX:
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white rounded-md border px-3 py-2 text-md text-black font-bold text-center">
                    {PIX_DATA.key}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={handleCopyPixKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Nome do recebedor */}
              <div className="w-full max-w-sm flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-[#393939] text-center">
                  Nome do recebedor:
                </p>
                <div className="bg-white rounded-md border px-3 py-2 text-md font-bold text-black text-center">
                  {PIX_DATA.receiverName}
                </div>
              </div>

              {/* Upload do comprovante */}
              <div className="w-full max-w-sm space-y-4">
                <p className="text-sm font-medium text-[#393939] text-center">
                  Após realizar o pagamento, envie o comprovante:
                </p>

                {!comprovantePreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <label
                      htmlFor="comprovante"
                      className="w-full cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[hsl(195,100%,45%)] transition-colors">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Clique para selecionar o comprovante
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG ou JPEG (máx. 5MB)
                        </p>
                      </div>
                      <input
                        id="comprovante"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={comprovantePreview}
                        alt="Preview do comprovante"
                        className="w-full rounded-lg border max-h-48 object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white hover:text-[#00ace6]"
                        onClick={clearComprovante}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      className="w-full"
                      style={{ backgroundColor: "hsl(195 100% 45%)" }}
                      onClick={handlePixPayment}
                      disabled={uploading || !comprovanteFile}
                    >
                      {uploading ? (
                        <>Enviando...</>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Finalizar pagamento
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-2">
                Fique tranquilo! Após o envio do comprovante, sua inscrição será
                confirmada pela nossa equipe em até 5 minutos.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Formulário de inscrição
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
                onSubmit={form.handleSubmit(handleFormSubmit)}
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
                  Ir para pagamento
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
