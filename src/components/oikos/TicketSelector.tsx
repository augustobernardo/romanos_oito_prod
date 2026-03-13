import { useState } from "react";

interface Lote {
  id: number;
  name: string;
  price: string;
  status: "available" | "sold_out" | "upcoming";
}

const lotes: Lote[] = [
  { id: 1, name: "1° LOTE", price: "R$ 170,00", status: "sold_out" },
  { id: 2, name: "2° LOTE", price: "R$ 190,00", status: "available" },
  { id: 3, name: "3° LOTE", price: "R$ 210,00", status: "upcoming" },
];

const TicketSelector = () => {
  const [selectedLote, setSelectedLote] = useState<number>(2);

  return (
    <section id="inscricao" className="w-full" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20 lg:py-24">
        <h2
          className="font-display text-2xl md:text-3xl font-bold uppercase text-center mb-2"
          style={{ color: "#333" }}
        >
          SELECIONE O LOTE
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: "#888" }}>
          Escolha a melhor opção para você
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
          {lotes.map((lote) => {
            const isSelected = selectedLote === lote.id;
            const isSoldOut = lote.status === "sold_out";
            const isUpcoming = lote.status === "upcoming";

            return (
              <button
                key={lote.id}
                onClick={() => !isSoldOut && !isUpcoming && setSelectedLote(lote.id)}
                disabled={isSoldOut || isUpcoming}
                className={`relative rounded-2xl p-6 md:p-8 text-center transition-all duration-300 border-2 ${
                  isSelected
                    ? "scale-105 shadow-xl"
                    : "hover:scale-[1.02]"
                } ${
                  isSoldOut || isUpcoming
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                style={{
                  backgroundColor: isSelected ? "#14A7C9" : "#fff",
                  borderColor: isSelected ? "#14A7C9" : "#e0e0e0",
                  color: isSelected ? "#fff" : "#333",
                }}
              >
                {isSoldOut && (
                  <span className="absolute top-3 right-3 text-xs font-bold uppercase px-2 py-1 rounded-full bg-red-100 text-red-600">
                    Esgotado
                  </span>
                )}
                {isUpcoming && (
                  <span className="absolute top-3 right-3 text-xs font-bold uppercase px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                    Em breve
                  </span>
                )}
                <p className="font-display text-lg md:text-xl font-bold uppercase mb-2">
                  {lote.name}
                </p>
                <p className="text-2xl md:text-3xl font-bold">{lote.price}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TicketSelector;
