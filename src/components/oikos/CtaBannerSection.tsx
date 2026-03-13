import worshipScene from "@/assets/oikos/worship-scene.jpg";

const CtaBannerSection = () => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={worshipScene}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display text-lg md:text-xl lg:text-2xl uppercase font-bold text-white text-center md:text-left leading-tight">
          VAMOS VIVER O MELHOR
          <br />
          FIM DE SEMANA DA SUA VIDA?
        </p>

        {/* Speech bubble CTA */}
        <a
          href="#inscricao"
          className="relative inline-flex items-center gap-2 rounded-full px-8 py-3 font-display font-bold uppercase text-sm md:text-base transition-all hover:scale-105 bg-white text-black"
        >
          {/* Bubble tail */}
          <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[14px] border-r-white border-b-[10px] border-b-transparent hidden md:block" />
          FAZER MINHA INSCRIÇÃO!
        </a>
      </div>
    </section>
  );
};

export default CtaBannerSection;
