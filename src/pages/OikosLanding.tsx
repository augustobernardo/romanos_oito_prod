import HeroSection from "@/components/oikos/HeroSection";
import HeadlineSection from "@/components/oikos/HeadlineSection";
import WhatIsOikosSection from "@/components/oikos/WhatIsOikosSection";
import WhoCanParticipateSection from "@/components/oikos/WhoCanParticipateSection";
import CtaBannerSection from "@/components/oikos/CtaBannerSection";
import EventDetailsSection from "@/components/oikos/EventDetailsSection";
import FAQSection from "@/components/oikos/FAQSection";
import WelcomeSection from "@/components/oikos/WelcomeSection";
import TicketSelector from "@/components/oikos/TicketSelector";
import ClosingQuoteSection from "@/components/oikos/ClosingQuoteSection";

const OikosLanding = () => {
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: "#F2EDE4" }}>
      <HeroSection />
      <HeadlineSection />
      <WhatIsOikosSection />
      <WhoCanParticipateSection />
      <CtaBannerSection />
      <EventDetailsSection />
      <FAQSection />
      <WelcomeSection />
      <TicketSelector />
      <ClosingQuoteSection />
    </div>
  );
};

export default OikosLanding;
