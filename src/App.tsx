import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import OikosLanding from "./pages/OikosLanding";
// import Events from "./pages/Events";
// import EventoOikos2026 from "./pages/EventoOikos2026";
// import CheckoutOikos2026 from "./pages/CheckoutOikos2026";
// import InscricaoRealizadaOikos2026 from "./pages/InscricaoRealizadaOikos2026";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminEventos from "./components/admin/AdminEventos";
import AdminLotes from "./components/admin/AdminLotes";
import AdminInscricoes from "./components/admin/AdminInscricoes";
import AdminCupons from "./components/admin/AdminCupons";
// import InscricaoResultado from "./pages/InscricaoResultado";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/oikos" element={<OikosLanding />} />
            {/* <Route path="/eventos" element={<Events />} /> -> Temporarily removed */}
            {/* <Route path="/eventos/oikos-2026" element={<EventoOikos2026 />} /> */}
            {/* <Route path="/oikos/checkout" element={<CheckoutOikos2026 />} />
            <Route path="/oikos/checkout/inscricao-realizada" element={<InscricaoRealizadaOikos2026 />} />
            <Route path="/oikos/checkout/resultado" element={<InscricaoResultado />} /> */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/eventos"
              element={
                <ProtectedRoute>
                  <AdminEventos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lotes"
              element={
                <ProtectedRoute>
                  <AdminLotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inscricoes"
              element={
                <ProtectedRoute>
                  <AdminInscricoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cupons"
              element={
                <ProtectedRoute>
                  <AdminCupons />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
