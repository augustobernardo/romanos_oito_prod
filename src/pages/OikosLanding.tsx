import HeroSection from "@/components/oikos/HeroSection";
import HeadlineSection from "@/components/oikos/HeadlineSection";
import WhatIsOikosSection from "@/components/oikos/WhatIsOikosSection";
import FAQSection from "@/components/oikos/FAQSection";
import WelcomeSection from "@/components/oikos/WelcomeSection";
import OikosFormSection from "@/components/oikos/OikosFormSection";
import ClosingQuoteSection from "@/components/oikos/ClosingQuoteSection";
import { useEffect, useState } from "react";

const OikosLanding = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Mostrar o tooltip após 3 segundos
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);

    // Esconder o tooltip após 8 segundos
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 11000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);


  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "#fff9e1" }}
    >
      <HeroSection />
      <HeadlineSection />
      <WhatIsOikosSection />
      <FAQSection />
      <WelcomeSection />
      <OikosFormSection />
      <ClosingQuoteSection />


      {/* WhatsApp floating button with tooltip */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Tooltip text */}
        <div
          className={`
            transition-all duration-500 ease-in-out
            ${showTooltip 
              ? "opacity-100 translate-x-0 visible" 
              : "opacity-0 translate-x-4 invisible"
            }
          `}
        >
          <div className="relative bg-white rounded-2xl shadow-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap">
            <span className="text-gray-700">
              💬 Precisa de ajuda? Fale conosco no WhatsApp
            </span>
            {/* Triângulo apontando para o botão */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="border-8 border-transparent border-l-white"></div>
            </div>
          </div>
        </div>

        {/* WhatsApp button */}
        <a
          href="https://api.whatsapp.com/send?phone=5533998427416&text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20OIKOS%202026."
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
          style={{ backgroundColor: "#25D366" }}
          aria-label="Suporte via WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-8 w-8"
            fill="white"
          >
            <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.744 3.054 9.378L1.056 31.08l5.898-1.96A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0Zm9.314 22.606c-.39 1.1-1.932 2.012-3.178 2.278-.852.18-1.964.324-5.71-1.226-4.796-1.982-7.882-6.85-8.122-7.168-.23-.318-1.932-2.574-1.932-4.908s1.222-3.48 1.656-3.958c.434-.478.948-.598 1.264-.598.316 0 .63.002.906.016.29.014.68-.112 1.064.812.39.94 1.33 3.274 1.448 3.512.118.238.196.516.04.832-.158.318-.236.516-.476.794-.238.278-.5.62-.714.832-.238.238-.486.496-.21.972.278.478 1.234 2.034 2.65 3.296 1.82 1.622 3.354 2.124 3.832 2.362.478.238.756.198 1.034-.12.278-.316 1.196-1.392 1.514-1.87.318-.478.636-.396 1.074-.238.436.158 2.77 1.306 3.248 1.544.478.238.796.358.914.554.118.198.118 1.142-.272 2.242Z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default OikosLanding;
