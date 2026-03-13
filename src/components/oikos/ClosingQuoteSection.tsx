import closingBg from "@/assets/oikos/closing-bg.jpg";
import logoR8White from "@/assets/oikos/logo-r8-white.png";

const ClosingQuoteSection = () => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={closingBg}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-6 py-20 md:py-28 lg:py-32">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          {/* Left */}
          <p className="text-white/70 text-base md:text-lg font-light italic">
            Caríssimos, desde já
          </p>

          {/* Center - Logo + Somos Filhos */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={logoR8White}
              alt="Romanos Oito"
              className="w-20 h-20 md:w-24 md:h-24 opacity-80"
            />
            <h3
              className="font-serif text-5xl md:text-6xl lg:text-7xl italic"
              style={{ color: "#fff" }}
            >
              Somos Filhos
            </h3>
          </div>

          {/* Right */}
          <p className="text-white/70 text-base md:text-lg font-light italic">
            mas nem sequer se
            <br />
            manifestou o que seremos!
          </p>
        </div>
      </div>
    </section>
  );
};

export default ClosingQuoteSection;
