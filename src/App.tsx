import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventoOikos2026 from "./pages/EventoOikos2026";
import CheckoutOikos2026 from "./pages/CheckoutOikos2026";
import InscricaoRealizadaOikos2026 from "./pages/InscricaoRealizadaOikos2026";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEventos from "./pages/admin/AdminEventos";
import AdminLotes from "./pages/admin/AdminLotes";
import AdminInscricoes from "./pages/admin/AdminInscricoes";
import InscricaoResultado from "./pages/InscricaoResultado";
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
            <Route path="/eventos" element={<Events />} />
            <Route path="/eventos/oikos-2026" element={<EventoOikos2026 />} />
            <Route path="/eventos/oikos-2026/checkout" element={<CheckoutOikos2026 />} />
            <Route path="/eventos/oikos-2026/inscricao-realizada" element={<InscricaoRealizadaOikos2026 />} />
            <Route path="/eventos/oikos-2026/resultado" element={<InscricaoResultado />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/eventos" element={<ProtectedRoute><AdminEventos /></ProtectedRoute>} />
            <Route path="/admin/lotes" element={<ProtectedRoute><AdminLotes /></ProtectedRoute>} />
            <Route path="/admin/inscricoes" element={<ProtectedRoute><AdminInscricoes /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
