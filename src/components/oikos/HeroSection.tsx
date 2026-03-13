import heroBg from "@/assets/oikos/hero-bg.png";

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden">
      <img
        src={heroBg}
        alt="OIKOS 2026 - 5, 6 e 7 de Junho - Governador Valadares MG - Centrel Pernoite"
        className="w-full h-auto block max-w-full"
        loading="eager"
      />
    </section>
  );
};

export default HeroSection;
