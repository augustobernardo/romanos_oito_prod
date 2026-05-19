import { setup, assign, fromPromise } from "xstate";
import { pentecostesFormSchema, type PentecostesFormData, STEP_FIELDS } from "@/components/pentecostes/schema";
import { uploadPaymentProof } from "@/services/paymentProofUploadService";
import { submitRegistration } from "@/services/pentecosteRegistrationService";

export interface FormContext {
  read_descriptions_confirmation: boolean;
  nome: string;
  instagram: string;
  whatsapp: string;
  dataNascimento: string;
  contatoResponsavel: string;
  confirmAuthorizationUnderage: boolean;
  paroquia: string;
  participaMovimento: string;
  jaParticipouR8: "sim" | "nao" | undefined;
  bringShare: string[];
  bringShareOther: string;
  workshopGroup: "turma_01" | "turma_02" | "turma_03" | "turma_04" | undefined;
  arrivalTime: boolean;
  arrivalTimeRestriction: string | undefined;
  expectationsPentecoste: string;
  paymentProofFile: File | null;
  paymentProofName: string;
  paymentProofSize: number;
  uploadState: "idle" | "uploading" | "uploaded" | "failed";
  uploadedProofUrl: string | null;
  submissionError: string | null;
}

export type FormEvent =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET" }
  | { type: "SUBMIT" }
  | { type: "UPDATE_FIELD"; field: string; value: unknown }
  | { type: "UPLOAD_PROOF"; file: File }
  | { type: "REMOVE_PROOF" };

const initialContext: FormContext = {
  read_descriptions_confirmation: false,
  nome: "",
  instagram: "",
  whatsapp: "",
  dataNascimento: "",
  contatoResponsavel: "",
  confirmAuthorizationUnderage: false,
  paroquia: "",
  participaMovimento: "",
  jaParticipouR8: undefined,
  bringShare: [],
  bringShareOther: "",
  workshopGroup: undefined,
  arrivalTime: false,
  arrivalTimeRestriction: undefined,
  expectationsPentecoste: "",
  paymentProofFile: null,
  paymentProofName: "",
  paymentProofSize: 0,
  uploadState: "idle",
  uploadedProofUrl: null,
  submissionError: null,
};

function isValidStep(context: FormContext, stepIndex: number): boolean {
  const fields = STEP_FIELDS[stepIndex] || [];
  const values: Record<string, unknown> = {};
  for (const key of Object.keys(context)) {
    values[key] = (context as unknown as Record<string, unknown>)[key];
  }

  const result = pentecostesFormSchema.safeParse(values);
  if (result.success) return true;

  const errored = new Set<string>();
  result.error.issues.forEach((i) => {
    if (i.path.length === 0) {
      fields.forEach((f) => errored.add(f as string));
    } else {
      errored.add(i.path[0] as string);
    }
  });

  return !fields.some((f) => errored.has(f as string));
}

export const pentecosteFormMachine = setup({
  types: {
    context: {} as FormContext,
    events: {} as FormEvent,
  },
  guards: {
    canProceedFromStep1: ({ context }) => {
      return context.read_descriptions_confirmation === true;
    },
    canProceedFromStep2: ({ context }) => {
      return isValidStep(context, 1);
    },
    canProceedFromStep3: ({ context }) => {
      return isValidStep(context, 2);
    },
    canSubmit: ({ context }) => {
      return context.paymentProofFile !== null;
    },
  },
  actions: {
    logTransition: (_, event?: FormEvent) => {
      if (import.meta.env.DEV || import.meta.env.MODE === "development") {
        console.debug(
          `[PentecosteMachine] ${event ? `Event: ${event.type}` : "Entered state"}`,
        );
      }
    },
    updateField: assign({
      read_descriptions_confirmation: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "read_descriptions_confirmation"
          ? (event.value as boolean)
          : context.read_descriptions_confirmation,
      nome: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "nome" ? (event.value as string) : context.nome,
      instagram: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "instagram" ? (event.value as string) : context.instagram,
      whatsapp: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "whatsapp" ? (event.value as string) : context.whatsapp,
      dataNascimento: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "dataNascimento" ? (event.value as string) : context.dataNascimento,
      contatoResponsavel: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "contatoResponsavel"
          ? (event.value as string)
          : context.contatoResponsavel,
      confirmAuthorizationUnderage: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "confirmAuthorizationUnderage"
          ? (event.value as boolean)
          : context.confirmAuthorizationUnderage,
      paroquia: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "paroquia" ? (event.value as string) : context.paroquia,
      participaMovimento: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "participaMovimento"
          ? (event.value as string)
          : context.participaMovimento,
      jaParticipouR8: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "jaParticipouR8"
          ? (event.value as "sim" | "nao" | undefined)
          : context.jaParticipouR8,
      bringShare: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "bringShare"
          ? (event.value as string[])
          : context.bringShare,
      bringShareOther: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "bringShareOther"
          ? (event.value as string)
          : context.bringShareOther,
      workshopGroup: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "workshopGroup"
          ? (event.value as "turma_01" | "turma_02" | "turma_03" | "turma_04" | undefined)
          : context.workshopGroup,
      arrivalTime: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "arrivalTime"
          ? (event.value as boolean)
          : context.arrivalTime,
      arrivalTimeRestriction: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "arrivalTimeRestriction"
          ? (event.value as string | undefined)
          : context.arrivalTimeRestriction,
      expectationsPentecoste: ({ context, event }) =>
        event.type === "UPDATE_FIELD" && event.field === "expectationsPentecoste"
          ? (event.value as string)
          : context.expectationsPentecoste,
    }),
    resetContext: assign(() => ({ ...initialContext })),
    uploadProof: assign({
      paymentProofFile: ({ event }) =>
        event.type === "UPLOAD_PROOF" ? event.file : null,
      paymentProofName: ({ event }) =>
        event.type === "UPLOAD_PROOF" ? event.file.name : "",
      paymentProofSize: ({ event }) =>
        event.type === "UPLOAD_PROOF" ? event.file.size : 0,
      uploadState: "idle" as const,
      uploadedProofUrl: null as null,
    }),
    removeProof: assign({
      paymentProofFile: null as unknown as File | null,
      paymentProofName: "",
      paymentProofSize: 0,
      uploadState: "idle" as const,
      uploadedProofUrl: null as null,
    }),
    setUploading: assign({
      uploadState: "uploading" as const,
    }),
    setUploaded: assign(({ event }) => ({
      uploadState: "uploaded" as const,
      uploadedProofUrl: (event as unknown as { output: { url: string } }).output.url,
    })),
    setUploadFailed: assign({
      uploadState: "failed" as const,
    }),
    setSubmissionError: assign(({ event }) => ({
      submissionError: (event as unknown as { error: { message: string } }).error.message || "Erro ao enviar inscrição.",
      uploadState: "failed" as const,
    })),
  },
  actors: {
    uploadProofService: fromPromise(async ({ input }) => {
      const ctx = input as FormContext;
      if (!ctx.paymentProofFile) throw new Error("Nenhum arquivo selecionado");
      return uploadPaymentProof(ctx.paymentProofFile);
    }),
    submitRegistrationService: fromPromise(async ({ input }) => {
      const ctx = input as FormContext;
      const payload = {
        _read_descriptions_confirmation: ctx.read_descriptions_confirmation,
        _fullname: ctx.nome,
        _whatsapp_number: ctx.whatsapp,
        _date_of_birth: ctx.dataNascimento,
        _instagram_user: ctx.instagram || undefined,
        _contact_person_charge: ctx.contatoResponsavel || undefined,
        _confirm_authorization_underage: ctx.confirmAuthorizationUnderage || undefined,
        _parish_church: ctx.paroquia,
        _participate_moviment: ctx.participaMovimento || undefined,
        _participate_romanos_event: ctx.jaParticipouR8,
        _bring_share: ctx.bringShare.length > 0 ? ctx.bringShare : undefined,
        _bring_share_other: ctx.bringShareOther || undefined,
        _workshop_group: ctx.workshopGroup,
        _arrival_time: ctx.arrivalTime,
        _arrival_time_restriction: ctx.arrivalTimeRestriction || undefined,
        _expectations_pentecoste: ctx.expectationsPentecoste || undefined,
        _payment_method: "pix",
        _payment_proof_url: ctx.uploadedProofUrl || undefined,
        _payment_proof_filename: ctx.paymentProofName || undefined,
        _payment_proof_size: ctx.paymentProofSize || undefined,
      };
      const result = await submitRegistration(payload);
      if (!result.success) {
        throw new Error(result.message || "Erro ao enviar inscrição.");
      }
      return result;
    }),
  },
}).createMachine({
  id: "pentecosteForm",
  initial: "step1_reading",
  context: { ...initialContext },
  states: {
    step1_reading: {
      on: {
        NEXT: {
          target: "step2_personal_info",
          guard: "canProceedFromStep1",
        },
        UPDATE_FIELD: {
          actions: "updateField",
        },
      },
    },
    step2_personal_info: {
      on: {
        NEXT: {
          target: "step3_event_info",
          guard: "canProceedFromStep2",
        },
        BACK: {
          target: "step1_reading",
        },
        UPDATE_FIELD: {
          actions: "updateField",
        },
      },
    },
    step3_event_info: {
      entry: "logTransition",
      on: {
        NEXT: {
          target: "step4_payment",
          guard: "canProceedFromStep3",
        },
        BACK: {
          target: "step2_personal_info",
        },
        UPDATE_FIELD: {
          actions: "updateField",
        },
      },
    },
    step4_payment: {
      entry: "logTransition",
      on: {
        SUBMIT: {
          target: "uploading_proof",
          guard: "canSubmit",
          actions: "logTransition",
        },
        BACK: {
          target: "step3_event_info",
        },
        UPDATE_FIELD: {
          actions: "updateField",
        },
        UPLOAD_PROOF: {
          actions: "uploadProof",
        },
        REMOVE_PROOF: {
          actions: "removeProof",
        },
      },
    },
    uploading_proof: {
      entry: "setUploading",
      invoke: {
        src: "uploadProofService",
        input: ({ context }) => context,
        onDone: {
          target: "submitting_registration",
          actions: "setUploaded",
        },
        onError: {
          target: "submission_error",
          actions: ["setUploadFailed", "setSubmissionError"],
        },
      },
    },
    submitting_registration: {
      invoke: {
        src: "submitRegistrationService",
        input: ({ context }) => context,
        onDone: {
          target: "submission_success",
        },
        onError: {
          target: "submission_error",
          actions: "setSubmissionError",
        },
      },
    },
    submission_success: {
      entry: "logTransition",
      on: {
        RESET: {
          target: "step1_reading",
          actions: "resetContext",
        },
      },
    },
    submission_error: {
      on: {
        BACK: {
          target: "step4_payment",
        },
        RESET: {
          target: "step1_reading",
          actions: "resetContext",
        },
      },
    },
  },
});

export { initialContext };
