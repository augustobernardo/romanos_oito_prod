import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  STRIPE_PAYMENT_LINK_URL,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_PRICING_TABLE_ID,
} from "@/utils/stripe";

const PRICING_TABLE_SCRIPT = "https://js.stripe.com/v3/pricing-table.js";

export type CheckoutLocationState = {
  customerEmail?: string;
};

const CheckoutOikos2026 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutLocationState | null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const prefilledEmail = state?.customerEmail ?? "";

  // Option 1: Embedded Stripe Pricing Table (client-side only)
  useEffect(() => {
    if (!STRIPE_PRICING_TABLE_ID || !STRIPE_PUBLISHABLE_KEY || !containerRef.current) return;

    const loadScript = () => {
      if (document.querySelector(`script[src="${PRICING_TABLE_SCRIPT}"]`)) {
        setScriptLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = PRICING_TABLE_SCRIPT;
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !STRIPE_PRICING_TABLE_ID || !STRIPE_PUBLISHABLE_KEY || !containerRef.current) return;

    containerRef.current.innerHTML = "";
    const table = document.createElement("stripe-pricing-table");
    table.setAttribute("pricing-table-id", STRIPE_PRICING_TABLE_ID);
    table.setAttribute("publishable-key", STRIPE_PUBLISHABLE_KEY);
    if (prefilledEmail) {
      table.setAttribute("customer-email", prefilledEmail);
    }
    containerRef.current.appendChild(table);
  }, [scriptLoaded, prefilledEmail]);

  const goToPaymentLink = () => {
    if (!STRIPE_PAYMENT_LINK_URL) return;
    const url = new URL(STRIPE_PAYMENT_LINK_URL);
    if (prefilledEmail) {
      url.searchParams.set("prefilled_email", prefilledEmail);
    }
    window.location.href = url.toString();
  };

  const hasPaymentLink = Boolean(STRIPE_PAYMENT_LINK_URL);
  const hasPricingTable = Boolean(STRIPE_PRICING_TABLE_ID && STRIPE_PUBLISHABLE_KEY);

  if (!hasPaymentLink && !hasPricingTable) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
          <p className="text-center text-muted-foreground">
            Checkout não configurado.
          </p>
          <Button variant="outline" onClick={() => navigate("/eventos/oikos-2026")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 md:px-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/eventos/oikos-2026")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="mx-auto max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Finalizar pagamento
            </h1>
            <p className="mt-2 text-muted-foreground">
              OIKOS 2026 — confirme a sua inscrição de forma segura.
            </p>
          </div>

          {hasPricingTable ? (
            <div ref={containerRef} className="min-h-[400px]" />
          ) : (
            <div className="flex flex-col items-center gap-6 rounded-lg border bg-card p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                Você será redirecionado para uma página segura para realizar o pagamento.
              </p>
              <Button
                size="lg"
                className="w-full max-w-xs"
                onClick={goToPaymentLink}
              >
                Ir para pagamento
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutOikos2026;
