import closingBg from "@/assets/oikos/closing-bg.jpg";

const ClosingQuoteSection = () => {
  return (
    <footer className="relative bg-black py-32 md:py-48 px-6 md:px-12 overflow-hidden flex flex-col items-center justify-center min-h-[60vh]">
      <div className="absolute inset-0 opacity-30 mix-blend-luminosity">

        <img
          src={closingBg}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
      />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-12 mb-24">
        <div className="text-white text-xl md:text-2xl font-medium text-center md:text-left opacity-90 md:flex-1">
          Caríssimos, desde já
        </div>
        
        <div className="text-center md:flex md:justify-center md:flex-none">
          <h2 className="font-serif text-7xl md:text-8xl lg:text-10xl italic text-[6rem] md:text-[10rem] leading-[0.8] text-white transform -rotate-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            Somos<br/>Filhos
          </h2>
        </div>
        
        <div className="text-white text-xl md:text-2xl font-medium max-w-xs text-center md:text-right opacity-90 leading-relaxed md:flex-1">
          mas nem sequer se manifestou o que seremos!
        </div>
      </div>
    </footer>
  );
};

export default ClosingQuoteSection;
