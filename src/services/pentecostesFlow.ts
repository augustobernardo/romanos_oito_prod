export const STEP_INDEX: Record<string, number> = {
  step1_reading: 0,
  step2_personal_info: 1,
  step3_event_info: 2,
  step4_payment: 3,
  uploading_proof: 3,
  submitting_registration: 3,
  submission_error: 3,
  submission_success: 4,
  completed: 4,
} as const;

export const PAYMENT_STEP_INDEX = 3;
export const SUCCESS_STEP_INDEX = 4;

export function validateStepForSubmit(
  stateValue: string,
  stepIndex: number,
): { valid: boolean; reason?: string } {
  if (stepIndex !== PAYMENT_STEP_INDEX) {
    return {
      valid: false,
      reason: `Submit só é permitido no step de pagamento (índice ${PAYMENT_STEP_INDEX}). Atual: ${stepIndex} (state: ${stateValue})`,
    };
  }

  if (!["step4_payment", "submission_error"].includes(stateValue)) {
    return {
      valid: false,
      reason: `Submit não permitido no estado atual: ${stateValue}`,
    };
  }

  return { valid: true };
}
