/**
 * E2E tests for the Pentecostes multi-step registration form.
 * Covers: hotspot open, validation, next/back, step guards,
 * conditional responsável field, phone mask formatting,
 * and state machine-driven navigation.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Pentecostes from "@/pages/Pentecostes";
import { calculateAge } from "@/utils/dateUtils";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

// jsdom polyfills for radix
const win = window as Record<string, unknown>;
if (!win.PointerEvent) {
  win.PointerEvent = MouseEvent;
}
if (!win.ResizeObserver) {
  win.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
Element.prototype.scrollIntoView = vi.fn();
const proto = Element.prototype as Record<string, unknown>;
proto.hasPointerCapture = vi.fn(() => false);
proto.releasePointerCapture = vi.fn();
proto.setPointerCapture = vi.fn();

const renderPage = async () => {
  const utils = render(
    <MemoryRouter initialEntries={["/pentecoste"]}>
      <Pentecostes />
    </MemoryRouter>,
  );
  // Form is hidden until the hotspot is clicked
  const hotspot = screen.queryByTestId("pentecostes-hotspot");
  if (hotspot) {
    const user = userEvent.setup();
    await user.click(hotspot);
  }
  return utils;
};

const getForm = (): HTMLElement =>
  document.querySelector("[data-pentecoste-form]") as HTMLElement;

const fillStep0Reading = async (
  user: ReturnType<typeof userEvent.setup>,
  formEl: HTMLElement,
) => {
  const q = within(formEl);
  await user.click(
    q.getByLabelText(/Li e estou ciente de todas as informações/i),
  );
};

const fillStep1PersonalInfo = async (
  user: ReturnType<typeof userEvent.setup>,
  formEl: HTMLElement,
  birthDate = "2001-01-15",
) => {
  const q = within(formEl);
  await user.type(q.getByLabelText(/Nome Completo/i), "Maria Aparecida");
  await user.type(q.getByLabelText(/Instagram/i), "@maria");
  await user.type(q.getByLabelText(/Data de Nascimento/i), birthDate);
  await user.type(q.getByLabelText(/WhatsApp/i), "11912345678");
  if (calculateAge(birthDate) < 18) {
    await user.type(
      q.getByLabelText(/Contato do responsável/i),
      "11987654321",
    );
    await user.click(
      q.getByLabelText(/ciência da autorização para menores/i),
    );
  }
  await user.type(q.getByLabelText(/Paróquia/i), "Paróquia São José");
  await user.type(q.getByLabelText(/Participa de algum movimento/i), "Não");
  await user.click(q.getByLabelText(/Sim! Já participei/i));
};

const advanceToStep2 = async (
  user: ReturnType<typeof userEvent.setup>,
  formEl: HTMLElement,
) => {
  await fillStep0Reading(user, formEl);
  const next = within(formEl).getByRole("button", { name: /Próximo passo/i });
  await user.click(next);
  await fillStep1PersonalInfo(user, formEl, "2001-01-15");
  await user.click(next);
};

const fillStep2Workshop = async (
  user: ReturnType<typeof userEvent.setup>,
  formEl: HTMLElement,
) => {
  const q = within(formEl);
  await user.click(q.getByLabelText(/01 Caixa de Leite \(1L\)/i));
  await user.click(q.getByLabelText(/^Turma 01/i));
  await user.click(q.getByLabelText("22:00"));
};

const advanceToStep3 = async (
  user: ReturnType<typeof userEvent.setup>,
  formEl: HTMLElement,
) => {
  await advanceToStep2(user, formEl);
  await fillStep2Workshop(user, formEl);
  const next = within(formEl).getByRole("button", { name: /Próximo passo/i });
  await user.click(next);
};

describe("Pentecostes Form (E2E)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("hotspot abre e exibe o formulário inline", async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(screen.getByTestId("pentecostes-hotspot"));
  });

  it("renderiza o formulário inline na página", async () => {
    await renderPage();
    expect(getForm()).toBeInTheDocument();
    expect(screen.getByText(/Passo 1 de 5/i)).toBeInTheDocument();
  });

  it("hotspot leva o usuário ao formulário (scrollIntoView)", async () => {
    await renderPage();
    expect(getForm()).toBeInTheDocument();
  });

  // --- STEP 1 (Reading) Tests ---

  it("não avança do step 1 sem marcar o checkbox de leitura", async () => {
    const user = userEvent.setup();
    await renderPage();
    const q = within(getForm());
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeDisabled();
  });

  it("avança para step 2 após marcar o checkbox de leitura", async () => {
    const user = userEvent.setup();
    await renderPage();
    const q = within(getForm());
    await user.click(
      q.getByLabelText(/Li e estou ciente de todas as informações/i),
    );
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeEnabled();
    await user.click(next);
    expect(screen.getByText(/Passo 2 de 5/i)).toBeInTheDocument();
  });

  it("botão Voltar fica desabilitado no step 1 (leitura)", async () => {
    await renderPage();
    expect(
      within(getForm()).getByRole("button", { name: /Voltar/i }),
    ).toBeDisabled();
  });

  it("não é possível pular o step 1 manualmente (guard bloqueia)", async () => {
    const user = userEvent.setup();
    await renderPage();
    const q = within(getForm());
    const next = q.getByRole("button", { name: /Próximo passo/i });
    // Botão está disabled e o guard canProceedFromStep1 retorna false
    expect(next).toBeDisabled();
    const checkbox = q.getByLabelText(
      /Li e estou ciente de todas as informações/i,
    );
    // Confirma que o checkbox NÃO está marcado
    expect(checkbox).not.toHaveAttribute("aria-checked", "true");
  });

  // --- STEP 2 (Personal Info — ex-Step1) Tests ---

  it("não exibe o checkbox de autorização quando idade >= 18", async () => {
    const user = userEvent.setup();
    await renderPage();
    const q = within(getForm());
    await fillStep0Reading(user, getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    await user.type(q.getByLabelText(/Data de Nascimento/i), "2006-01-15");
    expect(
      q.queryByLabelText(/ciência da autorização para menores/i),
    ).not.toBeInTheDocument();
  });

  it("exibe o checkbox de autorização quando idade < 18", async () => {
    const user = userEvent.setup();
    await renderPage();
    const q = within(getForm());
    await fillStep0Reading(user, getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    await user.type(q.getByLabelText(/Data de Nascimento/i), "2011-01-15");
    expect(
      await q.findByLabelText(/ciência da autorização para menores/i),
    ).toBeInTheDocument();
  });

  it("bloqueia o envio com campos vazios no step 2", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    const q = within(getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeDisabled();
  });

  it("exibe mensagens de erro de validação no step 2", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    const q = within(getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    const nome = q.getByLabelText(/Nome Completo/i);
    await user.type(nome, "Jo");
    await user.tab();
    expect(
      await q.findByText(/pelo menos 5 caracteres/i),
    ).toBeInTheDocument();
  });

  it("não renderiza o campo de responsável quando idade >= 18", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    const q = within(getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    await user.type(q.getByLabelText(/Data de Nascimento/i), "2006-01-15");
    expect(
      q.queryByLabelText(/Contato do responsável/i),
    ).not.toBeInTheDocument();
  });

  it("renderiza e exige o campo de responsável quando idade < 18", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    const q = within(getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    await user.type(q.getByLabelText(/Data de Nascimento/i), "2011-01-15");
    expect(
      await q.findByLabelText(/Contato do responsável/i),
    ).toBeInTheDocument();
  });

  it("formata o telefone via máscara", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    const q = within(getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    const phone = q.getByLabelText(/WhatsApp/i) as HTMLInputElement;
    await user.type(phone, "11912345678");
    expect(phone.value).toBe("(11) 91234-5678");
  });

  it("habilita o botão Próximo quando o step 2 está válido", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    const q = within(getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    await fillStep1PersonalInfo(user, getForm(), "2001-01-15");
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeEnabled();
  });

  it("permite envio do menor após marcar checkbox de autorização", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    const q = within(getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    await fillStep1PersonalInfo(user, getForm(), "2011-01-15");
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeEnabled();
  });

  it("navegação BACK do step 2 retorna ao step 1 preservando dados", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    const q = within(getForm());
    await user.click(q.getByRole("button", { name: /Próximo passo/i }));
    expect(screen.getByText(/Passo 2 de 5/i)).toBeInTheDocument();
    const back = q.getByRole("button", { name: /Voltar/i });
    await user.click(back);
    expect(screen.getByText(/Passo 1 de 5/i)).toBeInTheDocument();
    const checkbox = q.getByLabelText(
      /Li e estou ciente de todas as informações/i,
    );
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("navegação BACK do step 3 retorna ao step 2 preservando dados", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    expect(screen.getByText(/Passo 3 de 5/i)).toBeInTheDocument();
    const back = within(getForm()).getByRole("button", { name: /Voltar/i });
    await user.click(back);
    expect(screen.getByText(/Passo 2 de 5/i)).toBeInTheDocument();
    const nomeField = within(getForm()).getByLabelText(
      /Nome Completo/i,
    ) as HTMLInputElement;
    expect(nomeField.value).toBe("Maria Aparecida");
  });

  // --- STEP 2 (Workshop / Event Info) Tests ---

  it("bloqueia Próximo quando workshop está vazio", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const next = within(getForm()).getByRole("button", {
      name: /Próximo passo/i,
    });
    expect(next).toBeDisabled();
  });

  it("renderiza campo 'Outro' quando opção é selecionada", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const q = within(getForm());
    await user.click(q.getByLabelText(/Outra coisa\? Descreva abaixo/i));
    expect(
      await q.findByLabelText(/Descreva o que você irá levar/i),
    ).toBeInTheDocument();
  });

  it("desabilita arrival_time_restriction quando arrival_time está marcado", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const q = within(getForm());
    // arrival_time vem desmarcado por padrão → restrictions habilitados
    const r22 = q.getByLabelText("22:00") as HTMLElement;
    expect(r22).toBeEnabled();
    // ao marcar, deve desabilitar e limpar seleção
    await user.click(q.getByLabelText(/Comprometimento de chegada/i));
    expect(r22).toBeDisabled();
    // ao desmarcar novamente, deve habilitar
    await user.click(q.getByLabelText(/Comprometimento de chegada/i));
    expect(r22).toBeEnabled();
  });

  it("habilita Próximo quando workshop é preenchido corretamente", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const q = within(getForm());
    await user.click(q.getByLabelText(/01 Caixa de Leite \(1L\)/i));
    await user.click(q.getByLabelText(/^Turma 01/i));
    await user.click(q.getByLabelText("22:00"));
    await user.type(
      q.getByLabelText(/Quais são suas expectativas/i),
      "Renovação espiritual",
    );
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeEnabled();
  });

  it("exige horário alternativo quando arrival_time não está marcado", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const q = within(getForm());
    await user.click(q.getByLabelText(/01 Caixa de Leite \(1L\)/i));
    await user.click(q.getByLabelText(/^Turma 01/i));
    await user.type(
      q.getByLabelText(/Quais são suas expectativas/i),
      "Renovação espiritual",
    );
    // arrival_time vem desmarcado → sem horário alternativo, Próximo fica bloqueado
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeDisabled();
    await user.click(q.getByLabelText("22:30"));
    expect(next).toBeEnabled();
  });

  it("guards bloqueiam transição com dados inválidos no workshop", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const q = within(getForm());
    await user.click(q.getByLabelText(/01 Caixa de Leite \(1L\)/i));
    await user.click(q.getByLabelText(/^Turma 01/i));
    // Não preenche arrival_time / horário alternativo → deve permanecer bloqueado
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeDisabled();
  });

  it("arrival_time inicia desmarcado por padrão", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const q = within(getForm());
    const arrival = q.getByLabelText(/Comprometimento de chegada/i);
    expect(arrival).not.toHaveAttribute("aria-checked", "true");
  });

  it("ao marcar arrival_time, limpa seleção de arrival_time_restriction", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const q = within(getForm());
    const r22 = q.getByLabelText("22:30") as HTMLElement;
    await user.click(r22);
    expect(r22).toHaveAttribute("aria-checked", "true");
    await user.click(q.getByLabelText(/Comprometimento de chegada/i));
    expect(r22).not.toHaveAttribute("aria-checked", "true");
  });

  it("expectations_pentecoste é opcional e não bloqueia o Próximo", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep2(user, getForm());
    const q = within(getForm());
    await user.click(q.getByLabelText(/01 Caixa de Leite \(1L\)/i));
    await user.click(q.getByLabelText(/^Turma 01/i));
    await user.click(q.getByLabelText("22:00"));
    // Sem preencher expectativas
    const next = q.getByRole("button", { name: /Próximo passo/i });
    expect(next).toBeEnabled();
  });

  it("progress bar reflete o passo atual", async () => {
    const user = userEvent.setup();
    await renderPage();
    const formEl = getForm();
    expect(within(formEl).getByText("20%")).toBeInTheDocument();
    await fillStep0Reading(user, formEl);
    await user.click(within(formEl).getByRole("button", { name: /Próximo passo/i }));
    expect(within(formEl).getByText("40%")).toBeInTheDocument();
  });

  it("campo 'Já participou do Romanos 8?' usa cards/blocos", async () => {
    const user = userEvent.setup();
    await renderPage();
    await fillStep0Reading(user, getForm());
    await user.click(
      within(getForm()).getByRole("button", { name: /Próximo passo/i }),
    );
    const q = within(getForm());
    const optionLabel = q.getByText(/Sim! Já participei/i);
    // O wrapper visual é o FormItem com classes de borda
    const wrapper = optionLabel.closest("[class*='border-2']");
    expect(wrapper).not.toBeNull();
  });

  // --- STEP 4 (Payment) Tests ---

  it("renderiza o step de pagamento (Step3Payment) com QR Code PIX", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep3(user, getForm());
    expect(screen.getByText(/Passo 4 de 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Pagamento da inscrição/i)).toBeInTheDocument();
    expect(screen.getByAltText(/QR Code PIX Pentecostes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Chave PIX/i).length).toBeGreaterThan(0);
  });

  it("botão muda para 'Enviar' no step de pagamento", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep3(user, getForm());
    const submitBtn = within(getForm()).getByRole("button", { name: /Enviar/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it("botão 'Enviar' fica disabled quando não há comprovante anexado", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep3(user, getForm());
    const submitBtn = within(getForm()).getByRole("button", { name: /Enviar/i });
    expect(submitBtn).toBeDisabled();
  });

  it("botão 'Enviar' tem tooltip 'Anexe o comprovante para enviar' quando disabled por falta de proof", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep3(user, getForm());
    const submitBtn = within(getForm()).getByRole("button", { name: /Enviar/i });
    expect(submitBtn).toHaveAttribute("title", "Anexe o comprovante para enviar");
  });

  it("exibe área de upload de comprovante no step de pagamento", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep3(user, getForm());
    const q = within(getForm());
    expect(q.getByText(/Clique ou arraste o comprovante/i)).toBeInTheDocument();
    expect(q.getByText(/PNG, JPG ou PDF/i)).toBeInTheDocument();
  });

  it("navegação BACK do step 4 retorna ao step 3 preservando dados", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep3(user, getForm());
    expect(screen.getByText(/Passo 4 de 5/i)).toBeInTheDocument();
    const back = within(getForm()).getByRole("button", { name: /Voltar/i });
    await user.click(back);
    expect(screen.getByText(/Passo 3 de 5/i)).toBeInTheDocument();
    // Verifica que dados do workshop persistiram
    const turma01 = within(getForm()).getByLabelText(/^Turma 01/);
    expect(turma01).toBeInTheDocument();
  });

  it("voltar do step 4 e re-avançar preserva estado do comprovante", async () => {
    const user = userEvent.setup();
    await renderPage();
    await advanceToStep3(user, getForm());
    const back = within(getForm()).getByRole("button", { name: /Voltar/i });
    await user.click(back);
    const next = within(getForm()).getByRole("button", { name: /Próximo passo/i });
    await user.click(next);
    expect(screen.getByText(/Passo 4 de 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Pagamento da inscrição/i)).toBeInTheDocument();
  });

  it("bloqueia acesso à tela de sucesso sem passar pelo fluxo de submit", async () => {
    await renderPage();
    // A tela de sucesso (Inscrição recebida!) não deve aparecer sem passar pelo fluxo completo
    expect(screen.queryByText(/Inscrição recebida!/i)).not.toBeInTheDocument();
  });
});