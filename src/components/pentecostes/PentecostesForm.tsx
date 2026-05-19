import { useCallback } from "react";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WHATSAPP_NUMBER } from "@/config/constants";
import { validateStepForSubmit } from "@/services/pentecostesFlow";
import { usePentecostesForm } from "./usePentecostesForm";
import VigiliaInfoSummary from "./VigiliaInfoSummary";
import Step0Leitura from "./steps/Step0Leitura";
import Step1DadosPessoais from "./steps/Step1DadosPessoais";
import Step2Detalhes from "./steps/Step2Detalhes";
import Step3Payment from "./steps/Step3Payment";

const PentecostesForm = () => {
  const {
    form,
    currentStep,
    totalSteps,
    next,
    back,
    submit,
    reset,
    isStepValid,
    canSubmit,
    isFirstStep,
    isLastStep,
    isSubmitting,
    isSuccess,
    isError,
    syncToMachine,
    paymentProofFile,
    paymentProofName,
    paymentProofSize,
    handleFileUpload,
    handleRemoveFile,
    submissionError,
    machineState,
  } = usePentecostesForm();
  useWatch({ control: form.control });

  const handlePrimary = useCallback(async () => {
    if (isLastStep) {
      const validation = validateStepForSubmit(
        String(machineState?.value ?? ""),
        currentStep,
      );
      if (!validation.valid) {
        console.error(
          "[PentecostesForm] Submit bloqueado:",
          validation.reason,
        );
        return;
      }
      if (!canSubmit()) return;
      submit();
    } else {
      await next();
    }
  }, [isLastStep, canSubmit, currentStep, submit, next, machineState]);

  const handleConfirmationChange = useCallback(
    (checked: boolean) => {
      syncToMachine("read_descriptions_confirmation", checked);
    },
    [syncToMachine],
  );

  const isButtonDisabled = isSubmitting || (isLastStep ? !canSubmit() : !isStepValid());

  const submitBlockedByProof = isLastStep && !isSubmitting && !canSubmit();

  const buttonLabel = isSubmitting
    ? "Enviando..."
    : isLastStep
      ? "Enviar"
      : "Próximo";

  const buttonHint = submitBlockedByProof
    ? "Anexe o comprovante para enviar"
    : undefined;

  if (isSuccess) {
    return (
      <div className="py-10 space-y-10">
        <div className="text-center space-y-6">
          <CheckCircle className="mx-auto h-16 w-16 text-pentecoste-red" />
          <h2 className="font-display text-3xl font-black uppercase text-pentecoste-navy">
            Inscrição recebida!
          </h2>
          <Button
            type="button"
            onClick={() => {
              reset();
              toast.success("Formulário reiniciado.");
            }}
            className="rounded-full border-2 border-pentecoste-navy bg-pentecoste-red px-8 font-display uppercase tracking-wide text-pentecoste-paper hover:bg-pentecoste-red-dark"
          >
            Nova inscrição
          </Button>
        </div>

        <div className="space-y-6 pt-8 border-t-2 border-pentecoste-navy/20">
          <h2 className="font-display text-xl font-black uppercase text-pentecoste-navy text-center">
            Leia novamente atentamente as informações
          </h2>

          <div className="border-2 border-pentecoste-navy bg-pentecoste-paper p-6 shadow-[3px_3px_0_0_rgba(27,37,65,1)]">
            <VigiliaInfoSummary readOnly />
          </div>

          <div className="flex items-start gap-3 border-2 border-pentecoste-red bg-pentecoste-red/5 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-pentecoste-red mt-0.5" />
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-pentecoste-navy">
              É menor de idade? Chama o SAC do R8 para pegar a sua autorização.
            </p>
          </div>

          <div className="text-center">
            <a
              href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent("Olá! Preciso de ajuda com a Vigília de Pentecostes.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                type="button"
                className="rounded-full border-2 border-pentecoste-navy bg-[#25D366] px-6 py-2 font-display uppercase tracking-wide text-white hover:bg-[#25D366]/90 shadow-[3px_3px_0_0_rgba(27,37,65,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(27,37,65,1)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Falar com o SAC
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-pentecoste-form className="pentecoste-form">
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-pentecoste-navy/70">
            Passo {currentStep + 1} de {totalSteps}
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-pentecoste-red">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </p>
        </div>
        <Progress
          value={((currentStep + 1) / totalSteps) * 100}
          aria-label={`Progresso: passo ${currentStep + 1} de ${totalSteps}`}
          className="h-2 rounded-none border-2 border-pentecoste-navy bg-pentecoste-paper [&>div]:bg-pentecoste-red [&>div]:transition-transform [&>div]:duration-500"
        />
      </div>

      {isError && (
        <div className="mb-6 flex flex-col gap-3 border-2 border-pentecoste-red bg-pentecoste-red/10 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-pentecoste-red" />
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.1em] text-pentecoste-red">
                Erro ao enviar inscrição
              </p>
              {submissionError && (
                <p className="mt-1 font-mono text-xs text-pentecoste-navy/80">
                  {submissionError}
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            onClick={back}
            className="self-start rounded-full border-2 border-pentecoste-red bg-pentecoste-red px-6 font-mono text-xs uppercase tracking-wide text-pentecoste-paper hover:bg-pentecoste-red-dark"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePrimary();
          }}
          className="space-y-6"
          noValidate
        >
          {currentStep === 0 && (
            <Step0Leitura form={form} onConfirmationChange={handleConfirmationChange} />
          )}
          {currentStep === 1 && <Step1DadosPessoais form={form} />}
          {currentStep === 2 && <Step2Detalhes form={form} />}
          {currentStep === 3 && (
            <Step3Payment
              paymentProofFile={paymentProofFile}
              paymentProofName={paymentProofName}
              paymentProofSize={paymentProofSize}
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
            />
          )}

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={back}
              disabled={isFirstStep || isSubmitting}
              className="rounded-full border-2 border-pentecoste-navy bg-transparent px-8 font-display uppercase tracking-wide text-pentecoste-navy hover:bg-pentecoste-navy hover:text-pentecoste-paper"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handlePrimary}
              disabled={isButtonDisabled}
              aria-label={isLastStep ? "Enviar inscrição" : "Próximo passo"}
              title={buttonHint}
              className="rounded-full border-2 border-pentecoste-navy bg-pentecoste-red px-10 font-display uppercase tracking-wide text-pentecoste-paper shadow-[3px_3px_0_0_rgba(27,37,65,1)] transition-transform hover:bg-pentecoste-red-dark hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(27,37,65,1)]"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PentecostesForm;
