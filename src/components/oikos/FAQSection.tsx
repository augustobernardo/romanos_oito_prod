import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    question: "Qual a idade mínima para participar?",
    answer:
      "O OIKOS é destinado a jovens de 17 a 25 anos. Essa faixa etária foi pensada para otimizar a experiência e o conteúdo desenvolvido durante o retiro.",
  },
  {
    question: "Preciso ser católico para participar?",
    answer:
      "Não necessariamente! O OIKOS é aberto a todos os jovens que desejam viver uma experiência de encontro com Deus, independente de sua religião ou grau de proximidade com a fé.",
  },
  {
    question: "O que levar para o retiro?",
    answer:
      "Roupas confortáveis, itens de higiene pessoal, protetor solar, roupa de cama (lençol e travesseiro), Bíblia e caderno para anotações. Uma lista completa será enviada após a inscrição.",
  },
  {
    question: "Como funciona a alimentação?",
    answer:
      "Todas as refeições estão inclusas no valor da inscrição. Caso tenha alguma restrição alimentar, informe no formulário de inscrição.",
  },
  {
    question: "Posso parcelar o pagamento?",
    answer:
      "Sim! Oferecemos opções de parcelamento no cartão de crédito. As condições variam conforme o lote escolhido.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full" style={{ backgroundColor: "#14A7C9" }}>
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20 lg:py-24">
        <h2
          className="font-display text-6xl md:text-7xl lg:text-8xl font-bold uppercase text-center mb-12 md:mb-16"
          style={{ color: "#000" }}
        >
          FAQ
        </h2>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden transition-colors"
              style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-display text-base md:text-lg font-bold uppercase text-white pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-white shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-60" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-5 text-sm md:text-base leading-relaxed text-white/80">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
