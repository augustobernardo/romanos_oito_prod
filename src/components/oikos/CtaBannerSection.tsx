import worshipScene from "@/assets/oikos/worship-scene.jpg";

const CtaBannerSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-20">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={worshipScene}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 px-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display text-[#7EF17F] max-w-3xl uppercase font-bold leading-tight tracking-tight">
            Vamos viver o melhor <br /> fim de semana da sua vida?
          </h2>
        <a
          href="#inscricao"
          // className="relative inline-flex items-center gap-2 rounded-full px-8 py-3 font-display font-bold uppercase text-sm md:text-base transition-all hover:scale-105 bg-white text-black"
          className="relative inline-flex items-center justify-center px-10 py-4 rounded-full border-2 border-[#fff9e1] text-[#fff9e1] font-bold text-2xl uppercase tracking-widest"
        >
        {/* Bubble tail */}
         FAZER MINHA INSCRIÇÃO!
        </a>
        </div>
      </div>
    </section>
  );
};

export default CtaBannerSection;
