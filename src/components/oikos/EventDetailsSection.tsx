import worshipScene from "@/assets/oikos/worship-scene.jpg";

const EventDetailsSection = () => {
  return (
    <section className="w-full" style={{ backgroundColor: "#F2EDE4" }}>
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left column - Event info */}
          <div>
            {/* Date badges */}
            <div className="flex items-end gap-4 mb-4">
              <div className="flex items-center gap-2">
                {["5", "6", "7"].map((day) => (
                  <div
                    key={day}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-display text-2xl md:text-3xl font-bold"
                    style={{ backgroundColor: "#19C971", color: "#000" }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Age badge */}
              <div
                className="rounded-xl px-4 py-2 text-center ml-4"
                style={{ backgroundColor: "#14A7C9", color: "#fff" }}
              >
                <span className="text-xs uppercase font-bold block opacity-70">
                  SEMI PARA MAIORES
                </span>
              </div>
            </div>

            {/* Month/Year */}
            <div className="flex items-baseline gap-4 mb-6">
              <div>
                <span
                  className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase"
                  style={{ color: "#1a1a1a" }}
                >
                  JUNHO
                </span>
                <span
                  className="font-display text-4xl md:text-5xl lg:text-6xl font-bold ml-3"
                  style={{ color: "#1a1a1a" }}
                >
                  2026
                </span>
              </div>
              <div className="ml-auto">
                <span
                  className="font-display text-5xl md:text-6xl lg:text-7xl font-bold"
                  style={{ color: "#19C971" }}
                >
                  17+
                </span>
                <p className="font-display text-sm md:text-base font-bold uppercase" style={{ color: "#333" }}>
                  ATÉ 25 ANOS
                </p>
              </div>
            </div>

            {/* Location */}
            <p className="text-xs md:text-sm uppercase tracking-wider mb-4 font-bold" style={{ color: "#666" }}>
              LOCAL: CENTRO DE FORMAÇÃO DIOCESANO CENTREL
            </p>

            <p className="text-sm md:text-base leading-relaxed" style={{ color: "#555" }}>
              A nova faixa etária dá ao OIKOS a possibilidade de levar
              cada participante a extrair o máximo daquilo que Deus
              deseja entregar nestes dias. Sendo assim, entendemos que a
              idade é um fator crucial para a assimilação e absorção do
              conteúdo desenvolvido no decorrer do encontro.
            </p>
          </div>

          {/* Right column - Image */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-[480px] rounded-[16px] overflow-hidden shadow-lg" style={{ aspectRatio: "4/3" }}>
              <img
                src={worshipScene}
                alt="Momento de adoração no OIKOS"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;
